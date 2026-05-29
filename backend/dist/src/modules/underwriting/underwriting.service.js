"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnderwritingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../infrastructure/prisma/prisma.service");
const cbc_client_1 = require("./cbc.client");
const dti_calculator_1 = require("./dti-calculator");
const rules_engine_1 = require("./rules-engine");
let UnderwritingService = class UnderwritingService {
    prisma;
    cbcClient = new cbc_client_1.CbcClient();
    constructor(prisma) {
        this.prisma = prisma;
    }
    async evaluateLoan(loanId) {
        const loan = await this.prisma.loan.findUnique({
            where: { id: loanId },
            include: {
                customer: true,
                product: true,
            },
        });
        if (!loan)
            throw new Error('Loan not found');
        const cbcReport = await this.cbcClient.queryCredit(loan.customer.nationalId || 'UNKNOWN');
        await this.prisma.creditReport.create({
            data: {
                customerId: loan.customerId,
                loanId: loan.id,
                cbcScore: cbcReport.cbcScore,
                totalExposure: cbcReport.totalExposure,
                activeLoans: cbcReport.activeLoans,
                delinquencyFlag: cbcReport.delinquencyFlag,
                reportData: cbcReport.reportData,
            },
        });
        const monthlyIncome = Number(loan.customer.monthlyIncome) || 0;
        const monthlyExpenses = Number(loan.customer.monthlyExpenses) || 0;
        const annualRate = Number(loan.interestRate);
        const monthlyRate = annualRate / 100 / 12;
        const months = loan.durationMonths;
        const principal = Number(loan.principalAmount);
        let proposedEmi;
        if (loan.product.interestType === 'FLAT') {
            const totalInterest = principal * (annualRate / 100) * (months / 12);
            proposedEmi = (principal + totalInterest) / months;
        }
        else {
            proposedEmi =
                (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
                    (Math.pow(1 + monthlyRate, months) - 1);
        }
        const dtiInput = {
            monthlyIncome,
            monthlyExpenses,
            existingLoanPayments: Number(cbcReport.totalExposure) > 0
                ? Number(cbcReport.totalExposure) / 12
                : 0,
            proposedEmi,
        };
        const dti = (0, dti_calculator_1.calculateDti)(dtiInput);
        const underwritingInput = {
            principalAmount: principal,
            annualInterestRate: annualRate,
            cbcScore: cbcReport.cbcScore,
            delinquencyFlag: cbcReport.delinquencyFlag,
            dtiRatio: dti.dtiRatio,
            totalExposure: cbcReport.totalExposure,
            monthlyIncome,
        };
        const decision = (0, rules_engine_1.evaluate)(underwritingInput);
        await this.prisma.loan.update({
            where: { id: loanId },
            data: {
                dtiRatio: dti.dtiRatio,
                cbcScore: cbcReport.cbcScore,
            },
        });
        return { decision, dti, cbcScore: cbcReport.cbcScore };
    }
};
exports.UnderwritingService = UnderwritingService;
exports.UnderwritingService = UnderwritingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UnderwritingService);
//# sourceMappingURL=underwriting.service.js.map
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
exports.LoansService = exports.CreateLoanDto = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../infrastructure/prisma/prisma.service");
const ledger_service_1 = require("../ledger/ledger.service");
const crypto_1 = require("crypto");
class CreateLoanDto {
    customerId;
    productId;
    principalAmount;
    durationMonths;
}
exports.CreateLoanDto = CreateLoanDto;
let LoansService = class LoansService {
    prisma;
    ledger;
    constructor(prisma, ledger) {
        this.prisma = prisma;
        this.ledger = ledger;
    }
    async applyForLoan(createLoanDto) {
        const { customerId, productId, principalAmount, durationMonths } = createLoanDto;
        const product = await this.prisma.loanProduct.findUnique({
            where: { id: productId },
        });
        if (!product)
            throw new common_1.NotFoundException('Loan Product not found');
        if (principalAmount < Number(product.minAmount) ||
            principalAmount > Number(product.maxAmount)) {
            throw new common_1.BadRequestException('Amount out of product bounds');
        }
        const loan = await this.prisma.loan.create({
            data: {
                customerId,
                productId,
                principalAmount,
                interestRate: product.baseInterestRate,
                durationMonths,
                status: 'PENDING',
            },
        });
        return { loan, schedules: [] };
    }
    async disburseLoan(loanId) {
        return this.prisma.$transaction(async (tx) => {
            const loan = await tx.loan.findUnique({ where: { id: loanId } });
            if (!loan)
                throw new common_1.NotFoundException('Loan not found');
            if (loan.status !== 'APPROVED')
                throw new common_1.BadRequestException('Loan must be APPROVED before disbursement');
            const product = await tx.loanProduct.findUnique({ where: { id: loan.productId } });
            if (!product)
                throw new common_1.NotFoundException('Loan Product not found');
            const updatedLoan = await tx.loan.update({
                where: { id: loanId },
                data: {
                    status: 'DISBURSED',
                    disbursedAt: new Date(),
                },
            });
            const schedules = this.generateRepaymentSchedule(loan.id, loan.principalAmount, loan.interestRate, loan.durationMonths, product.interestType);
            await tx.repaymentSchedule.createMany({ data: schedules });
            const txReference = `DISB-${(0, crypto_1.randomUUID)()}`;
            await this.ledger.recordTransaction([
                {
                    accountId: 'CASH-VAULT',
                    accountCode: '10100',
                    accountType: 'CASH',
                    credit: Number(loan.principalAmount),
                    transactionReference: txReference,
                    description: `Loan disbursement for ${loanId}`,
                    loanId: loanId,
                },
                {
                    accountId: loanId,
                    accountCode: '12100',
                    accountType: 'LOAN',
                    debit: Number(loan.principalAmount),
                    transactionReference: txReference,
                    description: `Principal disbursed`,
                    loanId: loanId,
                },
            ]);
            return {
                success: true,
                loan: updatedLoan,
                transactionReference: txReference,
            };
        });
    }
    async approveLoan(loanId) {
        return this.prisma.$transaction(async (tx) => {
            const loan = await tx.loan.update({
                where: { id: loanId },
                data: { status: 'APPROVED' }
            });
            return loan;
        });
    }
    generateRepaymentSchedule(loanId, principal, annualRate, months, type) {
        const schedules = [];
        const monthlyRate = annualRate / 100 / 12;
        let balance = principal;
        const startDate = new Date();
        if (type === 'FLAT') {
            const totalInterest = principal * (annualRate / 100) * (months / 12);
            const monthlyInterest = totalInterest / months;
            const monthlyPrincipal = principal / months;
            const amountDue = monthlyPrincipal + monthlyInterest;
            for (let i = 1; i <= months; i++) {
                startDate.setMonth(startDate.getMonth() + 1);
                schedules.push({
                    loanId,
                    installmentNumber: i,
                    amountDue,
                    principalComponent: monthlyPrincipal,
                    interestComponent: monthlyInterest,
                    dueDate: new Date(startDate),
                    status: 'PENDING',
                });
            }
        }
        else if (type === 'REDUCING') {
            const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
                (Math.pow(1 + monthlyRate, months) - 1);
            for (let i = 1; i <= months; i++) {
                startDate.setMonth(startDate.getMonth() + 1);
                const interestForMonth = balance * monthlyRate;
                const principalForMonth = emi - interestForMonth;
                balance -= principalForMonth;
                schedules.push({
                    loanId,
                    installmentNumber: i,
                    amountDue: emi,
                    principalComponent: principalForMonth,
                    interestComponent: interestForMonth,
                    dueDate: new Date(startDate),
                    status: 'PENDING',
                });
            }
        }
        else {
            throw new common_1.BadRequestException('Invalid interest type');
        }
        return schedules;
    }
    async findCustomerByEmail(email) {
        return this.prisma.customer.findFirst({
            where: { email },
        });
    }
    async getMyActiveLoan(customerId) {
        const loan = await this.prisma.loan.findFirst({
            where: {
                customerId,
                status: 'ACTIVE',
            },
            include: {
                repaymentSchedules: {
                    orderBy: { dueDate: 'asc' },
                    where: { status: 'PENDING' },
                    take: 1,
                },
            },
        });
        if (!loan) {
            throw new common_1.NotFoundException('No active loan found');
        }
        return loan;
    }
    async getAllProducts() {
        return this.prisma.loanProduct.findMany({
            orderBy: { name: 'asc' },
        });
    }
    async createProduct(data) {
        return this.prisma.loanProduct.create({
            data: {
                name: data.name,
                description: data.description,
                minAmount: Number(data.minAmount),
                maxAmount: Number(data.maxAmount),
                baseInterestRate: Number(data.baseInterestRate),
                interestType: data.interestType,
            },
        });
    }
    async updateProduct(id, data) {
        return this.prisma.loanProduct.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description,
                minAmount: data.minAmount ? Number(data.minAmount) : undefined,
                maxAmount: data.maxAmount ? Number(data.maxAmount) : undefined,
                baseInterestRate: data.baseInterestRate
                    ? Number(data.baseInterestRate)
                    : undefined,
                interestType: data.interestType,
            },
        });
    }
    async getProduct(id) {
        return this.prisma.loanProduct.findUnique({ where: { id } });
    }
    async calculateCreditScore(loanId) {
        const loan = await this.prisma.loan.findUnique({
            where: { id: loanId },
            include: { customer: true }
        });
        if (!loan)
            throw new common_1.NotFoundException('Loan not found');
        let score = 500;
        if (loan.dtiRatio !== null && loan.dtiRatio !== undefined) {
            if (loan.dtiRatio < 0.3)
                score += 150;
            else if (loan.dtiRatio <= 0.5)
                score += 50;
            else
                score -= 100;
        }
        else {
            score -= 50;
        }
        if (loan.cbcScore) {
            if (loan.cbcScore >= 700)
                score += 200;
            else if (loan.cbcScore >= 600)
                score += 100;
            else if (loan.cbcScore >= 500)
                score += 0;
            else
                score -= 100;
        }
        const income = loan.customer.monthlyIncome || 0;
        const incomeDollar = income;
        if (incomeDollar > 2000)
            score += 150;
        else if (incomeDollar >= 1000)
            score += 100;
        else if (incomeDollar >= 500)
            score += 50;
        score = Math.min(Math.max(score, 0), 1000);
        let riskBand = 'D (High Risk)';
        if (score >= 800)
            riskBand = 'A (Excellent)';
        else if (score >= 650)
            riskBand = 'B (Good)';
        else if (score >= 500)
            riskBand = 'C (Fair)';
        return this.prisma.loan.update({
            where: { id: loanId },
            data: {
                internalCreditScore: score,
                creditRiskBand: riskBand,
            }
        });
    }
    async deleteProduct(id) {
        return this.prisma.loanProduct.delete({ where: { id } });
    }
};
exports.LoansService = LoansService;
exports.LoansService = LoansService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ledger_service_1.LedgerService])
], LoansService);
//# sourceMappingURL=loans.service.js.map
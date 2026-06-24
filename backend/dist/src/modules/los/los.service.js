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
exports.LosService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../infrastructure/prisma/prisma.service");
const los_state_machine_1 = require("./los-state-machine");
const underwriting_service_1 = require("../underwriting/underwriting.service");
const kyc_service_1 = require("../kyc/kyc.service");
const disbursement_service_1 = require("../disbursement/disbursement.service");
let LosService = class LosService {
    prisma;
    underwriting;
    kyc;
    disbursement;
    constructor(prisma, underwriting, kyc, disbursement) {
        this.prisma = prisma;
        this.underwriting = underwriting;
        this.kyc = kyc;
        this.disbursement = disbursement;
    }
    async createDraft(dto) {
        const product = await this.prisma.loanProduct.findUnique({
            where: { id: dto.productId },
        });
        if (!product)
            throw new common_1.NotFoundException('Loan product not found');
        const exchangeRate = dto.exchangeRate ?? (dto.currency === 'KHR' ? 4000 : 1.0);
        const minAmount = dto.currency === 'KHR' ? product.minAmount * exchangeRate : product.minAmount;
        const maxAmount = dto.currency === 'KHR' ? product.maxAmount * exchangeRate : product.maxAmount;
        if (dto.principalAmount < minAmount ||
            dto.principalAmount > maxAmount) {
            throw new common_1.BadRequestException(`Amount must be between ${minAmount} and ${maxAmount} ${dto.currency || 'USD'}`);
        }
        if (Number(product.baseInterestRate) > 18) {
            throw new common_1.BadRequestException('Interest rate exceeds NBC cap of 18% per annum');
        }
        let finalLid = dto.lid;
        if (!finalLid) {
            const nextLidObj = await this.getNextLid();
            finalLid = nextLidObj.lid;
        }
        const loan = await this.prisma.loan.create({
            data: {
                lid: finalLid,
                customerId: dto.customerId,
                productId: dto.productId,
                principalAmount: dto.principalAmount,
                interestRate: dto.interestRate ?? product.baseInterestRate,
                durationMonths: dto.numberOfInstallments ?? dto.durationMonths,
                currency: dto.currency || 'USD',
                exchangeRate: exchangeRate,
                applicationChannel: dto.applicationChannel || 'WEB',
                status: 'DRAFT',
                loanOfficerId: dto.loanOfficerId || null,
                disbursementDate: dto.disbursementDate
                    ? new Date(dto.disbursementDate)
                    : null,
                repaymentType: dto.repaymentType || 'MONTHLY',
                firstInstallmentDate: dto.firstInstallmentDate
                    ? new Date(dto.firstInstallmentDate)
                    : null,
                numberOfInstallments: dto.numberOfInstallments || null,
                excludeWeekends: dto.excludeWeekends || false,
                penaltyRate: dto.penaltyRate ?? null,
                adminFeeRate: dto.adminFeeRate ?? null,
                collectionFeeType: dto.collectionFeeType || 'RATE',
                collectionFeeValue: dto.collectionFeeValue ?? null,
                gracePeriod: dto.gracePeriod ?? null,
                refinanceFeeAmt: dto.refinanceFeeAmt ?? null,
                reminderPreference: dto.reminderPreference ?? null,
                loanCycle: dto.loanCycle || null,
                recommenderType: dto.recommenderType || null,
                branchId: dto.branchId || null,
                reasonOfCredit: dto.reasonOfCredit || null,
                loanNote: dto.loanNote || null,
                memoReasonOfCredit: dto.memoReasonOfCredit || null,
                collaterals: dto.collaterals && dto.collaterals.length > 0
                    ? {
                        create: dto.collaterals.map((c) => ({
                            type: c.type,
                            description: c.description,
                            estimatedValue: c.estimatedValue,
                            currency: c.currency || 'USD',
                            documentIds: JSON.stringify(c.documentIds || []),
                        })),
                    }
                    : undefined,
            },
            include: {
                customer: true,
                product: true,
                loanOfficer: { select: { id: true, firstName: true, lastName: true } },
            },
        });
        return loan;
    }
    async getNextLid() {
        const lastLoan = await this.prisma.loan.findFirst({
            where: { lid: { startsWith: 'LID-' } },
            orderBy: { lid: 'desc' },
            select: { lid: true },
        });
        let nextNumber = 1;
        if (lastLoan?.lid) {
            const parts = lastLoan.lid.split('-');
            if (parts.length === 2) {
                nextNumber = parseInt(parts[1], 10) + 1;
            }
        }
        return { lid: `LID-${nextNumber.toString().padStart(6, '0')}` };
    }
    async submitApplication(loanId, userId) {
        const loan = await this.getLoan(loanId);
        this.assertTransition(loan.status, 'SUBMITTED');
        const completeness = await this.kyc.checkCompleteness(loan.customerId, loan.product.name);
        if (completeness.missing.length > 0) {
            throw new common_1.BadRequestException({
                message: 'KYC documents incomplete',
                missing: completeness.missing,
                pendingVerification: completeness.pendingVerification,
            });
        }
        return this.transitionLoan(loanId, loan.status, 'SUBMITTED', userId);
    }
    async startKycReview(loanId, userId) {
        const loan = await this.getLoan(loanId);
        this.assertTransition(loan.status, 'KYC_REVIEW');
        return this.transitionLoan(loanId, loan.status, 'KYC_REVIEW', userId);
    }
    async completeKycReview(loanId, approved, userId, reason) {
        const loan = await this.getLoan(loanId);
        const target = approved ? 'KYC_APPROVED' : 'KYC_REJECTED';
        this.assertTransition(loan.status, target);
        if (approved) {
            const completeness = await this.kyc.checkCompleteness(loan.customerId, loan.product.name);
            if (!completeness.complete) {
                throw new common_1.BadRequestException({
                    message: 'Cannot approve KYC: some required documents are not verified or missing',
                    missing: completeness.missing,
                    pendingVerification: completeness.pendingVerification,
                });
            }
        }
        if (!approved) {
            await this.prisma.loan.update({
                where: { id: loanId },
                data: { rejectionReason: reason || 'KYC verification failed' },
            });
        }
        return this.transitionLoan(loanId, loan.status, target, userId);
    }
    async runCreditCheck(loanId, userId) {
        const loan = await this.getLoan(loanId);
        this.assertTransition(loan.status, 'CREDIT_CHECK');
        await this.transitionLoan(loanId, loan.status, 'CREDIT_CHECK', userId);
        const evaluation = await this.underwriting.evaluateLoan(loanId);
        await this.transitionLoan(loanId, 'CREDIT_CHECK', 'UNDERWRITING', userId);
        if (evaluation.decision.decision === 'AUTO_REJECT') {
            await this.prisma.loan.update({
                where: { id: loanId },
                data: { rejectionReason: evaluation.decision.reasons.join('; ') },
            });
            return {
                ...(await this.transitionLoan(loanId, 'UNDERWRITING', 'AUTO_REJECTED', userId)),
                underwritingResult: evaluation,
            };
        }
        const tier = evaluation.decision.tier ||
            (0, los_state_machine_1.getNextApprovalTier)(Number(loan.principalAmount));
        await this.prisma.approvalStep.create({
            data: {
                loanId,
                tier: tier === 'TIER1_REVIEW' ? 1 : tier === 'TIER2_REVIEW' ? 2 : 3,
            },
        });
        const updated = await this.transitionLoan(loanId, 'UNDERWRITING', tier, userId);
        return { ...updated, underwritingResult: evaluation };
    }
    async reviewApplication(loanId, dto, reviewerId) {
        const loan = await this.getLoan(loanId);
        const currentStatus = loan.status;
        let target;
        if (dto.decision === 'APPROVED') {
            target = 'APPROVED';
        }
        else if (dto.decision === 'REJECTED') {
            target = 'REJECTED';
        }
        else {
            if (currentStatus === 'TIER1_REVIEW')
                target = 'TIER2_REVIEW';
            else if (currentStatus === 'TIER2_REVIEW')
                target = 'TIER3_REVIEW';
            else
                throw new common_1.BadRequestException('Cannot escalate beyond TIER3');
        }
        this.assertTransition(currentStatus, target);
        const currentTier = currentStatus === 'TIER1_REVIEW'
            ? 1
            : currentStatus === 'TIER2_REVIEW'
                ? 2
                : 3;
        await this.prisma.approvalStep.updateMany({
            where: { loanId, tier: currentTier, decision: null },
            data: {
                assignedTo: reviewerId,
                decision: dto.decision,
                comments: dto.comments,
                decidedAt: new Date(),
            },
        });
        if (dto.decision === 'ESCALATED') {
            await this.prisma.approvalStep.create({
                data: {
                    loanId,
                    tier: currentTier + 1,
                },
            });
        }
        if (dto.decision === 'REJECTED') {
            await this.prisma.loan.update({
                where: { id: loanId },
                data: { rejectionReason: dto.comments || 'Rejected by reviewer' },
            });
        }
        return this.transitionLoan(loanId, currentStatus, target, reviewerId);
    }
    async prepareDisbursement(loanId, userId) {
        const loan = await this.getLoan(loanId);
        this.assertTransition(loan.status, 'PENDING_DISBURSEMENT');
        const schedules = this.generateRepaymentSchedule(loanId, Number(loan.principalAmount), Number(loan.interestRate), loan.durationMonths, loan.product.interestType, loan.firstInstallmentDate, loan.excludeWeekends);
        await this.prisma.repaymentSchedule.createMany({ data: schedules });
        return this.transitionLoan(loanId, loan.status, 'PENDING_DISBURSEMENT', userId);
    }
    async disburseLoan(loanId, method = 'BAKONG', accountId) {
        return this.disbursement.disburse(loanId, method, accountId);
    }
    async activateLoan(loanId, userId) {
        const loan = await this.getLoan(loanId);
        this.assertTransition(loan.status, 'ACTIVE');
        return this.transitionLoan(loanId, loan.status, 'ACTIVE', userId);
    }
    async getQueue(filters) {
        const where = {};
        if (filters?.status)
            where['status'] = filters.status;
        if (filters?.loanOfficerId)
            where['loanOfficerId'] = filters.loanOfficerId;
        if (filters?.branchId) {
            where['customer'] = { branchId: filters.branchId };
        }
        return this.prisma.loan.findMany({
            where,
            include: {
                customer: {
                    select: {
                        firstName: true,
                        lastName: true,
                        khmerFirstName: true,
                        khmerLastName: true,
                        phone: true,
                        branchId: true,
                    },
                },
                product: { select: { name: true, interestType: true } },
                approvalSteps: { orderBy: { createdAt: 'desc' }, take: 1 },
                repaymentSchedules: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getApplicationDetail(loanId) {
        const loan = await this.prisma.loan.findUnique({
            where: { id: loanId },
            include: {
                customer: true,
                product: true,
                repaymentSchedules: { orderBy: { installmentNumber: 'asc' } },
                creditReports: { orderBy: { queriedAt: 'desc' }, take: 1 },
                collaterals: true,
                guarantors: true,
                approvalSteps: { orderBy: { createdAt: 'asc' } },
                loanOfficer: { select: { id: true, firstName: true, lastName: true } },
            },
        });
        if (!loan)
            throw new common_1.NotFoundException('Loan not found');
        const documents = await this.prisma.document.findMany({
            where: { customerId: loan.customerId },
        });
        return { ...loan, documents };
    }
    async getTimeline(loanId) {
        const [approvalSteps, auditLogs] = await Promise.all([
            this.prisma.approvalStep.findMany({
                where: { loanId },
                orderBy: { createdAt: 'asc' },
            }),
            this.prisma.auditLog.findMany({
                where: { entity: 'Loan', entityId: loanId },
                orderBy: { createdAt: 'asc' },
                include: { user: true },
            }),
        ]);
        return { approvalSteps, auditLogs };
    }
    async addCollateral(loanId, dto) {
        await this.getLoan(loanId);
        return this.prisma.collateral.create({
            data: {
                loanId,
                type: dto.type,
                description: dto.description,
                estimatedValue: dto.estimatedValue,
                currency: dto.currency || 'USD',
                documentIds: JSON.stringify(dto.documentIds || []),
            },
        });
    }
    async addGuarantor(loanId, dto) {
        await this.getLoan(loanId);
        return this.prisma.guarantor.create({
            data: {
                loanId,
                firstName: dto.firstName,
                lastName: dto.lastName,
                nationalId: dto.nationalId,
                phone: dto.phone,
                relationship: dto.relationship,
            },
        });
    }
    async getLoan(loanId) {
        const loan = await this.prisma.loan.findUnique({
            where: { id: loanId },
            include: { customer: true, product: true },
        });
        if (!loan)
            throw new common_1.NotFoundException('Loan not found');
        return loan;
    }
    assertTransition(from, to) {
        const result = (0, los_state_machine_1.canTransition)(from, to);
        if (!result.allowed) {
            throw new common_1.BadRequestException(result.reason);
        }
    }
    async transitionLoan(loanId, from, to, userId) {
        const updated = await this.prisma.loan.update({
            where: { id: loanId },
            data: {
                previousStatus: from,
                status: to,
            },
        });
        await this.prisma.auditLog.create({
            data: {
                action: 'STATUS_CHANGE',
                entity: 'Loan',
                entityId: loanId,
                userId: userId || null,
                details: { from, to },
            },
        });
        return updated;
    }
    generateRepaymentSchedule(loanId, principal, annualRate, months, type, firstInstallmentDate, excludeWeekends) {
        const schedules = [];
        const monthlyRate = annualRate / 100 / 12;
        let balance = principal;
        const startDate = firstInstallmentDate ? new Date(firstInstallmentDate) : new Date();
        let currentDate = new Date(startDate);
        if (!firstInstallmentDate) {
            currentDate.setMonth(currentDate.getMonth() + 1);
        }
        const getNextBusinessDay = (date) => {
            const newDate = new Date(date);
            while (newDate.getDay() === 0 || newDate.getDay() === 6) {
                newDate.setDate(newDate.getDate() + 1);
            }
            return newDate;
        };
        if (type === 'FLAT') {
            const totalInterest = principal * (annualRate / 100) * (months / 12);
            const monthlyInterest = totalInterest / months;
            const monthlyPrincipal = principal / months;
            const amountDue = Math.round(monthlyPrincipal + monthlyInterest);
            for (let i = 1; i <= months; i++) {
                let dueDate = new Date(currentDate);
                if (excludeWeekends) {
                    dueDate = getNextBusinessDay(dueDate);
                }
                schedules.push({
                    loanId,
                    installmentNumber: i,
                    amountDue,
                    principalComponent: Math.round(monthlyPrincipal),
                    interestComponent: Math.round(monthlyInterest),
                    dueDate,
                    status: 'PENDING',
                });
                currentDate.setMonth(currentDate.getMonth() + 1);
            }
        }
        else {
            const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
                (Math.pow(1 + monthlyRate, months) - 1);
            for (let i = 1; i <= months; i++) {
                let dueDate = new Date(currentDate);
                if (excludeWeekends) {
                    dueDate = getNextBusinessDay(dueDate);
                }
                const interestForMonth = balance * monthlyRate;
                const principalForMonth = emi - interestForMonth;
                balance -= principalForMonth;
                schedules.push({
                    loanId,
                    installmentNumber: i,
                    amountDue: Math.round(emi),
                    principalComponent: Math.round(principalForMonth),
                    interestComponent: Math.round(interestForMonth),
                    dueDate,
                    status: 'PENDING',
                });
                currentDate.setMonth(currentDate.getMonth() + 1);
            }
        }
        return schedules;
    }
};
exports.LosService = LosService;
exports.LosService = LosService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        underwriting_service_1.UnderwritingService,
        kyc_service_1.KycService,
        disbursement_service_1.DisbursementService])
], LosService);
//# sourceMappingURL=los.service.js.map
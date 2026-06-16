import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import {
  canTransition,
  getNextApprovalTier,
  LoanStatus,
} from './los-state-machine';
import { UnderwritingService } from '../underwriting/underwriting.service';
import { KycService } from '../kyc/kyc.service';
import { DisbursementService } from '../disbursement/disbursement.service';
import {
  CreateDraftDto,
  ReviewDecisionDto,
  AddCollateralDto,
  AddGuarantorDto,
} from './dto/index';

@Injectable()
export class LosService {
  constructor(
    private prisma: PrismaService,
    private underwriting: UnderwritingService,
    private kyc: KycService,
    private disbursement: DisbursementService,
  ) {}

  // ==========================================================
  // Pipeline transitions
  // ==========================================================

  /**
   * Step 1: Create a draft loan application.
   */
  async createDraft(dto: CreateDraftDto) {
    const product = await this.prisma.loanProduct.findUnique({
      where: { id: dto.productId },
    });
    if (!product) throw new NotFoundException('Loan product not found');

    if (
      dto.principalAmount < Number(product.minAmount) ||
      dto.principalAmount > Number(product.maxAmount)
    ) {
      throw new BadRequestException(
        `Amount must be between ${product.minAmount} and ${product.maxAmount}`,
      );
    }

    // NBC cap enforcement
    if (Number(product.baseInterestRate) > 18) {
      throw new BadRequestException(
        'Interest rate exceeds NBC cap of 18% per annum',
      );
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
        // Use officer-specified rate if provided, else fall back to product default
        interestRate: dto.interestRate ?? product.baseInterestRate,
        durationMonths: dto.numberOfInstallments ?? dto.durationMonths,
        currency: dto.currency || 'USD',
        applicationChannel: dto.applicationChannel || 'WEB',
        status: 'DRAFT',
        loanOfficerId: dto.loanOfficerId || null,
        // Loan term details
        disbursementDate: dto.disbursementDate
          ? new Date(dto.disbursementDate)
          : null,
        repaymentType: dto.repaymentType || 'MONTHLY',
        firstInstallmentDate: dto.firstInstallmentDate
          ? new Date(dto.firstInstallmentDate)
          : null,
        numberOfInstallments: dto.numberOfInstallments || null,
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
        collaterals:
          dto.collaterals && dto.collaterals.length > 0
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

  /**
   * Step 2: Submit application for review.
   * Validates that all required KYC documents are uploaded.
   */
  async submitApplication(loanId: string, userId: string) {
    const loan = await this.getLoan(loanId);
    this.assertTransition(loan.status as LoanStatus, 'SUBMITTED');

    // Check document completeness
    const completeness = await this.kyc.checkCompleteness(
      loan.customerId,
      loan.product.name,
    );

    if (completeness.missing.length > 0) {
      throw new BadRequestException({
        message: 'KYC documents incomplete',
        missing: completeness.missing,
        pendingVerification: completeness.pendingVerification,
      });
    }

    return this.transitionLoan(loanId, loan.status, 'SUBMITTED', userId);
  }

  /**
   * Step 3: Begin KYC Review (auto-triggered or manual).
   */
  async startKycReview(loanId: string, userId: string) {
    const loan = await this.getLoan(loanId);
    this.assertTransition(loan.status as LoanStatus, 'KYC_REVIEW');
    return this.transitionLoan(loanId, loan.status, 'KYC_REVIEW', userId);
  }

  /**
   * Step 4: Complete KYC Review.
   */
  async completeKycReview(
    loanId: string,
    approved: boolean,
    userId: string,
    reason?: string,
  ) {
    const loan = await this.getLoan(loanId);
    const target = approved ? 'KYC_APPROVED' : 'KYC_REJECTED';
    this.assertTransition(loan.status as LoanStatus, target);

    if (approved) {
      const completeness = await this.kyc.checkCompleteness(
        loan.customerId,
        loan.product.name,
      );
      if (!completeness.complete) {
        throw new BadRequestException({
          message:
            'Cannot approve KYC: some required documents are not verified or missing',
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

  /**
   * Step 5: Run credit check (CBC query + underwriting).
   */
  async runCreditCheck(loanId: string, userId: string) {
    const loan = await this.getLoan(loanId);
    this.assertTransition(loan.status as LoanStatus, 'CREDIT_CHECK');

    // Transition to CREDIT_CHECK
    await this.transitionLoan(loanId, loan.status, 'CREDIT_CHECK', userId);

    // Run underwriting evaluation
    const evaluation = await this.underwriting.evaluateLoan(loanId);

    // Transition to UNDERWRITING
    await this.transitionLoan(loanId, 'CREDIT_CHECK', 'UNDERWRITING', userId);

    if (evaluation.decision.decision === 'AUTO_REJECT') {
      // Auto-reject
      await this.prisma.loan.update({
        where: { id: loanId },
        data: { rejectionReason: evaluation.decision.reasons.join('; ') },
      });
      return {
        ...(await this.transitionLoan(
          loanId,
          'UNDERWRITING',
          'AUTO_REJECTED',
          userId,
        )),
        underwritingResult: evaluation,
      };
    }

    // Route to appropriate approval tier
    const tier =
      evaluation.decision.tier ||
      getNextApprovalTier(Number(loan.principalAmount));

    // Create approval step
    await this.prisma.approvalStep.create({
      data: {
        loanId,
        tier: tier === 'TIER1_REVIEW' ? 1 : tier === 'TIER2_REVIEW' ? 2 : 3,
      },
    });

    const updated = await this.transitionLoan(
      loanId,
      'UNDERWRITING',
      tier,
      userId,
    );
    return { ...updated, underwritingResult: evaluation };
  }

  /**
   * Step 6: Review (Approve / Reject / Escalate) at any tier.
   */
  async reviewApplication(
    loanId: string,
    dto: ReviewDecisionDto,
    reviewerId: string,
  ) {
    const loan = await this.getLoan(loanId);
    const currentStatus = loan.status as LoanStatus;

    // Determine target status based on decision
    let target: LoanStatus;
    if (dto.decision === 'APPROVED') {
      target = 'APPROVED';
    } else if (dto.decision === 'REJECTED') {
      target = 'REJECTED';
    } else {
      // Escalate to next tier
      if (currentStatus === 'TIER1_REVIEW') target = 'TIER2_REVIEW';
      else if (currentStatus === 'TIER2_REVIEW') target = 'TIER3_REVIEW';
      else throw new BadRequestException('Cannot escalate beyond TIER3');
    }

    this.assertTransition(currentStatus, target);

    // Record the approval step
    const currentTier =
      currentStatus === 'TIER1_REVIEW'
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

    // If escalating, create next tier step
    if (dto.decision === 'ESCALATED') {
      await this.prisma.approvalStep.create({
        data: {
          loanId,
          tier: currentTier + 1,
        },
      });
    }

    // If rejected, record reason
    if (dto.decision === 'REJECTED') {
      await this.prisma.loan.update({
        where: { id: loanId },
        data: { rejectionReason: dto.comments || 'Rejected by reviewer' },
      });
    }

    return this.transitionLoan(loanId, currentStatus, target, reviewerId);
  }

  /**
   * Step 7: Move approved loan to pending disbursement.
   */
  async prepareDisbursement(loanId: string, userId: string) {
    const loan = await this.getLoan(loanId);
    this.assertTransition(loan.status as LoanStatus, 'PENDING_DISBURSEMENT');

    // Generate repayment schedule at this point
    const schedules = this.generateRepaymentSchedule(
      loanId,
      Number(loan.principalAmount),
      Number(loan.interestRate),
      loan.durationMonths,
      loan.product.interestType,
    );

    await this.prisma.repaymentSchedule.createMany({ data: schedules });

    return this.transitionLoan(
      loanId,
      loan.status,
      'PENDING_DISBURSEMENT',
      userId,
    );
  }

  /**
   * Step 8: Disburse the loan via Bakong / Cash.
   */
  async disburseLoan(
    loanId: string,
    method: 'BAKONG' | 'CASH' | 'BANK_TRANSFER' = 'BAKONG',
  ) {
    return this.disbursement.disburse(loanId, method);
  }

  /**
   * Step 9: Activate the loan (marks repayment period as started).
   */
  async activateLoan(loanId: string, userId: string) {
    const loan = await this.getLoan(loanId);
    this.assertTransition(loan.status as LoanStatus, 'ACTIVE');
    return this.transitionLoan(loanId, loan.status, 'ACTIVE', userId);
  }

  // ==========================================================
  // Queries
  // ==========================================================

  /**
   * Get the LOS pipeline queue filtered by status.
   */
  async getQueue(filters?: {
    status?: string;
    branchId?: string;
    loanOfficerId?: string;
  }) {
    const where: Record<string, unknown> = {};
    if (filters?.status) where['status'] = filters.status;
    if (filters?.loanOfficerId) where['loanOfficerId'] = filters.loanOfficerId;
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

  /**
   * Get full application detail for a single loan.
   */
  async getApplicationDetail(loanId: string) {
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
    if (!loan) throw new NotFoundException('Loan not found');

    // Get KYC documents
    const documents = await this.prisma.document.findMany({
      where: { customerId: loan.customerId },
    });

    return { ...loan, documents };
  }

  /**
   * Get timeline / audit trail for a loan.
   */
  async getTimeline(loanId: string) {
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

  /**
   * Add collateral to a loan.
   */
  async addCollateral(loanId: string, dto: AddCollateralDto) {
    await this.getLoan(loanId); // validate exists
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

  /**
   * Add guarantor to a loan.
   */
  async addGuarantor(loanId: string, dto: AddGuarantorDto) {
    await this.getLoan(loanId); // validate exists
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

  // ==========================================================
  // Private helpers
  // ==========================================================

  private async getLoan(loanId: string) {
    const loan = await this.prisma.loan.findUnique({
      where: { id: loanId },
      include: { customer: true, product: true },
    });
    if (!loan) throw new NotFoundException('Loan not found');
    return loan;
  }

  private assertTransition(from: LoanStatus, to: LoanStatus) {
    const result = canTransition(from, to);
    if (!result.allowed) {
      throw new BadRequestException(result.reason);
    }
  }

  private async transitionLoan(
    loanId: string,
    from: string,
    to: string,
    userId?: string,
  ) {
    const updated = await this.prisma.loan.update({
      where: { id: loanId },
      data: {
        previousStatus: from,
        status: to,
      },
    });

    // Audit log
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

  private generateRepaymentSchedule(
    loanId: string,
    principal: number,
    annualRate: number,
    months: number,
    type: string,
  ) {
    const schedules: Array<{
      loanId: string;
      installmentNumber: number;
      amountDue: number;
      principalComponent: number;
      interestComponent: number;
      dueDate: Date;
      status: string;
    }> = [];
    const monthlyRate = annualRate / 100 / 12;
    let balance = principal;
    const startDate = new Date();

    if (type === 'FLAT') {
      const totalInterest = principal * (annualRate / 100) * (months / 12);
      const monthlyInterest = totalInterest / months;
      const monthlyPrincipal = principal / months;
      const amountDue = Math.round(monthlyPrincipal + monthlyInterest);

      for (let i = 1; i <= months; i++) {
        startDate.setMonth(startDate.getMonth() + 1);
        schedules.push({
          loanId,
          installmentNumber: i,
          amountDue,
          principalComponent: Math.round(monthlyPrincipal),
          interestComponent: Math.round(monthlyInterest),
          dueDate: new Date(startDate),
          status: 'PENDING',
        });
      }
    } else {
      // REDUCING balance
      const emi =
        (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
        (Math.pow(1 + monthlyRate, months) - 1);

      for (let i = 1; i <= months; i++) {
        startDate.setMonth(startDate.getMonth() + 1);
        const interestForMonth = balance * monthlyRate;
        const principalForMonth = emi - interestForMonth;
        balance -= principalForMonth;

        schedules.push({
          loanId,
          installmentNumber: i,
          amountDue: Math.round(emi),
          principalComponent: Math.round(principalForMonth),
          interestComponent: Math.round(interestForMonth),
          dueDate: new Date(startDate),
          status: 'PENDING',
        });
      }
    }

    return schedules;
  }
}

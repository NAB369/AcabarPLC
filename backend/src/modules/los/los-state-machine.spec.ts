/**
 * Test specification for LOS State Machine
 */
import {
  canTransition,
  getNextApprovalTier,
  LoanStatus,
} from './los-state-machine';

describe('LOS State Machine', () => {
  // ========================================================
  // Happy path transitions
  // ========================================================
  describe('Valid transitions (happy path)', () => {
    const happyPath: [LoanStatus, LoanStatus][] = [
      ['DRAFT', 'SUBMITTED'],
      ['SUBMITTED', 'KYC_REVIEW'],
      ['KYC_REVIEW', 'KYC_APPROVED'],
      ['KYC_APPROVED', 'CREDIT_CHECK'],
      ['CREDIT_CHECK', 'UNDERWRITING'],
      ['UNDERWRITING', 'TIER1_REVIEW'],
      ['TIER1_REVIEW', 'APPROVED'],
      ['APPROVED', 'PENDING_DISBURSEMENT'],
      ['PENDING_DISBURSEMENT', 'DISBURSED'],
      ['DISBURSED', 'ACTIVE'],
      ['ACTIVE', 'COMPLETED'],
    ];

    it.each(happyPath)('should allow %s → %s', (from, to) => {
      const result = canTransition(from, to);
      expect(result.allowed).toBe(true);
    });
  });

  // ========================================================
  // Rejection paths
  // ========================================================
  describe('Rejection transitions', () => {
    it('should allow KYC_REVIEW → KYC_REJECTED', () => {
      expect(canTransition('KYC_REVIEW', 'KYC_REJECTED').allowed).toBe(true);
    });

    it('should allow UNDERWRITING → AUTO_REJECTED', () => {
      expect(canTransition('UNDERWRITING', 'AUTO_REJECTED').allowed).toBe(true);
    });

    it('should allow TIER1_REVIEW → REJECTED', () => {
      expect(canTransition('TIER1_REVIEW', 'REJECTED').allowed).toBe(true);
    });

    it('should allow TIER2_REVIEW → REJECTED', () => {
      expect(canTransition('TIER2_REVIEW', 'REJECTED').allowed).toBe(true);
    });

    it('should allow TIER3_REVIEW → REJECTED', () => {
      expect(canTransition('TIER3_REVIEW', 'REJECTED').allowed).toBe(true);
    });
  });

  // ========================================================
  // Escalation paths
  // ========================================================
  describe('Escalation transitions', () => {
    it('should allow TIER1_REVIEW → TIER2_REVIEW (escalation)', () => {
      expect(canTransition('TIER1_REVIEW', 'TIER2_REVIEW').allowed).toBe(true);
    });

    it('should allow TIER2_REVIEW → TIER3_REVIEW (escalation)', () => {
      expect(canTransition('TIER2_REVIEW', 'TIER3_REVIEW').allowed).toBe(true);
    });
  });

  // ========================================================
  // Overdue / Default paths
  // ========================================================
  describe('Delinquency transitions', () => {
    it('should allow ACTIVE → OVERDUE', () => {
      expect(canTransition('ACTIVE', 'OVERDUE').allowed).toBe(true);
    });

    it('should allow OVERDUE → ACTIVE (payment received)', () => {
      expect(canTransition('OVERDUE', 'ACTIVE').allowed).toBe(true);
    });

    it('should allow OVERDUE → DEFAULTED (90+ days)', () => {
      expect(canTransition('OVERDUE', 'DEFAULTED').allowed).toBe(true);
    });
  });

  // ========================================================
  // Invalid transitions
  // ========================================================
  describe('Invalid transitions (must be blocked)', () => {
    const invalidTransitions: [LoanStatus, LoanStatus][] = [
      ['DRAFT', 'APPROVED'],
      ['DRAFT', 'DISBURSED'],
      ['SUBMITTED', 'APPROVED'],
      ['KYC_REVIEW', 'CREDIT_CHECK'],
      ['UNDERWRITING', 'APPROVED'],
      ['PENDING_DISBURSEMENT', 'ACTIVE'],
      ['DISBURSED', 'COMPLETED'],
      ['COMPLETED', 'ACTIVE'],
      ['REJECTED', 'APPROVED'],
      ['AUTO_REJECTED', 'TIER1_REVIEW'],
      ['KYC_REJECTED', 'KYC_APPROVED'],
      ['DEFAULTED', 'ACTIVE'],
    ];

    it.each(invalidTransitions)('should block %s → %s', (from, to) => {
      const result = canTransition(from, to);
      expect(result.allowed).toBe(false);
      expect(result.reason).toBeDefined();
    });
  });

  // ========================================================
  // Terminal states
  // ========================================================
  describe('Terminal states', () => {
    const terminalStates: LoanStatus[] = [
      'COMPLETED',
      'REJECTED',
      'AUTO_REJECTED',
      'KYC_REJECTED',
      'DEFAULTED',
    ];

    it.each(terminalStates)(
      '%s should not transition to any other state',
      (state) => {
        const allStates: LoanStatus[] = [
          'DRAFT',
          'SUBMITTED',
          'KYC_REVIEW',
          'KYC_APPROVED',
          'CREDIT_CHECK',
          'UNDERWRITING',
          'TIER1_REVIEW',
          'APPROVED',
          'DISBURSED',
          'ACTIVE',
        ];

        allStates.forEach((target) => {
          expect(canTransition(state, target).allowed).toBe(false);
        });
      },
    );
  });

  // ========================================================
  // Approval tier routing
  // ========================================================
  describe('getNextApprovalTier', () => {
    it('should route loans < $500 to TIER1 (Loan Officer)', () => {
      expect(getNextApprovalTier(100)).toBe('TIER1_REVIEW');
      expect(getNextApprovalTier(499)).toBe('TIER1_REVIEW');
    });

    it('should route loans $500–$4,999 to TIER2 (Branch Manager)', () => {
      expect(getNextApprovalTier(500)).toBe('TIER2_REVIEW');
      expect(getNextApprovalTier(4999)).toBe('TIER2_REVIEW');
    });

    it('should route loans >= $5,000 to TIER3 (Credit Committee)', () => {
      expect(getNextApprovalTier(5000)).toBe('TIER3_REVIEW');
      expect(getNextApprovalTier(50000)).toBe('TIER3_REVIEW');
    });
  });
});

/**
 * Test specification for the Underwriting Rules Engine
 */
import { evaluate, UnderwritingInput } from './rules-engine';

describe('Underwriting Rules Engine', () => {
  const healthyApplicant: UnderwritingInput = {
    principalAmount: 3000,
    annualInterestRate: 15,
    cbcScore: 650,
    delinquencyFlag: false,
    dtiRatio: 0.35,
    totalExposure: 2000,
    monthlyIncome: 800,
  };

  // ========================================================
  // NBC Compliance
  // ========================================================
  describe('NBC Interest Rate Cap', () => {
    it('should AUTO_REJECT when interest rate exceeds 18%', () => {
      const input = { ...healthyApplicant, annualInterestRate: 18.5 };
      const result = evaluate(input);

      expect(result.decision).toBe('AUTO_REJECT');
      expect(result.reasons).toContain('Interest rate exceeds NBC cap of 18%');
    });

    it('should allow interest rate at exactly 18%', () => {
      const input = { ...healthyApplicant, annualInterestRate: 18 };
      const result = evaluate(input);

      expect(result.decision).not.toBe('AUTO_REJECT');
    });

    it('should allow interest rate below 18%', () => {
      const input = { ...healthyApplicant, annualInterestRate: 12 };
      const result = evaluate(input);

      expect(result.decision).toBe('MANUAL_REVIEW');
    });
  });

  // ========================================================
  // CBC Score Checks
  // ========================================================
  describe('CBC Credit Score', () => {
    it('should AUTO_REJECT when CBC score is below 300', () => {
      const input = { ...healthyApplicant, cbcScore: 250 };
      const result = evaluate(input);

      expect(result.decision).toBe('AUTO_REJECT');
      expect(result.reasons).toContain(
        'CBC score below minimum threshold (300)',
      );
    });

    it('should flag warning when CBC score is between 300–499', () => {
      const input = { ...healthyApplicant, cbcScore: 400 };
      const result = evaluate(input);

      expect(result.decision).toBe('MANUAL_REVIEW');
      expect(result.reasons).toContain(
        'CBC score is below recommended threshold (500)',
      );
    });

    it('should pass cleanly when CBC score is 500+', () => {
      const input = { ...healthyApplicant, cbcScore: 700 };
      const result = evaluate(input);

      expect(result.decision).toBe('MANUAL_REVIEW');
      expect(result.reasons).not.toContain(
        'CBC score is below recommended threshold (500)',
      );
    });

    it('should handle null CBC score (new borrower, no history)', () => {
      const input = { ...healthyApplicant, cbcScore: null };
      const result = evaluate(input);

      expect(result.decision).toBe('MANUAL_REVIEW');
    });
  });

  // ========================================================
  // Delinquency Flag
  // ========================================================
  describe('Delinquency Flag', () => {
    it('should AUTO_REJECT when delinquency flag is active', () => {
      const input = { ...healthyApplicant, delinquencyFlag: true };
      const result = evaluate(input);

      expect(result.decision).toBe('AUTO_REJECT');
      expect(result.reasons).toContain('Active delinquency reported by CBC');
    });

    it('should pass when delinquency flag is false', () => {
      const input = { ...healthyApplicant, delinquencyFlag: false };
      const result = evaluate(input);

      expect(result.decision).not.toBe('AUTO_REJECT');
    });
  });

  // ========================================================
  // DTI Ratio
  // ========================================================
  describe('Debt-to-Income (DTI) Ratio', () => {
    it('should AUTO_REJECT when DTI > 70%', () => {
      const input = { ...healthyApplicant, dtiRatio: 0.75 };
      const result = evaluate(input);

      expect(result.decision).toBe('AUTO_REJECT');
      expect(result.reasons).toContain('Debt-to-Income ratio exceeds 70%');
    });

    it('should flag warning when DTI is between 50%–70%', () => {
      const input = { ...healthyApplicant, dtiRatio: 0.55 };
      const result = evaluate(input);

      expect(result.decision).toBe('MANUAL_REVIEW');
      expect(result.reasons).toContain(
        'DTI ratio above 50% — requires careful review',
      );
    });

    it('should pass cleanly when DTI is below 50%', () => {
      const input = { ...healthyApplicant, dtiRatio: 0.3 };
      const result = evaluate(input);

      expect(result.decision).toBe('MANUAL_REVIEW');
      expect(result.reasons).not.toContain(
        'DTI ratio above 50% — requires careful review',
      );
    });

    it('should handle edge case DTI exactly at 70%', () => {
      const input = { ...healthyApplicant, dtiRatio: 0.7 };
      const result = evaluate(input);

      expect(result.decision).not.toBe('AUTO_REJECT');
    });
  });

  // ========================================================
  // Approval Tier Assignment
  // ========================================================
  describe('Approval Tier Assignment', () => {
    it('should assign TIER1 for loans < $500', () => {
      const input = { ...healthyApplicant, principalAmount: 300 };
      const result = evaluate(input);

      expect(result.tier).toBe('TIER1_REVIEW');
    });

    it('should assign TIER2 for loans $500–$4,999', () => {
      const input = { ...healthyApplicant, principalAmount: 2500 };
      const result = evaluate(input);

      expect(result.tier).toBe('TIER2_REVIEW');
    });

    it('should assign TIER3 for loans >= $5,000', () => {
      const input = { ...healthyApplicant, principalAmount: 10000 };
      const result = evaluate(input);

      expect(result.tier).toBe('TIER3_REVIEW');
    });

    it('should not assign tier when auto-rejected', () => {
      const input = { ...healthyApplicant, dtiRatio: 0.8 };
      const result = evaluate(input);

      expect(result.decision).toBe('AUTO_REJECT');
      expect(result.tier).toBeUndefined();
    });
  });

  // ========================================================
  // Multiple failure reasons
  // ========================================================
  describe('Multiple Rejection Reasons', () => {
    it('should accumulate all rejection reasons', () => {
      const input: UnderwritingInput = {
        principalAmount: 5000,
        annualInterestRate: 15,
        cbcScore: 200,
        delinquencyFlag: true,
        dtiRatio: 0.8,
        totalExposure: 50000,
        monthlyIncome: 500,
      };

      const result = evaluate(input);

      expect(result.decision).toBe('AUTO_REJECT');
      expect(result.reasons.length).toBeGreaterThanOrEqual(3);
      expect(result.reasons).toContain(
        'CBC score below minimum threshold (300)',
      );
      expect(result.reasons).toContain('Active delinquency reported by CBC');
      expect(result.reasons).toContain('Debt-to-Income ratio exceeds 70%');
    });
  });
});

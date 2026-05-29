/**
 * Test specification for DTI Calculator
 */
import { calculateDti, DtiInput } from './dti-calculator';

describe('DTI Calculator', () => {
  // ========================================================
  // Basic calculations
  // ========================================================
  describe('Basic DTI Calculation', () => {
    it('should calculate DTI for a healthy borrower', () => {
      const result = calculateDti({
        monthlyIncome: 1000,
        monthlyExpenses: 300,
        existingLoanPayments: 100,
        proposedEmi: 200,
      });

      expect(result.dtiRatio).toBeCloseTo(0.3);
      expect(result.dtiPercentage).toBe(30);
      expect(result.disposableIncome).toBe(400);
      expect(result.riskLevel).toBe('LOW');
    });

    it('should calculate DTI for a borrower with no existing loans', () => {
      const result = calculateDti({
        monthlyIncome: 800,
        monthlyExpenses: 200,
        existingLoanPayments: 0,
        proposedEmi: 150,
      });

      expect(result.dtiRatio).toBeCloseTo(0.1875);
      expect(result.riskLevel).toBe('LOW');
    });

    it('should calculate DTI with high existing debt burden', () => {
      const result = calculateDti({
        monthlyIncome: 500,
        monthlyExpenses: 200,
        existingLoanPayments: 250,
        proposedEmi: 100,
      });

      expect(result.dtiRatio).toBeCloseTo(0.7);
      expect(result.riskLevel).toBe('HIGH');
    });
  });

  // ========================================================
  // Risk level thresholds
  // ========================================================
  describe('Risk Level Classification', () => {
    it('should classify DTI <= 35% as LOW risk', () => {
      const result = calculateDti({
        monthlyIncome: 1000,
        monthlyExpenses: 300,
        existingLoanPayments: 0,
        proposedEmi: 350,
      });

      expect(result.riskLevel).toBe('LOW');
    });

    it('should classify DTI 36%–50% as MODERATE risk', () => {
      const result = calculateDti({
        monthlyIncome: 1000,
        monthlyExpenses: 200,
        existingLoanPayments: 100,
        proposedEmi: 350,
      });

      expect(result.riskLevel).toBe('MODERATE');
    });

    it('should classify DTI 51%–70% as HIGH risk', () => {
      const result = calculateDti({
        monthlyIncome: 1000,
        monthlyExpenses: 100,
        existingLoanPayments: 200,
        proposedEmi: 400,
      });

      expect(result.riskLevel).toBe('HIGH');
    });

    it('should classify DTI > 70% as CRITICAL risk', () => {
      const result = calculateDti({
        monthlyIncome: 1000,
        monthlyExpenses: 100,
        existingLoanPayments: 500,
        proposedEmi: 250,
      });

      expect(result.riskLevel).toBe('CRITICAL');
    });
  });

  // ========================================================
  // Disposable income
  // ========================================================
  describe('Disposable Income', () => {
    it('should calculate positive disposable income', () => {
      const result = calculateDti({
        monthlyIncome: 1500,
        monthlyExpenses: 400,
        existingLoanPayments: 200,
        proposedEmi: 300,
      });

      expect(result.disposableIncome).toBe(600);
    });

    it('should calculate negative disposable income (over-extended)', () => {
      const result = calculateDti({
        monthlyIncome: 500,
        monthlyExpenses: 300,
        existingLoanPayments: 200,
        proposedEmi: 150,
      });

      expect(result.disposableIncome).toBe(-150);
    });
  });

  // ========================================================
  // Edge cases
  // ========================================================
  describe('Edge Cases', () => {
    it('should handle zero income as CRITICAL', () => {
      const result = calculateDti({
        monthlyIncome: 0,
        monthlyExpenses: 0,
        existingLoanPayments: 0,
        proposedEmi: 100,
      });

      expect(result.dtiRatio).toBe(Infinity);
      expect(result.riskLevel).toBe('CRITICAL');
    });

    it('should handle zero proposed EMI', () => {
      const result = calculateDti({
        monthlyIncome: 1000,
        monthlyExpenses: 200,
        existingLoanPayments: 100,
        proposedEmi: 0,
      });

      expect(result.dtiRatio).toBeCloseTo(0.1);
      expect(result.riskLevel).toBe('LOW');
    });

    it('should handle very small income (typical rural Cambodia)', () => {
      const result = calculateDti({
        monthlyIncome: 150,
        monthlyExpenses: 80,
        existingLoanPayments: 0,
        proposedEmi: 30,
      });

      expect(result.dtiRatio).toBeCloseTo(0.2);
      expect(result.riskLevel).toBe('LOW');
      expect(result.disposableIncome).toBe(40);
    });

    it('should handle DTI exactly at boundary (35%)', () => {
      const result = calculateDti({
        monthlyIncome: 1000,
        monthlyExpenses: 200,
        existingLoanPayments: 0,
        proposedEmi: 350,
      });

      expect(result.dtiRatio).toBeCloseTo(0.35);
      expect(result.riskLevel).toBe('LOW');
    });

    it('should round dtiPercentage to 2 decimal places', () => {
      const result = calculateDti({
        monthlyIncome: 3000,
        monthlyExpenses: 1000,
        existingLoanPayments: 100,
        proposedEmi: 333,
      });

      expect(result.dtiPercentage).toBe(14.43);
    });
  });

  // ========================================================
  // Cambodia-specific scenarios
  // ========================================================
  describe('Cambodia Market Scenarios', () => {
    it('should evaluate a typical garment worker loan', () => {
      const result = calculateDti({
        monthlyIncome: 200,
        monthlyExpenses: 120,
        existingLoanPayments: 30,
        proposedEmi: 40,
      });

      expect(result.dtiRatio).toBeCloseTo(0.35);
      expect(result.disposableIncome).toBe(10);
    });

    it('should evaluate a small business owner (SME) loan', () => {
      const result = calculateDti({
        monthlyIncome: 2000,
        monthlyExpenses: 800,
        existingLoanPayments: 300,
        proposedEmi: 500,
      });

      expect(result.dtiRatio).toBeCloseTo(0.4);
      expect(result.riskLevel).toBe('MODERATE');
      expect(result.disposableIncome).toBe(400);
    });

    it('should evaluate a farmer with seasonal income (average monthly)', () => {
      const result = calculateDti({
        monthlyIncome: 120,
        monthlyExpenses: 70,
        existingLoanPayments: 0,
        proposedEmi: 25,
      });

      expect(result.dtiRatio).toBeCloseTo(0.2083, 3);
      expect(result.riskLevel).toBe('LOW');
    });
  });
});

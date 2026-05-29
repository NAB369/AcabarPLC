/**
 * Mock Credit Bureau Cambodia (CBC) Client
 *
 * Simulates a CBC credit inquiry. In production this would call
 * the CBC SOAP/REST API with the customer's National ID.
 */

export interface CbcReportResponse {
  cbcScore: number | null;
  totalExposure: number;
  activeLoans: number;
  delinquencyFlag: boolean;
  reportData: Record<string, unknown>;
}

export class CbcClient {
  /**
   * Query the CBC for a customer's credit history.
   * Mock implementation returns deterministic data based on the nationalId.
   */
  async queryCredit(nationalId: string): Promise<CbcReportResponse> {
    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Deterministic mock based on last digit of National ID
    const lastDigit = parseInt(nationalId.slice(-1), 10) || 0;

    if (lastDigit === 0) {
      // Simulate a blacklisted borrower
      return {
        cbcScore: 180,
        totalExposure: 50000,
        activeLoans: 5,
        delinquencyFlag: true,
        reportData: { mock: true, scenario: 'blacklisted' },
      };
    }

    if (lastDigit <= 3) {
      // Simulate a risky borrower
      return {
        cbcScore: 350 + lastDigit * 20,
        totalExposure: 8000 + lastDigit * 1000,
        activeLoans: 3,
        delinquencyFlag: false,
        reportData: { mock: true, scenario: 'risky' },
      };
    }

    if (lastDigit <= 6) {
      // Simulate a moderate borrower
      return {
        cbcScore: 500 + lastDigit * 15,
        totalExposure: 3000 + lastDigit * 500,
        activeLoans: 1,
        delinquencyFlag: false,
        reportData: { mock: true, scenario: 'moderate' },
      };
    }

    // Simulate a prime borrower
    return {
      cbcScore: 700 + lastDigit * 10,
      totalExposure: 1000,
      activeLoans: 0,
      delinquencyFlag: false,
      reportData: { mock: true, scenario: 'prime' },
    };
  }

  /**
   * Check if a customer has any active delinquency flags.
   */
  async hasDelinquency(nationalId: string): Promise<boolean> {
    const report = await this.queryCredit(nationalId);
    return report.delinquencyFlag;
  }
}

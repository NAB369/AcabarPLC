/**
 * Mock Bakong / KHQR Client
 *
 * Simulates the National Bank of Cambodia's Bakong Open API
 * for development. In production, replace with real API calls
 * to https://api-bakong.nbc.gov.kh
 */

export interface BakongTransferRequest {
  accountId: string; // Bakong account or phone number
  amount: number;
  currency: 'USD' | 'KHR';
  description: string;
}

export interface BakongTransferResponse {
  success: boolean;
  transactionHash: string;
  transactionId: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  timestamp: string;
}

export interface KhqrData {
  qrString: string;
  amount: number;
  currency: string;
  merchantName: string;
  transactionId: string;
}

export class BakongClient {
  private mockMode = true;

  /**
   * Initiate a fund transfer via Bakong (for disbursement).
   */
  async transfer(
    request: BakongTransferRequest,
  ): Promise<BakongTransferResponse> {
    if (this.mockMode) {
      return this.mockTransfer(request);
    }
    // Real implementation would call:
    // POST https://api-bakong.nbc.gov.kh/v1/transfer
    throw new Error('Real Bakong integration not configured');
  }

  /**
   * Generate a KHQR code for repayment collection.
   */
  async generateKhqr(
    amount: number,
    currency: 'USD' | 'KHR',
    description: string,
  ): Promise<KhqrData> {
    const transactionId = `KHQR-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    // In production, use NBC KHQR SDK to generate a proper EMVCo QR string
    const qrString = [
      '00020101021229',
      `52040000`,
      `5303${currency === 'USD' ? '840' : '116'}`,
      `54${amount.toFixed(2).length.toString().padStart(2, '0')}${amount.toFixed(2)}`,
      `5802KH`,
      `5914LMS CAMBODIA`,
      `6010PHNOM PENH`,
      `6304`, // CRC placeholder
    ].join('');

    return {
      qrString,
      amount,
      currency,
      merchantName: 'LMS Cambodia',
      transactionId,
    };
  }

  /**
   * Check transaction status by hash.
   */
  async checkTransaction(
    transactionHash: string,
  ): Promise<{ status: string; confirmed: boolean }> {
    if (this.mockMode) {
      return { status: 'COMPLETED', confirmed: true };
    }
    throw new Error('Real Bakong integration not configured');
  }

  private async mockTransfer(
    request: BakongTransferRequest,
  ): Promise<BakongTransferResponse> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const hash = `0x${Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16),
    ).join('')}`;

    return {
      success: true,
      transactionHash: hash,
      transactionId: `BAK-${Date.now()}`,
      status: 'COMPLETED',
      timestamp: new Date().toISOString(),
    };
  }
}

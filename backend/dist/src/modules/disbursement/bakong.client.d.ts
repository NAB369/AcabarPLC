export interface BakongTransferRequest {
    accountId: string;
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
export declare class BakongClient {
    private mockMode;
    transfer(request: BakongTransferRequest): Promise<BakongTransferResponse>;
    generateKhqr(amount: number, currency: 'USD' | 'KHR', description: string): Promise<KhqrData>;
    checkTransaction(transactionHash: string): Promise<{
        status: string;
        confirmed: boolean;
    }>;
    private mockTransfer;
}

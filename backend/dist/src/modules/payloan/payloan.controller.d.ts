import { PayloanService } from './payloan.service';
import { PayloanCallbackDto } from './payloan.dto';
export declare class PayloanController {
    private readonly payloanService;
    constructor(payloanService: PayloanService);
    handleCallback(dto: PayloanCallbackDto): Promise<{
        status: string;
        notificationId: string;
    }>;
    getNotifications(): Promise<{
        transactionId: string;
        id: string;
        createdAt: Date;
        amount: number;
        remark: string | null;
        billNo: string;
        transactionDate: string;
        transactionTime: string;
        payerAccountNo: string;
        payerName: string;
        currencyCode: string;
        paymentMethod: string;
        senderBankName: string;
        senderAccountName: string;
        settlementDate: string;
        settlementTime: string | null;
        settlementStatus: string;
        settlementErrorMessage: string | null;
        bankTransactionId: string | null;
    }[]>;
}

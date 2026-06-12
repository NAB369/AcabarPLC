import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { PayloanCallbackDto } from './payloan.dto';
export declare class PayloanService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    processCallback(dto: PayloanCallbackDto): Promise<{
        status: string;
        notificationId: string;
    }>;
    getAllNotifications(): Promise<{
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

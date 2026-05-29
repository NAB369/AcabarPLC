import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { LedgerService } from '../ledger/ledger.service';
export declare class ProcessRepaymentDto {
    loanId: string;
    amount: number | string;
    paymentMethod: string;
    paymentProof?: string;
    bankAccount?: string;
}
export declare class RepaymentsService {
    private prisma;
    private ledger;
    constructor(prisma: PrismaService, ledger: LedgerService);
    processRepayment(dto: ProcessRepaymentDto): Promise<{
        success: boolean;
        transactionReference: string;
        message: string;
    }>;
}

import { PrismaService } from '../../infrastructure/prisma/prisma.service';
export interface LedgerEntryDto {
    accountId: string;
    accountType: 'LOAN' | 'CASH' | 'INCOME' | 'LIABILITY' | 'FEE_INCOME' | 'INTEREST_INCOME' | 'PROVISION';
    debit?: number;
    credit?: number;
    transactionReference: string;
    description?: string;
}
export declare class LedgerService {
    private prisma;
    constructor(prisma: PrismaService);
    recordTransaction(entries: LedgerEntryDto[], txClient?: any): Promise<{
        success: boolean;
    }>;
    getAccountBalance(accountId: string): Promise<{
        accountId: string;
        totalDebit: number;
        totalCredit: number;
        netBalance: number;
    }>;
    getAccountEntries(accountId: string): Promise<{
        id: string;
        createdAt: Date;
        description: string | null;
        accountId: string;
        debit: number;
        credit: number;
        accountType: string;
        transactionReference: string;
    }[]>;
}

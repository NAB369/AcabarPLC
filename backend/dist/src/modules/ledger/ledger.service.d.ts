import { PrismaService } from '../../infrastructure/prisma/prisma.service';
export interface LedgerEntryDto {
    accountId: string;
    accountType: 'LOAN' | 'CASH' | 'INCOME' | 'LIABILITY' | 'FEE_INCOME' | 'INTEREST_INCOME' | 'PROVISION' | 'REVENUE';
    debit?: number;
    credit?: number;
    transactionReference: string;
    description?: string;
    loanId?: string;
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
        accountId: string;
        debit: number;
        credit: number;
        id: string;
        accountType: string;
        transactionReference: string;
        description: string | null;
        createdAt: Date;
        loanId: string | null;
    }[]>;
}

import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { LedgerService } from '../ledger/ledger.service';
export declare class PeriodService {
    private prisma;
    private ledger;
    constructor(prisma: PrismaService, ledger: LedgerService);
    getState(): Promise<{
        id: string;
        updatedAt: Date;
        businessDate: Date;
        isOpen: boolean;
    }>;
    startOfDay(userId: string): Promise<{
        success: boolean;
        state: {
            id: string;
            updatedAt: Date;
            businessDate: Date;
            isOpen: boolean;
        };
    }>;
    endOfDay(userId: string): Promise<{
        state: {
            id: string;
            updatedAt: Date;
            businessDate: Date;
            isOpen: boolean;
        };
        interestAccrued: number;
        penaltiesRecalculated: number;
        remindersGenerated: number;
        success: boolean;
    }>;
    getLogs(): Promise<{
        id: string;
        createdAt: Date;
        action: string;
        details: string | null;
        businessDate: Date;
        performedBy: string;
    }[]>;
    getTrialBalance(): Promise<{
        accounts: {
            name: string;
            code: string;
            type: string;
            debit: number;
            credit: number;
            balance: number;
        }[];
        totals: {
            totalAssets: number;
            totalRevenue: number;
        };
    }>;
    getJournal(dateStr?: string): Promise<({
        loan: {
            customer: {
                firstName: string;
                lastName: string;
            };
            lid: string | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        description: string | null;
        currency: string;
        loanId: string | null;
        transactionReference: string;
        accountId: string;
        accountCode: string | null;
        accountType: string;
        debit: number;
        credit: number;
        exchangeRate: number;
        journalEntryId: string | null;
    })[]>;
}

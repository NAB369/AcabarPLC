import { PeriodService } from './period.service';
export declare class PeriodController {
    private readonly periodService;
    constructor(periodService: PeriodService);
    getState(): Promise<{
        id: string;
        updatedAt: Date;
        businessDate: Date;
        isOpen: boolean;
    }>;
    startOfDay(req: any): Promise<{
        success: boolean;
        state: {
            id: string;
            updatedAt: Date;
            businessDate: Date;
            isOpen: boolean;
        };
    }>;
    endOfDay(req: any): Promise<{
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
    getJournal(date?: string): Promise<({
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

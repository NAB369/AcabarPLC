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
        success: boolean;
    }>;
    getLogs(): Promise<{
        id: string;
        createdAt: Date;
        businessDate: Date;
        action: string;
        details: string | null;
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
            lid: string | null;
            customer: {
                firstName: string;
                lastName: string;
            };
        } | null;
    } & {
        id: string;
        createdAt: Date;
        description: string | null;
        currency: string;
        loanId: string | null;
        accountId: string;
        debit: number;
        credit: number;
        exchangeRate: number;
        accountCode: string | null;
        accountType: string;
        transactionReference: string;
        journalEntryId: string | null;
    })[]>;
}

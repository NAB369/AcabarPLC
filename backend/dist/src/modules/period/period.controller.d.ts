import { PeriodService } from './period.service';
export declare class PeriodController {
    private readonly periodService;
    constructor(periodService: PeriodService);
    getState(): Promise<{
        id: string;
        businessDate: Date;
        isOpen: boolean;
        updatedAt: Date;
    }>;
    startOfDay(req: any): Promise<{
        success: boolean;
        state: {
            id: string;
            businessDate: Date;
            isOpen: boolean;
            updatedAt: Date;
        };
    }>;
    endOfDay(req: any): Promise<{
        state: {
            id: string;
            businessDate: Date;
            isOpen: boolean;
            updatedAt: Date;
        };
        interestAccrued: number;
        penaltiesRecalculated: number;
        success: boolean;
    }>;
    getLogs(): Promise<{
        id: string;
        businessDate: Date;
        action: string;
        performedBy: string;
        createdAt: Date;
        details: string | null;
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
        accountId: string;
        debit: number;
        credit: number;
        accountType: string;
        transactionReference: string;
        description: string | null;
        loanId: string | null;
    })[]>;
}

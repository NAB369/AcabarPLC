import { AccountingService } from './accounting.service';
export declare class AccountingController {
    private readonly accountingService;
    constructor(accountingService: AccountingService);
    getAccounts(type?: string): Promise<{
        id: string;
        code: string;
        name: string;
        nameKh: string | null;
        type: string;
        normalBal: string;
        parentCode: string | null;
        isActive: boolean;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    createAccount(dto: any): Promise<{
        id: string;
        code: string;
        name: string;
        nameKh: string | null;
        type: string;
        normalBal: string;
        parentCode: string | null;
        isActive: boolean;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateAccount(id: string, dto: any): Promise<{
        id: string;
        code: string;
        name: string;
        nameKh: string | null;
        type: string;
        normalBal: string;
        parentCode: string | null;
        isActive: boolean;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    toggleAccount(id: string): Promise<{
        id: string;
        code: string;
        name: string;
        nameKh: string | null;
        type: string;
        normalBal: string;
        parentCode: string | null;
        isActive: boolean;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getJournalEntries(type?: string, startDate?: string, endDate?: string): Promise<({
        lines: {
            id: string;
            description: string | null;
            createdAt: Date;
            currency: string;
            exchangeRate: number;
            accountId: string;
            accountCode: string | null;
            accountType: string;
            debit: number;
            credit: number;
            transactionReference: string;
            loanId: string | null;
            journalEntryId: string | null;
        }[];
    } & {
        id: string;
        type: string;
        createdAt: Date;
        reference: string;
        date: Date;
        memo: string | null;
        status: string;
        createdBy: string;
        currency: string;
        exchangeRate: number;
        totalAmount: number;
    })[]>;
    createJournalEntry(dto: any, req: any): Promise<{
        lines: {
            id: string;
            description: string | null;
            createdAt: Date;
            currency: string;
            exchangeRate: number;
            accountId: string;
            accountCode: string | null;
            accountType: string;
            debit: number;
            credit: number;
            transactionReference: string;
            loanId: string | null;
            journalEntryId: string | null;
        }[];
    } & {
        id: string;
        type: string;
        createdAt: Date;
        reference: string;
        date: Date;
        memo: string | null;
        status: string;
        createdBy: string;
        currency: string;
        exchangeRate: number;
        totalAmount: number;
    }>;
    createIncome(dto: any, req: any): Promise<{
        lines: {
            id: string;
            description: string | null;
            createdAt: Date;
            currency: string;
            exchangeRate: number;
            accountId: string;
            accountCode: string | null;
            accountType: string;
            debit: number;
            credit: number;
            transactionReference: string;
            loanId: string | null;
            journalEntryId: string | null;
        }[];
    } & {
        id: string;
        type: string;
        createdAt: Date;
        reference: string;
        date: Date;
        memo: string | null;
        status: string;
        createdBy: string;
        currency: string;
        exchangeRate: number;
        totalAmount: number;
    }>;
    createExpense(dto: any, req: any): Promise<{
        lines: {
            id: string;
            description: string | null;
            createdAt: Date;
            currency: string;
            exchangeRate: number;
            accountId: string;
            accountCode: string | null;
            accountType: string;
            debit: number;
            credit: number;
            transactionReference: string;
            loanId: string | null;
            journalEntryId: string | null;
        }[];
    } & {
        id: string;
        type: string;
        createdAt: Date;
        reference: string;
        date: Date;
        memo: string | null;
        status: string;
        createdBy: string;
        currency: string;
        exchangeRate: number;
        totalAmount: number;
    }>;
    createTransfer(dto: any, req: any): Promise<{
        lines: {
            id: string;
            description: string | null;
            createdAt: Date;
            currency: string;
            exchangeRate: number;
            accountId: string;
            accountCode: string | null;
            accountType: string;
            debit: number;
            credit: number;
            transactionReference: string;
            loanId: string | null;
            journalEntryId: string | null;
        }[];
    } & {
        id: string;
        type: string;
        createdAt: Date;
        reference: string;
        date: Date;
        memo: string | null;
        status: string;
        createdBy: string;
        currency: string;
        exchangeRate: number;
        totalAmount: number;
    }>;
    createSingleEntry(dto: any, req: any): Promise<{
        lines: {
            id: string;
            description: string | null;
            createdAt: Date;
            currency: string;
            exchangeRate: number;
            accountId: string;
            accountCode: string | null;
            accountType: string;
            debit: number;
            credit: number;
            transactionReference: string;
            loanId: string | null;
            journalEntryId: string | null;
        }[];
    } & {
        id: string;
        type: string;
        createdAt: Date;
        reference: string;
        date: Date;
        memo: string | null;
        status: string;
        createdBy: string;
        currency: string;
        exchangeRate: number;
        totalAmount: number;
    }>;
    getProfitAndLoss(startDate?: string, endDate?: string): Promise<{
        revenue: {
            totalDebit: number;
            totalCredit: number;
            balance: number;
            id: string;
            code: string;
            name: string;
            nameKh: string | null;
            type: string;
            normalBal: string;
            parentCode: string | null;
            isActive: boolean;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        expenses: {
            totalDebit: number;
            totalCredit: number;
            balance: number;
            id: string;
            code: string;
            name: string;
            nameKh: string | null;
            type: string;
            normalBal: string;
            parentCode: string | null;
            isActive: boolean;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        totalRevenue: number;
        totalExpenses: number;
        netIncome: number;
        startDate: Date;
        endDate: Date;
    }>;
    getBalanceSheet(): Promise<{
        assets: {
            totalDebit: number;
            totalCredit: number;
            balance: number;
            id: string;
            code: string;
            name: string;
            nameKh: string | null;
            type: string;
            normalBal: string;
            parentCode: string | null;
            isActive: boolean;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        liabilities: {
            totalDebit: number;
            totalCredit: number;
            balance: number;
            id: string;
            code: string;
            name: string;
            nameKh: string | null;
            type: string;
            normalBal: string;
            parentCode: string | null;
            isActive: boolean;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        equity: {
            totalDebit: number;
            totalCredit: number;
            balance: number;
            id: string;
            code: string;
            name: string;
            nameKh: string | null;
            type: string;
            normalBal: string;
            parentCode: string | null;
            isActive: boolean;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        totalAssets: number;
        totalLiabilities: number;
        totalEquity: number;
    }>;
    getAccountLedger(code: string, startDate?: string, endDate?: string): Promise<{
        account: {
            id: string;
            code: string;
            name: string;
            nameKh: string | null;
            type: string;
            normalBal: string;
            parentCode: string | null;
            isActive: boolean;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        entries: {
            runningBalance: number;
            journalEntry: {
                type: string;
                reference: string;
                date: Date;
                memo: string | null;
            } | null;
            loan: {
                lid: string | null;
                customer: {
                    firstName: string;
                    lastName: string;
                };
            } | null;
            id: string;
            description: string | null;
            createdAt: Date;
            currency: string;
            exchangeRate: number;
            accountId: string;
            accountCode: string | null;
            accountType: string;
            debit: number;
            credit: number;
            transactionReference: string;
            loanId: string | null;
            journalEntryId: string | null;
        }[];
        totalDebit: number;
        totalCredit: number;
        closingBalance: number;
    }>;
}

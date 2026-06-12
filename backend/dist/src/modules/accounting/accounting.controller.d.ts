import { AccountingService } from './accounting.service';
export declare class AccountingController {
    private readonly accountingService;
    constructor(accountingService: AccountingService);
    getAccounts(type?: string): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        code: string;
        description: string | null;
        nameKh: string | null;
        type: string;
        normalBal: string;
        parentCode: string | null;
    }[]>;
    createAccount(dto: any): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        code: string;
        description: string | null;
        nameKh: string | null;
        type: string;
        normalBal: string;
        parentCode: string | null;
    }>;
    updateAccount(id: string, dto: any): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        code: string;
        description: string | null;
        nameKh: string | null;
        type: string;
        normalBal: string;
        parentCode: string | null;
    }>;
    toggleAccount(id: string): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        code: string;
        description: string | null;
        nameKh: string | null;
        type: string;
        normalBal: string;
        parentCode: string | null;
    }>;
    getJournalEntries(type?: string, startDate?: string, endDate?: string): Promise<({
        lines: {
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
        }[];
    } & {
        id: string;
        createdAt: Date;
        status: string;
        currency: string;
        type: string;
        exchangeRate: number;
        date: Date;
        reference: string;
        memo: string | null;
        createdBy: string;
        totalAmount: number;
    })[]>;
    createJournalEntry(dto: any, req: any): Promise<{
        lines: {
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
        }[];
    } & {
        id: string;
        createdAt: Date;
        status: string;
        currency: string;
        type: string;
        exchangeRate: number;
        date: Date;
        reference: string;
        memo: string | null;
        createdBy: string;
        totalAmount: number;
    }>;
    createIncome(dto: any, req: any): Promise<{
        lines: {
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
        }[];
    } & {
        id: string;
        createdAt: Date;
        status: string;
        currency: string;
        type: string;
        exchangeRate: number;
        date: Date;
        reference: string;
        memo: string | null;
        createdBy: string;
        totalAmount: number;
    }>;
    createExpense(dto: any, req: any): Promise<{
        lines: {
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
        }[];
    } & {
        id: string;
        createdAt: Date;
        status: string;
        currency: string;
        type: string;
        exchangeRate: number;
        date: Date;
        reference: string;
        memo: string | null;
        createdBy: string;
        totalAmount: number;
    }>;
    createTransfer(dto: any, req: any): Promise<{
        lines: {
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
        }[];
    } & {
        id: string;
        createdAt: Date;
        status: string;
        currency: string;
        type: string;
        exchangeRate: number;
        date: Date;
        reference: string;
        memo: string | null;
        createdBy: string;
        totalAmount: number;
    }>;
    createSingleEntry(dto: any, req: any): Promise<{
        lines: {
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
        }[];
    } & {
        id: string;
        createdAt: Date;
        status: string;
        currency: string;
        type: string;
        exchangeRate: number;
        date: Date;
        reference: string;
        memo: string | null;
        createdBy: string;
        totalAmount: number;
    }>;
    getProfitAndLoss(startDate?: string, endDate?: string): Promise<{
        revenue: {
            totalDebit: number;
            totalCredit: number;
            balance: number;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            code: string;
            description: string | null;
            nameKh: string | null;
            type: string;
            normalBal: string;
            parentCode: string | null;
        }[];
        expenses: {
            totalDebit: number;
            totalCredit: number;
            balance: number;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            code: string;
            description: string | null;
            nameKh: string | null;
            type: string;
            normalBal: string;
            parentCode: string | null;
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
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            code: string;
            description: string | null;
            nameKh: string | null;
            type: string;
            normalBal: string;
            parentCode: string | null;
        }[];
        liabilities: {
            totalDebit: number;
            totalCredit: number;
            balance: number;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            code: string;
            description: string | null;
            nameKh: string | null;
            type: string;
            normalBal: string;
            parentCode: string | null;
        }[];
        equity: {
            totalDebit: number;
            totalCredit: number;
            balance: number;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            code: string;
            description: string | null;
            nameKh: string | null;
            type: string;
            normalBal: string;
            parentCode: string | null;
        }[];
        totalAssets: number;
        totalLiabilities: number;
        totalEquity: number;
    }>;
    getAccountLedger(code: string, startDate?: string, endDate?: string): Promise<{
        account: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            code: string;
            description: string | null;
            nameKh: string | null;
            type: string;
            normalBal: string;
            parentCode: string | null;
        };
        entries: {
            runningBalance: number;
            loan: {
                lid: string | null;
                customer: {
                    firstName: string;
                    lastName: string;
                };
            } | null;
            journalEntry: {
                type: string;
                date: Date;
                reference: string;
                memo: string | null;
            } | null;
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
        }[];
        totalDebit: number;
        totalCredit: number;
        closingBalance: number;
    }>;
}

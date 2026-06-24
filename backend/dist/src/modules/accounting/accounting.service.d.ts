import { PrismaService } from '../../infrastructure/prisma/prisma.service';
export interface CreateAccountDto {
    code: string;
    name: string;
    nameKh?: string;
    type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
    normalBal: 'DEBIT' | 'CREDIT';
    parentCode?: string;
    description?: string;
}
export interface JournalLineDto {
    accountCode: string;
    debit?: number;
    credit?: number;
    description?: string;
}
export interface CreateJournalEntryDto {
    date: string;
    memo?: string;
    currency?: string;
    exchangeRate?: number;
    lines: JournalLineDto[];
}
export interface CreateIncomeDto {
    date: string;
    incomeAccountCode: string;
    cashAccountCode: string;
    amount: number;
    currency?: string;
    exchangeRate?: number;
    memo?: string;
}
export interface CreateExpenseDto {
    date: string;
    expenseAccountCode: string;
    cashAccountCode: string;
    amount: number;
    currency?: string;
    exchangeRate?: number;
    memo?: string;
}
export interface CreateTransferDto {
    date: string;
    fromAccountCode: string;
    toAccountCode: string;
    amount: number;
    fromCurrency?: string;
    toCurrency?: string;
    exchangeRate?: number;
    memo?: string;
}
export interface CreateSingleEntryDto {
    date: string;
    accountCode: string;
    side: 'DEBIT' | 'CREDIT';
    amount: number;
    currency?: string;
    memo?: string;
}
export declare class AccountingService {
    private prisma;
    constructor(prisma: PrismaService);
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
    createAccount(dto: CreateAccountDto): Promise<{
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
    updateAccount(id: string, dto: Partial<CreateAccountDto>): Promise<{
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
    toggleAccountActive(id: string): Promise<{
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
            exchangeRate: number;
            loanId: string | null;
            accountId: string;
            debit: number;
            credit: number;
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
        exchangeRate: number;
        type: string;
        date: Date;
        reference: string;
        memo: string | null;
        createdBy: string;
        totalAmount: number;
    })[]>;
    createJournalEntry(dto: CreateJournalEntryDto, userId: string): Promise<{
        lines: {
            id: string;
            createdAt: Date;
            description: string | null;
            currency: string;
            exchangeRate: number;
            loanId: string | null;
            accountId: string;
            debit: number;
            credit: number;
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
        exchangeRate: number;
        type: string;
        date: Date;
        reference: string;
        memo: string | null;
        createdBy: string;
        totalAmount: number;
    }>;
    createIncomeEntry(dto: CreateIncomeDto, userId: string): Promise<{
        lines: {
            id: string;
            createdAt: Date;
            description: string | null;
            currency: string;
            exchangeRate: number;
            loanId: string | null;
            accountId: string;
            debit: number;
            credit: number;
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
        exchangeRate: number;
        type: string;
        date: Date;
        reference: string;
        memo: string | null;
        createdBy: string;
        totalAmount: number;
    }>;
    createExpenseEntry(dto: CreateExpenseDto, userId: string): Promise<{
        lines: {
            id: string;
            createdAt: Date;
            description: string | null;
            currency: string;
            exchangeRate: number;
            loanId: string | null;
            accountId: string;
            debit: number;
            credit: number;
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
        exchangeRate: number;
        type: string;
        date: Date;
        reference: string;
        memo: string | null;
        createdBy: string;
        totalAmount: number;
    }>;
    createTransfer(dto: CreateTransferDto, userId: string): Promise<{
        lines: {
            id: string;
            createdAt: Date;
            description: string | null;
            currency: string;
            exchangeRate: number;
            loanId: string | null;
            accountId: string;
            debit: number;
            credit: number;
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
        exchangeRate: number;
        type: string;
        date: Date;
        reference: string;
        memo: string | null;
        createdBy: string;
        totalAmount: number;
    }>;
    createSingleEntry(dto: CreateSingleEntryDto, userId: string): Promise<{
        lines: {
            id: string;
            createdAt: Date;
            description: string | null;
            currency: string;
            exchangeRate: number;
            loanId: string | null;
            accountId: string;
            debit: number;
            credit: number;
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
        exchangeRate: number;
        type: string;
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
            exchangeRate: number;
            loanId: string | null;
            accountId: string;
            debit: number;
            credit: number;
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

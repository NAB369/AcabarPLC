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
    createAccount(dto: CreateAccountDto): Promise<{
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
    updateAccount(id: string, dto: Partial<CreateAccountDto>): Promise<{
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
    toggleAccountActive(id: string): Promise<{
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
    createJournalEntry(dto: CreateJournalEntryDto, userId: string): Promise<{
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
    createIncomeEntry(dto: CreateIncomeDto, userId: string): Promise<{
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
    createExpenseEntry(dto: CreateExpenseDto, userId: string): Promise<{
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
    createTransfer(dto: CreateTransferDto, userId: string): Promise<{
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
    createSingleEntry(dto: CreateSingleEntryDto, userId: string): Promise<{
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

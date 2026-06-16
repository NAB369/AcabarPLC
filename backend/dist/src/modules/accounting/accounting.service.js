"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../infrastructure/prisma/prisma.service");
const crypto_1 = require("crypto");
let AccountingService = class AccountingService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAccounts(type) {
        return this.prisma.account.findMany({
            where: type ? { type, isActive: true } : { isActive: true },
            orderBy: [{ type: 'asc' }, { code: 'asc' }],
        });
    }
    async createAccount(dto) {
        const exists = await this.prisma.account.findUnique({
            where: { code: dto.code },
        });
        if (exists)
            throw new common_1.BadRequestException(`Account code ${dto.code} already exists`);
        return this.prisma.account.create({ data: dto });
    }
    async updateAccount(id, dto) {
        const acct = await this.prisma.account.findUnique({ where: { id } });
        if (!acct)
            throw new common_1.NotFoundException('Account not found');
        return this.prisma.account.update({ where: { id }, data: dto });
    }
    async toggleAccountActive(id) {
        const acct = await this.prisma.account.findUnique({ where: { id } });
        if (!acct)
            throw new common_1.NotFoundException('Account not found');
        return this.prisma.account.update({
            where: { id },
            data: { isActive: !acct.isActive },
        });
    }
    async getJournalEntries(type, startDate, endDate) {
        const where = {};
        if (type)
            where.type = type;
        if (startDate || endDate) {
            const dateFilter = {};
            if (startDate)
                dateFilter.gte = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                dateFilter.lte = end;
            }
            where.date = dateFilter;
        }
        return this.prisma.journalEntry.findMany({
            where,
            include: { lines: true },
            orderBy: { date: 'desc' },
            take: 100,
        });
    }
    async createJournalEntry(dto, userId) {
        const totalDebit = dto.lines.reduce((s, l) => s + (l.debit || 0), 0);
        const totalCredit = dto.lines.reduce((s, l) => s + (l.credit || 0), 0);
        if (Math.abs(totalDebit - totalCredit) > 0.01) {
            throw new common_1.BadRequestException(`Journal entry does not balance. Debit: ${totalDebit.toFixed(2)}, Credit: ${totalCredit.toFixed(2)}`);
        }
        for (const line of dto.lines) {
            const acct = await this.prisma.account.findUnique({
                where: { code: line.accountCode },
            });
            if (!acct)
                throw new common_1.BadRequestException(`Account code ${line.accountCode} not found`);
        }
        const reference = `JNL-${Date.now()}-${(0, crypto_1.randomUUID)().substring(0, 6).toUpperCase()}`;
        return this.prisma.journalEntry.create({
            data: {
                reference,
                date: new Date(dto.date),
                memo: dto.memo,
                type: 'JOURNAL',
                createdBy: userId,
                currency: dto.currency || 'USD',
                exchangeRate: dto.exchangeRate || 1.0,
                totalAmount: totalDebit,
                lines: {
                    create: dto.lines.map((line) => ({
                        accountId: line.accountCode,
                        accountCode: line.accountCode,
                        accountType: 'JOURNAL',
                        debit: line.debit || 0,
                        credit: line.credit || 0,
                        transactionReference: reference,
                        description: line.description || dto.memo,
                        currency: dto.currency || 'USD',
                        exchangeRate: dto.exchangeRate || 1.0,
                    })),
                },
            },
            include: { lines: true },
        });
    }
    async createIncomeEntry(dto, userId) {
        const incomeAcct = await this.prisma.account.findUnique({
            where: { code: dto.incomeAccountCode },
        });
        const cashAcct = await this.prisma.account.findUnique({
            where: { code: dto.cashAccountCode },
        });
        if (!incomeAcct)
            throw new common_1.BadRequestException(`Income account ${dto.incomeAccountCode} not found`);
        if (!cashAcct)
            throw new common_1.BadRequestException(`Cash account ${dto.cashAccountCode} not found`);
        const reference = `INC-${Date.now()}-${(0, crypto_1.randomUUID)().substring(0, 6).toUpperCase()}`;
        const amt = dto.amount;
        const cur = dto.currency || 'USD';
        const rate = dto.exchangeRate || 1.0;
        return this.prisma.journalEntry.create({
            data: {
                reference,
                date: new Date(dto.date),
                memo: dto.memo || `Income: ${incomeAcct.name}`,
                type: 'INCOME',
                createdBy: userId,
                currency: cur,
                exchangeRate: rate,
                totalAmount: amt,
                lines: {
                    create: [
                        {
                            accountId: dto.cashAccountCode,
                            accountCode: dto.cashAccountCode,
                            accountType: 'CASH',
                            debit: amt,
                            credit: 0,
                            transactionReference: reference,
                            description: `Cash received - ${incomeAcct.name}`,
                            currency: cur,
                            exchangeRate: rate,
                        },
                        {
                            accountId: dto.incomeAccountCode,
                            accountCode: dto.incomeAccountCode,
                            accountType: 'INCOME',
                            debit: 0,
                            credit: amt,
                            transactionReference: reference,
                            description: dto.memo || incomeAcct.name,
                            currency: cur,
                            exchangeRate: rate,
                        },
                    ],
                },
            },
            include: { lines: true },
        });
    }
    async createExpenseEntry(dto, userId) {
        const expAcct = await this.prisma.account.findUnique({
            where: { code: dto.expenseAccountCode },
        });
        const cashAcct = await this.prisma.account.findUnique({
            where: { code: dto.cashAccountCode },
        });
        if (!expAcct)
            throw new common_1.BadRequestException(`Expense account ${dto.expenseAccountCode} not found`);
        if (!cashAcct)
            throw new common_1.BadRequestException(`Cash account ${dto.cashAccountCode} not found`);
        const reference = `EXP-${Date.now()}-${(0, crypto_1.randomUUID)().substring(0, 6).toUpperCase()}`;
        const amt = dto.amount;
        const cur = dto.currency || 'USD';
        const rate = dto.exchangeRate || 1.0;
        return this.prisma.journalEntry.create({
            data: {
                reference,
                date: new Date(dto.date),
                memo: dto.memo || `Expense: ${expAcct.name}`,
                type: 'EXPENSE',
                createdBy: userId,
                currency: cur,
                exchangeRate: rate,
                totalAmount: amt,
                lines: {
                    create: [
                        {
                            accountId: dto.expenseAccountCode,
                            accountCode: dto.expenseAccountCode,
                            accountType: 'EXPENSE',
                            debit: amt,
                            credit: 0,
                            transactionReference: reference,
                            description: dto.memo || expAcct.name,
                            currency: cur,
                            exchangeRate: rate,
                        },
                        {
                            accountId: dto.cashAccountCode,
                            accountCode: dto.cashAccountCode,
                            accountType: 'CASH',
                            debit: 0,
                            credit: amt,
                            transactionReference: reference,
                            description: `Cash paid - ${expAcct.name}`,
                            currency: cur,
                            exchangeRate: rate,
                        },
                    ],
                },
            },
            include: { lines: true },
        });
    }
    async createTransfer(dto, userId) {
        const fromAcct = await this.prisma.account.findUnique({
            where: { code: dto.fromAccountCode },
        });
        const toAcct = await this.prisma.account.findUnique({
            where: { code: dto.toAccountCode },
        });
        if (!fromAcct)
            throw new common_1.BadRequestException(`From account ${dto.fromAccountCode} not found`);
        if (!toAcct)
            throw new common_1.BadRequestException(`To account ${dto.toAccountCode} not found`);
        const reference = `TRF-${Date.now()}-${(0, crypto_1.randomUUID)().substring(0, 6).toUpperCase()}`;
        const fromCur = dto.fromCurrency || 'USD';
        const toCur = dto.toCurrency || fromCur;
        const rate = dto.exchangeRate || 1.0;
        const toAmount = dto.amount * rate;
        return this.prisma.journalEntry.create({
            data: {
                reference,
                date: new Date(dto.date),
                memo: dto.memo || `Transfer: ${fromAcct.name} → ${toAcct.name}`,
                type: 'TRANSFER',
                createdBy: userId,
                currency: fromCur,
                exchangeRate: rate,
                totalAmount: dto.amount,
                lines: {
                    create: [
                        {
                            accountId: dto.toAccountCode,
                            accountCode: dto.toAccountCode,
                            accountType: 'CASH',
                            debit: toAmount,
                            credit: 0,
                            transactionReference: reference,
                            description: `Received from ${fromAcct.name} (${fromCur} ${dto.amount.toFixed(2)})`,
                            currency: toCur,
                            exchangeRate: rate,
                        },
                        {
                            accountId: dto.fromAccountCode,
                            accountCode: dto.fromAccountCode,
                            accountType: 'CASH',
                            debit: 0,
                            credit: dto.amount,
                            transactionReference: reference,
                            description: `Transferred to ${toAcct.name} (${toCur} ${toAmount.toFixed(2)})`,
                            currency: fromCur,
                            exchangeRate: rate,
                        },
                    ],
                },
            },
            include: { lines: true },
        });
    }
    async createSingleEntry(dto, userId) {
        const acct = await this.prisma.account.findUnique({
            where: { code: dto.accountCode },
        });
        if (!acct)
            throw new common_1.BadRequestException(`Account ${dto.accountCode} not found`);
        const reference = `SGL-${Date.now()}-${(0, crypto_1.randomUUID)().substring(0, 6).toUpperCase()}`;
        const cur = dto.currency || 'USD';
        return this.prisma.journalEntry.create({
            data: {
                reference,
                date: new Date(dto.date),
                memo: dto.memo || `Single entry: ${acct.name}`,
                type: 'SINGLE',
                createdBy: userId,
                currency: cur,
                exchangeRate: 1.0,
                totalAmount: dto.amount,
                lines: {
                    create: [
                        {
                            accountId: dto.accountCode,
                            accountCode: dto.accountCode,
                            accountType: acct.type,
                            debit: dto.side === 'DEBIT' ? dto.amount : 0,
                            credit: dto.side === 'CREDIT' ? dto.amount : 0,
                            transactionReference: reference,
                            description: dto.memo,
                            currency: cur,
                            exchangeRate: 1.0,
                        },
                    ],
                },
            },
            include: { lines: true },
        });
    }
    async getProfitAndLoss(startDate, endDate) {
        const start = startDate
            ? new Date(`${startDate}T00:00:00.000Z`)
            : new Date(new Date().getFullYear(), 0, 1);
        const end = endDate ? new Date(`${endDate}T23:59:59.999Z`) : new Date();
        const accounts = await this.prisma.account.findMany({
            where: { type: { in: ['REVENUE', 'EXPENSE'] }, isActive: true },
            orderBy: { code: 'asc' },
        });
        const rows = await Promise.all(accounts.map(async (acct) => {
            const result = await this.prisma.ledgerEntry.aggregate({
                where: {
                    accountCode: acct.code,
                    createdAt: { gte: start, lte: end },
                },
                _sum: { debit: true, credit: true },
            });
            const totalDebit = Number(result._sum.debit) || 0;
            const totalCredit = Number(result._sum.credit) || 0;
            const balance = acct.normalBal === 'CREDIT'
                ? totalCredit - totalDebit
                : totalDebit - totalCredit;
            return { ...acct, totalDebit, totalCredit, balance };
        }));
        const revenue = rows.filter((r) => r.type === 'REVENUE');
        const expenses = rows.filter((r) => r.type === 'EXPENSE');
        const totalRevenue = revenue.reduce((s, r) => s + r.balance, 0);
        const totalExpenses = expenses.reduce((s, r) => s + r.balance, 0);
        const netIncome = totalRevenue - totalExpenses;
        return {
            revenue,
            expenses,
            totalRevenue,
            totalExpenses,
            netIncome,
            startDate: start,
            endDate: end,
        };
    }
    async getBalanceSheet() {
        const accounts = await this.prisma.account.findMany({
            where: { type: { in: ['ASSET', 'LIABILITY', 'EQUITY'] }, isActive: true },
            orderBy: { code: 'asc' },
        });
        const rows = await Promise.all(accounts.map(async (acct) => {
            const result = await this.prisma.ledgerEntry.aggregate({
                where: { accountCode: acct.code },
                _sum: { debit: true, credit: true },
            });
            const totalDebit = Number(result._sum.debit) || 0;
            const totalCredit = Number(result._sum.credit) || 0;
            const balance = acct.normalBal === 'DEBIT'
                ? totalDebit - totalCredit
                : totalCredit - totalDebit;
            return { ...acct, totalDebit, totalCredit, balance };
        }));
        const assets = rows.filter((r) => r.type === 'ASSET');
        const liabilities = rows.filter((r) => r.type === 'LIABILITY');
        const equity = rows.filter((r) => r.type === 'EQUITY');
        const totalAssets = assets.reduce((s, r) => s + r.balance, 0);
        const totalLiabilities = liabilities.reduce((s, r) => s + r.balance, 0);
        const totalEquity = equity.reduce((s, r) => s + r.balance, 0);
        return {
            assets,
            liabilities,
            equity,
            totalAssets,
            totalLiabilities,
            totalEquity,
        };
    }
    async getAccountLedger(code, startDate, endDate) {
        const acct = await this.prisma.account.findUnique({ where: { code } });
        if (!acct)
            throw new common_1.NotFoundException(`Account ${code} not found`);
        const dateFilter = {};
        let hasDateFilter = false;
        if (startDate) {
            dateFilter.gte = new Date(`${startDate}T00:00:00.000Z`);
            hasDateFilter = true;
        }
        if (endDate) {
            dateFilter.lte = new Date(`${endDate}T23:59:59.999Z`);
            hasDateFilter = true;
        }
        const entries = await this.prisma.ledgerEntry.findMany({
            where: {
                accountCode: code,
                ...(hasDateFilter ? { createdAt: dateFilter } : {}),
            },
            include: {
                journalEntry: {
                    select: { reference: true, type: true, memo: true, date: true },
                },
                loan: {
                    select: {
                        lid: true,
                        customer: { select: { firstName: true, lastName: true } },
                    },
                },
            },
            orderBy: { createdAt: 'asc' },
        });
        let runningBalance = 0;
        const ledgerWithBalance = entries.map((e) => {
            if (acct.normalBal === 'DEBIT') {
                runningBalance += e.debit - e.credit;
            }
            else {
                runningBalance += e.credit - e.debit;
            }
            return { ...e, runningBalance };
        });
        const totalDebit = entries.reduce((s, e) => s + e.debit, 0);
        const totalCredit = entries.reduce((s, e) => s + e.credit, 0);
        return {
            account: acct,
            entries: ledgerWithBalance,
            totalDebit,
            totalCredit,
            closingBalance: runningBalance,
        };
    }
};
exports.AccountingService = AccountingService;
exports.AccountingService = AccountingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AccountingService);
//# sourceMappingURL=accounting.service.js.map
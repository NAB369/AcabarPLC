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
exports.LedgerService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../infrastructure/prisma/prisma.service");
let LedgerService = class LedgerService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async recordTransaction(entries, txClient) {
        const client = txClient || this.prisma;
        try {
            await client.ledgerEntry.createMany({
                data: entries.map((entry) => ({
                    accountId: entry.accountId,
                    accountType: entry.accountType,
                    debit: entry.debit || 0,
                    credit: entry.credit || 0,
                    transactionReference: entry.transactionReference,
                    description: entry.description,
                })),
            });
            return { success: true };
        }
        catch (error) {
            console.error('Ledger record failed:', error);
            throw new common_1.InternalServerErrorException('Failed to record ledger entry: ' + error.message);
        }
    }
    async getAccountBalance(accountId) {
        const result = await this.prisma.ledgerEntry.aggregate({
            where: { accountId },
            _sum: { debit: true, credit: true },
        });
        const totalDebit = Number(result._sum.debit) || 0;
        const totalCredit = Number(result._sum.credit) || 0;
        return {
            accountId,
            totalDebit,
            totalCredit,
            netBalance: totalDebit - totalCredit,
        };
    }
    async getAccountEntries(accountId) {
        return this.prisma.ledgerEntry.findMany({
            where: { accountId },
            orderBy: { createdAt: 'asc' },
        });
    }
};
exports.LedgerService = LedgerService;
exports.LedgerService = LedgerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LedgerService);
//# sourceMappingURL=ledger.service.js.map
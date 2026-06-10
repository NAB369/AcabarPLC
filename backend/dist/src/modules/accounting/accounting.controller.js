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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountingController = void 0;
const common_1 = require("@nestjs/common");
const accounting_service_1 = require("./accounting.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const permissions_guard_1 = require("../auth/guards/permissions.guard");
const permissions_decorator_1 = require("../auth/decorators/permissions.decorator");
let AccountingController = class AccountingController {
    accountingService;
    constructor(accountingService) {
        this.accountingService = accountingService;
    }
    getAccounts(type) {
        return this.accountingService.getAccounts(type);
    }
    createAccount(dto) {
        return this.accountingService.createAccount(dto);
    }
    updateAccount(id, dto) {
        return this.accountingService.updateAccount(id, dto);
    }
    toggleAccount(id) {
        return this.accountingService.toggleAccountActive(id);
    }
    getJournalEntries(type, startDate, endDate) {
        return this.accountingService.getJournalEntries(type, startDate, endDate);
    }
    createJournalEntry(dto, req) {
        return this.accountingService.createJournalEntry(dto, req.user.userId);
    }
    createIncome(dto, req) {
        return this.accountingService.createIncomeEntry(dto, req.user.userId);
    }
    createExpense(dto, req) {
        return this.accountingService.createExpenseEntry(dto, req.user.userId);
    }
    createTransfer(dto, req) {
        return this.accountingService.createTransfer(dto, req.user.userId);
    }
    createSingleEntry(dto, req) {
        return this.accountingService.createSingleEntry(dto, req.user.userId);
    }
    getProfitAndLoss(startDate, endDate) {
        return this.accountingService.getProfitAndLoss(startDate, endDate);
    }
    getBalanceSheet() {
        return this.accountingService.getBalanceSheet();
    }
    getAccountLedger(code, startDate, endDate) {
        return this.accountingService.getAccountLedger(code, startDate, endDate);
    }
};
exports.AccountingController = AccountingController;
__decorate([
    (0, common_1.Get)('accounts'),
    (0, permissions_decorator_1.Permissions)('VIEW_ACCOUNTS'),
    __param(0, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AccountingController.prototype, "getAccounts", null);
__decorate([
    (0, common_1.Post)('accounts'),
    (0, permissions_decorator_1.Permissions)('MANAGE_ACCOUNTS'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AccountingController.prototype, "createAccount", null);
__decorate([
    (0, common_1.Put)('accounts/:id'),
    (0, permissions_decorator_1.Permissions)('MANAGE_ACCOUNTS'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AccountingController.prototype, "updateAccount", null);
__decorate([
    (0, common_1.Put)('accounts/:id/toggle'),
    (0, permissions_decorator_1.Permissions)('MANAGE_ACCOUNTS'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AccountingController.prototype, "toggleAccount", null);
__decorate([
    (0, common_1.Get)('journal-entries'),
    (0, permissions_decorator_1.Permissions)('VIEW_REPORTS'),
    __param(0, (0, common_1.Query)('type')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], AccountingController.prototype, "getJournalEntries", null);
__decorate([
    (0, common_1.Post)('journal-entries'),
    (0, permissions_decorator_1.Permissions)('MANAGE_JOURNAL'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AccountingController.prototype, "createJournalEntry", null);
__decorate([
    (0, common_1.Post)('income'),
    (0, permissions_decorator_1.Permissions)('MANAGE_JOURNAL'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AccountingController.prototype, "createIncome", null);
__decorate([
    (0, common_1.Post)('expense'),
    (0, permissions_decorator_1.Permissions)('MANAGE_JOURNAL'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AccountingController.prototype, "createExpense", null);
__decorate([
    (0, common_1.Post)('transfer'),
    (0, permissions_decorator_1.Permissions)('MANAGE_JOURNAL'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AccountingController.prototype, "createTransfer", null);
__decorate([
    (0, common_1.Post)('single-entry'),
    (0, permissions_decorator_1.Permissions)('MANAGE_JOURNAL'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AccountingController.prototype, "createSingleEntry", null);
__decorate([
    (0, common_1.Get)('reports/profit-loss'),
    (0, permissions_decorator_1.Permissions)('VIEW_REPORTS'),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AccountingController.prototype, "getProfitAndLoss", null);
__decorate([
    (0, common_1.Get)('reports/balance-sheet'),
    (0, permissions_decorator_1.Permissions)('VIEW_REPORTS'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AccountingController.prototype, "getBalanceSheet", null);
__decorate([
    (0, common_1.Get)('reports/ledger/:code'),
    (0, permissions_decorator_1.Permissions)('VIEW_REPORTS'),
    __param(0, (0, common_1.Param)('code')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], AccountingController.prototype, "getAccountLedger", null);
exports.AccountingController = AccountingController = __decorate([
    (0, common_1.Controller)('accounting'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [accounting_service_1.AccountingService])
], AccountingController);
//# sourceMappingURL=accounting.controller.js.map
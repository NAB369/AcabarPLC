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
exports.PeriodController = void 0;
const common_1 = require("@nestjs/common");
const period_service_1 = require("./period.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const permissions_guard_1 = require("../auth/guards/permissions.guard");
const permissions_decorator_1 = require("../auth/decorators/permissions.decorator");
let PeriodController = class PeriodController {
    periodService;
    constructor(periodService) {
        this.periodService = periodService;
    }
    getState() {
        return this.periodService.getState();
    }
    startOfDay(req) {
        return this.periodService.startOfDay(req.user.userId);
    }
    endOfDay(req) {
        return this.periodService.endOfDay(req.user.userId);
    }
    getLogs() {
        return this.periodService.getLogs();
    }
    getTrialBalance() {
        return this.periodService.getTrialBalance();
    }
    getJournal(date) {
        return this.periodService.getJournal(date);
    }
};
exports.PeriodController = PeriodController;
__decorate([
    (0, common_1.Get)('state'),
    (0, permissions_decorator_1.Permissions)('VIEW_PERIOD'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PeriodController.prototype, "getState", null);
__decorate([
    (0, common_1.Post)('sod'),
    (0, permissions_decorator_1.Permissions)('MANAGE_PERIOD'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PeriodController.prototype, "startOfDay", null);
__decorate([
    (0, common_1.Post)('eod'),
    (0, permissions_decorator_1.Permissions)('MANAGE_PERIOD'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PeriodController.prototype, "endOfDay", null);
__decorate([
    (0, common_1.Get)('logs'),
    (0, permissions_decorator_1.Permissions)('VIEW_PERIOD'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PeriodController.prototype, "getLogs", null);
__decorate([
    (0, common_1.Get)('reports/trial-balance'),
    (0, permissions_decorator_1.Permissions)('VIEW_REPORTS'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PeriodController.prototype, "getTrialBalance", null);
__decorate([
    (0, common_1.Get)('reports/journal'),
    (0, permissions_decorator_1.Permissions)('VIEW_REPORTS'),
    __param(0, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PeriodController.prototype, "getJournal", null);
exports.PeriodController = PeriodController = __decorate([
    (0, common_1.Controller)('period'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [period_service_1.PeriodService])
], PeriodController);
//# sourceMappingURL=period.controller.js.map
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
exports.LosController = void 0;
const common_1 = require("@nestjs/common");
const los_service_1 = require("./los.service");
const index_1 = require("./dto/index");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const permissions_guard_1 = require("../auth/guards/permissions.guard");
const permissions_decorator_1 = require("../auth/decorators/permissions.decorator");
let LosController = class LosController {
    losService;
    constructor(losService) {
        this.losService = losService;
    }
    getNextLid() {
        return this.losService.getNextLid();
    }
    createDraft(dto) {
        return this.losService.createDraft(dto);
    }
    submitApplication(id, req) {
        return this.losService.submitApplication(id, req.user.sub);
    }
    startKycReview(id, req) {
        return this.losService.startKycReview(id, req.user.sub);
    }
    completeKycReview(id, body, req) {
        return this.losService.completeKycReview(id, body.approved, req.user.sub, body.reason);
    }
    runCreditCheck(id, req) {
        return this.losService.runCreditCheck(id, req.user.sub);
    }
    reviewApplication(id, dto, req) {
        return this.losService.reviewApplication(id, dto, req.user.sub);
    }
    prepareDisbursement(id, req) {
        return this.losService.prepareDisbursement(id, req.user.sub);
    }
    disburseLoan(id, body) {
        return this.losService.disburseLoan(id, body?.method);
    }
    activateLoan(id, req) {
        return this.losService.activateLoan(id, req.user.sub);
    }
    getQueue(status, branchId, loanOfficerId) {
        return this.losService.getQueue({ status, branchId, loanOfficerId });
    }
    getApplicationDetail(id) {
        console.log('HIT getApplicationDetail() with id:', id);
        return this.losService.getApplicationDetail(id);
    }
    getTimeline(id) {
        return this.losService.getTimeline(id);
    }
    addCollateral(id, dto) {
        return this.losService.addCollateral(id, dto);
    }
    addGuarantor(id, dto) {
        return this.losService.addGuarantor(id, dto);
    }
};
exports.LosController = LosController;
__decorate([
    (0, common_1.Get)('next-lid'),
    (0, permissions_decorator_1.Permissions)('VIEW_DASHBOARD'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], LosController.prototype, "getNextLid", null);
__decorate([
    (0, common_1.Post)('draft'),
    (0, permissions_decorator_1.Permissions)('CREATE_LOAN'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [index_1.CreateDraftDto]),
    __metadata("design:returntype", void 0)
], LosController.prototype, "createDraft", null);
__decorate([
    (0, common_1.Patch)(':id/submit'),
    (0, permissions_decorator_1.Permissions)('CREATE_LOAN'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], LosController.prototype, "submitApplication", null);
__decorate([
    (0, common_1.Patch)(':id/kyc-review'),
    (0, permissions_decorator_1.Permissions)('APPROVE_KYC'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], LosController.prototype, "startKycReview", null);
__decorate([
    (0, common_1.Patch)(':id/kyc-decision'),
    (0, permissions_decorator_1.Permissions)('APPROVE_KYC'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], LosController.prototype, "completeKycReview", null);
__decorate([
    (0, common_1.Post)(':id/credit-check'),
    (0, permissions_decorator_1.Permissions)('CREDIT_EVALUATE'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], LosController.prototype, "runCreditCheck", null);
__decorate([
    (0, common_1.Patch)(':id/review'),
    (0, permissions_decorator_1.Permissions)('UNDERWRITE_LOAN'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, index_1.ReviewDecisionDto, Object]),
    __metadata("design:returntype", void 0)
], LosController.prototype, "reviewApplication", null);
__decorate([
    (0, common_1.Patch)(':id/prepare-disbursement'),
    (0, permissions_decorator_1.Permissions)('MANAGE_DISBURSEMENT'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], LosController.prototype, "prepareDisbursement", null);
__decorate([
    (0, common_1.Post)(':id/disburse'),
    (0, permissions_decorator_1.Permissions)('MANAGE_DISBURSEMENT'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], LosController.prototype, "disburseLoan", null);
__decorate([
    (0, common_1.Patch)(':id/activate'),
    (0, permissions_decorator_1.Permissions)('MANAGE_DISBURSEMENT'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], LosController.prototype, "activateLoan", null);
__decorate([
    (0, common_1.Get)('queue'),
    (0, permissions_decorator_1.Permissions)('VIEW_DASHBOARD'),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Query)('loanOfficerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], LosController.prototype, "getQueue", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.Permissions)('VIEW_DASHBOARD'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LosController.prototype, "getApplicationDetail", null);
__decorate([
    (0, common_1.Get)(':id/timeline'),
    (0, permissions_decorator_1.Permissions)('VIEW_DASHBOARD'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LosController.prototype, "getTimeline", null);
__decorate([
    (0, common_1.Post)(':id/collateral'),
    (0, permissions_decorator_1.Permissions)('CREATE_LOAN'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, index_1.AddCollateralDto]),
    __metadata("design:returntype", void 0)
], LosController.prototype, "addCollateral", null);
__decorate([
    (0, common_1.Post)(':id/guarantor'),
    (0, permissions_decorator_1.Permissions)('CREATE_LOAN'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, index_1.AddGuarantorDto]),
    __metadata("design:returntype", void 0)
], LosController.prototype, "addGuarantor", null);
exports.LosController = LosController = __decorate([
    (0, common_1.Controller)('los'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [los_service_1.LosService])
], LosController);
//# sourceMappingURL=los.controller.js.map
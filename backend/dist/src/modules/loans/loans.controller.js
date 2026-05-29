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
exports.LoansController = void 0;
const common_1 = require("@nestjs/common");
const loans_service_1 = require("./loans.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const permissions_guard_1 = require("../auth/guards/permissions.guard");
const permissions_decorator_1 = require("../auth/decorators/permissions.decorator");
let LoansController = class LoansController {
    loansService;
    constructor(loansService) {
        this.loansService = loansService;
    }
    createProduct(data) {
        return this.loansService.createProduct(data);
    }
    getProduct(id) {
        return this.loansService.getProduct(id);
    }
    updateProduct(id, data) {
        return this.loansService.updateProduct(id, data);
    }
    deleteProduct(id) {
        return this.loansService.deleteProduct(id);
    }
    getAllProducts() {
        return this.loansService.getAllProducts();
    }
    applyForLoan(createLoanDto) {
        return this.loansService.applyForLoan(createLoanDto);
    }
    async getMyActiveLoan(req) {
        const customer = await this.loansService.findCustomerByEmail(req.user.email);
        if (!customer) {
            throw new Error('Customer profile not found for user');
        }
        return this.loansService.getMyActiveLoan(customer.id);
    }
    approveLoan(id) {
        return this.loansService.approveLoan(id);
    }
    disburseLoan(id) {
        return this.loansService.disburseLoan(id);
    }
};
exports.LoansController = LoansController;
__decorate([
    (0, common_1.Post)('products'),
    (0, permissions_decorator_1.Permissions)('MANAGE_SYSTEM'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LoansController.prototype, "createProduct", null);
__decorate([
    (0, common_1.Get)('products/:id'),
    (0, permissions_decorator_1.Permissions)('VIEW_DASHBOARD'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LoansController.prototype, "getProduct", null);
__decorate([
    (0, common_1.Patch)('products/:id'),
    (0, permissions_decorator_1.Permissions)('MANAGE_SYSTEM'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], LoansController.prototype, "updateProduct", null);
__decorate([
    (0, common_1.Delete)('products/:id'),
    (0, permissions_decorator_1.Permissions)('MANAGE_SYSTEM'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LoansController.prototype, "deleteProduct", null);
__decorate([
    (0, common_1.Get)('products'),
    (0, permissions_decorator_1.Permissions)('VIEW_DASHBOARD'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], LoansController.prototype, "getAllProducts", null);
__decorate([
    (0, common_1.Post)('apply'),
    (0, permissions_decorator_1.Permissions)('CREATE_LOAN'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [loans_service_1.CreateLoanDto]),
    __metadata("design:returntype", void 0)
], LoansController.prototype, "applyForLoan", null);
__decorate([
    (0, common_1.Get)('my-active'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LoansController.prototype, "getMyActiveLoan", null);
__decorate([
    (0, common_1.Post)(':id/approve'),
    (0, permissions_decorator_1.Permissions)('UNDERWRITE_LOAN'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LoansController.prototype, "approveLoan", null);
__decorate([
    (0, common_1.Post)(':id/disburse'),
    (0, permissions_decorator_1.Permissions)('MANAGE_DISBURSEMENT'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LoansController.prototype, "disburseLoan", null);
exports.LoansController = LoansController = __decorate([
    (0, common_1.Controller)('loans'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [loans_service_1.LoansService])
], LoansController);
//# sourceMappingURL=loans.controller.js.map
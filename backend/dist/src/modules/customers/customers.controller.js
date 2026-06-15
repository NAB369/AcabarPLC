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
exports.CustomersController = void 0;
const common_1 = require("@nestjs/common");
const customers_service_1 = require("./customers.service");
const create_customer_dto_1 = require("./dto/create-customer.dto");
const roles_guard_1 = require("../auth/roles.guard");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
let CustomersController = class CustomersController {
    customersService;
    constructor(customersService) {
        this.customersService = customersService;
    }
    create(createCustomerDto) {
        return this.customersService.create(createCustomerDto);
    }
    findAll() {
        return this.customersService.findAll();
    }
    search(query) {
        return this.customersService.search(query);
    }
    getNextCid() {
        return this.customersService.getNextCid();
    }
    findOne(id) {
        return this.customersService.findOne(id);
    }
    update(id, updateCustomerDto) {
        return this.customersService.update(id, updateCustomerDto);
    }
    remove(id) {
        return this.customersService.remove(id);
    }
    updateKyc(id, updateKycDto) {
        return this.customersService.updateKyc(id, updateKycDto);
    }
    syncKycFromLoans() {
        return this.customersService.syncKycFromLoans();
    }
};
exports.CustomersController = CustomersController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('CREDIT_OFFICER', 'BRANCH_MANAGER', 'SUPER_ADMIN', 'CUSTOMER_SERVICE'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_customer_dto_1.CreateCustomerDto]),
    __metadata("design:returntype", void 0)
], CustomersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('CREDIT_OFFICER', 'BRANCH_MANAGER', 'SUPER_ADMIN', 'COLLECTION_OFFICER', 'CUSTOMER_SERVICE', 'ACCOUNTANT'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CustomersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('search'),
    (0, roles_decorator_1.Roles)('CREDIT_OFFICER', 'BRANCH_MANAGER', 'SUPER_ADMIN', 'COLLECTION_OFFICER', 'CUSTOMER_SERVICE', 'ACCOUNTANT'),
    __param(0, (0, common_1.Query)('query')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CustomersController.prototype, "search", null);
__decorate([
    (0, common_1.Get)('next-cid'),
    (0, roles_decorator_1.Roles)('CREDIT_OFFICER', 'BRANCH_MANAGER', 'SUPER_ADMIN', 'CUSTOMER_SERVICE'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CustomersController.prototype, "getNextCid", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('CREDIT_OFFICER', 'BRANCH_MANAGER', 'SUPER_ADMIN', 'COLLECTION_OFFICER', 'CUSTOMER_SERVICE', 'ACCOUNTANT'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CustomersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('CREDIT_OFFICER', 'BRANCH_MANAGER', 'SUPER_ADMIN', 'CUSTOMER_SERVICE'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_customer_dto_1.UpdateCustomerDto]),
    __metadata("design:returntype", void 0)
], CustomersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('BRANCH_MANAGER', 'SUPER_ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CustomersController.prototype, "remove", null);
__decorate([
    (0, common_1.Patch)(':id/kyc'),
    (0, roles_decorator_1.Roles)('BRANCH_MANAGER', 'SUPER_ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_customer_dto_1.UpdateKycStatusDto]),
    __metadata("design:returntype", void 0)
], CustomersController.prototype, "updateKyc", null);
__decorate([
    (0, common_1.Post)('sync-kyc'),
    (0, roles_decorator_1.Roles)('BRANCH_MANAGER', 'SUPER_ADMIN'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CustomersController.prototype, "syncKycFromLoans", null);
exports.CustomersController = CustomersController = __decorate([
    (0, common_1.Controller)('customers'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [customers_service_1.CustomersService])
], CustomersController);
//# sourceMappingURL=customers.controller.js.map
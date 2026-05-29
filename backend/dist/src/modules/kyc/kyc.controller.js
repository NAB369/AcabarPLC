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
exports.KycController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const kyc_service_1 = require("./kyc.service");
const roles_guard_1 = require("../auth/roles.guard");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
let KycController = class KycController {
    kycService;
    constructor(kycService) {
        this.kycService = kycService;
    }
    uploadDocument(file, customerId, type, req) {
        return this.kycService.saveDocumentMetadata(customerId, type, file, req.user.sub);
    }
    verifyDocument(id, dto, req) {
        return this.kycService.verifyDocument(id, dto, req.user.sub);
    }
    async downloadDocument(id, res) {
        const fileInfo = await this.kycService.getDocumentFile(id);
        res.setHeader('Content-Type', fileInfo.mimeType);
        res.setHeader('Content-Disposition', `attachment; filename="${fileInfo.fileName}"`);
        res.sendFile(fileInfo.absolutePath);
    }
    getCustomerDocuments(customerId) {
        return this.kycService.getCustomerDocuments(customerId);
    }
    checkCompleteness(customerId, productName) {
        return this.kycService.checkCompleteness(customerId, productName);
    }
};
exports.KycController = KycController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, roles_decorator_1.Roles)('LOAN_OFFICER', 'BRANCH_MANAGER', 'SUPER_ADMIN'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads/kyc',
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                cb(null, `${uniqueSuffix}${(0, path_1.extname)(file.originalname)}`);
            },
        }),
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)('customerId')),
    __param(2, (0, common_1.Body)('type')),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", void 0)
], KycController.prototype, "uploadDocument", null);
__decorate([
    (0, common_1.Patch)('documents/:id/verify'),
    (0, roles_decorator_1.Roles)('BRANCH_MANAGER', 'SUPER_ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, kyc_service_1.VerifyDocumentDto, Object]),
    __metadata("design:returntype", void 0)
], KycController.prototype, "verifyDocument", null);
__decorate([
    (0, common_1.Get)('documents/:id/download'),
    (0, roles_decorator_1.Roles)('LOAN_OFFICER', 'BRANCH_MANAGER', 'SUPER_ADMIN', 'CREDIT_ANALYST'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], KycController.prototype, "downloadDocument", null);
__decorate([
    (0, common_1.Get)('customers/:customerId/documents'),
    (0, roles_decorator_1.Roles)('LOAN_OFFICER', 'BRANCH_MANAGER', 'SUPER_ADMIN', 'CREDIT_ANALYST'),
    __param(0, (0, common_1.Param)('customerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], KycController.prototype, "getCustomerDocuments", null);
__decorate([
    (0, common_1.Get)('customers/:customerId/completeness/:productName'),
    (0, roles_decorator_1.Roles)('LOAN_OFFICER', 'BRANCH_MANAGER', 'SUPER_ADMIN'),
    __param(0, (0, common_1.Param)('customerId')),
    __param(1, (0, common_1.Param)('productName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], KycController.prototype, "checkCompleteness", null);
exports.KycController = KycController = __decorate([
    (0, common_1.Controller)('kyc'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [kyc_service_1.KycService])
], KycController);
//# sourceMappingURL=kyc.controller.js.map
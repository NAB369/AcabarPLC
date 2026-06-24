"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KycService = exports.VerifyDocumentDto = exports.UploadDocumentDto = void 0;
const common_1 = require("@nestjs/common");
const class_validator_1 = require("class-validator");
const prisma_service_1 = require("../../infrastructure/prisma/prisma.service");
const nodePath = __importStar(require("path"));
const nodeFs = __importStar(require("fs"));
const kyc_checklist_1 = require("./kyc-checklist");
const audit_service_1 = require("../auth/audit.service");
class UploadDocumentDto {
    customerId;
    type;
    fileName;
    filePath;
    mimeType;
    sizeBytes;
}
exports.UploadDocumentDto = UploadDocumentDto;
class VerifyDocumentDto {
    status;
    rejectionReason;
}
exports.VerifyDocumentDto = VerifyDocumentDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['VERIFIED', 'REJECTED']),
    __metadata("design:type", String)
], VerifyDocumentDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], VerifyDocumentDto.prototype, "rejectionReason", void 0);
let KycService = class KycService {
    prisma;
    auditService;
    constructor(prisma, auditService) {
        this.prisma = prisma;
        this.auditService = auditService;
    }
    async saveDocumentMetadata(customerId, type, file, userId) {
        const customer = await this.prisma.customer.findUnique({
            where: { id: customerId },
        });
        if (!customer)
            throw new common_1.NotFoundException('Customer not found');
        const doc = await this.prisma.document.create({
            data: {
                customerId,
                type,
                fileName: file.originalname,
                filePath: file.path,
                mimeType: file.mimetype,
                sizeBytes: file.size,
                status: 'PENDING',
            },
        });
        await this.auditService.log({
            userId,
            action: 'DOCUMENT_UPLOAD',
            entity: 'Document',
            entityId: doc.id,
            details: { type, fileName: file.originalname },
        });
        return doc;
    }
    async uploadDocument(dto) {
        const customer = await this.prisma.customer.findUnique({
            where: { id: dto.customerId },
        });
        if (!customer)
            throw new common_1.NotFoundException('Customer not found');
        return this.prisma.document.create({
            data: {
                customerId: dto.customerId,
                type: dto.type,
                fileName: dto.fileName,
                filePath: dto.filePath,
                mimeType: dto.mimeType,
                sizeBytes: dto.sizeBytes,
                status: 'PENDING',
            },
        });
    }
    async verifyDocument(documentId, dto, verifiedBy) {
        const doc = await this.prisma.document.findUnique({
            where: { id: documentId },
        });
        if (!doc)
            throw new common_1.NotFoundException('Document not found');
        const updated = await this.prisma.document.update({
            where: { id: documentId },
            data: {
                status: dto.status,
                verifiedBy,
                verifiedAt: new Date(),
                rejectionReason: dto.rejectionReason || null,
            },
        });
        await this.auditService.log({
            userId: verifiedBy,
            action: 'DOCUMENT_VERIFICATION',
            entity: 'Document',
            entityId: documentId,
            details: { status: dto.status, rejectionReason: dto.rejectionReason },
        });
        return updated;
    }
    async getDocumentFile(documentId) {
        const doc = await this.prisma.document.findUnique({
            where: { id: documentId },
        });
        if (!doc) {
            throw new common_1.NotFoundException('Document not found');
        }
        const absolutePath = nodePath.resolve(process.cwd(), doc.filePath);
        if (!nodeFs.existsSync(absolutePath)) {
            throw new common_1.NotFoundException('Physical file not found on disk');
        }
        return {
            absolutePath,
            fileName: doc.fileName,
            mimeType: doc.mimeType,
        };
    }
    async getCustomerDocuments(customerId) {
        return this.prisma.document.findMany({
            where: { customerId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async checkCompleteness(customerId, productName) {
        const customer = await this.prisma.customer.findUnique({
            where: { id: customerId },
        });
        if (!customer)
            throw new common_1.NotFoundException('Customer not found');
        const checklist = [...(0, kyc_checklist_1.getChecklist)(productName)];
        if (customer.coBorrowerName || customer.coBorrowerKhmerName) {
            checklist.push({
                type: 'CO_BORROWER_ID',
                label: "Co-borrower's ID / Passport",
                required: true,
            });
        }
        if (customer.guarantorName || customer.guarantorKhmerName) {
            checklist.push({
                type: 'GUARANTOR_ID',
                label: "Guarantor's ID / Passport",
                required: true,
            });
        }
        const documents = await this.prisma.document.findMany({
            where: { customerId },
        });
        const uploadedTypes = new Set(documents.map((d) => d.type));
        const verifiedTypes = new Set(documents.filter((d) => d.status === 'VERIFIED').map((d) => d.type));
        const missing = checklist
            .filter((req) => req.required && !uploadedTypes.has(req.type))
            .map((req) => ({
            type: req.type,
            label: req.label,
            issue: 'NOT_UPLOADED',
        }));
        const pendingVerification = checklist
            .filter((req) => req.required &&
            uploadedTypes.has(req.type) &&
            !verifiedTypes.has(req.type))
            .map((req) => ({
            type: req.type,
            label: req.label,
            issue: 'PENDING_VERIFICATION',
        }));
        return {
            complete: missing.length === 0 && pendingVerification.length === 0,
            missing,
            pendingVerification,
            checklist,
        };
    }
};
exports.KycService = KycService;
exports.KycService = KycService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], KycService);
//# sourceMappingURL=kyc.service.js.map
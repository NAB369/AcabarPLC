import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { AuditService } from '../auth/audit.service';
export declare class UploadDocumentDto {
    customerId: string;
    type: string;
    fileName: string;
    filePath: string;
    mimeType: string;
    sizeBytes: number;
}
export declare class VerifyDocumentDto {
    status: 'VERIFIED' | 'REJECTED';
    rejectionReason?: string;
}
export declare class KycService {
    private prisma;
    private auditService;
    constructor(prisma: PrismaService, auditService: AuditService);
    saveDocumentMetadata(customerId: string, type: string, file: Express.Multer.File, userId: string): Promise<{
        id: string;
        createdAt: Date;
        status: string;
        rejectionReason: string | null;
        customerId: string;
        type: string;
        fileName: string;
        filePath: string;
        mimeType: string;
        sizeBytes: number;
        verifiedBy: string | null;
        verifiedAt: Date | null;
    }>;
    uploadDocument(dto: UploadDocumentDto): Promise<{
        id: string;
        createdAt: Date;
        status: string;
        rejectionReason: string | null;
        customerId: string;
        type: string;
        fileName: string;
        filePath: string;
        mimeType: string;
        sizeBytes: number;
        verifiedBy: string | null;
        verifiedAt: Date | null;
    }>;
    verifyDocument(documentId: string, dto: VerifyDocumentDto, verifiedBy: string): Promise<{
        id: string;
        createdAt: Date;
        status: string;
        rejectionReason: string | null;
        customerId: string;
        type: string;
        fileName: string;
        filePath: string;
        mimeType: string;
        sizeBytes: number;
        verifiedBy: string | null;
        verifiedAt: Date | null;
    }>;
    getDocumentFile(documentId: string): Promise<{
        absolutePath: string;
        fileName: string;
        mimeType: string;
    }>;
    getCustomerDocuments(customerId: string): Promise<{
        id: string;
        createdAt: Date;
        status: string;
        rejectionReason: string | null;
        customerId: string;
        type: string;
        fileName: string;
        filePath: string;
        mimeType: string;
        sizeBytes: number;
        verifiedBy: string | null;
        verifiedAt: Date | null;
    }[]>;
    checkCompleteness(customerId: string, productName: string): Promise<{
        complete: boolean;
        missing: {
            type: string;
            label: string;
            issue: string;
        }[];
        pendingVerification: {
            type: string;
            label: string;
            issue: string;
        }[];
        checklist: import("./kyc-checklist").DocumentRequirement[];
    }>;
}

import { KycService, VerifyDocumentDto } from './kyc.service';
export declare class KycController {
    private readonly kycService;
    constructor(kycService: KycService);
    uploadDocument(file: Express.Multer.File, customerId: string, type: string, req: any): Promise<{
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
    verifyDocument(id: string, dto: VerifyDocumentDto, req: any): Promise<{
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
    downloadDocument(id: string, res: any): Promise<void>;
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

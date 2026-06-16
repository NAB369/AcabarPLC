import { KycService, VerifyDocumentDto } from './kyc.service';
export declare class KycController {
    private readonly kycService;
    constructor(kycService: KycService);
    uploadDocument(file: Express.Multer.File, customerId: string, type: string, req: any): Promise<{
        id: string;
        type: string;
        fileName: string;
        filePath: string;
        mimeType: string;
        sizeBytes: number;
        status: string;
        verifiedBy: string | null;
        verifiedAt: Date | null;
        rejectionReason: string | null;
        createdAt: Date;
        customerId: string;
    }>;
    verifyDocument(id: string, dto: VerifyDocumentDto, req: any): Promise<{
        id: string;
        type: string;
        fileName: string;
        filePath: string;
        mimeType: string;
        sizeBytes: number;
        status: string;
        verifiedBy: string | null;
        verifiedAt: Date | null;
        rejectionReason: string | null;
        createdAt: Date;
        customerId: string;
    }>;
    downloadDocument(id: string, res: any): Promise<void>;
    getCustomerDocuments(customerId: string): Promise<{
        id: string;
        type: string;
        fileName: string;
        filePath: string;
        mimeType: string;
        sizeBytes: number;
        status: string;
        verifiedBy: string | null;
        verifiedAt: Date | null;
        rejectionReason: string | null;
        createdAt: Date;
        customerId: string;
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

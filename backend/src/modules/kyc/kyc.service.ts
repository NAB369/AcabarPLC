import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { getChecklist } from './kyc-checklist';
import { AuditService } from '../auth/audit.service';

export class UploadDocumentDto {
  customerId: string;
  type: string;
  fileName: string;
  filePath: string;
  mimeType: string;
  sizeBytes: number;
}

export class VerifyDocumentDto {
  status: 'VERIFIED' | 'REJECTED';
  rejectionReason?: string;
}

@Injectable()
export class KycService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  /**
   * Save document metadata after file upload.
   */
  async saveDocumentMetadata(
    customerId: string,
    type: string,
    file: Express.Multer.File,
    userId: string,
  ) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });
    if (!customer) throw new NotFoundException('Customer not found');

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

  /**
   * Upload a new KYC document for a customer.
   */
  async uploadDocument(dto: UploadDocumentDto) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: dto.customerId },
    });
    if (!customer) throw new NotFoundException('Customer not found');

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

  /**
   * Verify or reject a document.
   */
  async verifyDocument(
    documentId: string,
    dto: VerifyDocumentDto,
    verifiedBy: string,
  ) {
    const doc = await this.prisma.document.findUnique({
      where: { id: documentId },
    });
    if (!doc) throw new NotFoundException('Document not found');

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

  /**
   * Get document file details for download.
   */
  async getDocumentFile(documentId: string) {
    const doc = await this.prisma.document.findUnique({
      where: { id: documentId },
    });
    if (!doc) {
      throw new NotFoundException('Document not found');
    }

    const { resolve } = require('path');
    const { existsSync } = require('fs');
    const absolutePath = resolve(process.cwd(), doc.filePath);
    if (!existsSync(absolutePath)) {
      throw new NotFoundException('Physical file not found on disk');
    }

    return {
      absolutePath,
      fileName: doc.fileName,
      mimeType: doc.mimeType,
    };
  }

  /**
   * List all documents for a customer.
   */
  async getCustomerDocuments(customerId: string) {
    return this.prisma.document.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Check if all required documents for a loan are uploaded and verified.
   * Returns { complete, missing[] }.
   */
  async checkCompleteness(customerId: string, productName: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });
    if (!customer) throw new NotFoundException('Customer not found');

    const checklist = [...getChecklist(productName)];

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
    const verifiedTypes = new Set(
      documents.filter((d) => d.status === 'VERIFIED').map((d) => d.type),
    );

    const missing = checklist
      .filter((req) => req.required && !uploadedTypes.has(req.type))
      .map((req) => ({
        type: req.type,
        label: req.label,
        issue: 'NOT_UPLOADED',
      }));

    const pendingVerification = checklist
      .filter(
        (req) =>
          req.required &&
          uploadedTypes.has(req.type) &&
          !verifiedTypes.has(req.type),
      )
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
}

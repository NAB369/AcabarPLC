import {
  Controller,
  Post,
  Patch,
  Get,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import {
  KycService,
  UploadDocumentDto,
  VerifyDocumentDto,
} from './kyc.service';
import { RolesGuard } from '../auth/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('kyc')
@UseGuards(JwtAuthGuard, RolesGuard)
export class KycController {
  constructor(private readonly kycService: KycService) {}

  @Post('upload')
  @Roles('CREDIT_OFFICER', 'BRANCH_MANAGER', 'SUPER_ADMIN')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/kyc',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Body('customerId') customerId: string,
    @Body('type') type: string,
    @Req() req: any,
  ) {
    return this.kycService.saveDocumentMetadata(
      customerId,
      type,
      file,
      req.user.sub,
    );
  }

  @Patch('documents/:id/verify')
  @Roles('BRANCH_MANAGER', 'SUPER_ADMIN')
  verifyDocument(
    @Param('id') id: string,
    @Body() dto: VerifyDocumentDto,
    @Req() req: any,
  ) {
    return this.kycService.verifyDocument(id, dto, req.user.sub);
  }

  @Get('documents/:id/download')
  @Roles('CREDIT_OFFICER', 'BRANCH_MANAGER', 'SUPER_ADMIN', 'COLLECTION_OFFICER')
  async downloadDocument(@Param('id') id: string, @Res() res: any) {
    const fileInfo = await this.kycService.getDocumentFile(id);
    res.setHeader('Content-Type', fileInfo.mimeType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${fileInfo.fileName}"`,
    );
    res.sendFile(fileInfo.absolutePath);
  }

  @Get('customers/:customerId/documents')
  @Roles('CREDIT_OFFICER', 'BRANCH_MANAGER', 'SUPER_ADMIN', 'COLLECTION_OFFICER')
  getCustomerDocuments(@Param('customerId') customerId: string) {
    return this.kycService.getCustomerDocuments(customerId);
  }

  @Get('customers/:customerId/completeness/:productName')
  @Roles('CREDIT_OFFICER', 'BRANCH_MANAGER', 'SUPER_ADMIN')
  checkCompleteness(
    @Param('customerId') customerId: string,
    @Param('productName') productName: string,
  ) {
    return this.kycService.checkCompleteness(customerId, productName);
  }
}

import {
  Controller,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { RepaymentsService, ProcessRepaymentDto } from './repayments.service';
import { RolesGuard } from '../auth/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('repayments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RepaymentsController {
  constructor(private readonly repaymentsService: RepaymentsService) {}

  @Post('process')
  @Roles('LOAN_OFFICER', 'BRANCH_MANAGER', 'SUPER_ADMIN', 'ACCOUNTANT')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/repayments',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  processRepayment(
    @Body() dto: ProcessRepaymentDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      dto.paymentProof = file.path;
    }
    return this.repaymentsService.processRepayment(dto);
  }

  @Post('simulate-khqr')
  // No strict role required, just an authenticated user (customer)
  simulateKhqrPayment(@Body() dto: ProcessRepaymentDto) {
    return this.repaymentsService.processRepayment(dto);
  }
}

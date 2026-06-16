import {
  Controller,
  Post,
  Patch,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { LosService } from './los.service';
import {
  CreateDraftDto,
  ReviewDecisionDto,
  AddCollateralDto,
  AddGuarantorDto,
} from './dto/index';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@Controller('los')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class LosController {
  constructor(private readonly losService: LosService) {}

  @Get('next-lid')
  @Permissions('VIEW_DASHBOARD')
  getNextLid() {
    return this.losService.getNextLid();
  }

  @Post('draft')
  @Permissions('CREATE_LOAN')
  createDraft(@Body() dto: CreateDraftDto) {
    return this.losService.createDraft(dto);
  }

  @Patch(':id/submit')
  @Permissions('CREATE_LOAN')
  submitApplication(@Param('id') id: string, @Req() req: any) {
    return this.losService.submitApplication(id, req.user.sub);
  }

  @Patch(':id/kyc-review')
  @Permissions('APPROVE_KYC')
  startKycReview(@Param('id') id: string, @Req() req: any) {
    return this.losService.startKycReview(id, req.user.sub);
  }

  @Patch(':id/kyc-decision')
  @Permissions('APPROVE_KYC')
  completeKycReview(
    @Param('id') id: string,
    @Body() body: { approved: boolean; reason?: string },
    @Req() req: any,
  ) {
    return this.losService.completeKycReview(
      id,
      body.approved,
      req.user.sub,
      body.reason,
    );
  }

  @Post(':id/credit-check')
  @Permissions('CREDIT_EVALUATE')
  runCreditCheck(@Param('id') id: string, @Req() req: any) {
    return this.losService.runCreditCheck(id, req.user.sub);
  }

  @Patch(':id/review')
  @Permissions('UNDERWRITE_LOAN')
  reviewApplication(
    @Param('id') id: string,
    @Body() dto: ReviewDecisionDto,
    @Req() req: any,
  ) {
    return this.losService.reviewApplication(id, dto, req.user.sub);
  }

  @Patch(':id/prepare-disbursement')
  @Permissions('MANAGE_DISBURSEMENT')
  prepareDisbursement(@Param('id') id: string, @Req() req: any) {
    return this.losService.prepareDisbursement(id, req.user.sub);
  }

  @Post(':id/disburse')
  @Permissions('MANAGE_DISBURSEMENT')
  disburseLoan(
    @Param('id') id: string,
    @Body() body: { method?: 'BAKONG' | 'CASH' | 'BANK_TRANSFER' },
  ) {
    return this.losService.disburseLoan(id, body?.method);
  }

  @Patch(':id/activate')
  @Permissions('MANAGE_DISBURSEMENT')
  activateLoan(@Param('id') id: string, @Req() req: any) {
    return this.losService.activateLoan(id, req.user.sub);
  }

  @Get('queue')
  @Permissions('VIEW_DASHBOARD')
  getQueue(
    @Query('status') status?: string,
    @Query('branchId') branchId?: string,
    @Query('loanOfficerId') loanOfficerId?: string,
  ) {
    return this.losService.getQueue({ status, branchId, loanOfficerId });
  }

  @Get(':id')
  @Permissions('VIEW_DASHBOARD')
  getApplicationDetail(@Param('id') id: string) {
    console.log('HIT getApplicationDetail() with id:', id);
    return this.losService.getApplicationDetail(id);
  }

  @Get(':id/timeline')
  @Permissions('VIEW_DASHBOARD')
  getTimeline(@Param('id') id: string) {
    return this.losService.getTimeline(id);
  }

  @Post(':id/collateral')
  @Permissions('CREATE_LOAN')
  addCollateral(@Param('id') id: string, @Body() dto: AddCollateralDto) {
    return this.losService.addCollateral(id, dto);
  }

  @Post(':id/guarantor')
  @Permissions('CREATE_LOAN')
  addGuarantor(@Param('id') id: string, @Body() dto: AddGuarantorDto) {
    return this.losService.addGuarantor(id, dto);
  }
}

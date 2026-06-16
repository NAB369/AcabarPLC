import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AccountingService } from './accounting.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@Controller('accounting')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AccountingController {
  constructor(private readonly accountingService: AccountingService) {}

  // ── Chart of Accounts ──────────────────────────────────────────────────────

  @Get('accounts')
  @Permissions('VIEW_ACCOUNTS')
  getAccounts(@Query('type') type?: string) {
    return this.accountingService.getAccounts(type);
  }

  @Post('accounts')
  @Permissions('MANAGE_ACCOUNTS')
  createAccount(@Body() dto: any) {
    return this.accountingService.createAccount(dto);
  }

  @Put('accounts/:id')
  @Permissions('MANAGE_ACCOUNTS')
  updateAccount(@Param('id') id: string, @Body() dto: any) {
    return this.accountingService.updateAccount(id, dto);
  }

  @Put('accounts/:id/toggle')
  @Permissions('MANAGE_ACCOUNTS')
  toggleAccount(@Param('id') id: string) {
    return this.accountingService.toggleAccountActive(id);
  }

  // ── Journal Entries ────────────────────────────────────────────────────────

  @Get('journal-entries')
  @Permissions('VIEW_REPORTS')
  getJournalEntries(
    @Query('type') type?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.accountingService.getJournalEntries(type, startDate, endDate);
  }

  @Post('journal-entries')
  @Permissions('MANAGE_JOURNAL')
  createJournalEntry(@Body() dto: any, @Request() req: any) {
    return this.accountingService.createJournalEntry(dto, req.user.userId);
  }

  // ── Income Entry ───────────────────────────────────────────────────────────

  @Post('income')
  @Permissions('MANAGE_JOURNAL')
  createIncome(@Body() dto: any, @Request() req: any) {
    return this.accountingService.createIncomeEntry(dto, req.user.userId);
  }

  // ── Expense Entry ──────────────────────────────────────────────────────────

  @Post('expense')
  @Permissions('MANAGE_JOURNAL')
  createExpense(@Body() dto: any, @Request() req: any) {
    return this.accountingService.createExpenseEntry(dto, req.user.userId);
  }

  // ── Cash Transfer ──────────────────────────────────────────────────────────

  @Post('transfer')
  @Permissions('MANAGE_JOURNAL')
  createTransfer(@Body() dto: any, @Request() req: any) {
    return this.accountingService.createTransfer(dto, req.user.userId);
  }

  // ── Single Entry ───────────────────────────────────────────────────────────

  @Post('single-entry')
  @Permissions('MANAGE_JOURNAL')
  createSingleEntry(@Body() dto: any, @Request() req: any) {
    return this.accountingService.createSingleEntry(dto, req.user.userId);
  }

  // ── Reports ────────────────────────────────────────────────────────────────

  @Get('reports/profit-loss')
  @Permissions('VIEW_REPORTS')
  getProfitAndLoss(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.accountingService.getProfitAndLoss(startDate, endDate);
  }

  @Get('reports/balance-sheet')
  @Permissions('VIEW_REPORTS')
  getBalanceSheet() {
    return this.accountingService.getBalanceSheet();
  }

  @Get('reports/ledger/:code')
  @Permissions('VIEW_REPORTS')
  getAccountLedger(
    @Param('code') code: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.accountingService.getAccountLedger(code, startDate, endDate);
  }
}

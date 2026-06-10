import { Controller, Get, Post, Query, Request, UseGuards } from '@nestjs/common';
import { PeriodService } from './period.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@Controller('period')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PeriodController {
  constructor(private readonly periodService: PeriodService) {}

  @Get('state')
  @Permissions('VIEW_PERIOD')
  getState() {
    return this.periodService.getState();
  }

  @Post('sod')
  @Permissions('MANAGE_PERIOD')
  startOfDay(@Request() req: any) {
    // req.user has userId from jwt payload
    return this.periodService.startOfDay(req.user.userId);
  }

  @Post('eod')
  @Permissions('MANAGE_PERIOD')
  endOfDay(@Request() req: any) {
    return this.periodService.endOfDay(req.user.userId);
  }

  @Get('logs')
  @Permissions('VIEW_PERIOD')
  getLogs() {
    return this.periodService.getLogs();
  }

  @Get('reports/trial-balance')
  @Permissions('VIEW_REPORTS')
  getTrialBalance() {
    return this.periodService.getTrialBalance();
  }

  @Get('reports/journal')
  @Permissions('VIEW_REPORTS')
  getJournal(@Query('date') date?: string) {
    return this.periodService.getJournal(date);
  }
}

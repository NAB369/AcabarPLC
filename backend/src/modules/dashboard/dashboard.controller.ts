import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { RolesGuard } from '../auth/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('metrics')
  @Roles(
    'SUPER_ADMIN',
    'BRANCH_MANAGER',
    'CREDIT_OFFICER',
    'ACCOUNTANT',
    'COLLECTION_OFFICER',
    'TELLER',
    'AUDITOR',
    'CUSTOMER_SERVICE',
  )
  getMetrics() {
    return this.dashboardService.getMetrics();
  }

  @Get('reports/credit-officers')
  @Roles(
    'SUPER_ADMIN',
    'BRANCH_MANAGER',
    'CREDIT_OFFICER',
    'ACCOUNTANT',
    'AUDITOR',
  )
  getCreditOfficerReport() {
    return this.dashboardService.getCreditOfficerReport();
  }

  @Get('reports/recent-payments')
  @Roles('SUPER_ADMIN', 'BRANCH_MANAGER', 'ACCOUNTANT', 'AUDITOR')
  getRecentPaymentsReport() {
    return this.dashboardService.getRecentPaymentsReport();
  }
}

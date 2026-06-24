import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { CustomersModule } from './modules/customers/customers.module';
import { LoansModule } from './modules/loans/loans.module';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { RepaymentsModule } from './modules/repayments/repayments.module';
import { LedgerModule } from './modules/ledger/ledger.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { LosModule } from './modules/los/los.module';
import { KycModule } from './modules/kyc/kyc.module';
import { UnderwritingModule } from './modules/underwriting/underwriting.module';
import { DisbursementModule } from './modules/disbursement/disbursement.module';
import { BranchesModule } from './modules/branches/branches.module';
import { CompanyModule } from './modules/company/company.module';
import { PayloanModule } from './modules/payloan/payloan.module';
import { PeriodModule } from './modules/period/period.module';
import { AccountingModule } from './modules/accounting/accounting.module';
import { AlertsModule } from './modules/alerts/alerts.module';

import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100, // 100 requests per minute
    }]),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    CustomersModule,
    LoansModule,
    RepaymentsModule,
    LedgerModule,
    DashboardModule,
    LosModule,
    KycModule,
    UnderwritingModule,
    DisbursementModule,
    BranchesModule,
    CompanyModule,
    PayloanModule,
    PeriodModule,
    AccountingModule,
    AlertsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

import { Module } from '@nestjs/common';
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

import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

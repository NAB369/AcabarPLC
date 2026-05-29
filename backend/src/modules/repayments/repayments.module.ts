import { Module } from '@nestjs/common';
import { RepaymentsController } from './repayments.controller';
import { RepaymentsService } from './repayments.service';

import { LedgerModule } from '../ledger/ledger.module';

import { RepaymentsCron } from './repayments.cron';

@Module({
  imports: [LedgerModule],
  controllers: [RepaymentsController],
  providers: [RepaymentsService, RepaymentsCron],
})
export class RepaymentsModule {}

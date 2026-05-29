import { Module } from '@nestjs/common';
import { DisbursementService } from './disbursement.service';
import { LedgerModule } from '../ledger/ledger.module';

@Module({
  imports: [LedgerModule],
  providers: [DisbursementService],
  exports: [DisbursementService],
})
export class DisbursementModule {}

import { Module } from '@nestjs/common';
import { PayloanController } from './payloan.controller';
import { PayloanService } from './payloan.service';
import { LedgerModule } from '../ledger/ledger.module';

@Module({
  imports: [LedgerModule],
  controllers: [PayloanController],
  providers: [PayloanService],
})
export class PayloanModule {}

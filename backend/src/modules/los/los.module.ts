import { Module } from '@nestjs/common';
import { LosController } from './los.controller';
import { LosService } from './los.service';
import { UnderwritingModule } from '../underwriting/underwriting.module';
import { KycModule } from '../kyc/kyc.module';
import { DisbursementModule } from '../disbursement/disbursement.module';

@Module({
  imports: [UnderwritingModule, KycModule, DisbursementModule],
  controllers: [LosController],
  providers: [LosService],
  exports: [LosService],
})
export class LosModule {}

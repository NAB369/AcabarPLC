import { Module } from '@nestjs/common';
import { PayloanController } from './payloan.controller';
import { PayloanService } from './payloan.service';

@Module({
  controllers: [PayloanController],
  providers: [PayloanService],
})
export class PayloanModule {}

import { Module } from '@nestjs/common';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { ConsultationsController } from './consultations.controller';
import { ConsultationsService } from './consultations.service';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';

@Module({
  controllers: [
    CustomersController,
    ConsultationsController,
    FeedbackController,
  ],
  providers: [CustomersService, ConsultationsService, FeedbackService],
})
export class CustomersModule {}

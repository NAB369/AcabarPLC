import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('feedback')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Get()
  @Roles('CREDIT_OFFICER', 'BRANCH_MANAGER', 'SUPER_ADMIN', 'COLLECTION_OFFICER')
  findAll() {
    return this.feedbackService.findAll();
  }

  @Post()
  @Roles('CREDIT_OFFICER', 'BRANCH_MANAGER', 'SUPER_ADMIN')
  create(
    @Body()
    body: {
      customerId: string;
      loanId?: string;
      rating: number;
      comment?: string;
      category: string;
    },
  ) {
    return this.feedbackService.create(body);
  }
}

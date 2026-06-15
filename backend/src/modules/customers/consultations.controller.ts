import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ConsultationsService } from './consultations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('consultations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ConsultationsController {
  constructor(private readonly consultationsService: ConsultationsService) {}

  @Get()
  @Roles('CREDIT_OFFICER', 'BRANCH_MANAGER', 'SUPER_ADMIN')
  findAll() {
    return this.consultationsService.findAll();
  }

  @Post()
  @Roles('CREDIT_OFFICER', 'BRANCH_MANAGER', 'SUPER_ADMIN')
  create(
    @Body()
    body: {
      customerId: string;
      type: string;
      scheduledAt: string;
      notes?: string;
    },
  ) {
    return this.consultationsService.create(body);
  }

  @Patch(':id')
  @Roles('CREDIT_OFFICER', 'BRANCH_MANAGER', 'SUPER_ADMIN')
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: 'COMPLETED' | 'CANCELLED' },
  ) {
    return this.consultationsService.updateStatus(id, body.status);
  }
}

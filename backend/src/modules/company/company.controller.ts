import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { CompanyService } from './company.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@Controller('company')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get()
  @Permissions('VIEW_DASHBOARD')
  getCompany() {
    return this.companyService.getCompany();
  }

  @Patch()
  @Permissions('MANAGE_SYSTEM')
  updateCompany(@Body() data: any) {
    return this.companyService.updateCompany(data);
  }
}

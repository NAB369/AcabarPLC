import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import {
  CreateCustomerDto,
  UpdateKycStatusDto,
  UpdateCustomerDto,
} from './dto/create-customer.dto';
import { RolesGuard } from '../auth/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('customers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @Roles('LOAN_OFFICER', 'BRANCH_MANAGER', 'SUPER_ADMIN')
  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customersService.create(createCustomerDto);
  }

  @Get()
  @Roles('LOAN_OFFICER', 'BRANCH_MANAGER', 'SUPER_ADMIN', 'CREDIT_ANALYST')
  findAll() {
    return this.customersService.findAll();
  }

  @Get('search')
  @Roles('LOAN_OFFICER', 'BRANCH_MANAGER', 'SUPER_ADMIN', 'CREDIT_ANALYST')
  search(@Query('query') query: string) {
    return this.customersService.search(query);
  }

  @Get('next-cid')
  @Roles('LOAN_OFFICER', 'BRANCH_MANAGER', 'SUPER_ADMIN')
  getNextCid() {
    return this.customersService.getNextCid();
  }

  @Get(':id')
  @Roles('LOAN_OFFICER', 'BRANCH_MANAGER', 'SUPER_ADMIN', 'CREDIT_ANALYST')
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(id);
  }

  @Patch(':id')
  @Roles('LOAN_OFFICER', 'BRANCH_MANAGER', 'SUPER_ADMIN')
  update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.customersService.update(id, updateCustomerDto);
  }

  @Delete(':id')
  @Roles('BRANCH_MANAGER', 'SUPER_ADMIN')
  remove(@Param('id') id: string) {
    return this.customersService.remove(id);
  }

  @Patch(':id/kyc')
  @Roles('BRANCH_MANAGER', 'SUPER_ADMIN') // Only higher roles can approve KYC
  updateKyc(@Param('id') id: string, @Body() updateKycDto: UpdateKycStatusDto) {
    return this.customersService.updateKyc(id, updateKycDto);
  }

  @Post('sync-kyc')
  @Roles('BRANCH_MANAGER', 'SUPER_ADMIN')
  syncKycFromLoans() {
    return this.customersService.syncKycFromLoans();
  }
}

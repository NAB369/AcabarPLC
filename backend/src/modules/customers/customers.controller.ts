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
  @Roles('CREDIT_OFFICER', 'BRANCH_MANAGER', 'SUPER_ADMIN', 'CUSTOMER_SERVICE')
  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customersService.create(createCustomerDto);
  }

  @Get()
  @Roles('CREDIT_OFFICER', 'BRANCH_MANAGER', 'SUPER_ADMIN', 'COLLECTION_OFFICER', 'CUSTOMER_SERVICE', 'ACCOUNTANT')
  findAll() {
    return this.customersService.findAll();
  }

  @Get('search')
  @Roles('CREDIT_OFFICER', 'BRANCH_MANAGER', 'SUPER_ADMIN', 'COLLECTION_OFFICER', 'CUSTOMER_SERVICE', 'ACCOUNTANT')
  search(@Query('query') query: string) {
    return this.customersService.search(query);
  }

  @Get('next-cid')
  @Roles('CREDIT_OFFICER', 'BRANCH_MANAGER', 'SUPER_ADMIN', 'CUSTOMER_SERVICE')
  getNextCid() {
    return this.customersService.getNextCid();
  }

  @Get(':id')
  @Roles('CREDIT_OFFICER', 'BRANCH_MANAGER', 'SUPER_ADMIN', 'COLLECTION_OFFICER', 'CUSTOMER_SERVICE', 'ACCOUNTANT')
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(id);
  }

  @Patch(':id')
  @Roles('CREDIT_OFFICER', 'BRANCH_MANAGER', 'SUPER_ADMIN', 'CUSTOMER_SERVICE')
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

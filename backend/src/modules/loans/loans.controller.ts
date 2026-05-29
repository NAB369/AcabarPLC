import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Get,
  Req,
  Patch,
  Delete,
} from '@nestjs/common';
import { LoansService, CreateLoanDto } from './loans.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@Controller('loans')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Post('products')
  @Permissions('MANAGE_SYSTEM')
  createProduct(@Body() data: any) {
    return this.loansService.createProduct(data);
  }

  @Get('products/:id')
  @Permissions('VIEW_DASHBOARD')
  getProduct(@Param('id') id: string) {
    return this.loansService.getProduct(id);
  }

  @Patch('products/:id')
  @Permissions('MANAGE_SYSTEM')
  updateProduct(@Param('id') id: string, @Body() data: any) {
    return this.loansService.updateProduct(id, data);
  }

  @Delete('products/:id')
  @Permissions('MANAGE_SYSTEM')
  deleteProduct(@Param('id') id: string) {
    return this.loansService.deleteProduct(id);
  }

  @Get('products')
  @Permissions('VIEW_DASHBOARD')
  getAllProducts() {
    return this.loansService.getAllProducts();
  }

  @Post('apply')
  @Permissions('CREATE_LOAN')
  applyForLoan(@Body() createLoanDto: CreateLoanDto) {
    return this.loansService.applyForLoan(createLoanDto);
  }

  @Get('my-active')
  async getMyActiveLoan(@Req() req: any) {
    const customer = await this.loansService.findCustomerByEmail(
      req.user.email,
    );
    if (!customer) {
      throw new Error('Customer profile not found for user');
    }
    return this.loansService.getMyActiveLoan(customer.id);
  }

  @Post(':id/approve')
  @Permissions('UNDERWRITE_LOAN')
  approveLoan(@Param('id') id: string) {
    return this.loansService.approveLoan(id);
  }

  @Post(':id/disburse')
  @Permissions('MANAGE_DISBURSEMENT')
  disburseLoan(@Param('id') id: string) {
    return this.loansService.disburseLoan(id);
  }
}

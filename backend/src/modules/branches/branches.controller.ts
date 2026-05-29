import { Controller, Get, UseGuards } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('branches')
@UseGuards(JwtAuthGuard)
export class BranchesController {
  constructor(private prisma: PrismaService) {}

  @Get()
  findAll() {
    return this.prisma.branch.findMany({
      where: { isActive: true },
    });
  }
}

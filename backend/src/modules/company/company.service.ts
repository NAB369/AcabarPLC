import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) {}

  async getCompany() {
    const company = await this.prisma.company.findFirst();
    if (!company) {
      throw new NotFoundException('Company information not found');
    }
    return company;
  }

  async updateCompany(data: any) {
    const company = await this.prisma.company.findFirst();
    if (!company) {
      return this.prisma.company.create({ data });
    }
    return this.prisma.company.update({
      where: { id: company.id },
      data,
    });
  }
}

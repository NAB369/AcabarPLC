import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class AlertsService {
  constructor(private prisma: PrismaService) {}

  async getPendingAlerts() {
    return this.prisma.clientAlert.findMany({
      orderBy: { targetDate: 'asc' },
      include: {
        customer: { select: { firstName: true, lastName: true, phone: true } },
        loan: { select: { lid: true, principalAmount: true, currency: true } },
      },
    });
  }

  async updateAlertStatus(id: string, status: string) {
    return this.prisma.clientAlert.update({
      where: { id },
      data: { status },
    });
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class ConsultationsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.consultation.findMany({
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
            khmerFirstName: true,
            khmerLastName: true,
            phone: true,
          },
        },
      },
      orderBy: { scheduledAt: 'desc' },
    });
  }

  async create(data: {
    customerId: string;
    type: string;
    scheduledAt: string;
    notes?: string;
  }) {
    return this.prisma.consultation.create({
      data: {
        customerId: data.customerId,
        type: data.type,
        scheduledAt: new Date(data.scheduledAt),
        notes: data.notes,
        status: 'PENDING',
      },
      include: { customer: true },
    });
  }

  async updateStatus(id: string, status: 'COMPLETED' | 'CANCELLED') {
    const existing = await this.prisma.consultation.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Consultation not found');

    return this.prisma.consultation.update({
      where: { id },
      data: { status },
      include: { customer: true },
    });
  }
}

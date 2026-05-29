import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class FeedbackService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.feedback.findMany({
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
            khmerFirstName: true,
            khmerLastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: {
    customerId: string;
    loanId?: string;
    rating: number;
    comment?: string;
    category: string;
  }) {
    return this.prisma.feedback.create({
      data: {
        customerId: data.customerId,
        loanId: data.loanId,
        rating: data.rating,
        comment: data.comment,
        category: data.category,
      },
      include: { customer: true },
    });
  }
}

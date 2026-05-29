import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(params: {
    userId?: string;
    action: string;
    entity: string;
    entityId: string;
    details?: any;
  }) {
    return this.prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        details: params.details || {},
      },
    });
  }

  async getLogs(
    filters: { entity?: string; userId?: string; limit?: number } = {},
  ) {
    return this.prisma.auditLog.findMany({
      where: {
        entity: filters.entity,
        userId: filters.userId,
      },
      take: filters.limit || 50,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
      },
    });
  }
}

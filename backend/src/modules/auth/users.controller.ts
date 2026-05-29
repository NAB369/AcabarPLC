import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

import { AuditService } from './audit.service';
import { AuthService } from './auth.service';

@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersController {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    private authService: AuthService,
  ) {}

  @Get()
  @Permissions('MANAGE_SYSTEM')
  async getAllUsers() {
    return this.prisma.user.findMany({
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
        branch: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get('credit-officers')
  @Permissions('VIEW_DASHBOARD')
  async getCreditOfficers() {
    return this.prisma.user.findMany({
      where: {
        isActive: true,
        roles: {
          some: {
            role: {
              name: {
                in: ['CREDIT_OFFICER', 'LOAN_OFFICER', 'BRANCH_MANAGER', 'ADMIN', 'SUPER_ADMIN'],
              },
            },
          },
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        branch: { select: { name: true } },
        roles: { include: { role: { select: { name: true } } } },
      },
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
    });
  }

  @Get('roles')
  @Permissions('VIEW_DASHBOARD')
  async getRoles() {
    return this.prisma.role.findMany({
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  @Patch('roles/:roleId/permissions')
  @Permissions('MANAGE_SYSTEM')
  async updateRolePermissions(
    @Param('roleId') roleId: string,
    @Body('permissionIds') permissionIds: string[],
  ) {
    // Transactional update: clear existing and set new
    return this.prisma.$transaction(async (tx) => {
      await tx.rolePermission.deleteMany({ where: { roleId } });

      const newPermissions = permissionIds.map((pId) => ({
        roleId,
        permissionId: pId,
      }));

      await tx.rolePermission.createMany({ data: newPermissions });

      return { message: 'Role permissions updated successfully' };
    });
  }

  @Post(':userId/roles')
  @Permissions('MANAGE_SYSTEM')
  async assignRoleToUser(
    @Param('userId') userId: string,
    @Body('roleId') roleId: string,
  ) {
    // For this simple case, we'll replace all roles with the new one
    return this.prisma.$transaction(async (tx) => {
      await tx.userRole.deleteMany({ where: { userId } });
      await tx.userRole.create({
        data: { userId, roleId },
      });
      return { message: 'User role updated successfully' };
    });
  }

  @Get('permissions')
  @Permissions('MANAGE_SYSTEM')
  async getAllPermissions() {
    return this.prisma.permission.findMany();
  }

  @Patch(':id')
  @Permissions('MANAGE_SYSTEM')
  async updateUser(@Param('id') id: string, @Body() data: any) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { roles: { include: { role: true } } },
    });

    if (user?.roles.some((ur) => ur.role.name === 'SUPER_ADMIN')) {
      throw new Error('Cannot update System Admin accounts');
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        isActive: data.isActive,
      },
    });
  }

  @Get('audit-logs')
  @Permissions('MANAGE_SYSTEM')
  async getAuditLogs() {
    return this.auditService.getLogs();
  }

  @Get('me')
  async getMe(@Req() req: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { roles: { include: { role: true } }, branch: true },
    });
    if (!user) return null;
    const { passwordHash, ...result } = user as any;
    return result;
  }

  @Patch('me')
  async updateMe(@Req() req: any, @Body() data: any) {
    return this.authService.updateProfile(req.user.userId, data);
  }

  @Patch('me/password')
  async updateMyPassword(@Req() req: any, @Body() data: any) {
    return this.authService.updatePassword(req.user.userId, data);
  }

  @Delete(':id')
  @Permissions('MANAGE_SYSTEM')
  async deleteUser(@Param('id') id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { roles: { include: { role: true } } },
    });

    if (user?.roles.some((ur) => ur.role.name === 'SUPER_ADMIN')) {
      throw new Error('Cannot delete System Admin accounts');
    }

    return this.prisma.user.delete({ where: { id } });
  }
}

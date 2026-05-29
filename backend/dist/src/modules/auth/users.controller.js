"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../infrastructure/prisma/prisma.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const permissions_guard_1 = require("../auth/guards/permissions.guard");
const permissions_decorator_1 = require("../auth/decorators/permissions.decorator");
const audit_service_1 = require("./audit.service");
const auth_service_1 = require("./auth.service");
let UsersController = class UsersController {
    prisma;
    auditService;
    authService;
    constructor(prisma, auditService, authService) {
        this.prisma = prisma;
        this.auditService = auditService;
        this.authService = authService;
    }
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
    async updateRolePermissions(roleId, permissionIds) {
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
    async assignRoleToUser(userId, roleId) {
        return this.prisma.$transaction(async (tx) => {
            await tx.userRole.deleteMany({ where: { userId } });
            await tx.userRole.create({
                data: { userId, roleId },
            });
            return { message: 'User role updated successfully' };
        });
    }
    async getAllPermissions() {
        return this.prisma.permission.findMany();
    }
    async updateUser(id, data) {
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
    async getAuditLogs() {
        return this.auditService.getLogs();
    }
    async getMe(req) {
        const user = await this.prisma.user.findUnique({
            where: { id: req.user.userId },
            include: { roles: { include: { role: true } }, branch: true },
        });
        if (!user)
            return null;
        const { passwordHash, ...result } = user;
        return result;
    }
    async updateMe(req, data) {
        return this.authService.updateProfile(req.user.userId, data);
    }
    async updateMyPassword(req, data) {
        return this.authService.updatePassword(req.user.userId, data);
    }
    async deleteUser(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: { roles: { include: { role: true } } },
        });
        if (user?.roles.some((ur) => ur.role.name === 'SUPER_ADMIN')) {
            throw new Error('Cannot delete System Admin accounts');
        }
        return this.prisma.user.delete({ where: { id } });
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.Permissions)('MANAGE_SYSTEM'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getAllUsers", null);
__decorate([
    (0, common_1.Get)('credit-officers'),
    (0, permissions_decorator_1.Permissions)('VIEW_DASHBOARD'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getCreditOfficers", null);
__decorate([
    (0, common_1.Get)('roles'),
    (0, permissions_decorator_1.Permissions)('VIEW_DASHBOARD'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getRoles", null);
__decorate([
    (0, common_1.Patch)('roles/:roleId/permissions'),
    (0, permissions_decorator_1.Permissions)('MANAGE_SYSTEM'),
    __param(0, (0, common_1.Param)('roleId')),
    __param(1, (0, common_1.Body)('permissionIds')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateRolePermissions", null);
__decorate([
    (0, common_1.Post)(':userId/roles'),
    (0, permissions_decorator_1.Permissions)('MANAGE_SYSTEM'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)('roleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "assignRoleToUser", null);
__decorate([
    (0, common_1.Get)('permissions'),
    (0, permissions_decorator_1.Permissions)('MANAGE_SYSTEM'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getAllPermissions", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, permissions_decorator_1.Permissions)('MANAGE_SYSTEM'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateUser", null);
__decorate([
    (0, common_1.Get)('audit-logs'),
    (0, permissions_decorator_1.Permissions)('MANAGE_SYSTEM'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getAuditLogs", null);
__decorate([
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getMe", null);
__decorate([
    (0, common_1.Patch)('me'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateMe", null);
__decorate([
    (0, common_1.Patch)('me/password'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateMyPassword", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, permissions_decorator_1.Permissions)('MANAGE_SYSTEM'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "deleteUser", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.Controller)('users'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService,
        auth_service_1.AuthService])
], UsersController);
//# sourceMappingURL=users.controller.js.map
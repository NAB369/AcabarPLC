import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { AuditService } from './audit.service';
import { AuthService } from './auth.service';
export declare class UsersController {
    private prisma;
    private auditService;
    private authService;
    constructor(prisma: PrismaService, auditService: AuditService, authService: AuthService);
    getAllUsers(): Promise<({
        branch: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            name: string;
            code: string;
            address: string | null;
        } | null;
        roles: ({
            role: {
                permissions: ({
                    permission: {
                        id: string;
                        name: string;
                        description: string | null;
                    };
                } & {
                    roleId: string;
                    permissionId: string;
                })[];
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
            };
        } & {
            userId: string;
            roleId: string;
        })[];
    } & {
        id: string;
        email: string;
        passwordHash: string;
        firstName: string;
        lastName: string;
        isActive: boolean;
        isApproved: boolean;
        requestedRole: string | null;
        branchId: string | null;
        passwordChangedAt: Date;
        failedLoginAttempts: number;
        lockoutUntil: Date | null;
        mfaSecret: string | null;
        mfaEnabled: boolean;
        lastLoginIp: string | null;
        lastLoginAt: Date | null;
        refreshToken: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    getCreditOfficers(): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        branch: {
            name: string;
        } | null;
        roles: ({
            role: {
                name: string;
            };
        } & {
            userId: string;
            roleId: string;
        })[];
    }[]>;
    getRoles(): Promise<({
        permissions: ({
            permission: {
                id: string;
                name: string;
                description: string | null;
            };
        } & {
            roleId: string;
            permissionId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
    })[]>;
    updateRolePermissions(roleId: string, permissionIds: string[]): Promise<{
        message: string;
    }>;
    assignRoleToUser(userId: string, roleId: string): Promise<{
        message: string;
    }>;
    getAllPermissions(): Promise<{
        id: string;
        name: string;
        description: string | null;
    }[]>;
    updateUser(id: string, data: any): Promise<{
        id: string;
        email: string;
        passwordHash: string;
        firstName: string;
        lastName: string;
        isActive: boolean;
        isApproved: boolean;
        requestedRole: string | null;
        branchId: string | null;
        passwordChangedAt: Date;
        failedLoginAttempts: number;
        lockoutUntil: Date | null;
        mfaSecret: string | null;
        mfaEnabled: boolean;
        lastLoginIp: string | null;
        lastLoginAt: Date | null;
        refreshToken: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    approveUser(id: string, roleName?: string): Promise<{
        id: string;
        email: string;
        passwordHash: string;
        firstName: string;
        lastName: string;
        isActive: boolean;
        isApproved: boolean;
        requestedRole: string | null;
        branchId: string | null;
        passwordChangedAt: Date;
        failedLoginAttempts: number;
        lockoutUntil: Date | null;
        mfaSecret: string | null;
        mfaEnabled: boolean;
        lastLoginIp: string | null;
        lastLoginAt: Date | null;
        refreshToken: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getAuditLogs(): Promise<({
        user: {
            email: string;
            firstName: string;
            lastName: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        userId: string | null;
        action: string;
        entity: string;
        entityId: string;
        details: import("@prisma/client/runtime/library").JsonValue | null;
    })[]>;
    getMe(req: any): Promise<any>;
    updateMe(req: any, data: any): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        isActive: boolean;
        isApproved: boolean;
        requestedRole: string | null;
        branchId: string | null;
        passwordChangedAt: Date;
        failedLoginAttempts: number;
        lockoutUntil: Date | null;
        mfaSecret: string | null;
        mfaEnabled: boolean;
        lastLoginIp: string | null;
        lastLoginAt: Date | null;
        refreshToken: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateMyPassword(req: any, data: any): Promise<{
        message: string;
    }>;
    deleteUser(id: string): Promise<{
        id: string;
        email: string;
        passwordHash: string;
        firstName: string;
        lastName: string;
        isActive: boolean;
        isApproved: boolean;
        requestedRole: string | null;
        branchId: string | null;
        passwordChangedAt: Date;
        failedLoginAttempts: number;
        lockoutUntil: Date | null;
        mfaSecret: string | null;
        mfaEnabled: boolean;
        lastLoginIp: string | null;
        lastLoginAt: Date | null;
        refreshToken: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}

import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuditService } from './audit.service';
export declare class AuthService {
    private prisma;
    private jwtService;
    private auditService;
    constructor(prisma: PrismaService, jwtService: JwtService, auditService: AuditService);
    validateUser(email: string, pass: string, ip?: string): Promise<any>;
    login(loginDto: LoginDto, ip?: string, userAgent?: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: any;
            email: any;
            firstName: any;
            lastName: any;
            roles: any;
            branchId: any;
        };
    } | {
        mfaRequired: boolean;
        mfaToken: string;
    }>;
    verifyMfa(userId: string, code: string, ip?: string, userAgent?: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: any;
            email: any;
            firstName: any;
            lastName: any;
            roles: any;
            branchId: any;
        };
    }>;
    private generateTokens;
    logout(userId: string, token: string): Promise<{
        message: string;
    }>;
    register(registerDto: RegisterDto): Promise<{
        message: string;
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
    }>;
    updateProfile(userId: string, data: {
        firstName?: string;
        lastName?: string;
        email?: string;
    }): Promise<{
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
    updatePassword(userId: string, data: {
        currentPassword: string;
        newPassword: string;
    }): Promise<{
        message: string;
    }>;
}

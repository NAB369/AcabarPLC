"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../../infrastructure/prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
const { authenticator } = require('otplib');
const audit_service_1 = require("./audit.service");
let AuthService = class AuthService {
    prisma;
    jwtService;
    auditService;
    constructor(prisma, jwtService, auditService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.auditService = auditService;
    }
    async validateUser(email, pass, ip) {
        const user = await this.prisma.user.findUnique({
            where: { email },
            include: { roles: { include: { role: true } } },
        });
        if (!user)
            return null;
        if (user.lockoutUntil && user.lockoutUntil > new Date()) {
            const remainingMinutes = Math.ceil((user.lockoutUntil.getTime() - new Date().getTime()) / 60000);
            throw new common_1.UnauthorizedException(`Account is locked. Try again in ${remainingMinutes} minutes.`);
        }
        const isMatch = await bcrypt.compare(pass, user.passwordHash);
        if (isMatch) {
            await this.prisma.user.update({
                where: { id: user.id },
                data: {
                    failedLoginAttempts: 0,
                    lockoutUntil: null,
                    lastLoginAt: new Date(),
                    lastLoginIp: ip,
                },
            });
            const { passwordHash, ...result } = user;
            return result;
        }
        else {
            const failedAttempts = user.failedLoginAttempts + 1;
            const lockoutUntil = failedAttempts >= 5
                ? new Date(new Date().getTime() + 15 * 60000)
                : null;
            await this.prisma.user.update({
                where: { id: user.id },
                data: {
                    failedLoginAttempts: failedAttempts,
                    lockoutUntil,
                },
            });
            if (lockoutUntil) {
                throw new common_1.UnauthorizedException('Too many failed attempts. Account locked for 15 minutes.');
            }
            return null;
        }
    }
    async login(loginDto, ip, userAgent) {
        const user = await this.validateUser(loginDto.email, loginDto.password, ip);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        if (user.mfaEnabled) {
            return {
                mfaRequired: true,
                mfaToken: this.jwtService.sign({ sub: user.id, type: 'mfa' }, { expiresIn: '5m' }),
            };
        }
        const tokens = await this.generateTokens(user, ip, userAgent);
        await this.auditService.log({
            userId: user.id,
            action: 'LOGIN_SUCCESS',
            entity: 'Auth',
            entityId: user.id,
            details: { ip, userAgent },
        });
        return tokens;
    }
    async verifyMfa(userId, code, ip, userAgent) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { roles: { include: { role: true } } },
        });
        if (!user || !user.mfaSecret) {
            throw new common_1.UnauthorizedException('MFA not configured');
        }
        const isValid = authenticator.verify({
            token: code,
            secret: user.mfaSecret,
        });
        if (!isValid) {
            throw new common_1.UnauthorizedException('Invalid MFA code');
        }
        return this.generateTokens(user, ip, userAgent);
    }
    async generateTokens(user, ip, userAgent) {
        const payload = {
            email: user.email,
            sub: user.id,
            roles: user.roles.map((r) => r.role.name),
        };
        const accessToken = this.jwtService.sign(payload);
        const refreshToken = this.jwtService.sign({ sub: user.id }, { expiresIn: '7d' });
        await this.prisma.loginSession.create({
            data: {
                userId: user.id,
                tokenHash: accessToken,
                deviceInfo: userAgent,
                ipAddress: ip,
                expiresAt: new Date(new Date().getTime() + 7 * 24 * 60 * 60000),
            },
        });
        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                roles: payload.roles,
                branchId: user.branchId,
            },
        };
    }
    async logout(userId, token) {
        await this.prisma.loginSession.updateMany({
            where: { userId, tokenHash: token },
            data: { isActive: false },
        });
        await this.auditService.log({
            userId,
            action: 'LOGOUT',
            entity: 'Auth',
            entityId: userId,
        });
        return { message: 'Logged out successfully' };
    }
    async register(registerDto) {
        const { email, password, firstName, lastName } = registerDto;
        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        const passwordHash = await bcrypt.hash(password, 10);
        const user = await this.prisma.user.create({
            data: {
                email,
                passwordHash,
                firstName,
                lastName,
            },
        });
        const defaultRole = await this.prisma.role.findUnique({
            where: { name: 'CREDIT_OFFICER' },
        });
        if (defaultRole) {
            await this.prisma.userRole.create({
                data: {
                    userId: user.id,
                    roleId: defaultRole.id,
                },
            });
        }
        await this.auditService.log({
            userId: user.id,
            action: 'REGISTRATION',
            entity: 'User',
            entityId: user.id,
            details: { email: user.email },
        });
        return {
            message: 'User registered successfully',
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
            },
        };
    }
    async updateProfile(userId, data) {
        const updated = await this.prisma.user.update({
            where: { id: userId },
            data,
        });
        await this.auditService.log({
            userId,
            action: 'PROFILE_UPDATE',
            entity: 'User',
            entityId: userId,
            details: data,
        });
        const { passwordHash, ...result } = updated;
        return result;
    }
    async updatePassword(userId, data) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.UnauthorizedException('User not found');
        const isMatch = await bcrypt.compare(data.currentPassword, user.passwordHash);
        if (!isMatch)
            throw new common_1.UnauthorizedException('Incorrect current password');
        const newHash = await bcrypt.hash(data.newPassword, 10);
        await this.prisma.user.update({
            where: { id: userId },
            data: { passwordHash: newHash, passwordChangedAt: new Date() },
        });
        await this.auditService.log({
            userId,
            action: 'PASSWORD_CHANGE',
            entity: 'User',
            entityId: userId,
        });
        return { message: 'Password updated successfully' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        audit_service_1.AuditService])
], AuthService);
//# sourceMappingURL=auth.service.js.map
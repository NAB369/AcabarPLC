import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
const { authenticator } = require('otplib');

import { AuditService } from './audit.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private auditService: AuditService,
  ) {}

  async validateUser(email: string, pass: string, ip?: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { roles: { include: { role: true } } },
    });

    if (!user) return null;

    // Check Account Lockout
    if (user.lockoutUntil && user.lockoutUntil > new Date()) {
      const remainingMinutes = Math.ceil(
        (user.lockoutUntil.getTime() - new Date().getTime()) / 60000,
      );
      throw new UnauthorizedException(
        `Account is locked. Try again in ${remainingMinutes} minutes.`,
      );
    }

    const isMatch = await bcrypt.compare(pass, user.passwordHash);

    if (isMatch) {
      // Success: Reset failed attempts and update login info
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
    } else {
      // Failure: Increment counter and lockout if needed
      const failedAttempts = user.failedLoginAttempts + 1;
      const lockoutUntil =
        failedAttempts >= 5
          ? new Date(new Date().getTime() + 15 * 60000) // 15 minutes lockout
          : null;

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: failedAttempts,
          lockoutUntil,
        },
      });

      if (lockoutUntil) {
        throw new UnauthorizedException(
          'Too many failed attempts. Account locked for 15 minutes.',
        );
      }
      return null;
    }
  }

  async login(loginDto: LoginDto, ip?: string, userAgent?: string) {
    const user = await this.validateUser(loginDto.email, loginDto.password, ip);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check if MFA is required
    if (user.mfaEnabled) {
      return {
        mfaRequired: true,
        mfaToken: this.jwtService.sign(
          { sub: user.id, type: 'mfa' },
          { expiresIn: '5m' },
        ),
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

  async verifyMfa(
    userId: string,
    code: string,
    ip?: string,
    userAgent?: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { roles: { include: { role: true } } },
    });

    if (!user || !user.mfaSecret) {
      throw new UnauthorizedException('MFA not configured');
    }

    const isValid = authenticator.verify({
      token: code,
      secret: user.mfaSecret,
    });

    if (!isValid) {
      throw new UnauthorizedException('Invalid MFA code');
    }

    return this.generateTokens(user, ip, userAgent);
  }

  private async generateTokens(user: any, ip?: string, userAgent?: string) {
    const payload = {
      email: user.email,
      sub: user.id,
      roles: user.roles.map((r: any) => r.role.name),
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(
      { sub: user.id },
      { expiresIn: '7d' },
    );

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

  async logout(userId: string, token: string) {
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

  async register(registerDto: RegisterDto) {
    const { email, password, firstName, lastName } = registerDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
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

    // Default role assignment
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

  async updateProfile(
    userId: string,
    data: { firstName?: string; lastName?: string; email?: string },
  ) {
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

  async updatePassword(
    userId: string,
    data: { currentPassword: string; newPassword: string },
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');

    const isMatch = await bcrypt.compare(
      data.currentPassword,
      user.passwordHash,
    );
    if (!isMatch) throw new UnauthorizedException('Incorrect current password');

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
}

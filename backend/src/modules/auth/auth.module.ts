import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AuthController } from './auth.controller';
import { UsersController } from './users.controller';
import { AuthService } from './auth.service';
import { AuditService } from './audit.service';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.register({
      secret:
        process.env.JWT_SECRET ||
        'super-secret-enterprise-banking-key-change-in-production',
      signOptions: { expiresIn: (process.env.JWT_EXPIRATION || '7d') as any },
    }),
  ],
  controllers: [AuthController, UsersController],
  providers: [AuthService, AuditService, JwtStrategy],
  exports: [AuthService, AuditService],
})
export class AuthModule {}

import { Controller, Post, Body, Ip, Headers } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
  ) {}

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.authService.login(loginDto, ip, userAgent);
  }

  @Post('verify-mfa')
  async verifyMfa(
    @Body('code') code: string,
    @Headers('authorization') authHeader: string,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    // Extract user ID from temp token in authHeader
    const token = authHeader.split(' ')[1];
    const payload = await this.jwtService.verifyAsync(token);
    return this.authService.verifyMfa(payload.sub, code, ip, userAgent);
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }
}

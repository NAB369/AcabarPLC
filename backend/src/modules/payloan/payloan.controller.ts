import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PayloanService } from './payloan.service';
import { PayloanCallbackDto } from './payloan.dto';

// Note: With the global prefix 'api/v1', this maps to: /api/v1/client/wb/v1/payloan-callback
@Controller('client/wb/v1/payloan-callback')
export class PayloanController {
  constructor(private readonly payloanService: PayloanService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async handleCallback(@Body() dto: PayloanCallbackDto) {
    return this.payloanService.processCallback(dto);
  }

  @Get('notifications')
  async getNotifications() {
    return this.payloanService.getAllNotifications();
  }
}

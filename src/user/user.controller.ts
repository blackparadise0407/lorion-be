import { Controller, Get, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '@/auth/guards/auth.guard';

import { UserService } from './user.service';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async get() {
    return 'ok';
  }
}

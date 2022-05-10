import { Controller, Get, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '@/auth/guards/auth.guard';
import { User } from '@/common/decorators/user.decorator';

import { UserService } from './user.service';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getCurrentUser(@User('sub') userId: string) {
    return await this.userService.getOne({ _id: userId });
  }
}

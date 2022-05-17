import {
  BadRequestException,
  Controller,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { isValidObjectId } from 'mongoose';

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

  @Get(':userId')
  async getUserInfoById(@Param('userId') userId: string) {
    if (!userId) throw new BadRequestException('User is is required');
    if (!isValidObjectId(userId))
      throw new BadRequestException('User id is invalid');
    return await this.userService.getOne({ _id: userId });
  }
}

import {
  Controller,
  UseInterceptors,
  UseGuards,
  Get,
  Param,
  BadRequestException,
  Post,
  Body,
  NotFoundException,
} from '@nestjs/common';
import { isValidObjectId } from 'mongoose';

import { JwtAuthGuard } from '@/auth/guards/auth.guard';
import { User } from '@/common/decorators/user.decorator';
import { ResponseTransformInterceptor } from '@/common/interceptors/response-transform.interceptor';
import { UserService } from '@/user/user.service';

import { ConversationService } from './conversation.service';
import { CreateConversationRequestDTO } from './dto/create-conversation-request.dto';

@Controller('conversation')
@UseInterceptors(ResponseTransformInterceptor)
@UseGuards(JwtAuthGuard)
export class ConversationController {
  constructor(
    private readonly conversationService: ConversationService,

    private readonly userService: UserService,
  ) {}

  @Get(':userId')
  public async getByUser(@Param('userId') userId: string) {
    if (!isValidObjectId(userId))
      throw new BadRequestException('User id is invalid');

    return await this.conversationService.model
      .find({
        users: { $in: [userId] },
      })
      .populate('users');
  }

  @Post('')
  public async createConversation(
    @User('sub') senderId: string,
    @Body() { name, users }: CreateConversationRequestDTO,
  ) {
    const uniqUserIds = [...new Set([...users, senderId])];
    uniqUserIds.forEach((userId) => {
      if (!isValidObjectId(userId))
        throw new BadRequestException(`User id of '${userId}' is invalid`);
    });

    if (uniqUserIds.length === 2) {
      const foundConversation = await this.conversationService.model.findOne({
        users: { $all: uniqUserIds },
      });
      if (foundConversation)
        throw new BadRequestException('Conversation already exists');
    }

    const foundUsers = await this.userService.model.find({
      _id: { $in: uniqUserIds },
    });

    if (!foundUsers.length)
      throw new NotFoundException(
        `User id of '${uniqUserIds.join(', ')}' does not exist`,
      );

    if (foundUsers.length < 2)
      throw new BadRequestException(
        'Cannot create conversation with less than 2 users',
      );

    foundUsers.forEach((r) => {
      if (!r) throw new NotFoundException('User did not exist');
    });

    return await this.conversationService.createOne({
      name,
      users: foundUsers,
    });
  }
}

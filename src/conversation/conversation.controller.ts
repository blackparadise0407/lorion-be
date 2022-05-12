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
    @Body() { users }: CreateConversationRequestDTO,
  ) {
    const sender = await this.userService.getOne({ _id: senderId });
    if (!sender) throw new NotFoundException('User did not exist');
    users.forEach((userId) => {
      if (!isValidObjectId(userId))
        throw new BadRequestException(`User id of '${userId}' is invalid`);
    });

    const receivers = await this.userService.model.find({
      _id: { $in: users },
    });

    receivers.forEach((r) => {
      if (!r) throw new NotFoundException('User did not exist');
    });
    const conversation = await this.conversationService.createOne({
      name: 'Conversation',
      users: [sender, ...receivers],
    });
    return conversation;
  }
}

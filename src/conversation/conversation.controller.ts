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
  Inject,
  CACHE_MANAGER,
  Query,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { isValidObjectId, PipelineStage, Types } from 'mongoose';

import { JwtAuthGuard } from '@/auth/guards/auth.guard';
import { User } from '@/common/decorators/user.decorator';
import { ResponseTransformInterceptor } from '@/common/interceptors/response-transform.interceptor';
import { MessagePayloadDTO } from '@/dto/message-payload.dto';
import { UserService } from '@/user/user.service';

import { ConversationService } from './conversation.service';
import { CreateConversationRequestDTO } from './dto/create-conversation-request.dto';
import { MessageService } from './message/message.service';
// TODO: Refactor load more
const MESSAGE_LIMIT = 20;

@Controller('conversation')
@UseInterceptors(ResponseTransformInterceptor)
@UseGuards(JwtAuthGuard)
export class ConversationController {
  constructor(
    private readonly conversationService: ConversationService,
    private readonly messageService: MessageService,
    private readonly userService: UserService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  // TODO
  @Get('/messages/:conversationId')
  public async getMessagesByConversationId(
    @Param('conversationId') conversationId: string,
    @Query('limit') limit: number,
    @Query('page') page: number,
    @Query('current') current = 0,
  ) {
    if (!conversationId)
      throw new BadRequestException('Conversation id is required');
    if (!isValidObjectId(conversationId))
      throw new BadRequestException('Conversation id is invalid');

    const PAGE = page ?? 1;
    let LIMIT = limit ?? MESSAGE_LIMIT;
    const SKIP = (PAGE - 1) * LIMIT;

    let messages: Array<MessagePayloadDTO> = [];

    const messagesFromCache =
      await this.conversationService.getMessagesByConversationIdFromCache(
        conversationId,
      );

    const messagesFromCacheLen = messagesFromCache.length;
    if (current < messagesFromCacheLen) {
      messages = messagesFromCache;
      LIMIT = messagesFromCacheLen > LIMIT ? 0 : LIMIT - messagesFromCacheLen;
    }

    if (
      messagesFromCacheLen < MESSAGE_LIMIT ||
      current >= messagesFromCacheLen
    ) {
      const messagesFromDb = await this.messageService.model
        .find({
          conversation: conversationId,
        })
        .limit(LIMIT)
        .skip(SKIP)
        .sort({ timestamp: -1 });

      const mappedMessages = messagesFromDb
        .map(this.messageService.mapMessageToMessagePayload)
        .reverse();

      messages = [...mappedMessages, ...messages];
    }

    const totalFromDb = await this.messageService.model
      .find({
        conversation: conversationId,
      })
      .countDocuments();

    return { messages, total: totalFromDb };
  }

  @Get(':userId')
  public async getByUser(@Param('userId') userId: string) {
    if (!isValidObjectId(userId))
      throw new BadRequestException('User id is invalid');

    const pipeline: PipelineStage[] = [];
    const matches: PipelineStage = {
      $match: {
        users: { $in: [new Types.ObjectId(userId)] },
      },
    };

    pipeline.push(matches);

    const lookups: PipelineStage[] = [
      {
        $lookup: {
          from: 'messages',
          localField: '_id',
          foreignField: 'conversation',
          as: 'lastMessage',
          pipeline: [{ $sort: { timestamp: -1 } }, { $limit: 1 }],
        },
      },
      { $unwind: { path: '$lastMessage', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'users',
          localField: 'users',
          foreignField: '_id',
          as: 'users',
          pipeline: [
            {
              $project: {
                id: '$_id',
                username: 1,
                email: 1,
              },
            },
          ],
        },
      },
      { $sort: { 'lastMessage.timestamp': -1 } },
      { $limit: 20 },
      { $skip: 0 },
      {
        $addFields: {
          id: '$_id',
        },
      },
    ];

    pipeline.push(...lookups);

    const conversations = await this.conversationService.model.aggregate(
      pipeline,
    );

    for (const c of conversations) {
      const messages =
        await this.conversationService.getMessagesByConversationIdFromCache(
          c.id,
        );
      if (c.lastMessage) {
        c.lastMessage = this.messageService.mapMessageToMessagePayload(
          c.lastMessage,
        );
      }
      if (messages.length) {
        c.lastMessage = messages[messages.length - 1];
      }
    }

    return conversations;
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

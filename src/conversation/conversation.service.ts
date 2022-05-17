import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cache } from 'cache-manager';
import { Model } from 'mongoose';

import { BaseService } from '@/common/base.service';
import { MessagePayloadDTO } from '@/dto/message-payload.dto';

import { Conversation, ConversationDocument } from './conversation.schema';

@Injectable()
export class ConversationService extends BaseService<Conversation> {
  constructor(
    @InjectModel(Conversation.name)
    readonly conversationModel: Model<ConversationDocument>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {
    super(conversationModel);
  }

  public async getMessagesByConversationIdFromCache(id: string) {
    const rawMessages = await this.cacheManager.get(`conversation:${id}`);
    return (
      rawMessages ? JSON.parse(rawMessages as string) : []
    ) as Array<MessagePayloadDTO>;
  }
}

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BaseService } from '@/common/base.service';

import { Conversation, ConversationDocument } from './conversation.schema';

@Injectable()
export class ConversationService extends BaseService<Conversation> {
  constructor(
    @InjectModel(Conversation.name)
    readonly conversationModel: Model<ConversationDocument>,
  ) {
    super(conversationModel);
  }
}

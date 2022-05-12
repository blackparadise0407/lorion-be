import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BaseService } from '@/common/base.service';

import { Message, MessageDocument } from './message.schema';

@Injectable()
export class MessageService extends BaseService<Message> {
  constructor(
    @InjectModel(Message.name) readonly messageModel: Model<MessageDocument>,
  ) {
    super(messageModel);
  }
}

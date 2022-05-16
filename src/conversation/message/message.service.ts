import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BaseService } from '@/common/base.service';
import { MessagePayloadDTO } from '@/dto/message-payload.dto';

import { Message, MessageDocument } from './message.schema';

@Injectable()
export class MessageService extends BaseService<Message> {
  constructor(
    @InjectModel(Message.name) readonly messageModel: Model<MessageDocument>,
  ) {
    super(messageModel);
  }

  public mapMessageToMessagePayload({
    conversation,
    content,
    sender,
    timestamp,
  }: Message): MessagePayloadDTO {
    return {
      conversationId: conversation,
      message: content,
      senderId: sender,
      timestamp,
    } as unknown as MessagePayloadDTO;
  }
}

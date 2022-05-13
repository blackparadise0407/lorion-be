import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UserModule } from '@/user/user.module';

import { ConversationController } from './conversation.controller';
import { Conversation, ConversationSchema } from './conversation.schema';
import { ConversationService } from './conversation.service';
import { Message, MessageSchema } from './message/message.schema';
import { MessageService } from './message/message.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Conversation.name, schema: ConversationSchema },
      { name: Message.name, schema: MessageSchema },
    ]),
    UserModule,
  ],
  controllers: [ConversationController],
  providers: [ConversationService, MessageService],
  exports: [ConversationService, MessageService],
})
export class ConversationModule {}

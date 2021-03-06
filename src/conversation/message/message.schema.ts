import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MSchema } from 'mongoose';

import { User } from '@/user/user.schema';

import { Conversation } from '../conversation.schema';

export type MessageDocument = Message & Document;

@Schema({
  versionKey: false,
  timestamps: { createdAt: true },
  toJSON: {
    virtuals: true,
    transform: true,
  },
})
export class Message {
  _id: MSchema.Types.ObjectId;
  id: string;

  @Prop({ type: MSchema.Types.ObjectId, ref: 'User' })
  sender: User;

  @Prop()
  content: string;

  @Prop({ type: MSchema.Types.ObjectId, ref: 'Conversation' })
  conversation: Conversation;

  @Prop()
  timestamp: number;

  createdAt: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

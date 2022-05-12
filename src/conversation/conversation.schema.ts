import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MSchema } from 'mongoose';

import { User } from '@/user/user.schema';

export type ConversationDocument = Conversation & Document;

@Schema({
  timestamps: {
    createdAt: true,
  },
  versionKey: false,
  toJSON: {
    virtuals: true,
    transform: true,
  },
})
export class Conversation {
  _id: MSchema.Types.ObjectId;
  id: string;

  @Prop({ type: [{ type: MSchema.Types.ObjectId, ref: 'User' }] })
  users: User[];

  @Prop()
  name: string;

  createdAt: Date;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);

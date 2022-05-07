import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MSchema } from 'mongoose';

import { User } from '@/user/user.schema';

import { TokenType } from './token-type.enum';

export type TokenDocument = Token & Document;

@Schema({
  versionKey: false,
  timestamps: {
    createdAt: true,
  },
  toJSON: {
    transform: true,
    virtuals: true,
  },
})
export class Token {
  @Prop()
  value: string;

  @Prop()
  expiredAt: Date;

  @Prop({ ref: 'User', type: MSchema.Types.ObjectId })
  user: User;

  @Prop()
  type: TokenType;
}

export const TokenSchema = SchemaFactory.createForClass(Token);

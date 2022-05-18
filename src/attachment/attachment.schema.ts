import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MSchema } from 'mongoose';

import { User } from '@/user/user.schema';

export type AttachmentDocument = Attachment & Document;

@Schema({
  timestamps: {
    createdAt: true,
  },
  versionKey: false,
})
export class Attachment {
  _id: MSchema.Types.ObjectId;

  @Prop()
  path: string;

  @Prop()
  size: number;

  @Prop()
  mimetype: string;

  @Prop({ type: MSchema.Types.ObjectId, ref: 'User' })
  user: User;

  createdAt: Date;
}

export const AttachmentSchema = SchemaFactory.createForClass(Attachment);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Exclude } from 'class-transformer';
import { Document, Schema as MSchema } from 'mongoose';

export type UserDocument = User & Document;

@Schema({
  timestamps: {
    createdAt: true,
    updatedAt: true,
  },
  versionKey: false,
  toJSON: {
    virtuals: true,
    transform: true,
  },
})
export class User {
  _id: MSchema.Types.ObjectId;
  id?: string;

  @Prop({ unique: true })
  username: string;

  @Prop({ unique: true })
  email: string;

  @Prop()
  @Exclude({ toPlainOnly: true })
  password: string;

  @Prop({ default: true })
  enabled: boolean;

  @Prop({ default: false })
  verified: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

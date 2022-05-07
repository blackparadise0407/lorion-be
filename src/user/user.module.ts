import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema';
import * as bcryptjs from 'bcryptjs';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        imports: [ConfigModule],
        name: User.name,
        useFactory: (configService: ConfigService) => {
          const schema = UserSchema;

          schema.pre('save', async function (next: any) {
            const user = this as unknown as User;
            const salt = await bcryptjs.genSalt(
              configService.get<number>('auth.salt_rounds'),
            );
            user.password = await bcryptjs.hash(user.password, salt);
            next();
          });

          schema.set('toJSON', {
            transform: function (doc, ret) {
              delete ret.password;
              ret.id = doc._id;
              return ret;
            },
          });
          return schema;
        },
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}

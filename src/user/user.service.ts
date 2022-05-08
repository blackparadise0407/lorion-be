import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BaseService } from '@/common/base.service';

import { User, UserDocument } from './user.schema';

@Injectable()
export class UserService extends BaseService<User> {
  constructor(@InjectModel(User.name) readonly userModel: Model<UserDocument>) {
    super(userModel);
  }

  public async findOneByUsernameOrEmail(s: string) {
    return await this.model
      .findOne({
        $or: [{ username: s }, { email: s }],
      })
      .select('+password');
  }
}

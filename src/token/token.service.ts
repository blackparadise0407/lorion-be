import { BaseService } from '@/common/base.service';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomBytes } from 'crypto';
import { Model } from 'mongoose';

import { Token, TokenDocument } from './token.schema';

@Injectable()
export class TokenService extends BaseService<Token> {
  constructor(
    @InjectModel(Token.name) readonly tokenModel: Model<TokenDocument>,
  ) {
    super(tokenModel);
  }

  public generateRandomHash(size = 16): string {
    try {
      return randomBytes(size).toString('hex');
    } catch (e) {
      throw new InternalServerErrorException();
    }
  }
}

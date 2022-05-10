import { randomBytes } from 'crypto';

import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Algorithm, sign, verify } from 'jsonwebtoken';
import { Model } from 'mongoose';

import { BaseService } from '@/common/base.service';
import { User } from '@/user/user.schema';

import { Payload } from './jwt.payload';
import { Token, TokenDocument } from './token.schema';

@Injectable()
export class TokenService extends BaseService<Token> {
  constructor(
    private readonly configService: ConfigService,
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

  public generateJwt(user: User & { _id?: any }): string {
    const payload: Payload = {
      sub: user._id,
      email: user.email,
    };
    return sign(payload, this.configService.get<string>('auth.jwt.secret'), {
      algorithm: this.configService.get<Algorithm>('auth.jwt.alg'),
      expiresIn: this.configService.get<number>('auth.jwt.expiration'),
    });
  }

  public validateJwt(token: string, ignoreExpiration = false): Payload {
    try {
      return verify(token, this.configService.get<string>('auth.jwt.secret'), {
        algorithms: [this.configService.get<Algorithm>('auth.jwt.alg')],
        ignoreExpiration,
      }) as Payload;
    } catch (e) {
      if (e.message === 'jwt expired') {
        throw new ForbiddenException(e.message);
      }
      throw new UnauthorizedException('Invalid token');
    }
  }
}

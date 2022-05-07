import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as moment from 'moment';

import { MailService } from '@/mail/mail.service';
import { TokenType } from '@/token/token-type.enum';
import { TokenService } from '@/token/token.service';
import { UserService } from '@/user/user.service';

import { AuthService } from './auth.service';
import { RegisterDTO } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  @Post('/register')
  public async register(@Body() body: RegisterDTO) {
    const { email, username } = body;
    const foundUsername = await this.userService.getOne({ username });
    if (foundUsername) {
      throw new BadRequestException('This username has been taken');
    }

    const foundEmail = await this.userService.getOne({ email });
    if (foundEmail) {
      throw new BadRequestException('This email has been taken');
    }

    const createdUser = await this.userService.createOne(body);

    const verificationToken = await this.tokenService.createOne({
      value: this.tokenService.generateRandomHash(),
      user: createdUser,
      type: TokenType.email_verify,
      expiredAt: moment()
        .add(
          this.configService.get<number>('auth.email_verification_expiration'),
          'seconds',
        )
        .toDate(),
    });

    await this.mailService.sendEmailVerification(
      createdUser,
      verificationToken.value,
    );

    return createdUser;
  }
}

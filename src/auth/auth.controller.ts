import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as moment from 'moment';

import { User } from '@/common/decorators/user.decorator';
import { ResponseTransformInterceptor } from '@/common/interceptors/response-transform.interceptor';
import { MailService } from '@/mail/mail.service';
import { TokenType } from '@/token/token-type.enum';
import { TokenService } from '@/token/token.service';
import { UserService } from '@/user/user.service';

import { AuthService } from './auth.service';
import { LoginDTO } from './dto/login.dto';
import { RegisterDTO } from './dto/register.dto';
import { TokenRequestDTO } from './dto/token-request.dto';
import { JwtAuthGuard } from './guards/auth.guard';

@Controller('auth')
@UseInterceptors(ResponseTransformInterceptor)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  @Post('register')
  public async register(@Body() body: RegisterDTO) {
    const { email, username, password, confirmPassword } = body;

    const foundUser = await this.userService.model.findOne({
      $or: [{ username }, { email }],
    });

    if (email === foundUser?.email) {
      throw new BadRequestException('This email has been taken');
    }

    if (username === foundUser?.username) {
      throw new BadRequestException('This username has been taken');
    }

    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
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

    this.mailService.enqueueSendVerificationEmail(
      createdUser,
      verificationToken.value,
    );

    return 'Register successfully';
  }

  @Get('verify')
  public async verifyEmail(@Query('token') token: string) {
    const foundToken = await this.tokenService.getOne({ value: token });

    const malformedTokenMsg =
      'The provided token is malformed or otherwise invalid';

    if (!foundToken) {
      throw new BadRequestException(malformedTokenMsg);
    }

    if (foundToken.expiredAt < new Date()) {
      throw new BadRequestException('The provided token has expired');
    }

    const foundUser = await this.userService.updateOne(
      { _id: foundToken.user },
      { verified: true },
    );
    if (!foundUser) {
      throw new BadRequestException(malformedTokenMsg);
    }

    await this.tokenService.deleteOne({ _id: foundToken.id });

    return 'Verify email successfully';
  }

  @Post('login')
  public async login(@Body() body: LoginDTO) {
    const { username, password } = body;
    const foundUser = await this.userService.findOneByUsernameOrEmail(username);

    if (!foundUser) {
      throw new BadRequestException('Invalid credentials');
    }

    const isPasswordMatch = await this.authService.compareHash(
      password,
      foundUser.password,
    );

    if (!isPasswordMatch) {
      throw new BadRequestException('Invalid credentials');
    }

    if (!foundUser.verified) {
      throw new BadRequestException('Your account is not verified');
    }

    const accessToken = this.tokenService.generateJwt(foundUser);
    const refreshToken = await this.tokenService.createOne({
      expiredAt: moment().add(
        this.configService.get<number>('auth.refresh_token_expiration'),
        'seconds',
      ),
      type: TokenType.token_refresh,
      user: foundUser,
      value: this.tokenService.generateRandomHash(32),
    });

    return {
      accessToken,
      refreshToken: refreshToken.value,
      user: foundUser,
    };
  }

  @Post('token')
  async token(
    @Headers('authorization') authorization: string,
    @Body() { refreshToken }: TokenRequestDTO,
  ) {
    const token = authorization.split(' ')[1];
    const { sub } = this.tokenService.validateJwt(token, true);

    const malformedTokenMsg =
      'The provided token is malformed or otherwise invalid';

    const foundToken = await this.tokenService.getOne({
      user: sub,
      value: refreshToken,
    });

    if (!foundToken) {
      throw new BadRequestException(malformedTokenMsg);
    }

    if (foundToken.expiredAt < new Date()) {
      throw new BadRequestException('Session expired');
    }
    const foundUser = await this.userService.getOne({ _id: sub });

    if (!foundUser) {
      throw new BadRequestException(malformedTokenMsg);
    }

    const accessToken = this.tokenService.generateJwt(foundUser);

    return { accessToken };
  }

  @Get('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@User('sub') userId: string) {
    await this.tokenService.deleteMany({
      user: userId,
      type: TokenType.token_refresh,
    });
    return 'Logout successfully';
  }

  // TODO: Implement multiple devices login
  @Get('revoke')
  @UseGuards(JwtAuthGuard)
  async revoke(@User('sub') userId: string) {
    await this.tokenService.deleteMany({
      user: userId,
      type: TokenType.token_refresh,
    });
    return 'Revoke user access successfully';
  }
}

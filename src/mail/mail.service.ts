import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { User } from '@/user/user.schema';

/**
 * Use template path without ./
 */
@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendEmailVerification(user: User, token: string) {
    const baseUrl = this.configService.get<string>('app.baseUrl');
    const url = `${baseUrl}/api/auth/confirm?token=${token}`;

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Email verification',
      template: 'email-verification',
      context: {
        name: user.username,
        url,
      },
    });
  }
}

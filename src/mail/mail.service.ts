import { MailerService } from '@nestjs-modules/mailer';
import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bull';

import { EMAIL } from '@/constants/queue.constant';
import { User } from '@/user/user.schema';

/**
 * Use template path without ./
 */
@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
    @InjectQueue(EMAIL)
    private readonly emailQueue: Queue,
  ) {}

  public enqueueSendVerificationEmail(user: User, token: string) {
    this.emailQueue.add({ user, token }, { lifo: true });
  }

  public async sendVerificationEmail(user: User, token: string) {
    const baseUrl = this.configService.get<string>('app.baseUrl');
    const url = `${baseUrl}/api/auth/verify?token=${token}`;

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

import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

import { EMAIL } from '@/constants/queue.constant';

import { SendVerificationEmailDTO } from './dto/send-verification-email.dto';
import { MailService } from './mail.service';

@Processor(EMAIL)
export class MailConsumer {
  constructor(private readonly mailService: MailService) {}

  @Process()
  async sendEmailVerification(job: Job<SendVerificationEmailDTO>) {
    const { user, token } = job.data;
    await this.mailService.sendVerificationEmail(user, token);
  }
}

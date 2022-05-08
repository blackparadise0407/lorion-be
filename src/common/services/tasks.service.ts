import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';

import { TokenService } from '@/token/token.service';

@Injectable()
export class TasksService {
  private logger = new Logger('ScheduleJob');

  constructor(
    private readonly tokenService: TokenService,
    private readonly configService: ConfigService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async deleteExpiredEmailVerficationToken() {
    this.logger.log('deleteExpiredEmailVerficationToken');
    await this.tokenService.model.deleteMany({
      expiredAt: { $lte: new Date() },
    });
  }
}

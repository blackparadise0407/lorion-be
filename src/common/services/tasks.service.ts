import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Cache } from 'cache-manager';

import { MessageService } from '@/conversation/message/message.service';
import { MessagePayloadDTO } from '@/dto/message-payload.dto';
import { TokenService } from '@/token/token.service';

@Injectable()
export class TasksService {
  private logger = new Logger('ScheduleJob');

  constructor(
    private readonly tokenService: TokenService,
    private readonly messageService: MessageService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async deleteExpiredEmailVerficationToken(): Promise<void> {
    this.logger.log('deleteExpiredEmailVerficationToken');
    await this.tokenService.model.deleteMany({
      expiredAt: { $lte: new Date() },
    });
  }

  @Cron(CronExpression.EVERY_HOUR)
  async syncRedisMessageToDb(): Promise<void> {
    const keys = (await this.cacheManager.store.keys(
      'conversation:*',
    )) as Array<string>;
    for (const key of keys) {
      const rawMessages = await this.cacheManager.get(key);
      const insertedMessages: Array<MessagePayloadDTO> = rawMessages
        ? JSON.parse(rawMessages as string)
        : [];
      if (insertedMessages.length) {
        await this.messageService.model.insertMany(
          insertedMessages.map(
            ({ conversationId, senderId, timestamp, message }) => ({
              conversation: conversationId,
              sender: senderId,
              timestamp,
              content: message,
            }),
          ),
        );
        await this.cacheManager.del(key);
      }
    }
  }
}

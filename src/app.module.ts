import { BullModule } from '@nestjs/bull';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';

import { AppService } from '@/app.service';
import { AuthModule } from '@/auth/auth.module';
import appConfig from '@/config/app.config';
import { MailModule } from '@/mail/mail.module';
import { TokenModule } from '@/token/token.module';
import { UserModule } from '@/user/user.module';

import { AppGateway } from './app.gateway';
import { HttpLoggerMiddleware } from './common/middlewares/http-logger.middleware';
import { TasksService } from './common/services/tasks.service';
import { ConversationModule } from './conversation/conversation.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [appConfig],
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('db.uri'),
        retryAttempts: 3,
        retryDelay: 10,
        autoIndex: true,
      }),
      inject: [ConfigService],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('redis.host'),
          port: configService.get<number>('redis.port'),
        },
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    UserModule,
    TokenModule,
    MailModule,
    ConversationModule,
  ],
  providers: [AppService, AppGateway, TasksService],
})
export class AppModule {
  public static port: number;
  public static isDev: boolean;

  constructor(private readonly configService: ConfigService) {
    AppModule.port = configService.get<number>('app.port');
    AppModule.isDev = process.env.NODE_ENV === 'development';
  }

  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(HttpLoggerMiddleware).forRoutes('*');
  }
}

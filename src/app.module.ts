import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { PostsModule } from './posts/posts.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import type { RedisClientOptions } from 'redis';

@Module({
  imports: [
    CacheModule.register<RedisClientOptions>({
      ttl: 10 * 1000,
      max: 150,
      isGlobal: true,
      store: 'redis',
      url: 'redis://localhost:6379',
    }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    PostsModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}

import { TestingModule, Test } from '@nestjs/testing';
import { TerminusModule } from '@nestjs/terminus';

import { AppController } from './app.controller';
import { DatabaseModule } from './database';
import { ConfigModule } from './config';

describe('AppController', () => {
  let controller: AppController;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule, TerminusModule, DatabaseModule],
      controllers: [AppController],
    }).compile();

    controller = module.get<AppController>(AppController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Get status', () => {
    it('status', async () => {
      const received = await controller.status();
      expect(received).toStrictEqual({
        status: 'ok',
        info: {
          memory_heap: { status: 'up' },
          memory_rss: { status: 'up' },
          database: { status: 'up' },
          redis: { status: 'up' },
        },
        error: {},
        details: {
          memory_heap: { status: 'up' },
          memory_rss: { status: 'up' },
          database: { status: 'up' },
          redis: { status: 'up' },
        },
      });
    });
  });
});

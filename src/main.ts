import { initializeTransactionalContext } from 'typeorm-transactional';
import compress from '@fastify/compress';
import helmet from '@fastify/helmet';

import {
  NestFastifyApplication,
  FastifyAdapter,
} from '@nestjs/platform-fastify';
import { NestFactory } from '@nestjs/core';

import { HttpExceptionFilter } from './common/filters';
import { validationPipe } from './common/pipes';

import { ConfigService, ConfigMode } from './config';
import { AppModule } from './app.module';
import { swaggerSetup } from './swagger';

/**
 * [description]
 */
async function bootstrap() {
  initializeTransactionalContext();

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  const configService = app.get(ConfigService);

  const exceptionFilter = new HttpExceptionFilter();

  await app.register(compress, { encodings: ['gzip', 'deflate'] });
  await app.register(helmet, {
    contentSecurityPolicy: false,
  });

  app.setGlobalPrefix(configService.get('PREFIX')).enableCors({
    credentials: configService.get('CORS_CREDENTIALS'),
    origin: configService.get('CORS_ORIGIN'),
  });

  if (configService.getMode(ConfigMode.production)) app.enableShutdownHooks();

  await swaggerSetup(app, configService);

  return app
    .useGlobalPipes(validationPipe)
    .useGlobalFilters(exceptionFilter)
    .listen(configService.get('PORT'), configService.get('HOST'));
}

bootstrap();

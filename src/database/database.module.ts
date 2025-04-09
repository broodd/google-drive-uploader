import { dirname } from 'node:path';

import { addTransactionalDataSource } from 'typeorm-transactional';
import { DataSource } from 'typeorm';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

import { ConfigService } from 'src/config';

import { DatabaseLogger } from './database.logger';

/**
 * [description]
 */
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      name: 'default',
      useFactory: (configService: ConfigService) => ({
        name: configService.get('TYPEORM_NAME'),
        type: configService.get<'postgres'>('TYPEORM_TYPE'),
        host: configService.get('TYPEORM_HOST'),
        port: configService.get('TYPEORM_PORT'),
        cache: configService.get('TYPEORM_CACHE'),
        logger: new DatabaseLogger(configService.get('TYPEORM_LOGGING')),
        database: configService.get<string>('TYPEORM_DATABASE'),
        username: configService.get('TYPEORM_USERNAME'),
        password: configService.get('TYPEORM_PASSWORD'),
        dropSchema: configService.get('TYPEORM_DROP_SCHEMA'),
        synchronize: configService.get('TYPEORM_SYNCHRONIZE'),
        migrationsRun: configService.get('TYPEORM_MIGRATIONS_RUN'),
        entities: [dirname(__dirname) + '/modules/**/*.entity.{ts,js}'],
        migrations: [__dirname + '/migrations/*.{ts,js}'],
      }),
      async dataSourceFactory(options) {
        if (!options) throw new Error('Invalid options passed');
        return addTransactionalDataSource(new DataSource(options));
      },
    }),
  ],
})
export class DatabaseModule {}

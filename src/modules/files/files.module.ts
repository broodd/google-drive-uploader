import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

import { GoogleDriveModule } from 'src/google-drive/google-drive.module';
import { ConfigService } from 'src/config';

import { FilesController } from './controllers';
import { FilesService } from './services';
import { FileEntity } from './entities';

/**
 * [description]
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([FileEntity]),
    GoogleDriveModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        folder: config.get('GOOGLE_DRIVE_FOLDER'),
        client_email: config.get('GOOGLE_DRIVE_CLIENT_EMAIL'),
        private_key: config
          .get<string>('GOOGLE_DRIVE_PRIVATE_KEY')
          .replace(/\\n/g, '\n'),
      }),
    }),
  ],
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}

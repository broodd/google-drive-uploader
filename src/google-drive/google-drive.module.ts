import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { DynamicModule, Provider, Module } from '@nestjs/common';

import {
  GoogleDriveModuleAsyncOptions,
  GoogleDriveOptionsFactory,
  GoogleDriveModuleOptions,
} from './interfaces';
import {
  GOOGLE_DRIVE_MODULE_OPTIONS,
  GOOGLE_DRIVE_MODULE,
} from './google-drive.constants';
import { GoogleDriveService } from './services';

/**
 * [description]
 */
@Module({})
export class GoogleDriveModule {
  /**
   * [description]
   * @param options
   * @returns
   */
  static register(options: GoogleDriveModuleOptions): DynamicModule {
    return {
      module: GoogleDriveModule,
      providers: [
        { provide: GOOGLE_DRIVE_MODULE_OPTIONS, useValue: options },
        { provide: GOOGLE_DRIVE_MODULE, useValue: randomStringGenerator() },
        { provide: GoogleDriveService, useClass: GoogleDriveService },
      ],
      exports: [
        GOOGLE_DRIVE_MODULE,
        GOOGLE_DRIVE_MODULE_OPTIONS,
        GoogleDriveService,
      ],
    };
  }

  /**
   * [description]
   * @param options
   * @returns
   */
  static registerAsync(options: GoogleDriveModuleAsyncOptions): DynamicModule {
    return {
      module: GoogleDriveModule,
      imports: options.imports,
      providers: [
        ...this.createAsyncProviders(options),
        { provide: GOOGLE_DRIVE_MODULE, useValue: randomStringGenerator() },
        { provide: GoogleDriveService, useClass: GoogleDriveService },
      ],
      exports: [
        GOOGLE_DRIVE_MODULE,
        GOOGLE_DRIVE_MODULE_OPTIONS,
        GoogleDriveService,
      ],
    };
  }

  /**
   * [description]
   * @param options
   */
  private static createAsyncProviders(
    options: GoogleDriveModuleAsyncOptions,
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }
    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: options.useClass,
        useClass: options.useClass,
      },
    ];
  }

  /**
   * [description]
   * @param options
   */
  private static createAsyncOptionsProvider(
    options: GoogleDriveModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: GOOGLE_DRIVE_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }
    return {
      provide: GOOGLE_DRIVE_MODULE_OPTIONS,
      useFactory: async (optionsFactory: GoogleDriveOptionsFactory) =>
        optionsFactory.createGoogleDriveOptions(),
      inject: [options.useExisting || options.useClass],
    };
  }
}

import { ModuleMetadata } from '@nestjs/common/interfaces';
import { Type } from '@nestjs/common';

/**
 * [description]
 */
export interface GoogleDriveModuleOptions {
  readonly folder: string;

  readonly client_email: string;
  readonly private_key: string;
}

/**
 * [description]
 */
export interface GoogleDriveOptionsFactory {
  /**
   * [description]
   */
  createGoogleDriveOptions():
    | Promise<GoogleDriveModuleOptions>
    | GoogleDriveModuleOptions;
}

/**
 * [description]
 */
export interface GoogleDriveModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  /**
   * [description]
   */
  useExisting?: Type<GoogleDriveOptionsFactory>;

  /**
   * [description]
   */
  useClass?: Type<GoogleDriveOptionsFactory>;

  /**
   * [description]
   */
  useFactory?: (
    ...args: any[]
  ) => Promise<GoogleDriveModuleOptions> | GoogleDriveModuleOptions;

  /**
   * [description]
   */
  inject?: any[];
}

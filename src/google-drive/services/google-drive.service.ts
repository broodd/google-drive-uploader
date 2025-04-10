import path from 'node:path';

import { drive_v3, google } from 'googleapis';
import got from 'got';

import { BadRequestException, Injectable, Inject } from '@nestjs/common';

import { ErrorTypeEnum } from 'src/common/enums';

import { SelectDriveFileto } from 'src/modules/files/dto';
import { FileEntity } from 'src/modules/files/entities';

import { GOOGLE_DRIVE_MODULE_OPTIONS } from '../google-drive.constants';
import { GoogleDriveModuleOptions } from '../interfaces';

/**
 * [description]
 */
@Injectable()
export class GoogleDriveService {
  /**
   * [description]
   */
  private readonly drive: drive_v3.Drive;

  /**
   * [description]
   * @param options
   */
  constructor(
    @Inject(GOOGLE_DRIVE_MODULE_OPTIONS)
    public readonly options: GoogleDriveModuleOptions,
  ) {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: options.client_email,
        private_key: options.private_key,
      },
      scopes: ['https://www.googleapis.com/auth/drive'],
    });
    this.drive = google.drive({ version: 'v3', auth });
  }

  /**
   * Generate error in format
   * @param error
   */
  private throwError(error): never {
    throw new BadRequestException({
      message: ErrorTypeEnum.API_INVALID_DATA,
      error: error.response.data,
    });
  }

  /**
   * Upload file to Google Drive
   * Maximum file size: 5,120 GB
   * @link https://developers.google.com/workspace/drive/api/reference/rest/v3/files/create
   */
  public async createOneByUrl(url: string): Promise<drive_v3.Schema$File> {
    try {
      const metadata = await this.getFileMetaFromUrl(url);
      const fileStream = got.stream(url);

      const driveFile = await this.drive.files.create({
        requestBody: {
          parents: [this.options.folder],
          name: metadata.name,
        },
        media: {
          mimeType: metadata.mimetype,
          body: fileStream,
        },
      });

      return driveFile.data;
    } catch (error) {
      this.throwError(error);
    }
  }

  /**
   * [description]
   */
  public async deleteOne(conditions: SelectDriveFileto): Promise<void> {
    try {
      await this.drive.files.delete({
        fileId: conditions.id,
      });
    } catch (error) {
      this.throwError(error);
    }
  }

  /**
   * [description]
   * @param url
   */
  public async getFileMetaFromUrl(url: string): Promise<Partial<FileEntity>> {
    const metadata = await got.head(url);
    const contentDisposition = metadata.headers['content-disposition'];
    const mimetype = metadata.headers['content-type'];
    let name: string;

    if (contentDisposition) {
      const match = /filename\*=UTF-8''(.+)|filename="(.+)"|filename=(.+)/.exec(
        contentDisposition,
      );

      if (match) {
        name = decodeURIComponent(match[1] || match[2] || match[3]).replace(
          /['"]/g,
          '',
        );
      }
    } else {
      name = path.basename(new URL(url).pathname);
    }

    return {
      mimetype,
      name,
    };
  }
}

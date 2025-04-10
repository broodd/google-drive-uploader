import { Readable } from 'node:stream';
import path from 'node:path';

import { drive_v3, google } from 'googleapis';
import got from 'got';

import { Injectable, Inject } from '@nestjs/common';

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
   * [description]
   * @returns
   */
  async createOne(fileUrl): Promise<drive_v3.Schema$File> {
    const fileName = await this.getFileNameFromUrl(fileUrl);
    const fileStream = got.stream(fileUrl);

    const uploadedFile = await this.drive.files.create({
      requestBody: {
        parents: [this.options.folder],
        name: fileName,
      },
      media: {
        mimeType: 'application/octet-stream',
        body: fileStream,
      },
    });

    return uploadedFile.data;
  }

  /**
   * [description]
   */
  async selectMany(): Promise<drive_v3.Schema$File[]> {
    const res = await this.drive.files.list({
      pageSize: 10,
      fields: 'files(id, name, webViewLink)',
    });
    return res.data.files;
  }

  /**
   * [description]
   * @param fileUrl
   */
  async getFileNameFromUrl(fileUrl: string): Promise<string> {
    try {
      const fileOptions = await got.head(fileUrl);
      const contentDisposition = fileOptions.headers['content-disposition'];

      if (contentDisposition) {
        const match =
          /filename\*=UTF-8''(.+)|filename="(.+)"|filename=(.+)/.exec(
            contentDisposition,
          );

        if (match) {
          return decodeURIComponent(match[1] || match[2] || match[3]).replace(
            /['"]/g,
            '',
          );
        }
      }

      return path.basename(new URL(fileUrl).pathname);
    } catch {
      return null;
    }
  }
}

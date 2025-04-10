import {
  ClassSerializerInterceptor,
  UseInterceptors,
  Controller,
  Post,
  Get,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { GoogleDriveService } from 'src/google-drive/services';

/**
 * [description]
 */
@ApiTags('files')
@Controller('files')
export class FilesController {
  /**
   * [description]
   * @param filesService
   * @param googleDriveService
   */
  constructor(private readonly googleDriveService: GoogleDriveService) {}

  /**
   * Maximum file size: 5,120 GB
   * @param options
   * @link https://developers.google.com/workspace/drive/api/reference/rest/v3/files/create
   */
  @Post()
  public async createOne(): Promise<any> {
    return this.googleDriveService.createOne(
      'https://www.hostinger.co.uk/tutorials/wp-content/uploads/sites/2/2022/07/the-structure-of-a-url.png',
    );
  }

  /**
   * [description]
   * @param options
   */
  @Get()
  public async selectMany(): Promise<any> {
    return this.googleDriveService.selectMany();
  }
}

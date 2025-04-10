import {
  ClassSerializerInterceptor,
  UseInterceptors,
  Controller,
  Delete,
  Param,
  Query,
  Body,
  Post,
  Get,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { GoogleDriveService } from 'src/google-drive/services';

import {
  CreateFileByUrlResponseDto,
  CreateFilesByUrlsDto,
} from '../dto/create-files-by-urls.dto';
import { PaginationFilesDto, SelectDriveFileto, SelectFilesDto } from '../dto';
import { FilesService } from '../services';
import { FileEntity } from '../entities';

/**
 * [description]
 */
@ApiTags('files')
@Controller('files')
@UseInterceptors(ClassSerializerInterceptor)
export class FilesController {
  /**
   * [description]
   * @param filesService
   */
  constructor(private readonly filesService: FilesService) {}

  /**
   * Maximum file size: 5,120 GB
   * @param data
   * @link https://developers.google.com/workspace/drive/api/reference/rest/v3/files/create
   */
  @Post()
  @ApiOperation({ summary: 'Upload files to drive' })
  @ApiResponse({ type: () => CreateFileByUrlResponseDto, isArray: true })
  public async createManyByUrls(
    @Body() data: CreateFilesByUrlsDto,
  ): Promise<CreateFileByUrlResponseDto[]> {
    return Promise.allSettled(
      data.urls.map((url) => this.filesService.createOneAndUploadByUrl(url)),
    );
  }

  /**
   * [description]
   * @param options
   */
  @Get()
  @ApiOperation({ summary: 'Select files from database' })
  @ApiResponse({ type: () => PaginationFilesDto })
  public async selectManyAndCount(
    @Query() options: SelectFilesDto,
  ): Promise<PaginationFilesDto> {
    return this.filesService.selectManyAndCount(options);
  }

  /**
   * [description]
   * @param conditions
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete file from database and drive' })
  @ApiResponse({ type: () => FileEntity })
  public async deleteOneFromDrive(
    @Param() conditions: SelectDriveFileto,
  ): Promise<FileEntity> {
    return this.filesService.deleteOne(conditions);
  }
}

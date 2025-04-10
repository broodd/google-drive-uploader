import { runOnTransactionRollback, Transactional } from 'typeorm-transactional';
import { drive } from 'googleapis/build/src/apis/drive';
import { Repository } from 'typeorm';

import { NotFoundException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { FindOneBracketsOptions } from 'src/common/interfaces';
import { CommonService } from 'src/common/services';

import { GoogleDriveService } from 'src/google-drive/services';

import { PaginationFilesDto } from '../dto';
import { FileEntity } from '../entities';

/**
 * [description]
 */
@Injectable()
export class FilesService extends CommonService<
  FileEntity,
  PaginationFilesDto
> {
  /**
   * [description]
   * @param repository
   * @param googleDriveService
   */
  constructor(
    @InjectRepository(FileEntity)
    public readonly repository: Repository<FileEntity>,
    private readonly googleDriveService: GoogleDriveService,
  ) {
    super(FileEntity, repository, PaginationFilesDto);
  }

  /**
   * [description]
   * @param url
   */
  @Transactional()
  public async createOneAndUploadByUrl(url: string): Promise<FileEntity> {
    const driveFile = await this.googleDriveService.createOneByUrl(url);

    /**
     * Remove already uploaded file if transaction will rolback
     */
    runOnTransactionRollback(async () => {
      await this.googleDriveService.deleteOne({ id: driveFile.id });
    });

    return this.createOne({
      mimetype: driveFile.mimeType,
      name: driveFile.name,
      key: driveFile.id,
    });
  }

  /**
   * [description]
   * @param conditions
   */
  @Transactional()
  public async deleteOne(
    conditions: FindOneBracketsOptions<FileEntity>['where'],
  ): Promise<FileEntity> {
    const entity = await super.deleteOne(conditions);
    await this.googleDriveService.deleteOne({ id: entity.key });

    return entity;
  }
}

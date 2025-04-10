import { IsOptional, MaxLength, MinLength } from 'class-validator';
import { FindOneOptions, ILike } from 'typeorm';

import { ApiProperty } from '@nestjs/swagger';

import { FindManyOptionsDto } from 'src/common/dto';

import { FileEntity } from '../entities';

/**
 * [description]
 */
export class SelectFilesDto extends FindManyOptionsDto<FileEntity> {
  /**
   * [description]
   */
  @IsOptional()
  @MinLength(1)
  @MaxLength(256)
  @ApiProperty()
  public readonly filename?: string;

  /**
   * [description]
   */
  public get whereBrackets(): FindOneOptions['where'] {
    const { filename } = this;
    return Object.assign({}, filename && { filename: ILike(`%${filename}%`) });
  }
}

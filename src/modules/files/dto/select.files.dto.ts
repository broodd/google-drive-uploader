import { IsOptional, MaxLength, MinLength } from 'class-validator';
import { FindOneOptions, ILike } from 'typeorm';

import { ApiPropertyOptional } from '@nestjs/swagger';

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
  @ApiPropertyOptional()
  public readonly name?: string;

  /**
   * [description]
   */
  public get whereBrackets(): FindOneOptions['where'] {
    const { name } = this;
    return Object.assign({}, name && { name: ILike(`%${name}%`) });
  }
}

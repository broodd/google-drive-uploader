import { IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

import { FindOneOptionsDto } from 'src/common/dto';

import { FileEntity } from '../entities';

/**
 * [description]
 */
export class SelectFileDto extends FindOneOptionsDto<FileEntity> {}

/**
 * [description]
 */
export class SelectDriveFileto {
  /**
   * [description]
   */
  @IsString()
  @ApiProperty()
  public readonly id: string;
}

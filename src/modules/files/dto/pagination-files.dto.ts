import { ApiProperty } from '@nestjs/swagger';

import { PaginationDto } from 'src/common/dto';

import { FileEntity } from '../entities';

/**
 * [description]
 */
export class PaginationFilesDto extends PaginationDto<FileEntity> {
  /**
   * Result of the selection by the specified parameters.
   */
  @ApiProperty({ type: () => [FileEntity] })
  public readonly result: FileEntity[];

  /**
   * Total number of records.
   */
  @ApiProperty()
  public readonly count: number;
}

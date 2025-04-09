import { Transform } from 'class-transformer';
import { IsUUID } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

/**
 * [description]
 */
export class IDs {
  /**
   * Entity ID
   */
  @IsUUID(4, { each: true })
  @Transform(({ value }) => [].concat(value))
  @ApiProperty({ example: ['xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'] })
  public readonly ids: string[];
}

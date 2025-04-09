import { ApiProperty } from '@nestjs/swagger';

/**
 * [description]
 */
export class AffectedDto {
  /**
   * [description]
   */
  @ApiProperty()
  public readonly affected?: number;
}

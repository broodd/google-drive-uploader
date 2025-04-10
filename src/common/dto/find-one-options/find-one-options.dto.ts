import {
  IsBooleanString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  Matches,
} from 'class-validator';
import { Transform, Exclude, Expose } from 'class-transformer';
import { FindOptionsSelect } from 'typeorm';

import { ApiPropertyOptional } from '@nestjs/swagger';

import { stringArrayToNestedObject } from 'src/common/helpers';
import { FindOneBracketsOptions } from 'src/common/interfaces';

import { CustomExtendedOptionsDto } from '../custom-extended-options';

/**
 * Only letters, numbers, dot, underscore
 */
const JOIN_RELATIONS_REGEX = /^[a-zA-Z0-9._]+$/;

/**
 * [description]
 */
export class FindOneOptionsDto<Entity>
  extends CustomExtendedOptionsDto
  implements FindOneBracketsOptions
{
  /**
   * Specifies what columns should be retrieved
   */
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @Exclude({ toPlainOnly: true })
  @Transform(({ value }) => [].concat(value))
  @ApiPropertyOptional({
    type: [String],
    example: [],
    description: 'Specifies what columns should be retrieved',
  })
  public readonly selection?: (keyof Entity)[];

  /**
   * Expose field `select`, specifies what columns should be retrieved
   */
  @Expose({ toPlainOnly: true })
  public get select(): FindOptionsSelect<Entity> {
    return Object.assign(
      {},
      this.selection &&
        stringArrayToNestedObject(this.selection as string[], true),
    );
  }

  /**
   * Indicates what relations of entity should be loaded (simplified left join form)
   */
  @IsOptional()
  @IsBooleanString()
  @ApiPropertyOptional({
    type: 'boolean',
    description: 'Indicates what relations of entity should be loaded',
  })
  public eager?: string;

  /**
   * Getter to form an property of loadEagerRelations. Available after calling instanceToPlain
   */
  @Expose({ toPlainOnly: true })
  public get loadEagerRelations(): boolean {
    return !!this.eager ? JSON.parse(this.eager) : true;
  }

  /**
   * Specifies what columns should be retrieved
   * Works when eager is true
   */
  @IsArray()
  @IsOptional()
  @IsNotEmpty({ each: true })
  @Matches(JOIN_RELATIONS_REGEX, { each: true })
  @Transform(({ value }) => [].concat(value))
  @ApiPropertyOptional({
    type: [String],
    example: [],
    description:
      'Specifies what relations should be retrieved, works when eager = true',
  })
  public joinRelations?: string[] = [];

  /**
   * Specifies what columns should NOT be retrieved
   * Works when eager is true
   */
  @IsArray()
  @IsOptional()
  @IsNotEmpty({ each: true })
  @Matches(JOIN_RELATIONS_REGEX, { each: true })
  @Transform(({ value }) => [].concat(value))
  @ApiPropertyOptional({
    type: [String],
    example: [],
    description: 'Specifies what relations should NOT be retrieved',
  })
  public excludeRelations?: string[] = [];
}

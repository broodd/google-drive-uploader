import { IsNotEmpty, IsOptional, MaxLength, IsString, IsArray, Max, Min } from 'class-validator';
import { Transform, Exclude, Expose } from 'class-transformer';
import { FindOneOptions } from 'typeorm';

import { ApiProperty } from '@nestjs/swagger';

import { FindManyBracketsOptions } from 'src/common/interfaces';

import { FindOneOptionsDto } from '../find-one-options';

/**
 * [description]
 */
export class FindManyOptionsDto<Entity>
  extends FindOneOptionsDto<Entity>
  implements FindManyBracketsOptions
{
  /**
   * Order, in which entities should be ordered
   */
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @MaxLength(64, { each: true })
  @Transform(({ value }) => [].concat(value))
  @ApiProperty({
    type: [String],
    description: `Order, in which entities should be ordered. For order by relation field use <i>elation.field</i>`,
  })
  public asc?: string[];

  /**
   * If the same fields are specified for sorting in two directions, the priority is given to DESC
   */
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @MaxLength(64, { each: true })
  @Transform(({ value }) => [].concat(value))
  @ApiProperty({
    type: [String],
    description:
      'If the same fields are specified for sorting in two directions, the priority is given to DESC',
  })
  public desc?: string[];

  /**
   * Getter to form an object of order. Available after calling instanceToPlain
   */
  @Expose({ toPlainOnly: true })
  public get order(): Record<string, 'ASC' | 'DESC'> {
    return Object.assign(
      {},
      this.asc?.reduce<Record<string, 'ASC' | 'DESC'>>((acc, key) => {
        if (!key.startsWith('__') && !key.includes('.')) acc[key] = 'ASC';
        return acc;
      }, {}),
      this.desc?.reduce<Record<string, 'ASC' | 'DESC'>>((acc, key) => {
        if (!key.startsWith('__') && !key.includes('.')) acc[key] = 'DESC';
        return acc;
      }, {}),
    );
  }

  /**
   * Offset (paginated) where from entities should be taken
   */
  @Min(1)
  @IsOptional()
  @Exclude({ toPlainOnly: true })
  @ApiProperty({
    type: String,
    example: 1,
    description: 'Offset (paginated) where from entities should be taken',
  })
  public page?: number = 1;

  /**
   * Limit (paginated) - max number of entities should be taken
   */
  @Min(1)
  @Max(100)
  @IsOptional()
  @Exclude({ toPlainOnly: true })
  @ApiProperty({
    type: String,
    example: 5,
    default: 50,
    description: 'Limit (paginated) - max number of entities should be taken',
  })
  public take?: number = 50;

  /**
   * Getter to form an object of skip. Available after calling instanceToPlain
   */
  @Expose({ toPlainOnly: true })
  public get skip(): number {
    return (this.take || 0) * (this.page - 1);
  }

  /**
   * Dto conditions
   */
  public get whereBrackets(): FindOneOptions['where'] {
    return {};
  }
}

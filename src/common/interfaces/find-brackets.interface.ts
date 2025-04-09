import { FindManyOptions, FindOneOptions } from 'typeorm';

import { CustomExtendedOptions } from '../dto/custom-extended-options';

/**
 * [description]
 */
export interface FindManyBracketsOptions<Entity = any>
  extends FindManyOptions<Entity>,
    CustomExtendedOptions {
  /**
   * [description]
   */
  asc?: string[];

  /**
   * [description]
   */
  desc?: string[];

  /**
   * [description]
   */
  joinRelations?: string[];

  /**
   * [description]
   */
  excludeRelations?: string[];

  /**
   * [description]
   */
  whereBrackets?: FindOneOptions['where'];
}

/**
 * [description]
 */
export interface FindOneBracketsOptions<Entity = any>
  extends FindOneOptions<Entity>,
    CustomExtendedOptions {
  /**
   * [description]
   */
  joinRelations?: string[];

  /**
   * [description]
   */
  excludeRelations?: string[];

  /**
   * [description]
   */
  whereBrackets?: FindOneOptions['where'];
}

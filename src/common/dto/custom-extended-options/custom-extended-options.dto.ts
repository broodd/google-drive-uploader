import { Allow } from 'class-validator';

import { ApiHideProperty } from '@nestjs/swagger';

/**
 * [description]
 */
export interface CustomExtendedOptions {
  /**
   * [description]
   */
  userId?: string;

  /**
   * [description]
   */
  data?: Record<string, any>;
}

/**
 * [description]
 */
export class CustomExtendedOptionsDto implements CustomExtendedOptions {
  /**
   * Request userId
   */
  @Allow()
  @ApiHideProperty()
  public userId?: string;

  /**
   * Different useful payload data from controller
   */
  @Allow()
  @ApiHideProperty()
  public data?: Record<string, any>;

  /**
   * Request visible filter
   */
  @Allow()
  @ApiHideProperty()
  public isVisible?: boolean;
}

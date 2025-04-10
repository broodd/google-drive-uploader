import { IsUrl } from 'class-validator';

import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';

import { FileEntity } from '../entities';

/**
 * [description]
 */
export class CreateFilesByUrlsDto {
  /**
   * [description]
   */
  @ApiProperty({
    example: [
      'https://www.hostinger.co.uk/tutorials/wp-content/uploads/sites/2/2022/07/the-structure-of-a-url.png',
      'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    ],
  })
  @IsUrl({}, { each: true })
  public readonly urls: string[];
}

/**
 * [description]
 */
export class CreateFileByUrlResponseDto {
  /**
   * [description]
   */
  @ApiProperty()
  public readonly status: 'fulfilled' | 'rejected';

  /**
   * [description]
   */
  @ApiPropertyOptional()
  public readonly value?: FileEntity;

  /**
   * [description]
   */
  @ApiPropertyOptional()
  public readonly reason?: unknown;
}

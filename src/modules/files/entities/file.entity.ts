import { Expose } from 'class-transformer';
import { Column, Entity } from 'typeorm';

import { ApiProperty } from '@nestjs/swagger';

import { CommonEntity } from 'src/common/entities';

/**
 * [description]
 */
@Entity('files')
export class FileEntity extends CommonEntity {
  /**
   * [description]
   */
  @Expose()
  @ApiProperty({ readOnly: true })
  get driveUrl(): string {
    return `https://drive.google.com/file/d/${this.key}/view?usp=drivesdk`;
  }

  /**
   * [description]
   */
  @Expose()
  @ApiProperty({ readOnly: true })
  get src(): string {
    return `https://drive.google.com/uc?id=${this.key}`;
  }

  /**
   * [description]
   */
  @Column({ type: 'varchar', length: 256, nullable: true })
  @ApiProperty({ maxLength: 256, nullable: true })
  public readonly key: string;

  /**
   * [description]
   */
  @Column({ type: 'varchar', length: 256, nullable: true })
  @ApiProperty({ maxLength: 256, nullable: true })
  public readonly name: string;

  /**
   * [description]
   */
  @Column({ type: 'varchar', length: 256, nullable: true })
  @ApiProperty({ maxLength: 256, nullable: true })
  public readonly mimetype: string;
}

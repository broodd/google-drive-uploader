import { FindOneOptionsDto } from 'src/common/dto';

import { FileEntity } from '../entities';

/**
 * [description]
 */
export class SelectFileDto extends FindOneOptionsDto<FileEntity> {}

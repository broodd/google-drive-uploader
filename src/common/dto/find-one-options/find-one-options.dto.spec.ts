import { instanceToPlain, plainToInstance } from 'class-transformer';

import { FindOneOptionsDto } from './find-one-options.dto';

describe('FindOneOptionsDto', () => {
  it('should be defined', () => {
    expect(new FindOneOptionsDto()).toBeDefined();
  });

  describe('relations', () => {
    it('should be return array relation fields', () => {
      const plain = { eager: true };
      const classDto = plainToInstance(FindOneOptionsDto, plain);
      const instanceDto = instanceToPlain(classDto);
      expect(instanceDto).toMatchObject(plain);
    });
  });
});

import { ValueTransformer } from 'typeorm';

import { floatToInt } from 'src/common/helpers';

export const FloatIntColumnTransformer: ValueTransformer = {
  to: (value: number): number => value && floatToInt(value),
  from: (value: number) => value / 100,
};

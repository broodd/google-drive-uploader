import { of } from 'rxjs';

import { NestInterceptor, CallHandler } from '@nestjs/common';

import { TransformInterceptor, Response } from './transform.interceptor';

const next: CallHandler = { handle: () => of('test') };
const context: any = {
  switchToHttp: jest.fn(() => ({
    getResponse: () => ({
      statusCode: 200,
    }),
  })),
};

describe('TransformInterceptor', () => {
  let interceptor: NestInterceptor;

  beforeAll(() => {
    interceptor = new TransformInterceptor();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should be return', async () => {
    const responseInterceptor = await interceptor.intercept(context, next);
    return responseInterceptor.subscribe({
      next: (value: Response<string>) => {
        expect(value).toEqual({ data: 'test' });
      },
    });
  });
});

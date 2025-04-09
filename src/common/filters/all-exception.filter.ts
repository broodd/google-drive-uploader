import { URL } from 'node:url';

import { FastifyReply } from 'fastify';

import {
  ExceptionFilter,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  Catch,
} from '@nestjs/common';

import { ErrorTypeEnum } from '../enums';

const NODE_ENV = process.env.NODE_ENV;

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  private readonly logger: Logger = new Logger(AllExceptionFilter.name);

  catch(exception: Error, host: ArgumentsHost): FastifyReply {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse<FastifyReply>();

    const statusCode =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const { message, error } =
      exception instanceof HttpException
        ? (exception.getResponse() as Record<string, any>)
        : {
            message: ErrorTypeEnum.INTERNAL_SERVER_ERROR,
            error: ErrorTypeEnum.INTERNAL_SERVER_ERROR,
          };

    if (NODE_ENV != 'test') {
      this.logger.error(
        {
          url: new URL(request.url, 'logger://').pathname,
          method: request.method,
          params: request.params,
          query: request.query,
          body: request.body,
          user: request.user,
          statusCode,
          message,
        },
        exception.stack,
      );
    }

    return response.status(statusCode).send({ error, statusCode, message: [].concat(message) });
  }
}

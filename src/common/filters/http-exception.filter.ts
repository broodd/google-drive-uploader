import { FastifyReply } from 'fastify';

import { ExceptionFilter, ArgumentsHost, HttpException, Catch } from '@nestjs/common';

/**
 * [description]
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  /**
   * [description]
   */
  catch(exception: HttpException, host: ArgumentsHost): FastifyReply {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const statusCode = exception.getStatus();
    const { message, error } = exception.getResponse() as Record<string, any>;

    return response
      .status(statusCode)
      .send({ statusCode, message: [].concat(message), errorMessage: error?.message, error });
  }
}

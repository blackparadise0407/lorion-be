import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

import {
  BAD_REQUEST,
  FORBIDDEN,
  INTERNAL_SERVER_ERROR,
  UNAUTHORIZED,
  TOO_MANY_REQUESTS,
} from '@/constants/exception.constant';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(error: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest();
    const res = ctx.getResponse();

    if (error.getStatus() === HttpStatus.TOO_MANY_REQUESTS) {
      if (typeof error.response === 'string') {
        error.response = TOO_MANY_REQUESTS;
      }
    }

    if (error.getStatus() === HttpStatus.UNAUTHORIZED) {
      if (typeof error.response !== 'string') {
        error.response.message =
          error.response.message === 'Unauthorized'
            ? UNAUTHORIZED
            : error.response.message;
      }
    }

    if (error.getStatus() === HttpStatus.FORBIDDEN) {
      if (typeof error.response !== 'string') {
        error.response.message =
          error.response.message === 'Forbidden'
            ? FORBIDDEN
            : error.response.message;
      }
    }

    if (error.getStatus() === HttpStatus.BAD_REQUEST) {
      if (typeof error.response !== 'string') {
        error.response.message =
          error.response.message === 'Bad Request'
            ? BAD_REQUEST
            : error.response.message;
      }
    }

    if (error.getStatus() === HttpStatus.INTERNAL_SERVER_ERROR) {
      if (typeof error.response !== 'string') {
        error.response.message =
          error.response.message === 'Internal Server Error'
            ? INTERNAL_SERVER_ERROR
            : error.response.message;
      }
    }

    res.status(error.getStatus()).json({
      statusCode: error.getStatus(),
      error: error.response.name || error.response.error || error.name,
      message: error.response.message || error.response || error.message,
      errors: error.response.errors || null,
      timestamp: new Date().toISOString(),
      path: req ? req.url : null,
    });
  }
}

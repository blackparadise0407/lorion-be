import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(error: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest();
    const res = ctx.getResponse();

    if (error.getStatus() === HttpStatus.UNAUTHORIZED) {
      if (typeof error.response !== 'string') {
        error.response.message =
          error.response.message ||
          'Full authentication is required to access this resource';
      }
    }

    if (error.getStatus() === HttpStatus.FORBIDDEN) {
      if (typeof error.response !== 'string') {
        error.response.message =
          error.response.message ||
          'You do not have permission to access this resource';
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

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = '服务器内部错误';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exResponse = exception.getResponse();
      if (typeof exResponse === 'string') {
        message = exResponse;
      } else if (typeof exResponse === 'object' && exResponse !== null) {
        const resp = exResponse as any;
        // NestJS ValidationPipe 返回 { statusCode, message: string[], error }
        if (Array.isArray(resp.message)) {
          message = resp.message.join('; ');
        } else {
          message = resp.message || message;
        }
      }
    }

    response.status(status).json({
      code: status,
      data: null,
      message,
    });
  }
}

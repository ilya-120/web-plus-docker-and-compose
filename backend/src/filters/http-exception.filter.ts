import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  ValidationError,
} from '@nestjs/common';
import { Response } from 'express';
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();
    if (
      typeof exceptionResponse === 'object' &&
      'message' in exceptionResponse &&
      Array.isArray(exceptionResponse['message'])
    ) {
      // Обработка ошибок валидации
      const validationErrors = exceptionResponse['message'];
      const formattedErrors = this.formatValidationErrors(validationErrors);
      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        message: formattedErrors[0],
        errors: formattedErrors,
      });
    } else {
      // Обработка других типов ошибок
      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        message: exceptionResponse['message'] || exception.message,
      });
    }
  }
  private formatValidationErrors(errors: string[] | ValidationError[]): any {
    if (errors.length > 0 && typeof errors[0] === 'string') {
      return errors;
    }
    return (errors as ValidationError[]).reduce((acc, err) => {
      acc[err.property] = Object.values(err.constraints);
      return acc;
    }, {});
  }
}

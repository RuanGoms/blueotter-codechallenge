import { HttpStatus } from '@nestjs/common';

export class HttpResponse {
  static ok(data: any) {
    return { statusCode: HttpStatus.OK, data };
  }

  static created(data: any) {
    return { statusCode: HttpStatus.CREATED, data };
  }

  static noContent() {
    return { statusCode: HttpStatus.NO_CONTENT };
  }

  static notFound(message: string = 'Resource not found') {
    return {
      statusCode: HttpStatus.NOT_FOUND,
      message,
    };
  }

  static badRequest(message: string) {
    return {
      statusCode: HttpStatus.BAD_REQUEST,
      message,
    };
  }

  static unauthorized(message: string = 'Unauthorized') {
    return {
      statusCode: HttpStatus.UNAUTHORIZED,
      message,
    };
  }

  static forbidden(message: string = 'Forbidden') {
    return {
      statusCode: HttpStatus.FORBIDDEN,
      message,
    };
  }

  static error(message: string = 'Internal Server Error') {
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message,
    };
  }
}

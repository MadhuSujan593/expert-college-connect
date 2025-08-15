import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';
    let details: any = null;

    // Handle different types of exceptions
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const response = exception.getResponse() as any;
      message = response.message || exception.message;
      error = response.error || 'Bad Request';
      details = response.details || null;
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle Prisma database errors
      status = this.handlePrismaError(exception);
      message = this.getPrismaErrorMessage(exception);
      error = 'Database Error';
      details = {
        code: exception.code,
        meta: exception.meta,
      };
    } else if (exception instanceof Prisma.PrismaClientValidationError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Validation failed';
      error = 'Validation Error';
      details = {
        message: exception.message,
      };
    } else if (exception instanceof Prisma.PrismaClientUnknownRequestError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Database operation failed';
      error = 'Database Error';
      details = {
        message: exception.message,
      };
    } else if (exception instanceof Error) {
      // Handle generic JavaScript errors
      message = exception.message;
      error = exception.name;
      details = {
        stack: process.env.NODE_ENV === 'development' ? exception.stack : undefined,
      };
    }

    // Log the error
    this.logError(exception, request, status);

    // Create error response
    const errorResponse = {
      success: false,
      error: {
        message,
        error,
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
        ...(details && { details }),
        ...(process.env.NODE_ENV === 'development' && {
          stack: exception instanceof Error ? exception.stack : undefined,
        }),
      },
    };

    // Send response
    response.status(status).json(errorResponse);
  }

  /**
   * Handle Prisma-specific errors
   */
  private handlePrismaError(error: Prisma.PrismaClientKnownRequestError): number {
    switch (error.code) {
      case 'P2002':
        return HttpStatus.CONFLICT; // Unique constraint violation
      case 'P2003':
        return HttpStatus.BAD_REQUEST; // Foreign key constraint violation
      case 'P2025':
        return HttpStatus.NOT_FOUND; // Record not found
      case 'P2021':
        return HttpStatus.BAD_REQUEST; // Table does not exist
      case 'P2022':
        return HttpStatus.BAD_REQUEST; // Column does not exist
      case 'P2014':
        return HttpStatus.BAD_REQUEST; // The change you are trying to make would violate the required relation
      case 'P2015':
        return HttpStatus.BAD_REQUEST; // A related record could not be found
      case 'P2016':
        return HttpStatus.BAD_REQUEST; // Query interpretation error
      case 'P2017':
        return HttpStatus.BAD_REQUEST; // The relations are not connected
      case 'P2018':
        return HttpStatus.BAD_REQUEST; // The connected record does not exist
      case 'P2019':
        return HttpStatus.BAD_REQUEST; // Input error
      case 'P2020':
        return HttpStatus.BAD_REQUEST; // Value out of range
      case 'P2023':
        return HttpStatus.BAD_REQUEST; // Inconsistent column data
      case 'P2024':
        return HttpStatus.REQUEST_TIMEOUT; // Connection pool timeout
      case 'P2026':
        return HttpStatus.BAD_REQUEST; // Current database provider doesn't support a feature
      case 'P2027':
        return HttpStatus.BAD_REQUEST; // Multiple errors occurred
      default:
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }

  /**
   * Get user-friendly Prisma error messages
   */
  private getPrismaErrorMessage(error: Prisma.PrismaClientKnownRequestError): string {
    switch (error.code) {
      case 'P2002':
        const target = (error.meta?.target as string[]) || [];
        return `Duplicate entry: ${target.join(', ')} already exists`;
      case 'P2003':
        return 'Referenced record does not exist';
      case 'P2025':
        return 'Record not found';
      case 'P2021':
        return 'Database table does not exist';
      case 'P2022':
        return 'Database column does not exist';
      case 'P2014':
        return 'Operation would violate required relationship';
      case 'P2015':
        return 'Related record not found';
      case 'P2016':
        return 'Query interpretation error';
      case 'P2017':
        return 'Relations are not properly connected';
      case 'P2018':
        return 'Connected record does not exist';
      case 'P2019':
        return 'Input validation error';
      case 'P2020':
        return 'Value out of acceptable range';
      case 'P2023':
        return 'Inconsistent column data';
      case 'P2024':
        return 'Database connection timeout';
      case 'P2026':
        return 'Database feature not supported';
      case 'P2027':
        return 'Multiple database errors occurred';
      default:
        return 'Database operation failed';
    }
  }

  /**
   * Log error with context
   */
  private logError(exception: unknown, request: Request, status: number): void {
    const logContext = {
      timestamp: new Date().toISOString(),
      method: request.method,
      url: request.url,
      status,
      userAgent: request.get('User-Agent'),
      ip: request.ip,
      userId: (request as any).user?.id,
    };

    if (status >= 500) {
      this.logger.error('Server Error', exception, logContext);
    } else if (status >= 400) {
      this.logger.warn('Client Error', logContext);
    } else {
      this.logger.log('Request processed', logContext);
    }
  }
} 
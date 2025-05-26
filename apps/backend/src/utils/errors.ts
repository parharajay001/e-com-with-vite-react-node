import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';
import { envConfig } from '../config/envConfig';

type PrismaErrorMeta = {
  target?: string[];
  cause?: string;
  field_name?: string;
};

export const getPrismaErrorMessage = (error: PrismaClientKnownRequestError): string => {
  const meta = error.meta as PrismaErrorMeta;

  switch (error.code) {
    case 'P2002': {
      const target = (error.meta as PrismaErrorMeta | null)?.target;
      const fields =
        target && Array.isArray(target) && target.length > 0 ? target.join(', ') : 'field';
      return `Unique constraint violation: ${fields} already exists`;
    }
    case 'P2014':
      return 'Invalid ID reference: The change you are trying to make would violate database constraints';
    case 'P2003':
      return `Foreign key constraint failed: ${meta.field_name || 'Referenced record does not exist'}`;
    case 'P2025':
      return `Record not found: ${meta.cause || 'The requested record does not exist'}`;
    default:
      return `Database operation failed: ${error.message}`;
  }
};

export const handleControllerError = (error: unknown) => {
  let statusCode = StatusCodes.BAD_REQUEST;
  let errorMessage = 'Request failed';
  let errorDetails: string[] = [];
  let stack = null;

  if (error instanceof z.ZodError) {
    statusCode = StatusCodes.UNPROCESSABLE_ENTITY;
    errorMessage = 'Validation failed';
    errorDetails = error.errors.map((e) => `${e.path}: ${e.message}`);
  } else if (error instanceof PrismaClientKnownRequestError) {
    statusCode = error.code === 'P2002' ? StatusCodes.CONFLICT : StatusCodes.BAD_REQUEST;
    errorMessage = getPrismaErrorMessage(error);
    if (envConfig.nodeEnv === 'development') {
      errorDetails = [`Code: ${error.code}`, `Target: ${JSON.stringify(error.meta?.target)}`];
      stack = error.stack;
    }
  } else if (error instanceof ValidationError) {
    statusCode = StatusCodes.UNPROCESSABLE_ENTITY;
    errorMessage = error.message;
    errorDetails =
      typeof error === 'object' && error !== null && 'details' in error
        ? (error as { details: string[] }).details
        : [];
  } else if (error instanceof DatabaseError) {
    statusCode =
      error.code === 'DUPLICATE_ENTRY' ? StatusCodes.CONFLICT : StatusCodes.INTERNAL_SERVER_ERROR;
    errorMessage = error.message;
    if (envConfig.nodeEnv === 'development') {
      errorDetails = error.details || [];
      stack = error.stack;
    }
  } else if (error instanceof AuthenticationError) {
    statusCode = StatusCodes.UNAUTHORIZED;
    errorMessage = error.message;
  } else if (error instanceof Error) {
    errorMessage = error.message;
    stack = envConfig.nodeEnv !== 'production' ? error.stack : undefined;
  }

  return {
    statusCode,
    errorResponse: {
      error: errorMessage,
      ...(stack && envConfig.nodeEnv !== 'production' && { stack }),
      ...(errorDetails.length > 0 && { details: errorDetails }),
    },
  };
};

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class DatabaseError extends Error {
  public readonly code?: string;
  public readonly details?: string[];

  constructor(message: string, code?: string, details?: string[]) {
    super(message);
    this.name = 'DatabaseError';
    this.code = code;
    this.details = details;
  }
}

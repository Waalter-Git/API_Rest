import { ZodError } from 'zod';
import type { ErrorRequestHandler } from 'express';

type ValidationIssue = {
  field: string;
  message: string;
};

type ErrorResponseBody = {
  message: string;
  errors?: ValidationIssue[];
};

type DomainError = Error & {
  code?: string;
};

const isDomainError = (error: unknown): error is DomainError => {
  return error instanceof Error;
};

const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof ZodError) {
    const errors = error.issues.map((issue) => ({
      field: issue.path.length > 0 ? issue.path.join('.') : 'root',
      message: issue.message,
    }));

    const body: ErrorResponseBody = {
      message: 'Validation failed',
      errors,
    };

    response.status(400).json(body);
    return;
  }

  if (isDomainError(error) && error.name === 'NotFoundError') {
    response.status(404).json({ message: error.message });
    return;
  }

  if (isDomainError(error) && error.name === 'ForbiddenError') {
    response.status(403).json({ message: error.message });
    return;
  }

  if (isDomainError(error) && error.name === 'BadRequestError') {
    response.status(400).json({ message: error.message });
    return;
  }

  if (isDomainError(error) && (error.name === 'ConflictError' || error.code === 'P2002')) {
    response.status(409).json({ message: error.message });
    return;
  }

  response.status(500).json({
    message: 'Internal server error',
  });
};

export { errorHandler };

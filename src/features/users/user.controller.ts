import type { Request, Response, NextFunction } from 'express';
import { loginSchema, registerSchema } from './user.schema';
import { ConflictError, UnauthorizedError, login, register } from './user.service';

const registerHandler = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
  try {
    const payload = registerSchema.parse(request.body);
    const result = await register(payload);

    response.status(201).json(result);
  } catch (error) {
    if (error instanceof ConflictError || error instanceof UnauthorizedError) {
      response.status(error instanceof ConflictError ? 409 : 401).json({ message: error.message });
      return;
    }

    next(error);
  }
};

const loginHandler = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
  try {
    const payload = loginSchema.parse(request.body);
    const result = await login(payload);

    response.status(200).json(result);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      response.status(401).json({ message: error.message });
      return;
    }

    next(error);
  }
};

export { loginHandler, registerHandler };

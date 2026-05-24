import type { NextFunction, Request, RequestHandler, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '.prisma/client';

type TokenPayload = {
  sub?: string;
  role?: UserRole;
};

const JWT_SECRET = process.env.JWT_SECRET;

const authenticateUser: RequestHandler = (request: Request, response: Response, next: NextFunction): void => {
  if (!JWT_SECRET) {
    response.status(500).json({ message: 'Internal server error' });
    return;
  }

  const authorizationHeader = request.headers.authorization;

  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
    response.status(401).json({ message: 'Missing bearer token' });
    return;
  }

  const token = authorizationHeader.slice(7).trim();

  if (!token) {
    response.status(401).json({ message: 'Missing bearer token' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload & TokenPayload;

    if (!decoded.sub || !decoded.role) {
      response.status(401).json({ message: 'Invalid token payload' });
      return;
    }

    request.user = {
      id: decoded.sub,
      role: decoded.role,
    };

    next();
  } catch {
    response.status(401).json({ message: 'Invalid or expired token' });
  }
};

const requireRole = (allowedRoles: UserRole[]): RequestHandler => {
  return (request: Request, response: Response, next: NextFunction): void => {
    const userRole = request.user?.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      response.status(403).json({ message: 'Forbidden' });
      return;
    }

    next();
  };
};

export { authenticateUser, requireRole };

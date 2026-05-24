import type { UserRole } from '.prisma/client';

export {};

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export type AuthenticatedUser = {
  id: string;
  role: UserRole;
};

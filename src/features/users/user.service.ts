import 'dotenv/config';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient, UserRole, type User } from '.prisma/client';
import prisma from '../../config/prisma';

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS ?? '12');
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '8h';

type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

type LoginInput = {
  email: string;
  password: string;
};

type SafeUser = Omit<User, 'passwordHash'>;

type RegisterResult = {
  user: SafeUser;
};

type LoginResult = {
  user: SafeUser;
  accessToken: string;
};

class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}

class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

const serializeUser = (user: User): SafeUser => {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
};

const register = async (input: RegisterInput): Promise<RegisterResult> => {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existingUser) {
    throw new ConflictError('A user with this email already exists');
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  const createdUser = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
      role: UserRole.EMPLOYEE,
    },
  });

  return { user: serializeUser(createdUser) };
};

const login = async (input: LoginInput): Promise<LoginResult> => {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);

  if (!passwordMatches) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const signOptions: jwt.SignOptions = {
    expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  };

  const accessToken = jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, signOptions);

  return {
    user: serializeUser(user),
    accessToken,
  };
};

export { login, register, ConflictError, UnauthorizedError };

export const AUTH_TOKEN_KEY = 'jwt_token';

export type AuthRole = 'ADMIN' | 'TECH' | 'EMPLOYEE';

export type AuthUser = {
  id: string;
  role: AuthRole;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  user: AuthUser;
};

export type AuthState = {
  user: AuthUser | null;
  token: string | null;
};

export type AuthContextValue = AuthState & {
  isAuthenticated: boolean;
  isReady: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
};

export type JwtPayload = {
  sub: string;
  role: AuthRole;
  exp?: number;
  iat?: number;
};

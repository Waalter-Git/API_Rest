'use client';

import axios from 'axios';
import { createContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api } from '@/lib/axios';
import {
  AUTH_TOKEN_KEY,
  type AuthContextValue,
  type AuthRole,
  type AuthState,
  type AuthUser,
  type JwtPayload,
  type LoginCredentials,
  type LoginResponse,
} from '@/types/auth';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const writeAuthCookie = (token: string): void => {
  document.cookie = `${AUTH_TOKEN_KEY}=${token}; path=/; SameSite=Lax`;
};

const clearAuthCookie = (): void => {
  document.cookie = `${AUTH_TOKEN_KEY}=; Max-Age=0; path=/; SameSite=Lax`;
};

const decodeJwtPayload = (token: string): JwtPayload | null => {
  const parts = token.split('.');

  if (parts.length !== 3) {
    return null;
  }

  try {
    const payload = parts[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const paddedPayload = payload.padEnd(payload.length + ((4 - (payload.length % 4)) % 4), '=');
    const parsed = JSON.parse(window.atob(paddedPayload)) as { sub?: string; role?: AuthRole };

    if (!parsed.sub || !parsed.role) {
      return null;
    }

    return {
      sub: parsed.sub,
      role: parsed.role,
    };
  } catch {
    return null;
  }
};

const readStoredAuthState = (): AuthState => {
  if (typeof window === 'undefined') {
    return { user: null, token: null };
  }

  const token = window.localStorage.getItem(AUTH_TOKEN_KEY);

  if (!token) {
    return { user: null, token: null };
  }

  const payload = decodeJwtPayload(token);

  if (!payload) {
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
    return { user: null, token: null };
  }

  return {
    token,
    user: {
      id: payload.sub,
      role: payload.role,
    },
  };
};

type AuthProviderProps = {
  children: ReactNode;
};

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [state, setState] = useState<AuthState>({ user: null, token: null });
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const storedState = readStoredAuthState();
    setState(storedState);

    if (storedState.token) {
      writeAuthCookie(storedState.token);
    }

    setIsReady(true);
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      const response = await api.post<LoginResponse>('/login', credentials);
      const { accessToken, user } = response.data;

      window.localStorage.setItem(AUTH_TOKEN_KEY, accessToken);
      writeAuthCookie(accessToken);
      setState({
        token: accessToken,
        user,
      });
    } catch (error) {
      if (axios.isAxiosError<{ message?: string }>(error)) {
        const message = error.response?.data?.message;

        if (message) {
          throw new Error(message);
        }
      }

      throw new Error('Nao foi possivel autenticar a sessao.');
    }
  };

  const logout = (): void => {
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
    clearAuthCookie();
    setState({ user: null, token: null });
  };

  const value = useMemo<AuthContextValue>(() => ({
    ...state,
    isAuthenticated: Boolean(state.token && state.user),
    isReady,
    login,
    logout,
  }), [isReady, state]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext, AuthProvider };

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { api } from '../lib/api';

export type UserRole = 'EMPLOYER' | 'JOB_SEEKER' | 'SEEKER';

export interface User {
  id: string | number;
  username: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User | Record<string, unknown>) => void;
  logout: () => void;
}

export const normalizeRole = (value: unknown): UserRole => {
  if (value === 'EMPLOYER') return 'EMPLOYER';
  if (value === 'JOB_SEEKER' || value === 'SEEKER') return 'JOB_SEEKER';
  return 'JOB_SEEKER';
};

export const normalizeUser = (rawUser: Record<string, unknown> | null | undefined): User => {
  const nestedUser = (rawUser?.user as Record<string, unknown> | undefined) ?? undefined;
  const roleValue = rawUser?.role ?? nestedUser?.role ?? rawUser?.user_role ?? rawUser?.role_name;

  return {
    id: (rawUser?.id ?? nestedUser?.id ?? rawUser?.user_id ?? rawUser?.pk ?? 0) as string | number,
    username: (rawUser?.username ?? nestedUser?.username ?? '') as string,
    email: (rawUser?.email ?? nestedUser?.email ?? '') as string,
    role: normalizeRole(roleValue),
  };
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isCancelled = false;

    const fetchUser = async () => {
      if (!token) {
        if (!isCancelled) {
          setUser(null);
          setIsLoading(false);
        }
        return;
      }

      if (user?.role) {
        if (!isCancelled) setIsLoading(false);
        return;
      }

      try {
        const response = await api.get('/api/auth/me/');
        if (!isCancelled) {
          setUser(normalizeUser(response.data));
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        if (!isCancelled) {
          setToken(null);
          setUser(null);
          localStorage.removeItem('token');
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchUser();

    return () => {
      isCancelled = true;
    };
  }, [token]);

  const login = (newToken: string, newUser: User | Record<string, unknown>) => {
    const normalizedUser = normalizeUser(newUser as Record<string, unknown> | null | undefined);
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(normalizedUser);
    setIsLoading(false);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

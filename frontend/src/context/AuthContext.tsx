import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

import apiClient from '../services/apiClient';
import type { User, LoginCredentials, RegisterData, AuthState } from '../types/auth';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function toUser(data: {
  id: string;
  name: string;
  email: string;
  isAdmin?: boolean;
  isEmailVerified?: boolean;
  createdAt?: string | Date;
}): User {
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    isAdmin: data.isAdmin ?? false,
    isEmailVerified: data.isEmailVerified ?? false,
    createdAt: typeof data.createdAt === 'string' ? data.createdAt : data.createdAt?.toISOString() ?? '',
  };
}

export const AuthProvider = ({ children }: { children: ReactNode }): React.JSX.Element => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async (): Promise<void> => {
      const savedToken = localStorage.getItem('token');
      if (savedToken !== null) {
        try {
          const response = await apiClient.get<{
            id: string;
            name: string;
            email: string;
            isAdmin: boolean;
            isEmailVerified: boolean;
            createdAt: string;
          }>('/auth/profile');
          setUser(toUser(response.data));
        } catch {
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    void initAuth();
  }, []);

  const login = async ({ email, password }: LoginCredentials): Promise<void> => {
    try {
      setError(null);
      setLoading(true);
      const response = await apiClient.post<{
        id: string;
        name: string;
        email: string;
        isAdmin: boolean;
        isEmailVerified: boolean;
        token: string;
        createdAt?: string;
      }>('/auth/login', { email, password });
      const { token: newToken, ...userData } = response.data;

      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(toUser(userData));
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      setError(apiErr.response?.data?.message ?? 'Error al iniciar sesion');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async ({ name, email, password }: RegisterData): Promise<void> => {
    try {
      setError(null);
      setLoading(true);
      const response = await apiClient.post<{
        id: string;
        name: string;
        email: string;
        isAdmin?: boolean;
        isEmailVerified: boolean;
        token?: string;
        createdAt?: string;
      }>('/auth/register', { name, email, password });
      const { token: newToken, ...userData } = response.data;

      if (newToken !== undefined) {
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(toUser(userData));
      } else {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      }
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      setError(apiErr.response?.data?.message ?? 'Error al registrar');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = (): void => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiClient from '../services/apiClient';
import { User, LoginCredentials, RegisterData, AuthState } from '../types/auth';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        try {
          // ============================================
          // Usar apiClient con interceptor
          // El interceptor ya agrega el token automáticamente
          // ============================================
          const response = await apiClient.get('/auth/profile');
          setUser(response.data);
        } catch {
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async ({ email, password }: LoginCredentials) => {
    try {
      setError(null);
      setLoading(true);
      const response = await apiClient.post('/auth/login', { email, password });
      const { token, ...userData } = response.data;
      
      localStorage.setItem('token', token);
      setToken(token);
      setUser(userData);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Error al iniciar sesión');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async ({ name, email, password }: RegisterData) => {
    try {
      setError(null);
      setLoading(true);
      const response = await apiClient.post('/auth/register', { name, email, password });
      const { token, ...userData } = response.data;
      
      // Si hay token (para usuarios verificados), guardarlo
      // Si no hay token (email no verificado), no hacer login automático
      if (token) {
        localStorage.setItem('token', token);
        setToken(token);
        setUser(userData);
      } else {
        // Limpiar cualquier sesión anterior
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      }
      // No lanzamos error - el registro fue exitoso
      // El usuario debe verificar su email
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Error al registrar');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};
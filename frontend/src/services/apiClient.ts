import axios from 'axios';

// ============================================
// API CLIENT - Why?
// Centralizar las llamadas a la API tiene varios beneficios:
// 1. Manejo centralizado de errores
// 2. Headers consistentes (auth token)
// 3. Configuración de timeouts
// 4. Interceptors para logging
// 5. Facilita testing (se puede mockear)
// ============================================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Crear instancia de axios con configuración base
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 segundos de timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================
// REQUEST INTERCEPTOR
// Why? Agregar token de auth automáticamente a cada request
// ============================================
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============================================
// RESPONSE INTERCEPTOR
// Why? Manejar errores comunes globalmente
// ============================================
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;

// ============================================
// HELPERS PARA TIPOS GENÉRICOS
// Why? Reducir código repetitivo en los hooks
// ============================================

export interface ApiError {
  message: string;
  errors?: { field: string; message: string }[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pages: number;
}

// Función helper para extraer datos de respuesta
export const getData = <T>(response: { data: T }): T => response.data;
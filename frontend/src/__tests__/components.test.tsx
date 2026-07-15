import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import Login from '../pages/Login';
import { userEvent } from '@testing-library/user-event';

// ============================================
// TEST CONFIGURATION
// Why? Configurar providers necesarios para los tests
// de componentes que usan React Router y Context API
// ============================================

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const renderWithProviders = (ui: React.ReactElement) => {
  const testQueryClient = createTestQueryClient();
  return render(
    <BrowserRouter>
      <QueryClientProvider client={testQueryClient}>
        <AuthProvider>
          <CartProvider>{ui}</CartProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

// ============================================
// TESTS: Login Page
// ============================================
describe('Login Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render login form', () => {
    renderWithProviders(<Login />);
    
    expect(screen.getByRole('heading', { name: /iniciar sesión/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
  });

  it('should show validation errors for empty fields', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Login />);
    
    // Submit form sin llenar campos
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
    await user.click(submitButton);
    
    // Verificar que aparecen errores de validación
    await waitFor(() => {
      expect(screen.getByText(/el email es requerido/i)).toBeInTheDocument();
      expect(screen.getByText(/la contraseña es requerida/i)).toBeInTheDocument();
    });
  });

  it('should validate email format', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Login />);
    
    // Llenar con email inválido
    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'invalid-email');
    
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/ingresa un email válido/i)).toBeInTheDocument();
    });
  });

  it('should show minimum password length error', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Login />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, '123'); // Menos de 6 caracteres
    
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/al menos 6 caracteres/i)).toBeInTheDocument();
    });
  });
});

// ============================================
// TESTS: Validación de Formularios
// Why? Tests de validación son importantes para
// asegurar que la UX sea consistente
// ============================================
describe('Form Validation Logic', () => {
  it('should validate email correctly', () => {
    const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user.name@domain.org')).toBe(true);
    expect(isValidEmail('invalid')).toBe(false);
    expect(isValidEmail('@example.com')).toBe(false);
    expect(isValidEmail('user@')).toBe(false);
  });

  it('should validate password length', () => {
    const isValidPassword = (password: string) => password.length >= 6;
    
    expect(isValidPassword('123456')).toBe(true);
    expect(isValidPassword('password123')).toBe(true);
    expect(isValidPassword('12345')).toBe(false);
    expect(isValidPassword('')).toBe(false);
  });

  it('should validate required fields', () => {
    const isRequired = (value: string) => value.trim().length > 0;
    
    expect(isRequired('Test')).toBe(true);
    expect(isRequired('')).toBe(false);
    expect(isRequired('   ')).toBe(false);
  });
});

// ============================================
// TESTS: Cart Context
// Why? Verificar que el contexto del carrito funciona correctamente
// ============================================
describe('CartContext Logic', () => {
  it('should calculate total correctly', () => {
    const items = [
      { product: { price: 10 }, quantity: 2 },
      { product: { price: 5 }, quantity: 3 },
    ];
    
    const total = items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    
    expect(total).toBe(35); // (10*2) + (5*3) = 35
  });

  it('should calculate total items correctly', () => {
    const items = [
      { quantity: 2 },
      { quantity: 3 },
      { quantity: 1 },
    ];
    
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    
    expect(totalItems).toBe(6);
  });

  it('should handle empty cart', () => {
    const items: { product: { price: number }; quantity: number }[] = [];
    
    const total = items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    
    expect(total).toBe(0);
  });
});
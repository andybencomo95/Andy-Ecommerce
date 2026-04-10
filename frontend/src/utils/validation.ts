/**
 * Validación centralizada - Why?
 * Evita duplicar validación en frontend y backend.
 * Cualquier cambio en políticas solo se hace aquí.
 */

// ============================================
// VALIDACIÓN DE EMAIL
// ============================================

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

/**
 * Valida email con regex estricto
 */
export const isValidEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim();
  return EMAIL_REGEX.test(trimmed) && trimmed.length <= 320;
};

/**
 * Mensaje de error para email inválido
 */
export const getEmailError = (email: string): string | null => {
  if (!email?.trim()) return 'El email es requerido';
  if (!isValidEmail(email)) return 'Ingresa un email válido';
  return null;
};

// ============================================
// VALIDACIÓN DE CONTRASEÑA
// ============================================

interface PasswordValidation {
  isValid: boolean;
  errors: string[];
}

/**
 * Valida contraseña:
 * - Mínimo 8 caracteres
 * - Al menos una mayúscula O un símbolo
 * - Al menos una minúscula O un número
 */
export const validatePassword = (password: string): PasswordValidation => {
  const errors: string[] = [];
  
  if (!password) {
    errors.push('La contraseña es requerida');
    return { isValid: false, errors };
  }
  
  if (password.length < 8) {
    errors.push('La contraseña debe tener al menos 8 caracteres');
  }
  
  // Al menos mayúscula O símbolo
  const hasUpperOrSymbol = /[A-Z]/.test(password) || /[!@#$%^&*(),.?":{}|<>]/.test(password);
  if (!hasUpperOrSymbol) {
    errors.push('Debe tener al menos una mayúscula o símbolo');
  }
  
  // Al menos minúscula O número
  const hasLowerOrNumber = /[a-z]/.test(password) || /[0-9]/.test(password);
  if (!hasLowerOrNumber) {
    errors.push('Debe tener al menos una minúscula o número');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Valida que las contraseñas coincidan
 */
export const validatePasswordMatch = (password: string, confirmPassword: string): string | null => {
  if (!confirmPassword) return 'Confirma tu contraseña';
  if (password !== confirmPassword) return 'Las contraseñas no coinciden';
  return null;
};

// ============================================
// VALIDACIÓN DE NOMBRE
// ============================================

/**
 * Valida nombre de usuario
 */
export const validateName = (name: string): string | null => {
  if (!name?.trim()) return 'El nombre es requerido';
  if (name.trim().length < 2) return 'El nombre debe tener al menos 2 caracteres';
  if (name.trim().length > 100) return 'El nombre es muy largo';
  return null;
};

// ============================================
// EXPORT CONVENIENCE FUNCTIONS
// ============================================

/**
 * Valida todo el formulario de registro
 */
export interface RegisterValidation {
  isValid: boolean;
  errors: {
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  };
}

export const validateRegisterForm = (
  name: string,
  email: string,
  password: string,
  confirmPassword: string
): RegisterValidation => {
  const errors: RegisterValidation['errors'] = {};
  
  const nameError = validateName(name);
  if (nameError) errors.name = nameError;
  
  const emailError = getEmailError(email);
  if (emailError) errors.email = emailError;
  
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.errors[0];
  }
  
  const matchError = validatePasswordMatch(password, confirmPassword);
  if (matchError) errors.confirmPassword = matchError;
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Valida formulario de login
 */
export interface LoginValidation {
  isValid: boolean;
  errors: {
    email?: string;
    password?: string;
  };
}

export const validateLoginForm = (email: string, password: string): LoginValidation => {
  const errors: LoginValidation['errors'] = {};
  
  const emailError = getEmailError(email);
  if (emailError) errors.email = emailError;
  
  if (!password) errors.password = 'La contraseña es requerida';
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
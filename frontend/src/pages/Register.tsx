import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { validateRegisterForm } from '../utils/validation';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    // Usar validación centralizada
    const validation = validateRegisterForm(name, email, password, confirmPassword);
    setErrors(validation.errors);
    return validation.isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!validateForm()) return;

    try {
      await register({ name, email, password });
      // No navegar directamente, mostrar mensaje de verificación
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      if (err.response?.data?.message?.includes('ya existe')) {
        setError('El correo electrónico ya está en uso');
      } else {
        setError('Error al registrar. Intenta de nuevo.');
      }
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Crear Cuenta</h2>
        
        {error && <div className="alert alert-error">{error}</div>}
        
        {success && (
          <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
            <p style={{ marginBottom: '0.5rem' }}>
              ¡Usuario registrado exitosamente!
            </p>
            <p style={{ fontSize: '0.875rem', marginBottom: 0 }}>
              Por favor verifica tu correo electrónico antes de iniciar sesión.
              Serás redirigido al login en unos segundos...
            </p>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-control"
              placeholder="Tu nombre"
              style={errors.name ? { borderColor: '#dc2626' } : {}}
            />
            {errors.name && <span style={{ color: '#dc2626', fontSize: '0.875rem' }}>{errors.name}</span>}
          </div>
          
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control"
              placeholder="tu@email.com"
              style={errors.email ? { borderColor: '#dc2626' } : {}}
            />
            {errors.email && <span style={{ color: '#dc2626', fontSize: '0.875rem' }}>{errors.email}</span>}
          </div>
          
          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control"
              placeholder="Mínimo 8 caracteres, mayúscula, minúscula y número"
              style={errors.password ? { borderColor: '#dc2626' } : {}}
            />
            {errors.password && <span style={{ color: '#dc2626', fontSize: '0.875rem' }}>{errors.password}</span>}
          </div>
          
          <div className="form-group">
            <label>Confirmar Contraseña</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="form-control"
              placeholder="Repite tu contraseña"
              style={errors.confirmPassword ? { borderColor: '#dc2626' } : {}}
            />
            {errors.confirmPassword && <span style={{ color: '#dc2626', fontSize: '0.875rem' }}>{errors.confirmPassword}</span>}
          </div>
          
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={loading || success}
          >
            {loading ? 'Registrando...' : success ? 'Registrado!' : 'Crear Cuenta'}
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '1rem', color: '#64748b' }}>
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
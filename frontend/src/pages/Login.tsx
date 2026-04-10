import { useState } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { validateLoginForm } from '../utils/validation';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [requiresVerification, setRequiresVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  // Obtener redirección desde query string O desde state ( ProtectedRoute)
  const redirectPath = searchParams.get('redirect') || '/';
  const from = location.state?.from?.pathname || redirectPath;

  const validateForm = () => {
    // Usar validación centralizada
    const validation = validateLoginForm(email, password);
    setErrors(validation.errors);
    return validation.isValid;
  };

  const handleResendVerification = async () => {
    try {
      await axios.post('/api/auth/resend-verification', { email: verificationEmail });
      alert('Se ha enviado un nuevo correo de verificación');
      setRequiresVerification(false);
    } catch (err) {
      alert('Error al reenviar el correo de verificación');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setRequiresVerification(false);
    
    if (!validateForm()) return;
    
    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err: any) {
      // Verificar si necesita verificación de email
      if (err.response?.data?.requiresVerification) {
        setRequiresVerification(true);
        setVerificationEmail(err.response.data.email);
        setError('');
      } else {
        setError('Email o contraseña incorrectos');
      }
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Iniciar Sesión</h2>
        
        {error && <div className="alert alert-error">{error}</div>}
        
        {requiresVerification && (
          <div className="alert alert-warning" style={{ marginBottom: '1rem' }}>
            <p style={{ marginBottom: '0.5rem' }}>
              Debes verificar tu correo electrónico antes de iniciar sesión.
            </p>
            <button 
              onClick={handleResendVerification}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: '#3b82f6', 
                textDecoration: 'underline',
                cursor: 'pointer',
                padding: 0
              }}
            >
              Reenviar correo de verificación
            </button>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
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
              placeholder="••••••••"
              style={errors.password ? { borderColor: '#dc2626' } : {}}
            />
            {errors.password && <span style={{ color: '#dc2626', fontSize: '0.875rem' }}>{errors.password}</span>}
          </div>
          
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Iniciando...' : 'Iniciar Sesión'}
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '1rem', color: '#64748b' }}>
          ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
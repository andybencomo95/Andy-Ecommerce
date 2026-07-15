import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

function Login(): React.JSX.Element {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError('');

    if (email === '' || password === '') {
      setError('Completa todos los campos');
      return;
    }

    setLoading(true);

    try {
      await login({ email, password });
      const redirect = searchParams.get('redirect') ?? '/';
      navigate(redirect);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Credenciales invalidas';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Iniciar Sesion</h2>

        {error !== '' && <div className="alert alert-error">{error}</div>}

        <form onSubmit={(e: React.FormEvent) => { void handleSubmit(e); }}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label>Contrasena</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Iniciando sesion...' : 'Iniciar Sesion'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1rem' }}>
          No tienes cuenta?{' '}
          <Link to="/register" style={{ color: '#2563eb' }}>
            Registrate
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;

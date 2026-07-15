import axios from 'axios';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Register(): React.JSX.Element {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Las contrasenas no coinciden');
      return;
    }

    setLoading(true);

    try {
      await axios.post('/api/auth/register', { name, email, password });
      setMessage('Registro exitoso. Por favor verifica tu email antes de iniciar sesion.');

      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response !== undefined) {
        const data = err.response.data as { error?: { message?: string } };
        setError(data.error?.message ?? 'Error al registrar');
      } else {
        setError('Error al conectar con el servidor');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Crear Cuenta</h2>

        {error !== '' && <div className="alert alert-error">{error}</div>}
        {message !== '' && <div className="alert alert-success">{message}</div>}

        <form onSubmit={(e: React.FormEvent) => { void handleSubmit(e); }}>
          <div className="form-group">
            <label>Nombre</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-control"
              required
            />
          </div>

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
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label>Confirmar Contrasena</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="form-control"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1rem' }}>
          Ya tienes cuenta?{' '}
          <Link to="/login" style={{ color: '#2563eb' }}>
            Inicia Sesion
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;

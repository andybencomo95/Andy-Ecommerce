import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setStatus('error');
        setMessage('Token de verificación no proporcionado');
        return;
      }

      try {
        // Usar POST en lugar de GET para mayor seguridad
        const response = await axios.post('/api/auth/verify-email', { token });
        
        if (response.data.verified) {
          setStatus('success');
          setMessage(response.data.message);
        }
      } catch (err: any) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Error al verificar el correo');
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
      {status === 'loading' && (
        <>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <h2>Verificando tu correo electrónico...</h2>
        </>
      )}

      {status === 'success' && (
        <>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
          <h2 style={{ color: '#22c55e', marginBottom: '1rem' }}>¡Correo verificado!</h2>
          <p style={{ color: '#64748b', maxWidth: '400px', margin: '0 auto 2rem' }}>
            {message}
          </p>
          <Link to="/login" className="btn btn-primary">
            Iniciar Sesión
          </Link>
        </>
      )}

      {status === 'error' && (
        <>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>❌</div>
          <h2 style={{ color: '#dc2626', marginBottom: '1rem' }}>Error de verificación</h2>
          <p style={{ color: '#64748b', maxWidth: '400px', margin: '0 auto 2rem' }}>
            {message}
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/register" className="btn btn-primary">
              Registrarse nuevamente
            </Link>
            <Link to="/login" className="btn btn-outline">
              Volver al login
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default VerifyEmail;
import axios from 'axios';
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

function VerifyEmail(): React.JSX.Element {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async (): Promise<void> => {
      if (token === undefined) {
        setStatus('error');
        setMessage('Token de verificacion invalido');
        return;
      }

      try {
        const response = await axios.get<{ message: string }>(`/api/auth/verify-email/${token}`);
        setStatus('success');
        setMessage(response.data.message);
      } catch (err: unknown) {
        setStatus('error');
        if (axios.isAxiosError(err) && err.response !== undefined) {
          const data = err.response.data as { error?: { message?: string } };
          setMessage(data.error?.message ?? 'Error al verificar el email');
        } else {
          setMessage('Error al conectar con el servidor');
        }
      }
    };

    void verify();
  }, [token]);

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        {status === 'verifying' && (
          <>
            <h2>Verificando Email</h2>
            <div className="loading" style={{ marginTop: '1rem' }}>
              <div className="spinner" />
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            <h2>Email Verificado</h2>
            <div className="alert alert-success" style={{ marginTop: '1rem' }}>
              {message}
            </div>
            <Link to="/login" className="btn btn-primary" style={{ marginTop: '1.5rem', display: 'inline-block' }}>
              Iniciar Sesion
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <h2>Error de Verificacion</h2>
            <div className="alert alert-error" style={{ marginTop: '1rem' }}>
              {message}
            </div>
            <Link to="/login" className="btn btn-primary" style={{ marginTop: '1.5rem', display: 'inline-block' }}>
              Volver al Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default VerifyEmail;

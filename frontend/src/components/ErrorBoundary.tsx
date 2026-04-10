import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

// ============================================
// ERROR BOUNDARY
// Why? Los errores en React pueden "romper" toda la aplicación
// dejando una pantalla en blanco. Un Error Boundary captura esos errores
// y muestra una interfaz amigable mientras permite que el resto
// de la aplicación siga funcionando.
// ============================================

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  // Este método se llama cuando hay un error en el componente o sus hijos
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  // Aquí podemos registrar el error en un servicio externo (ej: Sentry)
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('💥 Error capturado por ErrorBoundary:', error);
    console.error('📍 Componente que falló:', errorInfo.componentStack);
    // En producción, aquí enviaría el error a un servicio de monitoreo
    // como Sentry, LogRocket, etc.
  }

  render() {
    if (this.state.hasError) {
      // Si hay un fallback personalizado, usarlo
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Componente de error por defecto
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            padding: '2rem',
            textAlign: 'center',
            background: '#f8fafc',
          }}
        >
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>😵</div>
          <h1 style={{ color: '#dc2626', marginBottom: '1rem' }}>
            Algo salió mal
          </h1>
          <p style={{ color: '#64748b', maxWidth: '400px', marginBottom: '2rem' }}>
            Encontramos un error inesperado. Por favor, intenta recargar la página
            o vuelve al inicio.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
              }}
            >
              Recargar Página
            </button>
            <a
              href="/"
              style={{
                padding: '0.75rem 1.5rem',
                background: 'white',
                color: '#3b82f6',
                border: '2px solid #3b82f6',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '1rem',
              }}
            >
              Volver al Inicio
            </a>
          </div>
          {(import.meta.env.DEV || import.meta.env.MODE === 'development') && (
            <details
              style={{
                marginTop: '2rem',
                padding: '1rem',
                background: '#fef2f2',
                borderRadius: '8px',
                maxWidth: '500px',
                textAlign: 'left',
              }}
            >
              <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                Detalles del error (solo desarrollo)
              </summary>
              <pre
                style={{
                  marginTop: '1rem',
                  fontSize: '0.75rem',
                  overflow: 'auto',
                }}
              >
                {this.state.error?.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    // Si no hay error, renderizar los hijos normalmente
    return this.props.children;
  }
}

export default ErrorBoundary;
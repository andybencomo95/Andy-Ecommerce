import { Link } from 'react-router-dom';

// ============================================
// PÁGINA 404 - NOT FOUND
// Why? Cuando un usuario intenta acceder a una ruta que no existe,
// en lugar de mostrar un error feo o una página en blanco, debemos
// mostrar algo amigable que le ayude a encontrar lo que busca.
// También mejora el SEO al dar una respuesta correcta al navegador.
// ============================================

const NotFound = () => {
  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      {/* Icono grande de advertencia */}
      <div style={{ fontSize: '6rem', marginBottom: '1rem' }}>🔍</div>

      {/* Título principal */}
      <h1
        style={{
          fontSize: '2.5rem',
          color: '#1e293b',
          marginBottom: '0.5rem',
        }}
      >
        Página no encontrada
      </h1>

      {/* Mensaje explicativo */}
      <p
        style={{
          color: '#64748b',
          fontSize: '1.1rem',
          maxWidth: '400px',
          marginBottom: '2rem',
          lineHeight: '1.6',
        }}
      >
        La página que buscas no existe o quizás fue movida. No te
        preocupes, ¡todavía puedes encontrar lo que necesitas!
      </p>

      {/* Acciones disponibles */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        <Link
          to="/"
          style={{
            padding: '0.75rem 1.5rem',
            background: '#3b82f6',
            color: 'white',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '500',
            transition: 'background 0.2s',
          }}
        >
          🏠 Volver al Inicio
        </Link>
        <Link
          to="/products"
          style={{
            padding: '0.75rem 1.5rem',
            background: 'white',
            color: '#3b82f6',
            border: '2px solid #3b82f6',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '500',
            transition: 'all 0.2s',
          }}
        >
          🛒 Ver Productos
        </Link>
      </div>

      {/* Información adicional */}
      <div
        style={{
          marginTop: '3rem',
          padding: '1.5rem',
          background: '#f8fafc',
          borderRadius: '12px',
          maxWidth: '400px',
        }}
      >
        <h3 style={{ marginBottom: '0.5rem', color: '#475569' }}>
          ¿Necesitas ayuda?
        </h3>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
          Si crees que esto es un error, no dudes en contactarme. ¡Siempre
          estoy mejorando la experiencia!
        </p>
      </div>
    </div>
  );
};

export default NotFound;
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Header = () => {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // ============================================
  // BREADCRUMBS - Migas de pan
  // ============================================
  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ label: 'Inicio', path: '/' }];
    
    let currentPath = '';
    for (const path of paths) {
      currentPath += `/${path}`;
      let label = path.charAt(0).toUpperCase() + path.slice(1);
      
      // Traducirlabels comunes
      const labels: Record<string, string> = {
        products: 'Productos',
        product: 'Producto',
        orders: 'Mis Pedidos',
        order: 'Pedido',
        cart: 'Carrito',
        checkout: 'Pago',
        login: 'Iniciar Sesión',
        register: 'Registrarse',
        admin: 'Admin',
        adminProducts: 'Productos',
        adminOrders: 'Pedidos'
      };
      
      if (labels[path]) label = labels[path];
      if (path !== 'admin') {
        breadcrumbs.push({ label, path: currentPath });
      }
    }
    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="header">
      <div className="container">
        {/* Breadcrumbs */}
        {breadcrumbs.length > 1 && (
          <nav style={{ fontSize: '0.75rem', marginBottom: '0.5rem', color: '#64748b' }}>
            {breadcrumbs.map((crumb, index) => (
              <span key={crumb.path}>
                {index > 0 && <span style={{ margin: '0 0.25rem' }}>/</span>}
                {index === breadcrumbs.length - 1 ? (
                  <span style={{ color: '#1e293b', fontWeight: 500 }}>{crumb.label}</span>
                ) : (
                  <Link to={crumb.path} style={{ color: '#64748b', textDecoration: 'none' }}>
                    {crumb.label}
                  </Link>
                )}
              </span>
            ))}
          </nav>
        )}
        <nav className="navbar">
          <Link to="/" className="logo">🛒 Andy Ecommerce</Link>
          
          <ul className="nav-links">
            <li><Link to="/">Inicio</Link></li>
            <li><Link to="/products">Productos</Link></li>
            {user ? (
              <>
                <li><Link to="/orders">Mis Pedidos</Link></li>
                {user.isAdmin && <li><Link to="/admin">Admin</Link></li>}
                <li>
                  <button onClick={handleLogout} className="btn btn-outline" style={{padding: '0.5rem 1rem'}}>
                    Salir
                  </button>
                </li>
              </>
            ) : (
              <li><Link to="/login">Login</Link></li>
            )}
          </ul>

          <div className="nav-icons">
            <Link to="/cart" className="cart-icon">
              🛒
              {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;

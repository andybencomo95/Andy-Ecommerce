import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

import styles from './Header.module.css';

function Header(): React.JSX.Element {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = (): void => {
    logout();
    navigate('/login');
  };

  return (
    <header className={styles.header}>
      <div className="container">
        <nav className={styles.navbar}>
          <Link to="/" className={styles.logo}>
            Andy{user !== null ? ` - ${user.name}` : ''}
          </Link>

          <ul className={styles.navLinks}>
            <li>
              <Link to="/">Inicio</Link>
            </li>
            <li>
              <Link to="/products">Productos</Link>
            </li>
            {user !== null && (
              <li>
                <Link to="/orders">Pedidos</Link>
              </li>
            )}
            {user !== null && user.isAdmin && (
              <li>
                <Link to="/admin/dashboard">Admin</Link>
              </li>
            )}
          </ul>

          <div className={styles.navIcons}>
            <button className={styles.cartIcon} onClick={() => navigate('/cart')}>
              🛒
              {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
            </button>

            {user !== null ? (
              <button
                onClick={handleLogout}
                className="btn btn-outline"
                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
              >
                Cerrar Sesión
              </button>
            ) : (
              <Link
                to="/login"
                className="btn btn-primary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', textDecoration: 'none' }}
              >
                Iniciar Sesión
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

export default Header;

import { Link } from 'react-router-dom';

import styles from './Footer.module.css';

function Footer(): React.JSX.Element {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.content}>
          <div className={styles.section}>
            <h3>Andy Ecommerce</h3>
            <ul>
              <li>Tu tienda online de confianza</li>
              <li>&copy; {year} Todos los derechos reservados</li>
            </ul>
          </div>

          <div className={styles.section}>
            <h3>Enlaces</h3>
            <ul>
              <li>
                <Link to="/">Inicio</Link>
              </li>
              <li>
                <Link to="/products">Productos</Link>
              </li>
              <li>
                <Link to="/cart">Carrito</Link>
              </li>
            </ul>
          </div>

          <div className={styles.section}>
            <h3>Contacto</h3>
            <ul>
              <li>Email: info@andyecommerce.com</li>
              <li>Tel: +34 123 456 789</li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

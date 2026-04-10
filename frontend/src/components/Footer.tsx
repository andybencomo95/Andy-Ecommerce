const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Andy Ecommerce</h3>
            <p>Tu tienda online de confianza</p>
          </div>
          <div className="footer-section">
            <h3>Enlaces</h3>
            <ul>
              <li><a href="/products">Productos</a></li>
              <li><a href="/orders">Mis Pedidos</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Contacto</h3>
            <ul>
              <li>Email: info@andyecommerce.com</li>
              <li>Teléfono: +1 234 567 890</li>
            </ul>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: '2rem', opacity: 0.7 }}>
          <p>© 2024 Andy Ecommerce. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

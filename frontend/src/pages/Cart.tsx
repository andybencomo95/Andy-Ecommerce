import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

const Cart = () => {
  const { items, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Verificar que el usuario esté logueado
  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/cart');
    }
  }, [user, navigate]);

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (!user) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <h2>Inicia sesión para ver tu carrito</h2>
        <p style={{ color: '#64748b', marginTop: '1rem' }}>
          Necesitas iniciar sesión para ver y gestionar tu carrito de compras
        </p>
        <Link to="/login" className="btn btn-primary" style={{ marginTop: '1.5rem', display: 'inline-block' }}>
          Iniciar Sesión
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <h2>Tu carrito está vacío</h2>
        <p style={{ color: '#64748b', marginTop: '1rem' }}>
          Agrega algunos productos para comenzar
        </p>
        <Link to="/products" className="btn btn-primary" style={{ marginTop: '1.5rem', display: 'inline-block' }}>
          Ver Productos
        </Link>
      </div>
    );
  }

  return (
    <div className="container cart-page">
      <h1>Mi Carrito de Compras</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginTop: '1.5rem' }}>
        <div className="cart-items">
          {items.map(item => (
            <div key={item.product.id} className="cart-item">
              <img
                src={item.product.image}
                alt={item.product.name}
                className="cart-item-image"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/80x80?text=Imagen';
                }}
              />
              <div className="cart-item-info">
                <Link to={`/products/${item.product.id}`} style={{ fontWeight: 600, textDecoration: 'none', color: '#1e293b' }}>
                  {item.product.name}
                </Link>
                <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                  {item.product.category}
                </p>
                <p style={{ color: '#2563eb', fontWeight: 600 }}>
                  ${item.product.price.toFixed(2)}
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                <button
                  onClick={() => removeFromCart(item.product.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                >
                  ✕ Eliminar
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    className="btn btn-outline"
                    style={{ width: '32px', height: '32px', padding: 0 }}
                  >
                    -
                  </button>
                  <span style={{ minWidth: '30px', textAlign: 'center' }}>{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    className="btn btn-outline"
                    style={{ width: '32px', height: '32px', padding: 0 }}
                  >
                    +
                  </button>
                </div>
                <p style={{ fontWeight: 600 }}>
                  ${(item.product.price * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div>
          <div className="cart-summary">
            <h3>Resumen del Pedido</h3>
            <div className="summary-row">
              <span>Subtotal ({items.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Envío</span>
              <span style={{ color: '#22c55e' }}>Gratis</span>
            </div>
            <div className="summary-row">
              <span>Total</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <button
              onClick={handleCheckout}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1rem' }}
            >
              Proceder al Pago →
            </button>
            <button
              onClick={clearCart}
              className="btn btn-outline"
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              Vaciar Carrito
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

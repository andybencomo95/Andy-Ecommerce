import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [shippingAddress, setShippingAddress] = useState({
    address: '',
    city: '',
    postalCode: '',
    country: 'España'
  });
  const [paymentMethod, setPaymentMethod] = useState('stripe');

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!shippingAddress.address.trim()) {
      newErrors.address = 'La dirección es requerida';
    }
    if (!shippingAddress.city.trim()) {
      newErrors.city = 'La ciudad es requerida';
    }
    if (!shippingAddress.postalCode.trim()) {
      newErrors.postalCode = 'El código postal es requerido';
    // ============================================
    // CÓDIGO POSTAL INTERNACIONAL - accepts 3-10 caracteres alfanuméricos
    // Ya no solo acepta formato español de 5 dígitos
    // ============================================
    } else if (!/^[A-Za-z0-9\s\-]{3,10}$/.test(shippingAddress.postalCode)) {
      newErrors.postalCode = 'Ingresa un código postal válido (3-10 caracteres)';
    }
    if (!shippingAddress.country.trim()) {
      newErrors.country = 'El país es requerido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');

    try {
      const orderData = {
        orderItems: items.map(item => ({
          product: item.product.id,
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
          image: item.product.image
        })),
        shippingAddress,
        paymentMethod,
        totalPrice
      };

      if (user) {
        const response = await axios.post('/api/orders', orderData);
        const createdOrder = response.data;
        
        // ============================================
        // CONFIRMACIÓN DEL PEDIDO - Why?
        // Pasar el ID para mostrar mensaje de éxito
        // ============================================
        clearCart();
        navigate(`/orders/${createdOrder.id}`, { 
          state: { success: true } 
        });
        return;
      }
      
      clearCart();
      navigate('/orders');
    } catch (err) {
      setError('Error al procesar el pedido. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <h2>Tu carrito está vacío</h2>
        <Link to="/products" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
          Ver Productos
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <h1>Finalizar Pedido</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1.5rem' }}>
        <div>
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3>Dirección de Envío</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Dirección *</label>
                <input
                  type="text"
                  value={shippingAddress.address}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                  className="form-control"
                  placeholder="Calle, número, piso..."
                  style={errors.address ? { borderColor: '#dc2626' } : {}}
                />
                {errors.address && <span style={{ color: '#dc2626', fontSize: '0.875rem' }}>{errors.address}</span>}
              </div>
              
              <div className="form-group">
                <label>Ciudad *</label>
                <input
                  type="text"
                  value={shippingAddress.city}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                  className="form-control"
                  placeholder="Madrid, Barcelona..."
                  style={errors.city ? { borderColor: '#dc2626' } : {}}
                />
                {errors.city && <span style={{ color: '#dc2626', fontSize: '0.875rem' }}>{errors.city}</span>}
              </div>
              
              <div className="form-group">
                <label>Código Postal *</label>
                <input
                  type="text"
                  value={shippingAddress.postalCode}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                  className="form-control"
                  placeholder="28001"
                  maxLength={10}
                  style={errors.postalCode ? { borderColor: '#dc2626' } : {}}
                />
                {errors.postalCode && <span style={{ color: '#dc2626', fontSize: '0.875rem' }}>{errors.postalCode}</span>}
              </div>
              
              <div className="form-group">
                <label>País *</label>
                <input
                  type="text"
                  value={shippingAddress.country}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                  className="form-control"
                  style={errors.country ? { borderColor: '#dc2626' } : {}}
                />
                {errors.country && <span style={{ color: '#dc2626', fontSize: '0.875rem' }}>{errors.country}</span>}
              </div>

              <div className="form-group">
                <label>Método de Pago</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="form-control"
                >
                  <option value="stripe">Tarjeta (Stripe)</option>
                  <option value="paypal">PayPal</option>
                </select>
              </div>
            </form>
          </div>
        </div>

        <div>
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3>Resumen del Pedido</h3>
            {items.map(item => (
              <div key={item.product.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #e2e8f0' }}>
                <span>{item.quantity}x {item.product.name}</span>
                <span>${(item.product.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', fontWeight: 'bold', fontSize: '1.25rem' }}>
              <span>Total</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            
            {error && <div className="alert alert-error">{error}</div>}
            
            <button
              onClick={handleSubmit}
              className="btn btn-primary"
              style={{ width: '100%' }}
              disabled={loading}
            >
              {loading ? 'Procesando...' : 'Realizar Pedido'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

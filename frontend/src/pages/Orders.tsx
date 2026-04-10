import { useState, useEffect } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface OrderItem {
  product: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

interface Order {
  id: string;
  orderItems: OrderItem[];
  shippingAddress: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
  totalPrice: number;
  isPaid: boolean;
  isDelivered: boolean;
  createdAt: string;
}

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  
  // ============================================
  // MENSAJE DE ÉXITO - viene del checkout
  // ============================================
  const isNewOrder = location.state?.success;

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        if (id) {
          // Fetch individual order details
          const response = await axios.get(`/api/orders/${id}`);
          setOrder(response.data);
        } else {
          // Fetch all orders
          const response = await axios.get('/api/orders');
          setOrders(response.data || []);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        if (!id) {
          // Demo orders solo para lista
          setOrders([
            {
              id: 'demo-1',
              orderItems: [
                { product: '1', name: 'Producto de Ejemplo', quantity: 2, price: 29.99, image: 'https://via.placeholder.com/60x60' }
              ],
              shippingAddress: { address: 'Calle Demo 123', city: 'Madrid', postalCode: '28001', country: 'España' },
              paymentMethod: 'stripe',
              totalPrice: 59.98,
              isPaid: true,
              isDelivered: false,
              createdAt: new Date().toISOString()
            }
          ]);
        }
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchOrders();
    }
  }, [user, id]);

  if (!user) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <h2>Debes iniciar sesión para ver tus pedidos</h2>
        <Link to="/login" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
          Iniciar Sesión
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      {/* Link para volver si es detalle de pedido */}
      {id && (
        <Link to="/orders" style={{ color: '#64748b', textDecoration: 'none', display: 'inline-block', marginBottom: '1rem' }}>
          ← Volver a Mis Pedidos
        </Link>
      )}
      
      <h1>{id ? `Pedido #${id}` : 'Mis Pedidos'}</h1>
      
      {/* ============================================
      // MENSAJE DE ÉXITO - Mostrar cuando viene del checkout
      // ============================================ */}
      {isNewOrder && (
        <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
          ¡Pedido realizado con éxito! Te enviaremos un email de confirmación.
        </div>
      )}
      
      {/* Si hay un pedido específico, mostrarlo */}
      {id && order ? (
        <div className="card" style={{ padding: '1.5rem', marginTop: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
            <div>
              <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                {new Date(order.createdAt).toLocaleDateString('es-ES')}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontWeight: 'bold', fontSize: '1.5rem' }}>${order.totalPrice.toFixed(2)}</p>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                <span style={{ 
                  padding: '0.25rem 0.5rem', 
                  borderRadius: '4px', 
                  fontSize: '0.75rem',
                  background: order.isPaid ? '#dcfce7' : '#fee2e2',
                  color: order.isPaid ? '#166534' : '#991b1b'
                }}>
                  {order.isPaid ? '✓ Pagado' : 'Pendiente'}
                </span>
                <span style={{ 
                  padding: '0.25rem 0.5rem', 
                  borderRadius: '4px', 
                  fontSize: '0.75rem',
                  background: order.isDelivered ? '#dcfce7' : '#f3f4f6',
                  color: order.isDelivered ? '#166534' : '#64748b'
                }}>
                  {order.isDelivered ? '✓ Entregado' : 'En proceso'}
                </span>
              </div>
            </div>
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <h4>Dirección de Envío</h4>
            <p>{order.shippingAddress.address}</p>
            <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
            <p>{order.shippingAddress.country}</p>
          </div>
          
          <div>
            <h4>Productos</h4>
            {order.orderItems.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem 0', borderBottom: '1px solid #e2e8f0' }}>
                <img 
                  src={item.image} 
                  alt={item.name} 
                  style={{ width: '50px', height: '50px', borderRadius: '4px', objectFit: 'cover' }}
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/50x50';
                  }}
                />
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 500 }}>{item.name}</p>
                  <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Cantidad: {item.quantity}</p>
                </div>
                <p style={{ fontWeight: 'bold' }}>${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <p style={{ color: '#64748b' }}>No tienes pedidos todavía</p>
          <Link to="/products" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
            Ver Productos
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
          {orders.map(order => (
            <div key={order.id} className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1rem' }}>Pedido #{order.id}</h3>
                  <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                    {new Date(order.createdAt).toLocaleDateString('es-ES')}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>${order.totalPrice.toFixed(2)}</p>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '4px', 
                      fontSize: '0.75rem',
                      background: order.isPaid ? '#dcfce7' : '#fee2e2',
                      color: order.isPaid ? '#166534' : '#991b1b'
                    }}>
                      {order.isPaid ? '✓ Pagado' : 'Pendiente'}
                    </span>
                    <span style={{ 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '4px', 
                      fontSize: '0.75rem',
                      background: order.isDelivered ? '#dcfce7' : '#f3f4f6',
                      color: order.isDelivered ? '#166534' : '#64748b'
                    }}>
                      {order.isDelivered ? '✓ Entregado' : 'En proceso'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                <p style={{ fontWeight: 500, marginBottom: '0.5rem' }}>Productos:</p>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  {order.orderItems.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }}
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/40x40';
                        }}
                      />
                      <span style={{ fontSize: '0.875rem' }}>{item.quantity}x {item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;

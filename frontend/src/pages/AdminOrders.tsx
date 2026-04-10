import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface OrderItem {
  id?: string;
  productId?: string;
  product?: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

interface Order {
  id: string;
  userId?: string;
  user?: { name: string; email: string };
  orderItems: OrderItem[];
  shippingAddress: { address: string; city: string; postalCode: string; country: string } | string;
  paymentMethod: string;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  createdAt: string;
}

const AdminOrders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!user || !user.isAdmin) {
      navigate('/');
      return;
    }
    fetchOrders();
  }, [user, navigate]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/orders/admin/all');
      setOrders(response.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Demo data
      setOrders([
        {
          id: 'demo-1',
          user: { name: 'Juan Pérez', email: 'juan@test.com' },
          orderItems: [
            { name: 'Laptop Pro', quantity: 1, price: 999.99, image: 'https://via.placeholder.com/60x60' }
          ],
          shippingAddress: { address: 'Calle 123', city: 'Madrid', postalCode: '28001', country: 'España' },
          paymentMethod: 'stripe',
          totalPrice: 999.99,
          isPaid: true,
          isDelivered: false,
          createdAt: new Date().toISOString()
        },
        {
          id: 'demo-2',
          user: { name: 'María García', email: 'maria@test.com' },
          orderItems: [
            { name: 'Camiseta', quantity: 2, price: 29.99, image: 'https://via.placeholder.com/60x60' }
          ],
          shippingAddress: { address: 'Avenida 456', city: 'Barcelona', postalCode: '08001', country: 'España' },
          paymentMethod: 'paypal',
          totalPrice: 59.98,
          isPaid: true,
          isDelivered: true,
          deliveredAt: new Date().toISOString(),
          createdAt: new Date(Date.now() - 86400000).toISOString()
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async (orderId: string) => {
    try {
      await axios.put(`/api/orders/${orderId}/pay`);
      fetchOrders();
      setSelectedOrder(null);
    } catch (error) {
      console.error('Error marking as paid:', error);
      alert('Error al actualizar el pedido');
    }
  };

  const handleMarkAsDelivered = async (orderId: string) => {
    try {
      await axios.put(`/api/orders/${orderId}/deliver`);
      fetchOrders();
      setSelectedOrder(null);
    } catch (error) {
      console.error('Error marking as delivered:', error);
      alert('Error al actualizar el pedido');
    }
  };

  const getShippingAddress = (order: Order) => {
    if (typeof order.shippingAddress === 'string') {
      try {
        return JSON.parse(order.shippingAddress);
      } catch {
        return { address: order.shippingAddress, city: '', postalCode: '', country: '' };
      }
    }
    return order.shippingAddress;
  };

  if (!user?.isAdmin) {
    return null;
  }

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <Link to="/admin" className="btn btn-outline" style={{ marginBottom: '1rem' }}>
            ← Volver al Dashboard
          </Link>
          <h1>Gestión de Pedidos</h1>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{orders.length}</div>
          <div style={{ color: '#64748b' }}>Total Pedidos</div>
        </div>
        <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#166534' }}>
            {orders.filter(o => o.isPaid).length}
          </div>
          <div style={{ color: '#64748b' }}>Pagados</div>
        </div>
        <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc2626' }}>
            {orders.filter(o => !o.isPaid).length}
          </div>
          <div style={{ color: '#64748b' }}>Pendientes</div>
        </div>
        <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0891b2' }}>
            {orders.filter(o => o.isDelivered).length}
          </div>
          <div style={{ color: '#64748b' }}>Entregados</div>
        </div>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner"></div></div>
      ) : orders.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <p style={{ color: '#64748b' }}>No hay pedidos todavía</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {orders.map(order => (
            <div key={order.id} className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <h3 style={{ margin: 0 }}>Pedido #{order.id.slice(0, 8)}</h3>
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
                  <div style={{ color: '#64748b', fontSize: '0.875rem' }}>
                    Cliente: <strong>{order.user?.name || 'Cliente'}</strong> ({order.user?.email})
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.875rem' }}>
                    Fecha: {new Date(order.createdAt).toLocaleDateString('es-ES')}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>${order.totalPrice.toFixed(2)}</div>
                  <div style={{ color: '#64748b', fontSize: '0.875rem' }}>{order.paymentMethod}</div>
                </div>
              </div>

              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button 
                  onClick={() => setSelectedOrder(order)}
                  className="btn btn-outline"
                  style={{ padding: '0.5rem 1rem' }}
                >
                  Ver Detalles
                </button>
                {!order.isPaid && (
                  <button 
                    onClick={() => handleMarkAsPaid(order.id)}
                    className="btn btn-primary"
                    style={{ padding: '0.5rem 1rem' }}
                  >
                    Marcar Pagado
                  </button>
                )}
                {order.isPaid && !order.isDelivered && (
                  <button 
                    onClick={() => handleMarkAsDelivered(order.id)}
                    className="btn btn-primary"
                    style={{ padding: '0.5rem 1rem' }}
                  >
                    Marcar Entregado
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de detalles */}
      {selectedOrder && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ padding: '2rem', maxWidth: '600px', width: '90%', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
              <h2>Detalles del Pedido #{selectedOrder.id.slice(0, 8)}</h2>
              <button onClick={() => setSelectedOrder(null)} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem' }}>✕</button>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h4>Información del Cliente</h4>
              <p><strong>Nombre:</strong> {selectedOrder.user?.name || 'Cliente'}</p>
              <p><strong>Email:</strong> {selectedOrder.user?.email || 'N/A'}</p>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h4>Dirección de Envío</h4>
              <p>
                {getShippingAddress(selectedOrder).address}<br />
                {getShippingAddress(selectedOrder).city}, {getShippingAddress(selectedOrder).postalCode}<br />
                {getShippingAddress(selectedOrder).country}
              </p>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h4>Productos</h4>
              {selectedOrder.orderItems.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem 0', borderBottom: '1px solid #e2e8f0' }}>
                  <img 
                    src={item.image} 
                    alt={item.name}
                    style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                    onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/50x50'; }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500 }}>{item.name}</div>
                    <div style={{ color: '#64748b', fontSize: '0.875rem' }}>Cantidad: {item.quantity}</div>
                  </div>
                  <div style={{ fontWeight: 'bold' }}>${(item.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', fontWeight: 'bold', fontSize: '1.25rem' }}>
                <span>Total</span>
                <span>${selectedOrder.totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h4>Estado</h4>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <span style={{ 
                  padding: '0.5rem 1rem', 
                  borderRadius: '4px',
                  background: selectedOrder.isPaid ? '#dcfce7' : '#fee2e2',
                  color: selectedOrder.isPaid ? '#166534' : '#991b1b'
                }}>
                  {selectedOrder.isPaid ? '✓ Pagado' : 'Pendiente de Pago'}
                </span>
                <span style={{ 
                  padding: '0.5rem 1rem', 
                  borderRadius: '4px',
                  background: selectedOrder.isDelivered ? '#dcfce7' : '#f3f4f6',
                  color: selectedOrder.isDelivered ? '#166534' : '#64748b'
                }}>
                  {selectedOrder.isDelivered ? '✓ Entregado' : 'En proceso'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setSelectedOrder(null)} className="btn btn-outline">
                Cerrar
              </button>
              {!selectedOrder.isPaid && (
                <button onClick={() => handleMarkAsPaid(selectedOrder.id)} className="btn btn-primary">
                  Marcar como Pagado
                </button>
              )}
              {selectedOrder.isPaid && !selectedOrder.isDelivered && (
                <button onClick={() => handleMarkAsDelivered(selectedOrder.id)} className="btn btn-primary">
                  Marcar como Entregado
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
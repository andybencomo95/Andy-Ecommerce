import axios from 'axios';
import { useState, useEffect } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';

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

function Orders(): React.JSX.Element {
  const [orders, setOrders] = useState<Order[]>([]);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState('');
  const { user } = useAuth();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();

  const isNewOrder = (location.state as { success?: boolean } | null)?.success ?? false;

  useEffect(() => {
    const fetchOrders = async (): Promise<void> => {
      if (user === null) {
        return;
      }
      setLoading(true);
      try {
        if (id !== undefined) {
          const response = await axios.get<Order>(`/api/orders/${id}`);
          setOrder(response.data);
        } else {
          const response = await axios.get<Order[]>('/api/orders');
          setOrders(response.data);
        }
      } catch (err: unknown) {
        console.error('Error fetching orders:', err);
        if (id === undefined) {
          setOrders([
            {
              id: 'demo-1',
              orderItems: [
                { product: '1', name: 'Producto de Ejemplo', quantity: 2, price: 29.99, image: 'https://via.placeholder.com/60x60' },
              ],
              shippingAddress: { address: 'Calle Demo 123', city: 'Madrid', postalCode: '28001', country: 'Espana' },
              paymentMethod: 'stripe',
              totalPrice: 59.98,
              isPaid: true,
              isDelivered: false,
              createdAt: new Date().toISOString(),
            },
          ]);
        }
      } finally {
        setLoading(false);
      }
    };

    void fetchOrders();
  }, [user, id]);

  const handlePay = async (orderId: string): Promise<void> => {
    setPaying(true);
    setPayError('');
    try {
      const response = await axios.put<Order>(`/api/orders/${orderId}/pay`, {
        paymentIntentId: `pi_sim_${Date.now()}`,
      });
      setOrder(response.data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response !== undefined) {
        const data = err.response.data as { error?: { message?: string } };
        setPayError(data.error?.message ?? 'Error al procesar el pago');
      } else {
        setPayError('Error al procesar el pago. Intentelo de nuevo.');
      }
    } finally {
      setPaying(false);
    }
  };

  if (user === null) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <h2>Debes iniciar sesion para ver tus pedidos</h2>
        <Link to="/login" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
          Iniciar Sesion
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      {id !== undefined && (
        <Link to="/orders" style={{ color: '#64748b', textDecoration: 'none', display: 'inline-block', marginBottom: '1rem' }}>
          Volver a Mis Pedidos
        </Link>
      )}

      <h1>{id !== undefined ? 'Detalle del Pedido' : 'Mis Pedidos'}</h1>

      {isNewOrder && (
        <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
          Pedido realizado con exito. Te enviaremos un email de confirmacion.
        </div>
      )}

      {id !== undefined && order !== null ? (
        <DetailView order={order} paying={paying} payError={payError} onPay={handlePay} />
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <p style={{ color: '#64748b' }}>No tienes pedidos todavia</p>
          <Link to="/products" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
            Ver Productos
          </Link>
        </div>
      ) : (
        <OrderList orders={orders} />
      )}
    </div>
  );
}

function DetailView({
  order,
  paying,
  payError,
  onPay,
}: {
  order: Order;
  paying: boolean;
  payError: string;
  onPay: (id: string) => Promise<void>;
}): React.JSX.Element {
  return (
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
            <StatusBadge active={order.isPaid} labelTrue="Pagado" labelFalse="Pendiente" colorTrue="#166534" colorFalse="#991b1b" bgTrue="#dcfce7" bgFalse="#fee2e2" />
            <StatusBadge active={order.isDelivered} labelTrue="Entregado" labelFalse="En proceso" colorTrue="#166534" colorFalse="#64748b" bgTrue="#dcfce7" bgFalse="#f3f4f6" />
          </div>
        </div>
      </div>

      {!order.isPaid && (
        <div style={{ marginBottom: '1.5rem' }}>
          <button
            onClick={() => { void onPay(order.id); }}
            className="btn btn-primary"
            disabled={paying}
            style={{ width: '100%', padding: '0.75rem' }}
          >
            {paying ? 'Procesando pago simulado...' : 'Pagar Ahora (Simulado)'}
          </button>
          {payError !== '' && (
            <p style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '0.5rem' }}>{payError}</p>
          )}
        </div>
      )}

      {order.isPaid && (
        <div className="alert alert-success" style={{ marginBottom: '1.5rem', textAlign: 'center', padding: '0.75rem' }}>
          Pago confirmado. Gracias por tu compra.
        </div>
      )}

      <div style={{ marginBottom: '1.5rem' }}>
        <h4>Direccion de Envio</h4>
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
  );
}

function OrderList({ orders }: { orders: Order[] }): React.JSX.Element {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
      {orders.map((o) => (
        <div key={o.id} className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem' }}>Pedido #{o.id}</h3>
              <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                {new Date(o.createdAt).toLocaleDateString('es-ES')}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>${o.totalPrice.toFixed(2)}</p>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                <StatusBadge active={o.isPaid} labelTrue="Pagado" labelFalse="Pendiente" colorTrue="#166534" colorFalse="#991b1b" bgTrue="#dcfce7" bgFalse="#fee2e2" />
                <StatusBadge active={o.isDelivered} labelTrue="Entregado" labelFalse="En proceso" colorTrue="#166534" colorFalse="#64748b" bgTrue="#dcfce7" bgFalse="#f3f4f6" />
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {o.orderItems.map((item, idx) => (
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
            <Link to={`/orders/${o.id}`} style={{ display: 'inline-block', marginTop: '0.75rem', color: '#2563eb', fontSize: '0.875rem' }}>
              Ver detalle
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}

function StatusBadge({
  active,
  labelTrue,
  labelFalse,
  colorTrue,
  colorFalse,
  bgTrue,
  bgFalse,
}: {
  active: boolean;
  labelTrue: string;
  labelFalse: string;
  colorTrue: string;
  colorFalse: string;
  bgTrue: string;
  bgFalse: string;
}): React.JSX.Element {
  return (
    <span
      style={{
        padding: '0.25rem 0.5rem',
        borderRadius: '4px',
        fontSize: '0.75rem',
        background: active ? bgTrue : bgFalse,
        color: active ? colorTrue : colorFalse,
      }}
    >
      {active ? labelTrue : labelFalse}
    </span>
  );
}

export default Orders;

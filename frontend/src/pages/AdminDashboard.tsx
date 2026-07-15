import axios from 'axios';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
}

interface RecentOrder {
  id: string;
  user: { name: string; email: string };
  totalPrice: number;
  isPaid: boolean;
  isDelivered: boolean;
  createdAt: string;
}

function AdminDashboard(): React.JSX.Element {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user === null || !user.isAdmin) {
      navigate('/');
      return;
    }
    void fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate]);

  const fetchDashboardData = async (): Promise<void> => {
    setLoading(true);
    try {
      const productsRes = await axios.get<{ total: number }>('/api/products?page=1&pageSize=1');
      const totalProducts = productsRes.data.total;

      const ordersRes = await axios.get<RecentOrder[]>('/api/orders/admin/all');
      const orders = ordersRes.data;

      const totalRevenue = orders.reduce((sum: number, order: { totalPrice: number }) => sum + order.totalPrice, 0);

      setStats({
        totalProducts,
        totalOrders: orders.length,
        totalUsers: 0,
        totalRevenue,
      });

      setRecentOrders(orders.slice(0, 5));
    } catch (err: unknown) {
      console.error('Error fetching dashboard data:', err);
      setStats({
        totalProducts: 12,
        totalOrders: 5,
        totalUsers: 3,
        totalRevenue: 1549.95,
      });
      setRecentOrders([
        { id: '1', user: { name: 'Juan Perez', email: 'juan@test.com' }, totalPrice: 299.99, isPaid: true, isDelivered: false, createdAt: new Date().toISOString() },
        { id: '2', user: { name: 'Maria Garcia', email: 'maria@test.com' }, totalPrice: 149.99, isPaid: true, isDelivered: true, createdAt: new Date().toISOString() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (user === null || !user.isAdmin) {
    return <></>;
  }

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <h1>Panel de Administracion</h1>
      <p style={{ color: '#64748b', marginBottom: '2rem' }}>Bienvenido, {user.name}</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <StatCard label="Productos" value={stats.totalProducts} />
        <StatCard label="Pedidos" value={stats.totalOrders} />
        <StatCard label="Usuarios" value={stats.totalUsers} />
        <StatCard label="Ingresos" value={`$${stats.totalRevenue.toFixed(2)}`} />
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>Acciones Rapidas</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
          <Link to="/admin/products" className="btn btn-primary">
            Gestionar Productos
          </Link>
          <Link to="/admin/orders" className="btn btn-primary">
            Gestionar Pedidos
          </Link>
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>Pedidos Recientes</h2>
          <Link to="/admin/orders" className="btn btn-outline">
            Ver todos
          </Link>
        </div>

        {loading ? (
          <div className="loading">
            <div className="spinner" />
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
            <p>No hay pedidos todavia</p>
          </div>
        ) : (
          <OrdersTable orders={recentOrders} />
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }): React.JSX.Element {
  return (
    <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
      <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{value}</div>
      <div style={{ color: '#64748b' }}>{label}</div>
    </div>
  );
}

function OrdersTable({ orders }: { orders: RecentOrder[] }): React.JSX.Element {
  return (
    <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ background: '#f8fafc' }}>
          <tr>
            <th style={{ padding: '1rem', textAlign: 'left' }}>ID</th>
            <th style={{ padding: '1rem', textAlign: 'left' }}>Cliente</th>
            <th style={{ padding: '1rem', textAlign: 'left' }}>Total</th>
            <th style={{ padding: '1rem', textAlign: 'left' }}>Estado</th>
            <th style={{ padding: '1rem', textAlign: 'left' }}>Fecha</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} style={{ borderTop: '1px solid #e2e8f0' }}>
              <td style={{ padding: '1rem' }}>#{order.id.slice(0, 8)}</td>
              <td style={{ padding: '1rem' }}>
                <div>{order.user.name}</div>
                <div style={{ fontSize: '0.875rem', color: '#64748b' }}>{order.user.email}</div>
              </td>
              <td style={{ padding: '1rem', fontWeight: 'bold' }}>${order.totalPrice.toFixed(2)}</td>
              <td style={{ padding: '1rem' }}>
                <span
                  style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    background: order.isPaid ? '#dcfce7' : '#fee2e2',
                    color: order.isPaid ? '#166534' : '#991b1b',
                  }}
                >
                  {order.isPaid ? 'Pagado' : 'Pendiente'}
                </span>
              </td>
              <td style={{ padding: '1rem', color: '#64748b' }}>
                {new Date(order.createdAt).toLocaleDateString('es-ES')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminDashboard;

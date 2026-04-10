import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Product } from '../types/cart';

const Home = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('/api/products');
        setProducts(response.data.products || []);
      } catch (error) {
        console.error('Error fetching products:', error);
        // Products demo if API not available
        setProducts([
          {
            id: 'demo-1',
            name: 'Producto Demo 1',
            description: 'Auriculares inalámbricos con sonido premium',
            price: 29.99,
            image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=300&fit=crop',
            category: 'Electrónica',
            stock: 10,
            createdAt: new Date().toISOString()
          },
          {
            id: 'demo-2',
            name: 'Producto Demo 2',
            description: 'Camiseta clásica de algodón orgánico',
            price: 49.99,
            image: 'https://images.unsplash.com/photo-1529374255404-311a2a4f1c9d?w=400&h=300&fit=crop',
            category: 'Ropa',
            stock: 5,
            createdAt: new Date().toISOString()
          },
          {
            id: 'demo-3',
            name: 'Producto Demo 3',
            description: 'Gorra deportiva adjustable',
            price: 19.99,
            image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&h=300&fit=crop',
            category: 'Accesorios',
            stock: 20,
            createdAt: new Date().toISOString()
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div>
      <section className="hero">
        <div className="container">
          <h1>Bienvenido a Andy Ecommerce</h1>
          <p>Los mejores productos al mejor precio</p>
          <Link to="/products" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
            Ver Productos
          </Link>
        </div>
      </section>

      <section className="container">
        <h2 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Productos Destacados</h2>
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="products-grid">
            {products.slice(0, 4).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
        <div style={{ textAlign: 'center', margin: '2rem 0' }}>
          <Link to="/products" className="btn btn-outline">
            Ver Todos los Productos →
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;

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
            description: 'Este es un producto de demostración',
            price: 29.99,
            image: 'https://via.placeholder.com/280x200?text=Producto+1',
            category: 'Electrónica',
            stock: 10,
            createdAt: new Date().toISOString()
          },
          {
            id: 'demo-2',
            name: 'Producto Demo 2',
            description: 'Otro producto de demostración',
            price: 49.99,
            image: 'https://via.placeholder.com/280x200?text=Producto+2',
            category: 'Ropa',
            stock: 5,
            createdAt: new Date().toISOString()
          },
          {
            id: 'demo-3',
            name: 'Producto Demo 3',
            description: 'Tercer producto de demostración',
            price: 19.99,
            image: 'https://via.placeholder.com/280x200?text=Producto+3',
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

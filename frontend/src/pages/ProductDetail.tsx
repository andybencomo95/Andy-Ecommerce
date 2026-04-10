import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Product } from '../types/cart';
import { useCart } from '../context/CartContext';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/api/products/${id}`);
        setProduct(response.data);
      } catch (error) {
        console.error('Error fetching product:', error);
        // Demo product
        setProduct({
          id: id || 'demo-1',
          name: 'Producto de Ejemplo',
          description: 'Esta es una descripción detallada del producto. Es un producto de alta calidad con excelentes características.',
          price: 99.99,
          image: 'https://via.placeholder.com/600x400?text=Producto',
          category: 'Categoría',
          stock: 10,
          createdAt: new Date().toISOString()
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: '2rem 0', textAlign: 'center' }}>
        <h2>Producto no encontrado</h2>
        <Link to="/products" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
          Volver a Productos
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <Link to="/products" style={{ color: '#64748b', textDecoration: 'none' }}>
        ← Volver a Productos
      </Link>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', marginTop: '1.5rem' }}>
        <div>
          <img
            src={product.image}
            alt={product.name}
            style={{ width: '100%', borderRadius: '12px' }}
            onError={(e) => {
              e.currentTarget.src = 'https://via.placeholder.com/600x400?text=Imagen';
            }}
          />
        </div>
        
        <div>
          <span className="product-category">{product.category}</span>
          <h1 style={{ marginTop: '0.5rem' }}>{product.name}</h1>
          <p className="product-price" style={{ fontSize: '2rem', marginTop: '1rem' }}>
            ${product.price.toFixed(2)}
          </p>
          
          <p style={{ marginTop: '1.5rem', color: '#64748b' }}>
            {product.description}
          </p>
          
          <div style={{ marginTop: '1.5rem' }}>
            <span style={{ 
              color: product.stock > 0 ? '#22c55e' : '#ef4444',
              fontWeight: 600
            }}>
              {product.stock > 0 ? `✓ Stock disponible: ${product.stock} unidades` : '✗ Sin stock'}
            </span>
          </div>
          
          {product.stock > 0 && (
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button 
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="btn btn-outline"
                  style={{ width: '40px', height: '40px', padding: 0 }}
                >
                  -
                </button>
                <span style={{ minWidth: '40px', textAlign: 'center', fontSize: '1.25rem' }}>
                  {quantity}
                </span>
                <button 
                  onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                  className="btn btn-outline"
                  style={{ width: '40px', height: '40px', padding: 0 }}
                >
                  +
                </button>
              </div>
              
              <button 
                onClick={() => addToCart(product, quantity)}
                className="btn btn-primary"
                style={{ flex: 1 }}
              >
                Agregar al Carrito 🛒
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

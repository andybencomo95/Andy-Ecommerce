import { Link } from 'react-router-dom';
import { Product } from '../types/cart';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();

  return (
    <div className="product-card">
      <img 
        src={product.image} 
        alt={product.name} 
        className="product-image"
        onError={(e) => {
          e.currentTarget.src = 'https://via.placeholder.com/280x200?text=Imagen+no+disponible';
        }}
      />
      <div className="product-info">
        <span className="product-category">{product.category}</span>
        <h3 className="product-name">{product.name}</h3>
        <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>
          {product.description.substring(0, 80)}...
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="product-price">${product.price.toFixed(2)}</span>
          <span style={{ fontSize: '0.875rem', color: product.stock > 0 ? '#22c55e' : '#ef4444' }}>
            {product.stock > 0 ? `Stock: ${product.stock}` : 'Sin stock'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          <button 
            onClick={() => addToCart(product)}
            disabled={product.stock === 0}
            className="btn btn-primary"
            style={{ flex: 1 }}
          >
            Agregar 🛒
          </button>
          <Link to={`/products/${product.id}`} className="btn btn-outline">
            Ver
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

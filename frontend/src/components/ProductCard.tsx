import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types/cart';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleAddToCart = async () => {
    setIsAdding(true);
    await addToCart(product);
    setTimeout(() => setIsAdding(false), 500);
  };

  const fallbackImage = `https://placehold.co/280x220/e2e8f0/64748b?text=${encodeURIComponent(product.name)}`;

  const isOutOfStock = product.stock === 0;
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount 
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

  return (
    <div className={`product-card ${isOutOfStock ? 'out-of-stock' : ''}`}>
      <div className="product-image-container">
        {hasDiscount && (
          <span className="discount-badge">-{discountPercent}%</span>
        )}
        {isOutOfStock && (
          <div className="out-of-stock-overlay">
            <span>Agotado</span>
          </div>
        )}
        <img 
          src={imageError ? fallbackImage : product.image} 
          alt={product.name} 
          className="product-image"
          onError={() => setImageError(true)}
        />
        <div className="product-actions">
          <Link to={`/products/${product.id}`} className="quick-view-btn">
            Ver Detalle
          </Link>
        </div>
      </div>
      <div className="product-info">
        <span className="product-category">{product.category}</span>
        <h3 className="product-name">{product.name}</h3>
        <p className="product-description">
          {product.description?.substring(0, 60)}{product.description && product.description.length > 60 ? '...' : ''}
        </p>
        <div className="product-price-row">
          <div className="price-container">
            <span className="product-price">${product.price.toFixed(2)}</span>
            {hasDiscount && (
              <span className="original-price">${product.originalPrice?.toFixed(2)}</span>
            )}
          </div>
          <span className={`stock-badge ${product.stock > 0 ? 'in-stock' : 'no-stock'}`}>
            {product.stock > 0 ? `${product.stock} disponibles` : 'Sin stock'}
          </span>
        </div>
        <button 
          onClick={handleAddToCart}
          disabled={isOutOfStock || isAdding}
          className={`add-to-cart-btn ${isAdding ? 'adding' : ''}`}
        >
          {isAdding ? 'Agregando...' : isOutOfStock ? 'Agotado' : 'Agregar al Carrito'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
import { Link } from 'react-router-dom';

import styles from './ProductCard.module.css';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image: string;
  category: string;
  stock: number;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  adding?: boolean;
}

function ProductCard({ product, onAddToCart, adding }: ProductCardProps): React.JSX.Element {
  const isOutOfStock = product.stock === 0;

  return (
    <div className={`${styles.card} ${isOutOfStock ? styles.outOfStock : ''}`}>
      <div className={styles.imageContainer}>
        <img
          src={product.image}
          alt={product.name}
          className={styles.image}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = 'https://via.placeholder.com/300x300?text=No+Image';
          }}
        />

        {isOutOfStock && (
          <div className={styles.overlay}>
            <span>Agotado</span>
          </div>
        )}

        <div className={styles.actions}>
          <Link
            to={`/products/${product.id}`}
            className="quick-view-btn"
            style={{
              display: 'block',
              width: '100%',
              padding: '0.75rem',
              background: 'white',
              color: '#1e293b',
              textAlign: 'center',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: 500,
            }}
          >
            Ver Detalle
          </Link>
        </div>
      </div>

      <div className={styles.info}>
        <span className={styles.category}>{product.category}</span>
        <h3 className={styles.name}>{product.name}</h3>
        <p className={styles.description}>
          {(product.description ?? "").length > 80
            ? `${(product.description ?? "").slice(0, 80)}...`
            : product.description ?? ""}
        </p>

        <div className={styles.priceRow}>
          <span className={styles.price}>${product.price.toFixed(2)}</span>
          <span className={`${styles.stockBadge} ${isOutOfStock ? styles.noStock : styles.inStock}`}>
            {isOutOfStock ? 'Agotado' : `${product.stock} en stock`}
          </span>
        </div>

        <button
          className={`${styles.addToCartBtn} ${adding === true ? styles.adding : ''}`}
          onClick={() => onAddToCart(product)}
          disabled={isOutOfStock || adding === true}
        >
          {adding === true ? 'Agregando...' : isOutOfStock ? 'Sin stock' : 'Agregar al Carrito'}
        </button>
      </div>
    </div>
  );
}

export default ProductCard;

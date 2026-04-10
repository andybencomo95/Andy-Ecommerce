import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import axios from 'axios';
import { Product } from '../types/cart';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [categories, setCategories] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/api/products/categories');
        setCategories(response.data || []);
      } catch (error) {
        setCategories(['Electrónica', 'Ropa', 'Deportes', 'Hogar', 'Accesorios']);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (keyword) params.append('keyword', keyword);
        if (category && category !== 'all') params.append('category', category);
        params.append('page', page.toString());
        
        const response = await axios.get(`/api/products?${params}`);
        let fetchedProducts = response.data.products || [];
        
        if (fetchedProducts.length === 0) {
          fetchedProducts = [
            { id: 'demo-1', name: 'Laptop Pro', description: 'Laptop de alta gama con procesador Intel i7, 16GB RAM, 512GB SSD', price: 999.99, originalPrice: 1299.99, image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop', category: 'Electrónica', stock: 10, createdAt: '' },
            { id: 'demo-2', name: 'Camiseta Cotton', description: 'Camiseta de algodón orgánica, disponible en varios colores', price: 29.99, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop', category: 'Ropa', stock: 50, createdAt: '' },
            { id: 'demo-3', name: 'Zapatillas Running', description: 'Zapatillas deportivas ultraligeras con amortiguación avanzada', price: 89.99, originalPrice: 119.99, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop', category: 'Deportes', stock: 25, createdAt: '' },
            { id: 'demo-4', name: 'Auriculares Pro', description: 'Auriculares Bluetooth con cancelación activa de ruido', price: 149.99, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop', category: 'Electrónica', stock: 30, createdAt: '' },
            { id: 'demo-5', name: 'Reloj Smart', description: 'Reloj inteligente con monitor de frecuencia cardíaca', price: 199.99, originalPrice: 249.99, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop', category: 'Electrónica', stock: 20, createdAt: '' },
            { id: 'demo-6', name: 'Mochila Traveler', description: 'Mochila resistente al agua con puerto USB integrado', price: 49.99, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop', category: 'Accesorios', stock: 40, createdAt: '' },
            { id: 'demo-7', name: 'Cámara Action', description: 'Cámara action 4K resistente al agua hasta 30m', price: 299.99, image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=300&fit=crop', category: 'Electrónica', stock: 15, createdAt: '' },
            { id: 'demo-8', name: 'Billetera Leather', description: 'Billetera de cuero genuino con múltiples compartimentos', price: 39.99, image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&h=300&fit=crop', category: 'Accesorios', stock: 35, createdAt: '' },
          ];
        }
        
        fetchedProducts = sortProducts(fetchedProducts, sortBy, sortOrder);
        
        setProducts(fetchedProducts);
        setPages(response.data.pages || 1);
      } catch (error) {
        console.error('Error fetching products:', error);
        const demoProducts = [
          { id: 'demo-1', name: 'Laptop Pro', description: 'Laptop de alta gama con procesador Intel i7', price: 999.99, originalPrice: 1299.99, image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop', category: 'Electrónica', stock: 10, createdAt: '' },
          { id: 'demo-2', name: 'Camiseta Cotton', description: 'Camiseta de algodón orgánica', price: 29.99, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop', category: 'Ropa', stock: 50, createdAt: '' },
          { id: 'demo-3', name: 'Zapatillas Running', description: 'Zapatillas deportivas ultraligeras', price: 89.99, originalPrice: 119.99, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop', category: 'Deportes', stock: 25, createdAt: '' },
          { id: 'demo-4', name: 'Auriculares Pro', description: 'Auriculares Bluetooth con cancelación de ruido', price: 149.99, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop', category: 'Electrónica', stock: 30, createdAt: '' },
        ];
        setProducts(sortProducts(demoProducts, sortBy, sortOrder));
        setPages(1);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [keyword, category, page, sortBy, sortOrder]);

  const sortProducts = (products: Product[], sort: string, order: 'asc' | 'desc') => {
    const sorted = [...products].sort((a, b) => {
      let comparison = 0;
      switch (sort) {
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'newest':
          comparison = (new Date(b.createdAt || 0).getTime()) - (new Date(a.createdAt || 0).getTime());
          break;
        default:
          comparison = 0;
      }
      return order === 'asc' ? comparison : -comparison;
    });
    return sorted;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    const newParams = new URLSearchParams();
    if (keyword) newParams.set('keyword', keyword);
    if (category && category !== 'all') newParams.set('category', category);
    setSearchParams(newParams);
  };

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    setPage(1);
    const newParams = new URLSearchParams();
    if (keyword) newParams.set('keyword', keyword);
    if (newCategory && newCategory !== 'all') newParams.set('category', newCategory);
    setSearchParams(newParams);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [newSort, newOrder] = e.target.value.split('-');
    setSortBy(newSort);
    setSortOrder(newOrder as 'asc' | 'desc');
  };

  const clearFilters = () => {
    setKeyword('');
    setCategory('');
    setPriceRange({ min: '', max: '' });
    setPage(1);
    setSearchParams({});
  };

  const hasActiveFilters = keyword || category || priceRange.min || priceRange.max;

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Nuestros Productos</h1>
        <Link to="/" className="btn btn-outline">← Volver al Inicio</Link>
      </div>
      
      {/* Filters */}
      <div className="products-filter">
        <form onSubmit={handleSearch}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Buscar productos</label>
              <input
                type="text"
                placeholder="Buscar..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="form-control"
              />
            </div>
            
            <div style={{ minWidth: 150 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Categoría</label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="form-control"
              >
                <option value="">Todas</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div style={{ minWidth: 150 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Ordenar por</label>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={handleSortChange}
                className="sort-select form-control"
              >
                <option value="name-asc">Nombre (A-Z)</option>
                <option value="name-desc">Nombre (Z-A)</option>
                <option value="price-asc">Precio (Menor)</option>
                <option value="price-desc">Precio (Mayor)</option>
                <option value="newest-newest">Más Recientes</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn btn-primary">Buscar</button>
              {hasActiveFilters && (
                <button type="button" onClick={clearFilters} className="btn btn-outline">
                  Limpiar
                </button>
              )}
            </div>
          </div>
        </form>

        {hasActiveFilters && (
          <div className="active-filters" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
            <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Filtros activos:</span>
            {keyword && (
              <span className="filter-tag">
                "{keyword}" <button onClick={() => { setKeyword(''); setPage(1); }}>×</button>
              </span>
            )}
            {category && (
              <span className="filter-tag">
                {category} <button onClick={() => handleCategoryChange('')}>×</button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Results info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
          {products.length > 0 && !loading && (
            <>Mostrando <strong>{products.length}</strong> producto{products.length !== 1 ? 's' : ''}</>
          )}
        </p>
        {pages > 1 && (
          <span style={{ color: '#64748b', fontSize: '0.875rem' }}>
            Página {page} de {pages}
          </span>
        )}
      </div>

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="products-empty">
          <h3>No se encontraron productos</h3>
          <p>Prueba con otros filtros o busca otro término</p>
          <button onClick={clearFilters} className="btn btn-primary">
            Ver todos los productos
          </button>
        </div>
      ) : (
        <>
          <div className="products-grid">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          {pages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn btn-outline"
                style={{ minWidth: 120 }}
              >
                ← Anterior
              </button>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                {Array.from({ length: Math.min(5, pages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`btn ${page === pageNum ? 'btn-primary' : 'btn-outline'}`}
                      style={{ minWidth: 40, padding: '0.75rem' }}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setPage(p => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="btn btn-outline"
                style={{ minWidth: 120 }}
              >
                Siguiente →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Products;
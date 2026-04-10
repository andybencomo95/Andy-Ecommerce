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

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/api/products/categories');
        setCategories(response.data || []);
      } catch (error) {
        // Categorías por defecto
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
        const fetchedProducts = response.data.products || [];
        
        // Si no hay productos en la base de datos, usar demo products
        if (fetchedProducts.length === 0) {
          setProducts([
            { id: 'demo-1', name: 'Laptop Pro', description: 'Laptop de alta gama', price: 999.99, image: 'https://via.placeholder.com/280x200?text=Laptop', category: 'Electrónica', stock: 10, createdAt: '' },
            { id: 'demo-2', name: 'Camiseta Cotton', description: 'Camiseta de algodón', price: 29.99, image: 'https://via.placeholder.com/280x200?text=Camiseta', category: 'Ropa', stock: 50, createdAt: '' },
            { id: 'demo-3', name: 'Zapatillas Running', description: 'Zapatillas deportivas', price: 89.99, image: 'https://via.placeholder.com/280x200?text=Zapatillas', category: 'Deportes', stock: 25, createdAt: '' },
            { id: 'demo-4', name: 'Auriculares', description: 'Auriculares Bluetooth', price: 149.99, image: 'https://via.placeholder.com/280x200?text=Auriculares', category: 'Electrónica', stock: 30, createdAt: '' },
            { id: 'demo-5', name: 'Reloj Smart', description: 'Reloj inteligente', price: 199.99, image: 'https://via.placeholder.com/280x200?text=Reloj', category: 'Electrónica', stock: 20, createdAt: '' },
            { id: 'demo-6', name: 'Mochila', description: 'Mochila resistente al agua', price: 49.99, image: 'https://via.placeholder.com/280x200?text=Mochila', category: 'Accesorios', stock: 40, createdAt: '' },
          ]);
        } else {
          setProducts(fetchedProducts);
        }
        setPages(response.data.pages || 1);
      } catch (error) {
        console.error('Error fetching products:', error);
        // Demo products como fallback
        setProducts([
          { id: 'demo-1', name: 'Laptop Pro', description: 'Laptop de alta gama', price: 999.99, image: 'https://via.placeholder.com/280x200?text=Laptop', category: 'Electrónica', stock: 10, createdAt: '' },
          { id: 'demo-2', name: 'Camiseta Cotton', description: 'Camiseta de algodón', price: 29.99, image: 'https://via.placeholder.com/280x200?text=Camiseta', category: 'Ropa', stock: 50, createdAt: '' },
          { id: 'demo-3', name: 'Zapatillas Running', description: 'Zapatillas deportivas', price: 89.99, image: 'https://via.placeholder.com/280x200?text=Zapatillas', category: 'Deportes', stock: 25, createdAt: '' },
          { id: 'demo-4', name: 'Auriculares', description: 'Auriculares Bluetooth', price: 149.99, image: 'https://via.placeholder.com/280x200?text=Auriculares', category: 'Electrónica', stock: 30, createdAt: '' },
        ]);
        setPages(1);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [keyword, category, page]);

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

  const clearFilters = () => {
    setKeyword('');
    setCategory('');
    setPage(1);
    setSearchParams({});
  };

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1>Nuestros Productos</h1>
        <Link to="/" className="btn btn-outline">← Volver</Link>
      </div>
      
      {/* Filtros y búsqueda */}
      <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
        <form onSubmit={handleSearch}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'end' }}>
            {/* Búsqueda */}
            <div style={{ flex: '1', minWidth: '200px' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Buscar</label>
              <input
                type="text"
                placeholder="Buscar productos..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="form-control"
              />
            </div>
            
            {/* Filtro por categoría */}
            <div style={{ minWidth: '180px' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Categoría</label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="form-control"
              >
                <option value="">Todas las categorías</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            {/* Botones */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn btn-primary">Buscar</button>
              {(keyword || category) && (
                <button type="button" onClick={clearFilters} className="btn btn-outline">
                  Limpiar
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Contador de resultados */}
      <div style={{ marginBottom: '1rem', color: '#64748b' }}>
        {products.length > 0 && !loading && (
          <span>Mostrando {products.length} producto{products.length !== 1 ? 's' : ''}</span>
        )}
      </div>

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: '#64748b', fontSize: '1.1rem' }}>No se encontraron productos</p>
          <button onClick={clearFilters} className="btn btn-primary" style={{ marginTop: '1rem' }}>
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
              >
                ← Anterior
              </button>
              <span style={{ display: 'flex', alignItems: 'center', padding: '0 1rem' }}>
                Página {page} de {pages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="btn btn-outline"
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
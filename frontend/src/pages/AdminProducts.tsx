import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Product } from '../types/cart';

const AdminProducts = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    category: '',
    stock: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user || !user.isAdmin) {
      navigate('/');
      return;
    }
    fetchProducts();
  }, [user, navigate]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/products?page=1&pageSize=100');
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      // Demo data
      setProducts([
        { id: 'demo-1', name: 'Laptop Pro', description: 'Laptop de alta gama', price: 999.99, image: 'https://via.placeholder.com/280x200?text=Laptop', category: 'Electrónica', stock: 10, createdAt: '' },
        { id: 'demo-2', name: 'Camiseta Cotton', description: 'Camiseta de algodón', price: 29.99, image: 'https://via.placeholder.com/280x200?text=Camiseta', category: 'Ropa', stock: 50, createdAt: '' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'El nombre es requerido';
    if (!formData.description.trim()) newErrors.description = 'La descripción es requerida';
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'El precio debe ser mayor a 0';
    if (!formData.image.trim()) newErrors.image = 'La imagen es requerida';
    if (!formData.category.trim()) newErrors.category = 'La categoría es requerida';
    if (!formData.stock || parseInt(formData.stock) < 0) newErrors.stock = 'El stock no puede ser negativo';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        image: formData.image,
        category: formData.category,
        stock: parseInt(formData.stock)
      };

      if (editingProduct) {
        await axios.put(`/api/products/${editingProduct.id}`, productData);
      } else {
        await axios.post('/api/products', productData);
      }

      setShowModal(false);
      setEditingProduct(null);
      setFormData({ name: '', description: '', price: '', image: '', category: '', stock: '' });
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error al guardar el producto');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;
    
    try {
      await axios.delete(`/api/products/${id}`);
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error al eliminar el producto');
    }
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      image: product.image,
      category: product.category,
      stock: product.stock.toString()
    });
    setShowModal(true);
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({ name: '', description: '', price: '', image: '', category: '', stock: '' });
    setErrors({});
    setShowModal(true);
  };

  if (!user?.isAdmin) {
    return null;
  }

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <Link to="/admin" className="btn btn-outline" style={{ marginBottom: '1rem' }}>
            ← Volver al Dashboard
          </Link>
          <h1>Gestión de Productos</h1>
        </div>
        <button onClick={openCreateModal} className="btn btn-primary">
          + Nuevo Producto
        </button>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner"></div></div>
      ) : products.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <p style={{ color: '#64748b' }}>No hay productos todavía</p>
          <button onClick={openCreateModal} className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Crear primer producto
          </button>
        </div>
      ) : (
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f8fafc' }}>
              <tr>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Imagen</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Nombre</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Categoría</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Precio</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Stock</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '1rem' }}>
                    <img 
                      src={product.image} 
                      alt={product.name}
                      style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                      onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/60x60'; }}
                    />
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 500 }}>{product.name}</div>
                    <div style={{ fontSize: '0.875rem', color: '#64748b' }}>{product.description.slice(0, 50)}...</div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ padding: '0.25rem 0.5rem', background: '#e0f2fe', borderRadius: '4px', fontSize: '0.875rem' }}>
                      {product.category}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 'bold' }}>${product.price.toFixed(2)}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      color: product.stock > 0 ? '#166534' : '#991b1b',
                      fontWeight: product.stock > 0 ? 'normal' : 'bold'
                    }}>
                      {product.stock} unidades
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <button 
                      onClick={() => openEditModal(product)}
                      className="btn btn-outline"
                      style={{ marginRight: '0.5rem', padding: '0.25rem 0.5rem' }}
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => handleDelete(product.id)}
                      className="btn btn-outline"
                      style={{ padding: '0.25rem 0.5rem', color: '#dc2626' }}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ padding: '2rem', maxWidth: '500px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2>{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-control"
                  placeholder="Nombre del producto"
                />
                {errors.name && <span style={{ color: '#dc2626', fontSize: '0.875rem' }}>{errors.name}</span>}
              </div>

              <div className="form-group">
                <label>Descripción *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="form-control"
                  placeholder="Descripción del producto"
                  rows={3}
                />
                {errors.description && <span style={{ color: '#dc2626', fontSize: '0.875rem' }}>{errors.description}</span>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Precio *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="form-control"
                    placeholder="0.00"
                  />
                  {errors.price && <span style={{ color: '#dc2626', fontSize: '0.875rem' }}>{errors.price}</span>}
                </div>

                <div className="form-group">
                  <label>Stock *</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="form-control"
                    placeholder="0"
                  />
                  {errors.stock && <span style={{ color: '#dc2626', fontSize: '0.875rem' }}>{errors.stock}</span>}
                </div>
              </div>

              <div className="form-group">
                <label>Categoría *</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="form-control"
                  placeholder="Electrónica, Ropa, etc."
                  list="categories"
                />
                <datalist id="categories">
                  <option value="Electrónica" />
                  <option value="Ropa" />
                  <option value="Deportes" />
                  <option value="Hogar" />
                  <option value="Accesorios" />
                </datalist>
                {errors.category && <span style={{ color: '#dc2626', fontSize: '0.875rem' }}>{errors.category}</span>}
              </div>

              <div className="form-group">
                <label>URL de Imagen *</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="form-control"
                  placeholder="https://..."
                />
                {errors.image && <span style={{ color: '#dc2626', fontSize: '0.875rem' }}>{errors.image}</span>}
                {formData.image && (
                  <img 
                    src={formData.image} 
                    alt="Preview" 
                    style={{ marginTop: '0.5rem', maxWidth: '100px', maxHeight: '100px', objectFit: 'cover' }}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                )}
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button 
                  type="button" 
                  onClick={() => { setShowModal(false); setEditingProduct(null); }}
                  className="btn btn-outline"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Guardando...' : (editingProduct ? 'Actualizar' : 'Crear')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
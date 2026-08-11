import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Product } from '../types';
import { Plus, Search, ArrowRightLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Inventory: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { user } = useAuth();
  
  const [showStockModal, setShowStockModal] = useState<number | null>(null);
  const [stockForm, setStockForm] = useState({ quantity: 0, movementType: 'IN', reason: '' });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/products?search=${search}`);
      setProducts(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search]);

  const handleStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showStockModal) return;
    
    try {
      await api.post(`/products/${showStockModal}/stock`, {
        ...stockForm,
        quantity: Number(stockForm.quantity)
      });
      setShowStockModal(null);
      setStockForm({ quantity: 0, movementType: 'IN', reason: '' });
      fetchProducts();
      alert('Stock updated successfully.');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update stock');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2>Inventory</h2>
        {(user?.role === 'ADMIN' || user?.role === 'WAREHOUSE') && (
          <button className="btn btn-primary">
            <Plus size={16} /> Add Product
          </button>
        )}
      </div>

      <div className="card mb-4">
        <div className="flex items-center gap-2">
          <Search size={20} className="text-muted" />
          <input 
            type="text" 
            placeholder="Search products..." 
            className="form-input" 
            style={{ maxWidth: '300px' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div>Loading products...</div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => {
                  const isOutOfStock = p.currentStock === 0;
                  const isLowStock = !isOutOfStock && p.currentStock <= p.minimumStock;
                  
                  return (
                    <tr key={p.id}>
                      <td className="font-semibold">{p.name}</td>
                      <td>{p.sku}</td>
                      <td>{p.category}</td>
                      <td>₹{p.unitPrice}</td>
                      <td className="font-semibold">{p.currentStock}</td>
                      <td>
                        {isOutOfStock ? (
                          <span className="badge badge-danger">Out of Stock</span>
                        ) : isLowStock ? (
                          <span className="badge badge-warning">Low Stock</span>
                        ) : (
                          <span className="badge badge-success">In Stock</span>
                        )}
                      </td>
                      <td>
                        {(user?.role === 'ADMIN' || user?.role === 'WAREHOUSE') && (
                          <button 
                            className="btn btn-secondary" 
                            style={{padding: '0.25rem 0.5rem'}}
                            onClick={() => setShowStockModal(p.id)}
                          >
                            <ArrowRightLeft size={16} /> Manage Stock
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
                {products.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-8">No products found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showStockModal && (
        <div style={{position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50}}>
          <div className="card" style={{width: '100%', maxWidth: '400px'}}>
            <h3 className="mb-4">Manage Stock</h3>
            <form onSubmit={handleStockSubmit}>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select 
                  className="form-input" 
                  value={stockForm.movementType}
                  onChange={e => setStockForm({...stockForm, movementType: e.target.value})}
                >
                  <option value="IN">Stock IN (+)</option>
                  <option value="OUT">Stock OUT (-)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Quantity</label>
                <input 
                  type="number" 
                  min="1"
                  required 
                  className="form-input" 
                  value={stockForm.quantity} 
                  onChange={e => setStockForm({...stockForm, quantity: e.target.value as any})} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Reason</label>
                <input 
                  required 
                  className="form-input" 
                  placeholder="e.g. New Purchase"
                  value={stockForm.reason} 
                  onChange={e => setStockForm({...stockForm, reason: e.target.value})} 
                />
              </div>
              <div className="flex justify-between gap-4 mt-4">
                <button type="button" className="btn btn-secondary" onClick={() => setShowStockModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Stock</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;

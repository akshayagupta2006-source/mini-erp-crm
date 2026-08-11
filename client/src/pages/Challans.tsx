import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Challan, Customer, Product } from '../types';
import { Plus, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Challans: React.FC = () => {
  const [challans, setChallans] = useState<Challan[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Data for Create Modal
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | ''>('');
  const [selectedProductId, setSelectedProductId] = useState<number | ''>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [items, setItems] = useState<{product: Product, quantity: number}[]>([]);

  const fetchChallans = async () => {
    try {
      setLoading(true);
      const res = await api.get('/challans');
      setChallans(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallans();
  }, []);

  const openCreateModal = async () => {
    setShowCreateModal(true);
    try {
      const [custRes, prodRes] = await Promise.all([
        api.get('/customers?limit=1000&status=ACTIVE'),
        api.get('/products?limit=1000')
      ]);
      setCustomers(custRes.data.data);
      setProducts(prodRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const addItem = () => {
    if (!selectedProductId || quantity <= 0) return;
    const product = products.find(p => p.id === Number(selectedProductId));
    if (!product) return;
    
    // Check if already added
    const existing = items.find(i => i.product.id === product.id);
    if (existing) {
      setItems(items.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i));
    } else {
      setItems([...items, { product, quantity }]);
    }
    
    setSelectedProductId('');
    setQuantity(1);
  };

  const handleSaveDraft = async () => {
    if (!selectedCustomerId || items.length === 0) {
      alert('Please select a customer and add at least one item');
      return;
    }
    try {
      await api.post('/challans', {
        customerId: Number(selectedCustomerId),
        items: items.map(i => ({ productId: i.product.id, quantity: i.quantity }))
      });
      setShowCreateModal(false);
      setItems([]);
      setSelectedCustomerId('');
      fetchChallans();
      alert('Draft challan created');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create challan');
    }
  };

  const handleConfirm = async (id: number) => {
    if (!window.confirm("Confirm this challan? Stock will be reduced immediately.")) return;
    
    try {
      await api.post(`/challans/${id}/confirm`);
      fetchChallans();
      alert('Challan confirmed successfully.');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to confirm challan');
    }
  };

  const handleCancel = async (id: number) => {
    if (!window.confirm("Are you sure you want to cancel this challan?")) return;
    
    try {
      await api.post(`/challans/${id}/cancel`);
      fetchChallans();
      alert('Challan cancelled.');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel challan');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2>Sales Challans</h2>
        {(user?.role === 'ADMIN' || user?.role === 'SALES') && (
          <button className="btn btn-primary" onClick={openCreateModal}>
            <Plus size={16} /> Create Challan
          </button>
        )}
      </div>

      <div className="card">
        {loading ? (
          <div>Loading challans...</div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Challan No</th>
                  <th>Customer</th>
                  <th>Quantity</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {challans.map(c => (
                  <tr key={c.id}>
                    <td className="font-semibold">{c.challanNumber}</td>
                    <td>{c.customer?.customerName}</td>
                    <td>{c.totalQuantity} items</td>
                    <td>
                      <span className={`badge ${c.status === 'CONFIRMED' ? 'badge-success' : c.status === 'DRAFT' ? 'badge-warning' : 'badge-danger'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="flex gap-2">
                        {c.status === 'DRAFT' && (user?.role === 'ADMIN' || user?.role === 'SALES') && (
                          <button className="btn btn-primary" style={{padding: '0.25rem 0.5rem'}} onClick={() => handleConfirm(c.id)}>
                            <CheckCircle size={14} /> Confirm
                          </button>
                        )}
                        {c.status !== 'CANCELLED' && (user?.role === 'ADMIN' || user?.role === 'SALES') && (
                          <button className="btn btn-danger" style={{padding: '0.25rem 0.5rem'}} onClick={() => handleCancel(c.id)}>
                            <XCircle size={14} /> Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {challans.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-8">No challans found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div style={{position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50}}>
          <div className="card flex-col" style={{width: '90%', maxWidth: '800px', maxHeight: '90vh'}}>
            <h3 className="mb-4">Create Challan</h3>
            
            <div className="flex-col" style={{overflowY: 'auto', flex: 1}}>
              <div className="form-group">
                <label className="form-label">Select Customer</label>
                <select className="form-input" value={selectedCustomerId} onChange={e => setSelectedCustomerId(Number(e.target.value))}>
                  <option value="">-- Select Customer --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.customerName} {c.businessName ? `(${c.businessName})` : ''}</option>
                  ))}
                </select>
              </div>

              <div className="card mb-4 mt-4 bg-slate-50" style={{backgroundColor: '#f8fafc'}}>
                <h4 className="mb-2 text-sm font-semibold text-muted">Add Products</h4>
                <div className="flex items-end gap-4">
                  <div className="form-group flex-1 mb-0">
                    <select className="form-input" value={selectedProductId} onChange={e => setSelectedProductId(Number(e.target.value))}>
                      <option value="">-- Select Product --</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} - Stock: {p.currentStock} - ₹{p.unitPrice}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group mb-0" style={{width: '100px'}}>
                    <input type="number" min="1" className="form-input" value={quantity} onChange={e => setQuantity(Number(e.target.value))} />
                  </div>
                  <button type="button" className="btn btn-primary mb-0" onClick={addItem}>Add</button>
                </div>
              </div>

              {items.length > 0 && (
                <div className="table-container mb-4">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Avail. Stock</th>
                        <th>Req. Quantity</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, idx) => (
                        <tr key={idx}>
                          <td>{item.product.name}</td>
                          <td>{item.product.currentStock}</td>
                          <td className={item.quantity > item.product.currentStock ? 'text-danger font-semibold' : ''}>
                            {item.quantity}
                          </td>
                          <td>
                            <button className="text-danger" style={{background: 'none', border: 'none', cursor: 'pointer'}} 
                              onClick={() => setItems(items.filter((_, i) => i !== idx))}>Remove</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex justify-between gap-4 mt-4 pt-4" style={{borderTop: '1px solid var(--border-color)'}}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Close</button>
              <button type="button" className="btn btn-warning" style={{backgroundColor: '#f59e0b', color: 'white'}} onClick={handleSaveDraft}>
                Save as Draft
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Challans;

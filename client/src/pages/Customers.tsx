import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Customer } from '../types';
import { Plus, Search, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { user } = useAuth();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    customerName: '', mobile: '', email: '', businessName: '', customerType: 'RETAIL', status: 'LEAD'
  });

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/customers?search=${search}`);
      setCustomers(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/customers', newCustomer);
      setShowAddModal(false);
      fetchCustomers();
      alert('Customer added successfully.');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add customer');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2>Customers</h2>
        {(user?.role === 'ADMIN' || user?.role === 'SALES') && (
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> Add Customer
          </button>
        )}
      </div>

      <div className="card mb-4">
        <div className="flex items-center gap-2">
          <Search size={20} className="text-muted" />
          <input 
            type="text" 
            placeholder="Search customers..." 
            className="form-input" 
            style={{ maxWidth: '300px' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div>Loading customers...</div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Business</th>
                  <th>Mobile</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(c => (
                  <tr key={c.id}>
                    <td className="font-semibold">{c.customerName}</td>
                    <td>{c.businessName || '-'}</td>
                    <td>{c.mobile}</td>
                    <td><span className="badge badge-neutral">{c.customerType}</span></td>
                    <td>
                      <span className={`badge ${c.status === 'ACTIVE' ? 'badge-success' : c.status === 'LEAD' ? 'badge-info' : 'badge-danger'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-secondary" style={{padding: '0.25rem 0.5rem'}}>
                        <Eye size={16} /> View
                      </button>
                    </td>
                  </tr>
                ))}
                {customers.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-8">No customers found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAddModal && (
        <div style={{position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50}}>
          <div className="card" style={{width: '100%', maxWidth: '500px'}}>
            <h3 className="mb-4">Add Customer</h3>
            <form onSubmit={handleAdd}>
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input required className="form-input" value={newCustomer.customerName} onChange={e => setNewCustomer({...newCustomer, customerName: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Mobile *</label>
                <input required className="form-input" value={newCustomer.mobile} onChange={e => setNewCustomer({...newCustomer, mobile: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Business Name</label>
                <input className="form-input" value={newCustomer.businessName} onChange={e => setNewCustomer({...newCustomer, businessName: e.target.value})} />
              </div>
              <div className="flex justify-between gap-4 mt-4">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Customer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;

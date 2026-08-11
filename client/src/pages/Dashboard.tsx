import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Customer, Product, Challan } from '../types';

const Dashboard: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [challans, setChallans] = useState<Challan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customersRes, productsRes, challansRes] = await Promise.all([
          api.get('/customers?limit=1000'),
          api.get('/products?limit=1000'),
          api.get('/challans?limit=1000')
        ]);
        setCustomers(customersRes.data.data);
        setProducts(productsRes.data.data);
        setChallans(challansRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;

  const activeCustomers = customers.filter(c => c.status === 'ACTIVE').length;
  const lowStockProducts = products.filter(p => p.currentStock > 0 && p.currentStock <= p.minimumStock);
  const outOfStockProducts = products.filter(p => p.currentStock === 0);
  const confirmedChallans = challans.filter(c => c.status === 'CONFIRMED').length;

  return (
    <div>
      <h2 className="mb-4">Dashboard</h2>
      
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-title">Total Customers</div>
          <div className="stat-value">{customers.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Active Customers</div>
          <div className="stat-value">{activeCustomers}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Total Products</div>
          <div className="stat-value">{products.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Confirmed Challans</div>
          <div className="stat-value">{confirmedChallans}</div>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="card w-full">
          <h3 className="mb-4 text-warning">Low Stock Products ({lowStockProducts.length})</h3>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Stock</th>
                  <th>Minimum</th>
                </tr>
              </thead>
              <tbody>
                {lowStockProducts.slice(0, 5).map(p => (
                  <tr key={p.id}>
                    <td>{p.name} <span className="text-muted" style={{fontSize: '0.8rem'}}>({p.sku})</span></td>
                    <td className="text-warning font-semibold">{p.currentStock}</td>
                    <td>{p.minimumStock}</td>
                  </tr>
                ))}
                {lowStockProducts.length === 0 && (
                  <tr><td colSpan={3} className="text-center">No low stock products</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card w-full">
          <h3 className="mb-4 text-danger">Out of Stock ({outOfStockProducts.length})</h3>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                </tr>
              </thead>
              <tbody>
                {outOfStockProducts.slice(0, 5).map(p => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.sku}</td>
                  </tr>
                ))}
                {outOfStockProducts.length === 0 && (
                  <tr><td colSpan={2} className="text-center">No out of stock products</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

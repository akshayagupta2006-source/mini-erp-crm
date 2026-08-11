import React from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, Package, FileText, LogOut } from 'lucide-react';

const AppLayout: React.FC = () => {
  const { user, logout, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <div>Loading...</div>;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] },
    { name: 'Customers', path: '/customers', icon: Users, roles: ['ADMIN', 'SALES', 'ACCOUNTS'] },
    { name: 'Inventory', path: '/inventory', icon: Package, roles: ['ADMIN', 'WAREHOUSE', 'ACCOUNTS', 'SALES'] },
    { name: 'Challans', path: '/challans', icon: FileText, roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] },
  ];

  const allowedNavItems = navItems.filter(item => item.roles.includes(user.role));

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          ERP Portal
        </div>
        <nav className="sidebar-nav">
          {allowedNavItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            
            return (
              <Link 
                key={item.name} 
                to={item.path} 
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={20} />
                {item.name}
              </Link>
            )
          })}
        </nav>
        <div className="sidebar-footer">
          <div className="mb-4">
            <div className="font-semibold">{user.name}</div>
            <div className="text-muted" style={{ fontSize: '0.8rem' }}>{user.role}</div>
          </div>
          <button onClick={logout} className="btn btn-secondary w-full">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <span className="badge badge-info">{user.role}</span>
          </div>
        </header>
        <div className="page-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;

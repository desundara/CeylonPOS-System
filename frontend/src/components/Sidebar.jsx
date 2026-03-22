import React from 'react';
import {
  LayoutDashboard, ShoppingCart, Package, Users, Truck,
  BarChart3, Settings, X, LogOut, AlertTriangle, Star,
  CreditCard, Sun, Moon
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'pos', label: 'Point of Sale', icon: ShoppingCart },
  { id: 'cashier', label: 'Cashier System', icon: CreditCard },
  { id: 'inventory', label: 'Inventory', icon: Package },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'loyalty', label: 'Loyalty Points', icon: Star },
  { id: 'suppliers', label: 'Suppliers', icon: Truck },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const { activePage, setActivePage, sidebarOpen, setSidebarOpen, lowStockProducts, cartCount, cashierSession, logoutCashier } = useApp();
  const { isDark, toggleTheme } = useTheme();

  const handleNav = (id) => {
    setActivePage(id);
    setSidebarOpen(false);
  };

  return (
    <>
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/70 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`
        fixed top-0 left-0 h-full z-50 w-64 flex flex-col
        transition-transform duration-300
        md:relative md:translate-x-0 md:z-auto
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `} style={{ background: 'var(--sidebar-bg)', borderRight: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>

        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center flex-shrink-0 w-9 h-9 rounded-xl"
              style={{ background: 'linear-gradient(135deg, #1565C0, #42A5F5)' }}>
              <span className="font-mono text-xs font-bold" style={{ color: '#ffffff' }}>CP</span>
            </div>
            <div className="min-w-0">
              <div
                className="leading-none tracking-widest"
                style={{
                  fontSize: '1.1rem',
                  fontFamily: '"Bebas Neue", cursive',
                  color: 'var(--text-primary)',   /* ✅ theme-aware, not hardcoded white */
                  letterSpacing: '0.08em',
                }}>
                CEYLON <span style={{ color: '#42A5F5' }}>POS</span>
              </div>
              <div style={{ fontSize: '0.6rem', lineHeight: 1.2, color: 'var(--text-muted)' }}>
                Software Solutions (Pvt) Ltd
              </div>
            </div>
          </div>
          <button className="md:hidden" style={{ color: 'var(--text-muted)' }} onClick={() => setSidebarOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* Cashier session badge */}
        {cashierSession && (
          <div className="flex items-center gap-2 px-3 py-2 mx-3 mt-3 rounded-xl"
            style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)' }}>
            <div className="flex items-center justify-center flex-shrink-0 w-6 h-6 text-xs font-bold rounded-lg"
              style={{ background: 'rgba(52,211,153,0.25)', color: '#34d399' }}>
              {cashierSession.avatar || cashierSession.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate" style={{ color: '#34d399' }}>{cashierSession.name}</p>
              <p className="truncate" style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>
                Since {cashierSession.loginTime}
              </p>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0"></div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => handleNav(id)}
              className={`nav-item w-full text-left ${activePage === id ? 'active' : ''}`}>
              <Icon size={17} />
              <span className="flex-1 text-sm">{label}</span>
              {id === 'pos' && cartCount > 0 && (
                <span className="flex items-center justify-center w-5 h-5 font-mono text-xs rounded-full"
                  style={{ background: '#1565C0', color: '#fff' }}>
                  {cartCount}
                </span>
              )}
              {id === 'inventory' && lowStockProducts.length > 0 && (
                <span className="text-xs rounded-full px-1.5 py-0.5"
                  style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.3)' }}>
                  {lowStockProducts.length}
                </span>
              )}
              {id === 'loyalty' && (
                <span style={{ color: '#fbbf24', fontSize: '0.7rem' }}>⭐</span>
              )}
            </button>
          ))}
        </nav>

        {/* Low stock alert */}
        {lowStockProducts.length > 0 && (
          <div className="p-3 mx-3 mb-3 rounded-xl"
            style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}>
            <div className="flex items-center gap-2 text-xs font-medium mb-0.5" style={{ color: '#fbbf24' }}>
              <AlertTriangle size={12} /> Low Stock Alert
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {lowStockProducts.length} products need restocking
            </p>
          </div>
        )}

        {/* Bottom controls */}
        <div className="px-4 py-4 space-y-3 border-t" style={{ borderColor: 'var(--border-color)' }}>

          {/* Theme toggle */}
          <button onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all"
            style={{
              background: 'var(--input-bg)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
            }}>
            {isDark
              ? <Sun size={15} style={{ color: '#fbbf24' }} />
              : <Moon size={15} style={{ color: '#1565C0' }} />}
            <span style={{ color: 'var(--text-secondary)' }}>
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </span>
          </button>

          {/* User info */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 text-sm font-bold rounded-full"
              style={{ background: 'linear-gradient(135deg,#1565C0,#42A5F5)', color: '#ffffff' }}>
              A
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>Admin User</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Store Manager</div>
            </div>
            {cashierSession && (
              <button onClick={logoutCashier}
                style={{ color: '#f87171' }}
                onMouseEnter={e => e.currentTarget.style.color = '#fca5a5'}
                onMouseLeave={e => e.currentTarget.style.color = '#f87171'}
                title="End cashier session">
                <LogOut size={15} />
              </button>
            )}
          </div>

        </div>
      </aside>
    </>
  );
}
import React from 'react';
import { Menu, Bell, Search } from 'lucide-react';
import { useApp } from '../context/AppContext';

const pageTitles = {
  dashboard: 'Dashboard',
  pos: 'Point of Sale',
  cashier: 'Cashier System',
  inventory: 'Inventory',
  customers: 'Customers',
  loyalty: 'Loyalty Points',
  suppliers: 'Suppliers',
  reports: 'Reports & Analytics',
  settings: 'Settings',
};

export default function Header() {
  const { setSidebarOpen, activePage, lowStockProducts, notification, cashierSession } = useApp();
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-LK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <>
      {notification && (
        <div className={`fixed top-4 right-4 z-[100] px-5 py-3 rounded-xl text-sm font-medium animate-slide-up shadow-2xl
          ${notification.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          {notification.msg}
        </div>
      )}

      <header className="flex items-center justify-between px-4 md:px-6 py-3.5 border-b"
        style={{ borderColor: 'var(--border-color)', background: 'var(--header-bg)', backdropFilter: 'blur(12px)' }}>
        <div className="flex items-center gap-4">
          <button className="md:hidden" style={{ color: 'var(--text-muted)' }} onClick={() => setSidebarOpen(true)}>
            <Menu size={22} />
          </button>
          <div>
            <h1 className="page-title text-2xl md:text-3xl" style={{ color: 'var(--text-primary)', fontFamily: '"Bebas Neue", cursive', letterSpacing: '0.05em' }}>
              {pageTitles[activePage]}
            </h1>
            <p className="text-xs hidden md:block" style={{ color: 'var(--text-muted)' }}>{dateStr}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <button className="hidden md:flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors"
            style={{ background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
            <Search size={14} />
            <span className="hidden lg:block">Quick search...</span>
            <span className="text-xs font-mono px-1.5 py-0.5 rounded" style={{ background: 'rgba(21,101,192,0.15)' }}>⌘K</span>
          </button>

          <button className="relative p-2 rounded-lg transition-colors" style={{ color: 'var(--text-muted)' }}>
            <Bell size={18} />
            {lowStockProducts.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-amber-400 rounded-full"></span>
            )}
          </button>

          {cashierSession ? (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg"
              style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)' }}>
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-emerald-400">{cashierSession.name}</span>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--border-color)' }}>
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Online</span>
            </div>
          )}
        </div>
      </header>
    </>
  );
}

import React, { useEffect, useMemo, useState } from 'react';
import { Menu, Bell, Search, CheckCheck, X } from 'lucide-react';
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
  const {
    setSidebarOpen,
    activePage,
    lowStockProducts,
    notification,
    removeToast,
    notifications,
    unreadNotifications,
    markNotificationsRead,
    cashierSession,
    setActivePage,
    products,
    customers,
    suppliers,
  } = useApp();
  const [quickSearchOpen, setQuickSearchOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [quickSearch, setQuickSearch] = useState('');
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-LK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setQuickSearchOpen(true);
      }
      if (event.key === 'Escape') {
        setQuickSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!quickSearchOpen) {
      setQuickSearch('');
    }
  }, [quickSearchOpen]);

  const query = quickSearch.trim().toLowerCase();
  const quickResults = useMemo(() => {
    const pageResults = Object.entries(pageTitles).map(([id, label]) => ({
      id: `page-${id}`,
      label,
      meta: 'Page',
      onSelect: () => setActivePage(id),
    }));

    const productResults = products.slice(0, 6).map((product) => ({
      id: `product-${product.id}`,
      label: product.name,
      meta: `Product • ${product.sku}`,
      onSelect: () => setActivePage('inventory'),
    }));

    const customerResults = customers.slice(0, 6).map((customer) => ({
      id: `customer-${customer.id}`,
      label: customer.name,
      meta: `Customer • ${customer.phone}`,
      onSelect: () => setActivePage('customers'),
    }));

    const supplierResults = suppliers.slice(0, 6).map((supplier) => ({
      id: `supplier-${supplier.id}`,
      label: supplier.name,
      meta: `Supplier • ${supplier.phone || supplier.contact || 'No contact'}`,
      onSelect: () => setActivePage('suppliers'),
    }));

    return [...pageResults, ...productResults, ...customerResults, ...supplierResults]
      .filter((item) => !query || `${item.label} ${item.meta}`.toLowerCase().includes(query))
      .slice(0, 8);
  }, [customers, products, query, setActivePage, suppliers]);

  const handleQuickSelect = (item) => {
    item.onSelect();
    setQuickSearchOpen(false);
  };

  const handleBellClick = () => {
    setNotificationOpen((prev) => !prev);
    if (unreadNotifications.length > 0) {
      markNotificationsRead(unreadNotifications.map((item) => item.id));
    }
  };

  const getToastStyles = (type) => {
    if (type === 'error') return 'bg-red-600 text-white';
    if (type === 'warning') return 'bg-amber-500 text-slate-950';
    if (type === 'info') return 'bg-blue-600 text-white';
    return 'bg-emerald-600 text-white';
  };

  return (
    <>
      <div className="fixed top-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2 px-4 md:px-0">
        {notification.map((item) => (
          <div key={item.id} className={`rounded-xl px-4 py-3 text-sm font-medium shadow-2xl animate-slide-up ${getToastStyles(item.type)}`}>
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <div className="text-xs uppercase tracking-wide opacity-80">{item.title}</div>
                <div>{item.msg}</div>
              </div>
              <button onClick={() => removeToast(item.id)} className="opacity-80 hover:opacity-100">
                <X size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

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
          <button
            className="hidden md:flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors"
            style={{ background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}
            onClick={() => setQuickSearchOpen(true)}
          >
            <Search size={14} />
            <span className="hidden lg:block">Quick search...</span>
            <span className="text-xs font-mono px-1.5 py-0.5 rounded" style={{ background: 'rgba(21,101,192,0.15)' }}>Ctrl K</span>
          </button>

          <button className="relative p-2 rounded-lg transition-colors" style={{ color: 'var(--text-muted)' }} onClick={handleBellClick}>
            <Bell size={18} />
            {unreadNotifications.length > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[1.1rem] rounded-full bg-amber-400 px-1 text-center text-[10px] font-bold text-slate-950">
                {Math.min(unreadNotifications.length, 9)}
              </span>
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

      {notificationOpen && (
        <div className="fixed right-4 top-20 z-[110] w-[22rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl glass shadow-2xl"
          style={{ border: '1px solid var(--border-color)' }}>
          <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: 'var(--border-color)' }}>
            <div>
              <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Notifications</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {unreadNotifications.length} unread
              </div>
            </div>
            <button
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs"
              style={{ color: 'var(--text-muted)', background: 'var(--input-bg)' }}
              onClick={() => markNotificationsRead()}
            >
              <CheckCheck size={13} />
              Mark all read
            </button>
          </div>

          <div className="max-h-[24rem] overflow-y-auto">
            {notifications.length > 0 ? notifications.map((item) => (
              <div
                key={item.id}
                className="border-b px-4 py-3"
                style={{
                  borderColor: 'var(--border-color)',
                  background: item.read ? 'transparent' : 'rgba(21,101,192,0.08)',
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.title}</div>
                    <div className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>{item.msg}</div>
                    <div className="mt-1 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                      {new Date(item.createdAt).toLocaleString('en-LK')}
                    </div>
                  </div>
                  {!item.read && <span className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-400"></span>}
                </div>
              </div>
            )) : (
              <div className="px-4 py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                No notifications yet.
              </div>
            )}
          </div>

          {lowStockProducts.length > 0 && (
            <div className="border-t px-4 py-3 text-xs" style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}>
              {lowStockProducts.length} low stock item{lowStockProducts.length > 1 ? 's' : ''} need attention.
            </div>
          )}
        </div>
      )}

      {quickSearchOpen && (
        <div className="fixed inset-0 z-[120] flex items-start justify-center p-4 pt-20 bg-black/70" onClick={() => setQuickSearchOpen(false)}>
          <div
            className="w-full max-w-xl overflow-hidden glass rounded-2xl animate-slide-up"
            style={{ border: '1px solid var(--border-color)' }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
              <Search size={16} style={{ color: 'var(--text-muted)' }} />
              <input
                autoFocus
                value={quickSearch}
                onChange={(event) => setQuickSearch(event.target.value)}
                placeholder="Search pages, products, customers, suppliers..."
                className="w-full bg-transparent outline-none"
                style={{ color: 'var(--text-primary)' }}
              />
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-2">
              {quickResults.length > 0 ? quickResults.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleQuickSelect(item)}
                  className="w-full rounded-xl px-3 py-3 text-left transition-colors"
                  style={{ color: 'var(--text-primary)' }}
                  onMouseEnter={(event) => { event.currentTarget.style.background = 'var(--input-bg)'; }}
                  onMouseLeave={(event) => { event.currentTarget.style.background = 'transparent'; }}
                >
                  <div className="text-sm font-medium">{item.label}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{item.meta}</div>
                </button>
              )) : (
                <div className="px-3 py-6 text-sm text-center" style={{ color: 'var(--text-muted)' }}>
                  No matches found.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

import React, { createContext, useContext, useState } from 'react';
import { products as defaultProducts, customers as defaultCustomers, suppliers, recentSales } from '../data/mockData';

const AppContext = createContext();

const load = (key, fallback) => {
  try {
    const s = localStorage.getItem(key);
    return s ? JSON.parse(s) : fallback;
  } catch { return fallback; }
};

const save = (key, val) => {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
};

export function AppProvider({ children }) {
  const [products, setProductsRaw]   = useState(() => load('sm_products', defaultProducts));
  const [customers, setCustomersRaw] = useState(() => load('sm_customers', defaultCustomers));
  const [transactions, setTransRaw]  = useState(() => load('sm_transactions', recentSales));

  const [cart, setCart]                     = useState([]);
  const [activePage, setActivePage]         = useState('dashboard');
  const [sidebarOpen, setSidebarOpen]       = useState(false);
  const [notification, setNotification]     = useState(null);
  const [cashierSession, setCashierSession] = useState(null);

  const setProducts  = (v) => { const n = typeof v === 'function' ? v(products)      : v; save('sm_products',      n); setProductsRaw(n);  };
  const setCustomers = (v) => { const n = typeof v === 'function' ? v(customers)     : v; save('sm_customers',     n); setCustomersRaw(n); };
  const setTrans     = (v) => { const n = typeof v === 'function' ? v(transactions)  : v; save('sm_transactions',  n); setTransRaw(n);     };

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const addToCart = (product) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === product.id);
      if (ex) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
  };
  const removeFromCart = (id)      => setCart(prev => prev.filter(i => i.id !== id));
  const updateCartQty  = (id, qty) => {
    if (qty <= 0) { removeFromCart(id); return; }
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty } : i));
  };
  const clearCart = () => setCart([]);

  const cartTotal        = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount        = cart.reduce((s, i) => s + i.qty, 0);
  const lowStockProducts = products.filter(p => p.stock <= p.minStock);

  const POINTS_PER_RUPEE = 0.01;
  const POINTS_VALUE     = 0.5;

  const addLoyaltyPoints = (customerId, total) => {
    const earned = Math.floor(total * POINTS_PER_RUPEE);
    setCustomers(prev => prev.map(c =>
      c.id === customerId
        ? { ...c, loyaltyPoints: c.loyaltyPoints + earned, totalSpent: c.totalSpent + total }
        : c
    ));
    return earned;
  };

  const redeemPoints = (customerId, points) => {
    setCustomers(prev => prev.map(c =>
      c.id === customerId ? { ...c, loyaltyPoints: Math.max(0, c.loyaltyPoints - points) } : c
    ));
    return Math.floor(points * POINTS_VALUE);
  };

  const loginCashier  = (cashier) => {
    setCashierSession({ ...cashier, loginTime: new Date().toLocaleTimeString() });
    showNotification('Welcome, ' + cashier.name + '!');
  };
  const logoutCashier = () => {
    setCashierSession(null);
    clearCart();
    showNotification('Cashier session ended');
  };

  const completeSale = (saleData) => {
    const invoiceNum = String(transactions.length + 900).padStart(4, '0');
    const newTx = {
      id:       'INV-2025-' + invoiceNum,
      customer: saleData.customerName || 'Walk-in Customer',
      items:    cart.length,
      total:    saleData.total,
      payment:  saleData.payment,
      time:     new Date().toLocaleTimeString('en-LK', { hour: '2-digit', minute: '2-digit' }),
      date:     new Date().toLocaleDateString('en-LK'),
      status:   'Completed',
      cashier:  cashierSession ? cashierSession.name : 'Admin',
    };

    setTrans(prev => [newTx, ...prev]);

    setProducts(prev => prev.map(p => {
      const item = cart.find(i => i.id === p.id);
      return item ? { ...p, stock: Math.max(0, p.stock - item.qty) } : p;
    }));

    if (saleData.customerId) {
      addLoyaltyPoints(saleData.customerId, saleData.total);
    }

    if (saleData.customerId && saleData.redeemPoints > 0) {
      setCustomers(prev => prev.map(c =>
        c.id === saleData.customerId
          ? { ...c, loyaltyPoints: Math.max(0, c.loyaltyPoints - saleData.redeemPoints) }
          : c
      ));
    }

    clearCart();
    return newTx;
  };

  return (
    <AppContext.Provider value={{
      products, setProducts,
      customers, setCustomers,
      suppliers,
      transactions,
      cart, addToCart, removeFromCart, updateCartQty, clearCart,
      cartTotal, cartCount,
      activePage, setActivePage,
      sidebarOpen, setSidebarOpen,
      lowStockProducts,
      notification, showNotification,
      cashierSession, loginCashier, logoutCashier,
      completeSale,
      addLoyaltyPoints, redeemPoints,
      POINTS_PER_RUPEE, POINTS_VALUE,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
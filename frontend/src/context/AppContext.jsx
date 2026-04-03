import React, { createContext, useContext, useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { products as defaultProducts, customers as defaultCustomers, suppliers as defaultSuppliers, recentSales, categories as defaultCategories, salesData as defaultSalesData, monthlyData as defaultMonthlyData, topProducts as defaultTopProducts } from '../data/mockData';
import { productService } from '../api/productService';
import { customerService } from '../api/customerService';
import { saleService } from '../api/saleService';
import { supplierService } from '../api/supplierService';
import { settingsService } from '../api/settingsService';

const AppContext = createContext();
const API_ORIGIN = 'http://localhost:8000';
const defaultAppSettings = {
  store_name: 'CeylonPOS Demo Shop',
  store_address: 'No 12, Galle Road, Colombo 03',
  store_phone: '0112345678',
  store_email: 'info@ceylonpos.lk',
  tax_rate: 8,
  currency: 'LKR',
  notify_low_stock: true,
  notify_daily_report: true,
  notify_sms: false,
  notify_email: true,
  notify_sound: true,
  two_factor_enabled: false,
  receipt_header: 'CeylonPOS Demo Shop',
  receipt_footer: 'Thank you for shopping with us!',
  printer_name: 'Default Printer',
  print_logo_on_receipt: true,
  auto_print_after_sale: true,
  print_barcode_on_receipt: true,
  date_format: 'DD/MM/YYYY',
  time_format: '12-hour (AM/PM)',
  language: 'English',
};

export function AppProvider({ children }) {
  const [products, setProductsRaw] = useState([]);
  const [customers, setCustomersRaw] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [transactions, setTransRaw] = useState([]);
  const [categories, setCategories] = useState([]);
  const [dailyMetrics, setDailyMetrics] = useState([]);
  const [monthlyMetrics, setMonthlyMetrics] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [appSettings, setAppSettings] = useState(defaultAppSettings);

  const [cart, setCart] = useState([]);
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notification, setNotification] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [cashierSession, setCashierSession] = useState(null);

  const [loading, setLoading] = useState(true);
  const notificationIdRef = useRef(0);
  const notificationTimersRef = useRef(new Map());
  const audioContextRef = useRef(null);

  const normalizeMediaUrl = (value) => {
    if (!value) return null;
    if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:')) {
      return value;
    }
    if (value.startsWith('/')) {
      return `${API_ORIGIN}${value}`;
    }
    return `${API_ORIGIN}/${value}`;
  };

  // Mapping helpers
  const mapProduct = (p) => ({
    ...p,
    minStock: p.min_stock,
    supplier: p.supplier_name,
    image: normalizeMediaUrl(p.image),
  });

  const mapCustomer = (c) => ({
    ...c,
    loyaltyPoints: c.loyalty_points,
    totalSpent: parseFloat(c.total_spent),
    joinDate: c.join_date,
  });

  const mapSupplier = (s) => ({
    ...s,
    contact: s.contact_person,
  });

  const mapSale = (s) => ({
    id: s.invoice_number,
    customer: s.customer_name || 'Walk-in Customer',
    items: s.items ? s.items.length : 0,
    total: parseFloat(s.total_amount),
    payment: s.payment_method,
    time: new Date(s.date_time).toLocaleTimeString('en-LK', { hour: '2-digit', minute: '2-digit' }),
    date: new Date(s.date_time).toLocaleDateString('en-LK'),
    status: s.status,
    cashier: s.cashier_name || 'Admin',
  });

  // Fetch initial data from backend
  const refreshData = async () => {
    try {
      setLoading(true);
      const results = await Promise.allSettled([
        productService.getAll(),
        customerService.getAll(),
        supplierService.getAll(),
        saleService.getAll(),
        productService.getCategories(),
        saleService.getDailyMetrics(),
        saleService.getMonthlyMetrics(),
        saleService.getTopProducts(),
        settingsService.get(),
      ]);

      const [
        productsResult,
        customersResult,
        suppliersResult,
        transactionsResult,
        categoriesResult,
        dailyMetricsResult,
        monthlyMetricsResult,
        topProductsResult,
        settingsResult,
      ] = results;

      if (productsResult.status === 'fulfilled') {
        setProductsRaw(productsResult.value.map(mapProduct));
      } else {
        console.error('Failed to fetch products:', productsResult.reason);
        setProductsRaw(defaultProducts);
      }

      if (customersResult.status === 'fulfilled') {
        setCustomersRaw(customersResult.value.map(mapCustomer));
      } else {
        console.error('Failed to fetch customers:', customersResult.reason);
        setCustomersRaw(defaultCustomers);
      }

      if (suppliersResult.status === 'fulfilled') {
        setSuppliers(suppliersResult.value.map(mapSupplier));
      } else {
        console.error('Failed to fetch suppliers:', suppliersResult.reason);
        setSuppliers(defaultSuppliers);
      }

      if (transactionsResult.status === 'fulfilled') {
        setTransRaw(transactionsResult.value.map(mapSale));
      } else {
        console.error('Failed to fetch sales:', transactionsResult.reason);
        setTransRaw(recentSales);
      }

      if (categoriesResult.status === 'fulfilled') {
        setCategories(categoriesResult.value);
      } else {
        console.error('Failed to fetch categories:', categoriesResult.reason);
        setCategories(defaultCategories.filter(c => c !== 'All').map((c, i) => ({ id: i, name: c })));
      }

      if (dailyMetricsResult.status === 'fulfilled') {
        setDailyMetrics(dailyMetricsResult.value);
      } else {
        console.error('Failed to fetch daily metrics:', dailyMetricsResult.reason);
        setDailyMetrics(defaultSalesData);
      }

      if (monthlyMetricsResult.status === 'fulfilled') {
        setMonthlyMetrics(monthlyMetricsResult.value);
      } else {
        console.error('Failed to fetch monthly metrics:', monthlyMetricsResult.reason);
        setMonthlyMetrics(defaultMonthlyData);
      }

      if (topProductsResult.status === 'fulfilled') {
        setTopProducts(topProductsResult.value);
      } else {
        console.error('Failed to fetch top products:', topProductsResult.reason);
        setTopProducts(defaultTopProducts);
      }

      if (settingsResult.status === 'fulfilled') {
        setAppSettings(settingsResult.value);
      } else {
        console.error('Failed to fetch settings:', settingsResult.reason);
        setAppSettings(defaultAppSettings);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const removeToast = useCallback((id) => {
    setNotification((prev) => prev.filter((item) => item.id !== id));
    const timer = notificationTimersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      notificationTimersRef.current.delete(id);
    }
  }, []);

  const markNotificationsRead = useCallback((ids = null) => {
    setNotifications((prev) => prev.map((item) => (
      !ids || ids.includes(item.id) ? { ...item, read: true } : item
    )));
  }, []);

  const pushSystemNotification = useCallback((entry) => {
    setNotifications((prev) => {
      const existing = prev.find((item) => item.key && item.key === entry.key);
      if (existing) {
        const nextCreatedAt = entry.createdAt || existing.createdAt;
        const hasChanges = (
          existing.type !== (entry.type || 'info') ||
          existing.title !== entry.title ||
          existing.msg !== entry.msg ||
          existing.read !== false ||
          existing.createdAt !== nextCreatedAt
        );

        if (!hasChanges) {
          return prev;
        }

        return prev.map((item) => item.id === existing.id ? {
          ...item,
          ...entry,
          id: existing.id,
          read: false,
          createdAt: nextCreatedAt,
        } : item);
      }

      const nextId = ++notificationIdRef.current;
      return [{
        id: nextId,
        type: entry.type || 'info',
        title: entry.title,
        msg: entry.msg,
        createdAt: entry.createdAt || new Date().toISOString(),
        read: false,
        system: true,
        key: entry.key,
      }, ...prev].slice(0, 30);
    });
  }, []);

  const showNotification = useCallback((msg, type = 'success', options = {}) => {
    const id = ++notificationIdRef.current;
    const entry = {
      id,
      msg,
      type,
      title: options.title || (type === 'error' ? 'Error' : type === 'warning' ? 'Warning' : 'Notification'),
      createdAt: new Date().toISOString(),
      read: false,
      system: !!options.system,
      key: options.key || null,
    };

    setNotifications((prev) => [entry, ...prev].slice(0, 30));
    setNotification((prev) => [...prev, entry].slice(-3));

    if (appSettings.notify_sound && typeof window !== 'undefined') {
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          if (!audioContextRef.current) {
            audioContextRef.current = new AudioContextClass();
          }

          const context = audioContextRef.current;
          if (context.state === 'suspended') {
            context.resume().catch(() => {});
          }

          const oscillator = context.createOscillator();
          const gain = context.createGain();
          const now = context.currentTime;
          const frequency = type === 'error' ? 280 : type === 'warning' ? 520 : 760;

          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(frequency, now);
          gain.gain.setValueAtTime(0.0001, now);
          gain.gain.exponentialRampToValueAtTime(0.12, now + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

          oscillator.connect(gain);
          gain.connect(context.destination);
          oscillator.start(now);
          oscillator.stop(now + 0.18);
        }
      } catch (error) {
        console.debug('Notification sound unavailable:', error);
      }
    }

    if (options.persistent) {
      return id;
    }

    const timeoutMs = options.timeoutMs ?? 3000;
    const timer = setTimeout(() => removeToast(id), timeoutMs);
    notificationTimersRef.current.set(id, timer);
    return id;
  }, [appSettings.notify_sound, removeToast]);

  const addToCart = (product) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === product.id);
      if (ex) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
  };
  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id));
  const updateCartQty = (id, qty) => {
    if (qty <= 0) { removeFromCart(id); return; }
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty } : i));
  };
  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((s, i) => s + parseFloat(i.price) * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const lowStockProducts = useMemo(
    () => products.filter((p) => p.stock <= p.minStock),
    [products]
  );
  const unreadNotifications = useMemo(
    () => notifications.filter((item) => !item.read),
    [notifications]
  );
  const lowStockSummary = useMemo(() => {
    const count = lowStockProducts.length;
    const topNames = lowStockProducts.slice(0, 3).map((product) => product.name).join(', ');
    return { count, topNames };
  }, [lowStockProducts]);
  const todaySummary = useMemo(() => {
    const today = new Date().toLocaleDateString('en-LK');
    const todaySales = transactions.filter((item) => item.date === today);
    const totalRevenue = todaySales.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);

    return {
      count: todaySales.length,
      totalRevenue,
    };
  }, [transactions]);

  const POINTS_PER_RUPEE = 0.01;
  const POINTS_VALUE = 0.5;
  const MIN_REDEEM_POINTS = 100;

  useEffect(() => {
    return () => {
      notificationTimersRef.current.forEach((timer) => clearTimeout(timer));
      notificationTimersRef.current.clear();
      if (audioContextRef.current?.state !== 'closed') {
        audioContextRef.current?.close().catch(() => {});
      }
    };
  }, []);

  useEffect(() => {
    if (!appSettings.notify_low_stock) return;
    if (loading) return;
    if (lowStockSummary.count === 0) return;

    pushSystemNotification({
      key: 'low-stock-alert',
      type: 'warning',
      title: 'Low stock alert',
      msg: `${lowStockSummary.count} product${lowStockSummary.count > 1 ? 's are' : ' is'} below minimum stock${lowStockSummary.topNames ? `: ${lowStockSummary.topNames}` : ''}`,
    });
  }, [appSettings.notify_low_stock, loading, lowStockSummary, pushSystemNotification]);

  useEffect(() => {
    if (!appSettings.notify_daily_report) return;
    if (loading) return;
    if (!todaySummary.count) return;

    pushSystemNotification({
      key: 'daily-report-summary',
      type: 'info',
      title: 'Today summary',
      msg: `${todaySummary.count} sales today totaling Rs. ${todaySummary.totalRevenue.toLocaleString()}`,
    });
  }, [appSettings.notify_daily_report, loading, todaySummary, pushSystemNotification]);

  const loginCashier = (cashier) => {
    setCashierSession({ ...cashier, loginTime: new Date().toLocaleTimeString() });
    showNotification('Welcome, ' + cashier.name + '!');
  };
  const logoutCashier = () => {
    setCashierSession(null);
    clearCart();
    showNotification('Cashier session ended');
  };

  // State setters that sync with backend
  const setProducts = async (action) => {
    // For now, we assume direct manipulation is still needed for some local state tricks, 
    // but we should primarily rely on refreshData() after API calls.
    if (typeof action === 'function') {
        const next = action(products);
        setProductsRaw(next);
    } else {
        setProductsRaw(action);
    }
  };

  const setCustomers = async (action) => {
    if (typeof action === 'function') {
        const next = action(customers);
        setCustomersRaw(next);
    } else {
        setCustomersRaw(action);
    }
  };

  const completeSale = async (saleData) => {
    try {
      if (!cashierSession?.id) {
        showNotification('Cashier login is required before checkout', 'error');
        setActivePage('cashier');
        throw new Error('Cashier login is required before checkout');
      }

      const payload = {
        items: cart.map(item => ({ id: item.id, qty: item.qty })),
        customer_id: saleData.customerId,
        redeem_points: saleData.redeemPoints || 0,
        discount_amount: saleData.discountAmount || 0,
        payment_method: saleData.payment || 'Cash',
        cashier_id: cashierSession.id,
        cashier_name: cashierSession.name,
      };

      const result = await saleService.create(payload);
      const newTx = mapSale(result);

      await refreshData(); // Sync everything
      clearCart();
      return newTx;
    } catch (error) {
      console.error('Sale completion failed:', error);
      showNotification('Sale failed: ' + error.message, 'error');
      throw error;
    }
  };

  return (
    <AppContext.Provider value={{
      products, setProducts,
      categories,
      appSettings, setAppSettings,
      dailyMetrics, monthlyMetrics, topProducts,
      customers, setCustomers,
      suppliers,
      transactions,
      cart, addToCart, removeFromCart, updateCartQty, clearCart,
      cartTotal, cartCount,
      activePage, setActivePage,
      sidebarOpen, setSidebarOpen,
      lowStockProducts,
      notification, removeToast,
      notifications, unreadNotifications, showNotification, markNotificationsRead,
      cashierSession, loginCashier, logoutCashier,
      completeSale,
      POINTS_PER_RUPEE, POINTS_VALUE,
      MIN_REDEEM_POINTS,
      loading,
      refreshData,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);

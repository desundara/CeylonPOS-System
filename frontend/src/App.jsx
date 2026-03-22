import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import POS from './pages/POS';
import Inventory from './pages/Inventory';
import Customers from './pages/Customers';
import LoyaltyPoints from './pages/LoyaltyPoints';
import Suppliers from './pages/Suppliers';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import CashierLogin from './pages/CashierLogin';

const pages = {
  dashboard: <Dashboard />,
  pos: <POS />,
  inventory: <Inventory />,
  customers: <Customers />,
  loyalty: <LoyaltyPoints />,
  suppliers: <Suppliers />,
  reports: <Reports />,
  settings: <Settings />,
};

function AppContent() {
  const { activePage } = useApp();

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        transition: 'background 0.3s ease, color 0.3s ease',
      }}
    >
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden" style={{ color: 'var(--text-primary)' }}>
        <Header />
        <main
          className={`flex-1 ${activePage === 'pos' ? 'overflow-hidden' : 'overflow-y-auto'}`}
          style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
        >
          {pages[activePage] || <Dashboard />}
        </main>
      </div>
    </div>
  );
}

function CashierGate() {
  const { activePage } = useApp();
  if (activePage === 'cashier') return <CashierLogin />;
  return <AppContent />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <CashierGate />
      </AppProvider>
    </ThemeProvider>
  );
}
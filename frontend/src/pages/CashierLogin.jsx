import React, { useState, useEffect } from 'react';
import { Lock, User, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { cashierService } from '../api/cashierService';

export default function CashierLogin() {
  const { loginCashier, setActivePage } = useApp();
  const { isDark } = useTheme();
  const [cashiers, setCashiers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCashiers = async () => {
      try {
        const data = await cashierService.getAll();
        setCashiers(data);
      } catch (err) {
        console.error("Failed to load cashiers", err);
        setError("Failed to load cashier profiles from server.");
      }
    };
    fetchCashiers();
  }, []);

  // Keyboard accessibility for PIN entry
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selected) return; // Only accept input if profile selected
      
      if (/^[0-9]$/.test(e.key)) {
        setPin(p => p.length < 4 ? p + e.key : p);
      } else if (e.key === 'Backspace') {
        setPin(p => p.slice(0, -1));
      } else if (e.key === 'Escape' || e.key.toLowerCase() === 'c') {
        setPin(''); // 'c' or escape to clear
      } else if (e.key === 'Enter') {
        document.getElementById('pos-login-button')?.click();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selected]);

  const handlePinPad = (digit) => {
    if (pin.length < 4) setPin(p => p + digit);
  };

  const handleBackspace = () => setPin(p => p.slice(0, -1));
  const handleClear = () => setPin('');

  const handleLogin = async () => {
    if (!selected) { setError('Please select a cashier profile'); return; }
    if (pin.length < 4) { setError('Enter your 4-digit PIN'); return; }
    setLoading(true);
    setError('');
    
    try {
      const response = await cashierService.login(selected.id, pin);
      await new Promise(r => setTimeout(r, 600));
      loginCashier(response.user);
      setActivePage('pos'); // Redirect to POS after login
    } catch (err) {
      await new Promise(r => setTimeout(r, 600));
      setError('Incorrect PIN or Server Error. Please try again.');
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4" style={{ background: 'var(--bg-primary)' }}>
      {/* Background pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
        <div style={{
          position: 'absolute', top: '-20%', left: '-10%',
          width: '600px', height: '600px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(21,101,192,0.08) 0%, transparent 70%)'
        }} />
        <div style={{
          position: 'absolute', bottom: '-10%', right: '-5%',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(66,165,245,0.06) 0%, transparent 70%)'
        }} />
      </div>

      <div className="relative z-10 w-full max-w-4xl">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl" style={{ background: 'linear-gradient(135deg,#1565C0,#42A5F5)' }}>
              <ShieldCheck size={24} className="text-white" />
            </div>
            <div className="text-left">
              <div className="text-3xl tracking-widest font-display" style={{ color: 'var(--text-primary)', fontFamily: '"Bebas Neue", cursive' }}>
                CEYLON<span style={{ color: '#42A5F5' }}>POS</span>
              </div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Software Solutions (Pvt) Ltd</div>
            </div>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Select your profile and enter PIN to start session</p>
          <button
            onClick={() => setActivePage('dashboard')}
            className="mt-3 text-xs flex items-center gap-1.5 mx-auto transition-all"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
            ← Back to Dashboard
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Cashier Selection */}
          <div>
            <h3 className="flex items-center gap-2 mb-3 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
              <User size={14} /> Select Cashier
            </h3>
            <div className="space-y-2">
              {cashiers.map(c => (
                <button key={c.id} onClick={() => { setSelected(c); setPin(''); setError(''); }}
                  className="flex items-center w-full gap-4 p-4 text-left transition-all rounded-xl"
                  style={selected?.id === c.id
                    ? { background: 'rgba(21,101,192,0.2)', border: '2px solid rgba(21,101,192,0.6)', color: 'var(--text-primary)' }
                    : { background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <div className="flex items-center justify-center flex-shrink-0 text-lg font-bold w-11 h-11 rounded-xl"
                    style={{ background: selected?.id === c.id ? 'linear-gradient(135deg,#1565C0,#42A5F5)' : 'rgba(21,101,192,0.15)', color: selected?.id === c.id ? '#fff' : '#42A5F5' }}>
                    {c.avatar}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{c.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{c.role}</p>
                  </div>
                  {selected?.id === c.id && (
                    <div className="flex items-center justify-center flex-shrink-0 w-5 h-5 bg-blue-500 rounded-full">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* PIN Entry */}
          <div>
            <h3 className="flex items-center gap-2 mb-3 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
              <Lock size={14} /> Enter PIN
            </h3>
            <div className="p-5 rounded-2xl" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
              {/* PIN Display */}
              <div className="flex items-center justify-center gap-3 mb-5">
                {[0, 1, 2, 3].map(i => (
                  <div key={i} className="flex items-center justify-center w-12 h-12 text-xl font-bold transition-all rounded-xl"
                    style={{
                      background: pin.length > i ? 'rgba(21,101,192,0.3)' : 'var(--input-bg)',
                      border: pin.length > i ? '2px solid rgba(21,101,192,0.6)' : '1px solid var(--border-color)',
                      color: 'var(--text-primary)'
                    }}>
                    {pin.length > i ? (showPin ? pin[i] : '●') : ''}
                  </div>
                ))}
                <button onClick={() => setShowPin(p => !p)} className="ml-1" style={{ color: 'var(--text-muted)' }}>
                  {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Error */}
              {error && (
                <div className="px-3 py-2 mb-4 text-xs text-center text-red-400 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  {error}
                </div>
              )}

              {/* PIN Pad */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                {['1','2','3','4','5','6','7','8','9','C','0','⌫'].map(key => (
                  <button key={key}
                    onClick={() => {
                      if (key === '⌫') handleBackspace();
                      else if (key === 'C') handleClear();
                      else handlePinPad(key);
                    }}
                    className="h-12 text-sm font-semibold transition-all rounded-xl active:scale-95"
                    style={key === 'C'
                      ? { background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }
                      : key === '⌫'
                      ? { background: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.25)' }
                      : { background: 'var(--input-bg)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
                    {key}
                  </button>
                ))}
              </div>

              <button id="pos-login-button" onClick={handleLogin} disabled={loading || !selected || pin.length < 4}
                className="w-full py-3 text-sm font-semibold text-white transition-all rounded-xl"
                style={{
                  background: (!selected || pin.length < 4) ? 'rgba(21,101,192,0.3)' : 'linear-gradient(135deg,#1565C0,#1E88E5)',
                  cursor: (!selected || pin.length < 4) ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1
                }}>
                {loading ? 'Verifying...' : 'Login to POS'}
              </button>

              <p className="mt-3 text-xs text-center" style={{ color: 'var(--text-muted)' }}>
                Demo PINs: 1234 · 2345 · 3456 · 0000
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

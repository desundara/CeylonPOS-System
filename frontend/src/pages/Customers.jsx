import React, { useState } from 'react';
import { Search, UserPlus, Phone, Mail, Star, TrendingUp, X, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Customers() {
  const { customers, showNotification } = useApp();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [selected, setSelected] = useState(null);

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) || c.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    if (!form.name || !form.phone) { showNotification('Name and phone required', 'error'); return; }
    showNotification('Customer added successfully!');
    setShowModal(false);
    setForm({ name: '', phone: '', email: '' });
  };

  const purchaseHistory = [
    { id: 'INV-2025-0821', date: '2025-03-18', items: 7, total: 3420, payment: 'Cash' },
    { id: 'INV-2025-0756', date: '2025-03-10', items: 3, total: 1560, payment: 'Card' },
    { id: 'INV-2025-0689', date: '2025-03-01', items: 12, total: 7890, payment: 'Cash' },
  ];

  return (
    <div className="p-4 md:p-6 animate-fade-in">
      <div className="flex flex-col gap-3 mb-6 sm:flex-row">
        <div className="relative flex-1">
          <Search size={15} className="absolute -translate-y-1/2 left-3 top-1/2" style={{ color: 'var(--text-muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers..." className="input-field pl-9" />
        </div>
        <button onClick={() => setShowModal(true)} className="flex-shrink-0 btn-primary">
          <UserPlus size={15} /> Add Customer
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="space-y-3 xl:col-span-2">
          {filtered.map((c) => (
            <button key={c.id} onClick={() => setSelected(selected?.id === c.id ? null : c)}
              className="w-full p-4 text-left transition-all glass rounded-xl glass-hover"
              style={selected?.id === c.id ? { borderColor: 'rgba(21,101,192,0.5)' } : {}}>
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center flex-shrink-0 text-lg font-bold w-11 h-11 rounded-xl"
                  style={{ background: 'rgba(21,101,192,0.15)', border: '1px solid rgba(21,101,192,0.3)', color: '#42A5F5' }}>
                  {c.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{c.name}</h3>
                    <div className="flex items-center flex-shrink-0 gap-1 text-xs text-amber-400">
                      <Star size={11} fill="currentColor" />
                      <span className="font-mono">{c.loyaltyPoints} pts</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap mt-2 gap-x-4 gap-y-1">
                    <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                      <Phone size={10} /> {c.phone}
                    </span>
                    <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                      <Mail size={10} /> {c.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="text-xs">
                      <span style={{ color: 'var(--text-muted)' }}>Total Spent: </span>
                      <span className="font-mono font-semibold text-emerald-400">Rs. {c.totalSpent.toLocaleString()}</span>
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      Since {new Date(c.joinDate).toLocaleDateString('en-LK', { year: 'numeric', month: 'short' })}
                    </div>
                  </div>
                </div>
              </div>

              {selected?.id === c.id && (
                <div className="pt-4 mt-4 border-t animate-fade-in" style={{ borderColor: 'var(--border-color)' }}>
                  <p className="mb-3 text-xs font-semibold tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>
                    Purchase History
                  </p>
                  <div className="space-y-2">
                    {purchaseHistory.map((h, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 rounded-lg"
                        style={{ background: 'var(--input-bg)' }}>
                        <div>
                          <p className="font-mono text-xs text-blue-400">{h.id}</p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                            {h.date} · {h.items} items · {h.payment}
                          </p>
                        </div>
                        <span className="font-mono text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                          Rs. {h.total.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <div className="p-5 glass rounded-xl">
            <h3 className="flex items-center gap-2 mb-4 font-semibold" style={{ color: 'var(--text-primary)' }}>
              <TrendingUp size={16} className="text-blue-400" /> Customer Overview
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Total Customers', value: customers.length },
                { label: 'Total Revenue', value: `Rs. ${(customers.reduce((s, c) => s + c.totalSpent, 0) / 1000).toFixed(0)}k` },
                { label: 'Avg Loyalty Points', value: Math.round(customers.reduce((s, c) => s + c.loyaltyPoints, 0) / customers.length) },
                { label: 'Top Spender', value: [...customers].sort((a, b) => b.totalSpent - a.totalSpent)[0]?.name },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</span>
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 glass rounded-xl">
            <h3 className="mb-3 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Top Customers</h3>
            {[...customers].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 4).map((c, i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <div className="flex items-center justify-center text-xs font-bold rounded-full w-7 h-7"
                  style={{ background: 'rgba(21,101,192,0.2)', color: '#42A5F5' }}>
                  {c.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{c.name}</p>
                  <p className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>Rs. {c.totalSpent.toLocaleString()}</p>
                </div>
                <span className="font-mono text-xs text-amber-400">{c.loyaltyPoints}pt</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="w-full max-w-md p-6 glass rounded-2xl animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Add New Customer</h2>
              <button onClick={() => setShowModal(false)} style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
            </div>
            <div className="space-y-4">
              {[{ label: 'Full Name *', key: 'name', type: 'text' }, { label: 'Phone *', key: 'phone', type: 'tel' }, { label: 'Email', key: 'email', type: 'email' }].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-muted)' }}>{label}</label>
                  <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} className="input-field" placeholder={label} />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="justify-center flex-1 btn-ghost">Cancel</button>
              <button onClick={handleAdd} className="flex-1 py-2.5 rounded-xl text-white font-semibold flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg,#1565C0,#1E88E5)' }}>
                <Check size={15} /> Add Customer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
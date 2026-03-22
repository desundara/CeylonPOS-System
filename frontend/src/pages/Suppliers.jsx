import React, { useState } from 'react';
import { Search, Plus, Phone, Mail, Truck, DollarSign } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Suppliers() {
  const { suppliers, showNotification } = useApp();
  const [search, setSearch] = useState('');

  const filtered = suppliers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.contact.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase())
  );

  const totalBalance = suppliers.reduce((sum, s) => sum + s.balance, 0);

  return (
    <div className="p-4 md:p-6 animate-fade-in">
      <div className="flex flex-col gap-3 mb-6 sm:flex-row">
        <div className="relative flex-1">
          <Search size={15} className="absolute -translate-y-1/2 left-3 top-1/2" style={{ color: 'var(--text-muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search suppliers..." className="input-field pl-9" />
        </div>
        <button onClick={() => showNotification('Add Supplier form coming soon!')} className="flex-shrink-0 btn-primary">
          <Plus size={15} /> Add Supplier
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6 md:grid-cols-4">
        {[
          { label: 'Total Suppliers', value: suppliers.length, color: '#42A5F5' },
          { label: 'Active', value: suppliers.filter(s => s.status === 'Active').length, color: '#34D399' },
          { label: 'Inactive', value: suppliers.filter(s => s.status === 'Inactive').length, color: '#F87171' },
          { label: 'Outstanding Balance', value: `Rs. ${(totalBalance / 1000).toFixed(0)}k`, color: '#FBBF24' },
        ].map((s, i) => (
          <div key={i} className="p-4 glass rounded-xl">
            <div className="text-xl font-bold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((s, i) => (
          <div key={s.id} className="p-5 transition-all glass rounded-xl glass-hover animate-slide-up"
            style={{ animationDelay: `${i * 0.06}s` }}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl"
                  style={{ background: 'rgba(21,101,192,0.15)', border: '1px solid rgba(21,101,192,0.25)' }}>
                  <Truck size={18} className="text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>{s.name}</h3>
                  <span className="badge badge-blue text-xs mt-0.5">{s.category}</span>
                </div>
              </div>
              <span className={`badge ${s.status === 'Active' ? 'badge-green' : 'badge-red'}`}>{s.status}</span>
            </div>

            <div className="mb-4 space-y-2">
              <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                <span>Contact:</span>
                <span style={{ color: 'var(--text-secondary)' }}>{s.contact}</span>
              </div>
              <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                <Phone size={11} /> {s.phone}
              </div>
              <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                <Mail size={11} /> {s.email}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
              <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                <DollarSign size={11} />
                <span>Outstanding:</span>
              </div>
              <span className={`font-mono font-semibold text-sm ${s.balance > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                Rs. {s.balance.toLocaleString()}
              </span>
            </div>

            <div className="flex gap-2 mt-3">
              <button onClick={() => showNotification(`Creating PO for ${s.name}`)}
                className="flex-1 py-2 text-xs text-blue-400 transition-all rounded-lg"
                style={{ background: 'rgba(21,101,192,0.1)', border: '1px solid rgba(21,101,192,0.25)' }}>
                Create PO
              </button>
              <button onClick={() => showNotification(`Recording payment for ${s.name}`)}
                className="flex-1 py-2 text-xs transition-all rounded-lg"
                style={{ background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                Record Payment
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
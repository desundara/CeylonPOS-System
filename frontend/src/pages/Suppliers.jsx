import React, { useState } from 'react';
import { Search, Plus, Phone, Mail, Truck, DollarSign, X, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supplierService } from '../api/supplierService';

export default function Suppliers() {
  const { suppliers, showNotification, refreshData } = useApp();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', contact_person: '', phone: '', email: '', category: 'Grains' });
  const [actionModal, setActionModal] = useState({ open: false, type: '', supplier: null });
  const [actionForm, setActionForm] = useState({ amount: '', note: '' });

  const handleAdd = async () => {
    if (!form.name || !form.phone) { showNotification('Name and phone required', 'error'); return; }
    try {
        await supplierService.create(form);
        showNotification('Supplier added successfully!');
        await refreshData();
        setShowModal(false);
        setForm({ name: '', contact_person: '', phone: '', email: '', category: 'Grains' });
    } catch (error) {
        showNotification('Failed to add supplier: ' + error.message, 'error');
    }
  };

  const filtered = suppliers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.contact && s.contact.toLowerCase().includes(search.toLowerCase())) ||
    (s.phone || '').includes(search) ||
    (s.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.category || '').toLowerCase().includes(search.toLowerCase())
  );

  const totalBalance = suppliers.reduce((sum, s) => sum + (s.balance || 0), 0);

  const openSupplierAction = (type, supplier) => {
    setActionModal({ open: true, type, supplier });
    setActionForm({ amount: '', note: '' });
  };

  const handleSupplierAction = async () => {
    const amount = parseFloat(actionForm.amount);
    if (!actionModal.supplier || !amount || amount <= 0) {
      showNotification('Enter a valid amount', 'error');
      return;
    }

    try {
      if (actionModal.type === 'po') {
        await supplierService.createPurchaseOrder(actionModal.supplier.id, amount, actionForm.note);
        showNotification(`Purchase order created for ${actionModal.supplier.name}`);
      } else {
        await supplierService.recordPayment(actionModal.supplier.id, amount, actionForm.note);
        showNotification(`Payment recorded for ${actionModal.supplier.name}`);
      }
      await refreshData();
      setActionModal({ open: false, type: '', supplier: null });
      setActionForm({ amount: '', note: '' });
    } catch (error) {
      showNotification('Supplier action failed: ' + error.message, 'error');
    }
  };

  return (
    <div className="p-4 md:p-6 animate-fade-in">
      <div className="flex flex-col gap-3 mb-6 sm:flex-row">
        <div className="relative flex-1">
          <Search size={15} className="absolute -translate-y-1/2 left-3 top-1/2" style={{ color: 'var(--text-muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search suppliers..." className="input-field pl-9" />
        </div>
        <button onClick={() => setShowModal(true)} className="flex-shrink-0 btn-primary">
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
                <span style={{ color: 'var(--text-secondary)' }}>{s.contact_person}</span>
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
              <span className={`font-mono font-semibold text-sm ${(s.balance || 0) > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                Rs. {(s.balance || 0).toLocaleString()}
              </span>
            </div>

            <div className="flex gap-2 mt-3">
              <button onClick={() => openSupplierAction('po', s)}
                className="flex-1 py-2 text-xs text-blue-400 transition-all rounded-lg"
                style={{ background: 'rgba(21,101,192,0.1)', border: '1px solid rgba(21,101,192,0.25)' }}>
                Create PO
              </button>
              <button onClick={() => openSupplierAction('payment', s)}
                className="flex-1 py-2 text-xs transition-all rounded-lg"
                style={{ background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                Record Payment
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="w-full max-w-md p-6 glass rounded-2xl animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Add New Supplier</h2>
              <button onClick={() => setShowModal(false)} style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
            </div>
            <div className="space-y-4">
              {[
                  { label: 'Supplier Name *', key: 'name', type: 'text' },
                  { label: 'Contact Person', key: 'contact_person', type: 'text' },
                  { label: 'Phone *', key: 'phone', type: 'tel' },
                  { label: 'Email', key: 'email', type: 'email' }
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-muted)' }}>{label}</label>
                  <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} className="input-field" placeholder={label} />
                </div>
              ))}
              <div>
                <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input-field">
                    {['Grains', 'Groceries', 'Beverages', 'Dairy', 'Produce', 'Snacks', 'Personal Care', 'Household'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="justify-center flex-1 btn-ghost">Cancel</button>
              <button onClick={handleAdd} className="flex-1 py-2.5 rounded-xl text-white font-semibold flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg,#1565C0,#1E88E5)' }}>
                <Check size={15} /> Add Supplier
              </button>
            </div>
          </div>
        </div>
      )}

      {actionModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="w-full max-w-md p-6 glass rounded-2xl animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                {actionModal.type === 'po' ? 'Create Purchase Order' : 'Record Payment'}
              </h2>
              <button onClick={() => setActionModal({ open: false, type: '', supplier: null })} style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Supplier: <span style={{ color: 'var(--text-primary)' }}>{actionModal.supplier?.name}</span>
              </div>
              <div>
                <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Amount (Rs.)</label>
                <input
                  type="number"
                  value={actionForm.amount}
                  onChange={e => setActionForm(f => ({ ...f, amount: e.target.value }))}
                  className="input-field"
                  placeholder="Enter amount"
                />
              </div>
              <div>
                <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Note</label>
                <input
                  type="text"
                  value={actionForm.note}
                  onChange={e => setActionForm(f => ({ ...f, note: e.target.value }))}
                  className="input-field"
                  placeholder="Optional reference"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setActionModal({ open: false, type: '', supplier: null })} className="justify-center flex-1 btn-ghost">Cancel</button>
              <button onClick={handleSupplierAction} className="flex-1 py-2.5 rounded-xl text-white font-semibold flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg,#1565C0,#1E88E5)' }}>
                <Check size={15} /> {actionModal.type === 'po' ? 'Create PO' : 'Save Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

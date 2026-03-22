import React, { useState } from 'react';
import { Search, Plus, Edit2, AlertTriangle, Package, X, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { categories } from '../data/mockData';

export default function Inventory() {
  const { products, setProducts, showNotification } = useApp();
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState({ name: '', sku: '', category: 'Grains', price: '', stock: '', minStock: '', unit: '', supplier: '' });

  const filtered = products.filter(p => {
    const matchCat = filterCat === 'All' || p.category === filterCat;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const openAdd = () => {
    setEditProduct(null);
    setForm({ name: '', sku: '', category: 'Grains', price: '', stock: '', minStock: '', unit: '', supplier: '' });
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditProduct(p);
    setForm({ name: p.name, sku: p.sku, category: p.category, price: p.price, stock: p.stock, minStock: p.minStock, unit: p.unit, supplier: p.supplier });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name || !form.sku || !form.price) { showNotification('Please fill required fields', 'error'); return; }
    if (editProduct) {
      setProducts(prev => prev.map(p => p.id === editProduct.id
        ? { ...p, ...form, price: +form.price, stock: +form.stock, minStock: +form.minStock }
        : p));
      showNotification('Product updated successfully!');
    } else {
      const newP = { id: Date.now(), ...form, price: +form.price, stock: +form.stock, minStock: +form.minStock, barcode: `490${Date.now()}` };
      setProducts(prev => [...prev, newP]);
      showNotification('Product added successfully!');
    }
    setShowModal(false);
  };

  const lowCount = products.filter(p => p.stock <= p.minStock).length;

  return (
    <div className="p-4 md:p-6 animate-fade-in">
      <div className="flex flex-col gap-3 mb-6 sm:flex-row">
        <div className="flex flex-1 gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute -translate-y-1/2 left-3 top-1/2" style={{ color: 'var(--text-muted)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="input-field pl-9" />
          </div>
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="w-auto input-field">
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <button onClick={openAdd} className="flex-shrink-0 btn-primary">
          <Plus size={15} /> Add Product
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6 md:grid-cols-4">
        {[
          { label: 'Total Products', value: products.length, color: '#42A5F5' },
          { label: 'Low Stock', value: lowCount, color: '#FBBF24' },
          { label: 'Categories', value: categories.length - 1, color: '#A78BFA' },
          { label: 'Total Value', value: `Rs. ${(products.reduce((s, p) => s + p.price * p.stock, 0) / 1000).toFixed(0)}k`, color: '#34D399' },
        ].map((s, i) => (
          <div key={i} className="p-4 glass rounded-xl">
            <div className="text-xl font-bold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="overflow-hidden glass rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--input-bg)' }}>
                {['Product', 'SKU', 'Category', 'Price', 'Stock', 'Status', 'Action'].map(h => (
                  <th key={h} className="px-4 py-3 text-xs font-semibold tracking-wider text-left uppercase whitespace-nowrap"
                    style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const isLow = p.stock <= p.minStock;
                const isOut = p.stock === 0;
                return (
                  <tr key={p.id} className="table-row">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg"
                          style={{ background: 'rgba(21,101,192,0.12)' }}>
                          <Package size={14} className="text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{p.name}</p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{p.supplier}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--text-muted)' }}>{p.sku}</td>
                    <td className="px-4 py-3"><span className="badge badge-blue">{p.category}</span></td>
                    <td className="px-4 py-3 font-mono text-sm" style={{ color: 'var(--text-primary)' }}>Rs. {p.price.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`font-mono text-sm font-semibold ${isOut ? 'text-red-400' : isLow ? 'text-amber-400' : ''}`}
                          style={!isOut && !isLow ? { color: 'var(--text-primary)' } : {}}>
                          {p.stock}
                        </span>
                        {isLow && !isOut && <AlertTriangle size={12} className="text-amber-400" />}
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>/{p.minStock}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${isOut ? 'badge-red' : isLow ? 'badge-yellow' : 'badge-green'}`}>
                        {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg transition-colors"
                        style={{ color: 'var(--text-muted)' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#42A5F5'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                        <Edit2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 text-xs border-t" style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}>
          Showing {filtered.length} of {products.length} products
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="glass rounded-2xl p-6 w-full max-w-lg animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                {editProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                { label: 'Product Name *', key: 'name', type: 'text', full: true },
                { label: 'SKU *', key: 'sku', type: 'text' },
                { label: 'Price (Rs.) *', key: 'price', type: 'number' },
                { label: 'Stock Qty', key: 'stock', type: 'number' },
                { label: 'Min Stock', key: 'minStock', type: 'number' },
                { label: 'Unit', key: 'unit', type: 'text' },
                { label: 'Supplier', key: 'supplier', type: 'text', full: true },
              ].map(({ label, key, type, full }) => (
                <div key={key} className={full ? 'sm:col-span-2' : ''}>
                  <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-muted)' }}>{label}</label>
                  <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="input-field" placeholder={label} />
                </div>
              ))}
              <div className="sm:col-span-2">
                <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input-field">
                  {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="justify-center flex-1 btn-ghost">Cancel</button>
              <button onClick={handleSave}
                className="flex-1 py-2.5 rounded-xl text-white font-semibold flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg,#1565C0,#1E88E5)' }}>
                <Check size={15} /> {editProduct ? 'Update' : 'Add Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
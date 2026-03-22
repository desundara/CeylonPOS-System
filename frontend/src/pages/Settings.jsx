import React, { useState } from 'react';
import { Store, Bell, Shield, Printer, Globe, Save, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

const sections = [
  { id: 'store', label: 'Store Information', icon: Store },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'printing', label: 'Receipt & Printing', icon: Printer },
  { id: 'regional', label: 'Regional Settings', icon: Globe },
];

export default function Settings() {
  const { showNotification } = useApp();
  const [active, setActive] = useState('store');
  const [storeForm, setStoreForm] = useState({
    name: 'CeylonPOS Demo Shop',
    address: 'No 12, Galle Road, Colombo 03',
    phone: '0112345678',
    email: 'info@ceylonpos.lk',
    taxRate: '8',
    currency: 'LKR',
  });
  const [notifs, setNotifs] = useState({ lowStock: true, dailyReport: true, sms: false, email: true });

  const renderContent = () => {
    switch (active) {
      case 'store':
        return (
          <div className="space-y-4">
            <h2 className="mb-2 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Store Information</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                { label: 'Store Name', key: 'name' },
                { label: 'Phone Number', key: 'phone' },
                { label: 'Email Address', key: 'email' },
                { label: 'Tax Rate (%)', key: 'taxRate' },
                { label: 'Currency', key: 'currency' },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-muted)' }}>{label}</label>
                  <input value={storeForm[key]} onChange={e => setStoreForm(f => ({ ...f, [key]: e.target.value }))} className="input-field" />
                </div>
              ))}
              <div className="sm:col-span-2">
                <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Address</label>
                <textarea value={storeForm.address} onChange={e => setStoreForm(f => ({ ...f, address: e.target.value }))}
                  className="h-20 resize-none input-field" />
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-4">
            <h2 className="mb-2 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Notification Settings</h2>
            {[
              { key: 'lowStock', label: 'Low Stock Alerts', desc: 'Get notified when products fall below minimum stock' },
              { key: 'dailyReport', label: 'Daily Reports', desc: 'Receive daily sales summary automatically' },
              { key: 'sms', label: 'SMS Notifications', desc: 'Send SMS alerts to your registered number' },
              { key: 'email', label: 'Email Notifications', desc: 'Send important alerts to your email address' },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between p-4 rounded-xl"
                style={{ background: 'var(--input-bg)', border: '1px solid var(--border-color)' }}>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{label}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{desc}</p>
                </div>
                <button onClick={() => setNotifs(n => ({ ...n, [key]: !n[key] }))}
                  className="relative flex-shrink-0 h-6 transition-all rounded-full w-11"
                  style={{ background: notifs[key] ? '#1565C0' : 'var(--border-color)' }}>
                  <div className="absolute w-4 h-4 transition-all bg-white rounded-full top-1"
                    style={{ left: notifs[key] ? '1.375rem' : '0.25rem' }}></div>
                </button>
              </div>
            ))}
          </div>
        );

      case 'security':
        return (
          <div className="space-y-4">
            <h2 className="mb-2 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Security Settings</h2>
            {[{ label: 'Current Password' }, { label: 'New Password' }, { label: 'Confirm Password' }].map(({ label }) => (
              <div key={label}>
                <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-muted)' }}>{label}</label>
                <input type="password" className="input-field" placeholder="••••••••" />
              </div>
            ))}
            <div className="p-4 mt-4 rounded-xl"
              style={{ background: 'rgba(21,101,192,0.06)', border: '1px solid rgba(21,101,192,0.2)' }}>
              <p className="text-xs font-medium text-blue-400">Two-Factor Authentication</p>
              <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                Add an extra layer of security to your account with 2FA
              </p>
              <button className="mt-3 text-xs px-3 py-1.5 rounded-lg text-blue-400 transition-all"
                style={{ border: '1px solid rgba(21,101,192,0.4)' }}>
                Enable 2FA
              </button>
            </div>
          </div>
        );

      case 'printing':
        return (
          <div className="space-y-4">
            <h2 className="mb-2 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Receipt & Printing</h2>
            {[
              { label: 'Receipt Header', placeholder: 'CeylonPOS Demo Shop' },
              { label: 'Receipt Footer', placeholder: 'Thank you for shopping with us!' },
              { label: 'Printer Name', placeholder: 'Default Printer' },
            ].map(({ label, placeholder }) => (
              <div key={label}>
                <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-muted)' }}>{label}</label>
                <input type="text" className="input-field" placeholder={placeholder} />
              </div>
            ))}
            <div className="p-4 rounded-xl" style={{ background: 'var(--input-bg)', border: '1px solid var(--border-color)' }}>
              <p className="mb-2 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Print Options</p>
              {['Print logo on receipt', 'Auto-print after sale', 'Print barcode on receipt'].map(opt => (
                <label key={opt} className="flex items-center gap-3 py-1.5 cursor-pointer">
                  <input type="checkbox" className="accent-blue-600" defaultChecked />
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{opt}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'regional':
        return (
          <div className="space-y-4">
            <h2 className="mb-2 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Regional Settings</h2>
            {[
              { label: 'Currency', options: ['LKR - Sri Lankan Rupee', 'USD - US Dollar', 'EUR - Euro'] },
              { label: 'Date Format', options: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'] },
              { label: 'Time Format', options: ['12-hour (AM/PM)', '24-hour'] },
              { label: 'Language', options: ['English', 'Sinhala', 'Tamil'] },
            ].map(({ label, options }) => (
              <div key={label}>
                <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-muted)' }}>{label}</label>
                <select className="input-field">
                  {options.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>
        );

      default: return null;
    }
  };

  return (
    <div className="p-4 md:p-6 animate-fade-in">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="p-3 glass rounded-xl h-fit">
          {sections.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActive(id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-all mb-1"
              style={active === id
                ? { background: 'var(--nav-active-bg)', color: 'var(--text-primary)', border: '1px solid var(--nav-active-border)' }
                : { color: 'var(--text-muted)' }}>
              <Icon size={15} />
              <span className="flex-1">{label}</span>
              <ChevronRight size={12} style={{ opacity: 0.4 }} />
            </button>
          ))}
        </div>

        <div className="p-6 md:col-span-3 glass rounded-xl">
          {renderContent()}
          <div className="flex gap-3 pt-6 mt-6 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <button className="btn-ghost">Discard</button>
            <button onClick={() => showNotification('Settings saved successfully!')} className="btn-primary">
              <Save size={14} /> Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
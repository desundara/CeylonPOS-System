import React, { useEffect, useState } from 'react';
import { Store, Bell, Shield, Printer, Globe, Save, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { settingsService } from '../api/settingsService';

const sections = [
  { id: 'store', label: 'Store Information', icon: Store },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'printing', label: 'Receipt & Printing', icon: Printer },
  { id: 'regional', label: 'Regional Settings', icon: Globe },
];

const regionalOptions = {
  currency: ['LKR', 'USD', 'EUR'],
  date_format: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'],
  time_format: ['12-hour (AM/PM)', '24-hour'],
  language: ['English', 'Sinhala', 'Tamil'],
};

export default function Settings() {
  const { appSettings, setAppSettings, showNotification, refreshData } = useApp();
  const [active, setActive] = useState('store');
  const [form, setForm] = useState(appSettings);
  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(appSettings);
  }, [appSettings]);

  const updateField = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (securityForm.currentPassword || securityForm.newPassword || securityForm.confirmPassword) {
      showNotification('Password change is not available in this build yet. Store/security preferences will still be saved.', 'error');
    }

    if (securityForm.newPassword && securityForm.newPassword !== securityForm.confirmPassword) {
      showNotification('New password and confirm password do not match', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        store_name: form.store_name,
        store_address: form.store_address,
        store_phone: form.store_phone,
        store_email: form.store_email,
        tax_rate: parseFloat(form.tax_rate) || 0,
        currency: form.currency,
        notify_low_stock: form.notify_low_stock,
        notify_daily_report: form.notify_daily_report,
        notify_sms: form.notify_sms,
        notify_email: form.notify_email,
        notify_sound: form.notify_sound,
        two_factor_enabled: form.two_factor_enabled,
        receipt_header: form.receipt_header,
        receipt_footer: form.receipt_footer,
        printer_name: form.printer_name,
        print_logo_on_receipt: form.print_logo_on_receipt,
        auto_print_after_sale: form.auto_print_after_sale,
        print_barcode_on_receipt: form.print_barcode_on_receipt,
        date_format: form.date_format,
        time_format: form.time_format,
        language: form.language,
      };

      const saved = await settingsService.update(payload);
      setAppSettings(saved);
      setForm(saved);
      setSecurityForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      await refreshData();
      showNotification('Settings saved successfully!');
    } catch (error) {
      showNotification('Failed to save settings: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    setForm(appSettings);
    setSecurityForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    showNotification('Unsaved changes discarded');
  };

  const renderContent = () => {
    switch (active) {
      case 'store':
        return (
          <div className="space-y-4">
            <h2 className="mb-2 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Store Information</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                { label: 'Store Name', key: 'store_name' },
                { label: 'Phone Number', key: 'store_phone' },
                { label: 'Email Address', key: 'store_email' },
                { label: 'Tax Rate (%)', key: 'tax_rate' },
                { label: 'Currency', key: 'currency' },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-muted)' }}>{label}</label>
                  <input value={form[key] ?? ''} onChange={e => updateField(key, e.target.value)} className="input-field" />
                </div>
              ))}
              <div className="sm:col-span-2">
                <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Address</label>
                <textarea value={form.store_address ?? ''} onChange={e => updateField('store_address', e.target.value)}
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
              { key: 'notify_low_stock', label: 'Low Stock Alerts', desc: 'Get notified when products fall below minimum stock' },
              { key: 'notify_daily_report', label: 'Daily Reports', desc: 'Receive daily sales summary automatically' },
              { key: 'notify_sms', label: 'SMS Notifications', desc: 'Send SMS alerts to your registered number' },
              { key: 'notify_email', label: 'Email Notifications', desc: 'Send important alerts to your email address' },
              { key: 'notify_sound', label: 'Notification Sound', desc: 'Play a short alert sound when notifications appear' },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between p-4 rounded-xl"
                style={{ background: 'var(--input-bg)', border: '1px solid var(--border-color)' }}>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{label}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{desc}</p>
                </div>
                <button onClick={() => updateField(key, !form[key])}
                  className="relative flex-shrink-0 h-6 transition-all rounded-full w-11"
                  style={{ background: form[key] ? '#1565C0' : 'var(--border-color)' }}>
                  <div className="absolute w-4 h-4 transition-all bg-white rounded-full top-1"
                    style={{ left: form[key] ? '1.375rem' : '0.25rem' }}></div>
                </button>
              </div>
            ))}
          </div>
        );

      case 'security':
        return (
          <div className="space-y-4">
            <h2 className="mb-2 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Security Settings</h2>
            {[
              { label: 'Current Password', key: 'currentPassword' },
              { label: 'New Password', key: 'newPassword' },
              { label: 'Confirm Password', key: 'confirmPassword' },
            ].map(({ label, key }) => (
              <div key={label}>
                <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-muted)' }}>{label}</label>
                <input
                  type="password"
                  value={securityForm[key]}
                  onChange={e => setSecurityForm(prev => ({ ...prev, [key]: e.target.value }))}
                  className="input-field"
                  placeholder="••••••••"
                />
              </div>
            ))}
            <div className="p-4 mt-4 rounded-xl"
              style={{ background: 'rgba(21,101,192,0.06)', border: '1px solid rgba(21,101,192,0.2)' }}>
              <p className="text-xs font-medium text-blue-400">Two-Factor Authentication</p>
              <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                Save whether two-factor authentication should be enabled for the store admin workflow.
              </p>
              <button
                onClick={() => updateField('two_factor_enabled', !form.two_factor_enabled)}
                className="mt-3 text-xs px-3 py-1.5 rounded-lg text-blue-400 transition-all"
                style={{ border: '1px solid rgba(21,101,192,0.4)' }}
              >
                {form.two_factor_enabled ? 'Disable 2FA' : 'Enable 2FA'}
              </button>
            </div>
          </div>
        );

      case 'printing':
        return (
          <div className="space-y-4">
            <h2 className="mb-2 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Receipt & Printing</h2>
            {[
              { label: 'Receipt Header', key: 'receipt_header' },
              { label: 'Receipt Footer', key: 'receipt_footer' },
              { label: 'Printer Name', key: 'printer_name' },
            ].map(({ label, key }) => (
              <div key={label}>
                <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-muted)' }}>{label}</label>
                <input type="text" value={form[key] ?? ''} onChange={e => updateField(key, e.target.value)} className="input-field" />
              </div>
            ))}
            <div className="p-4 rounded-xl" style={{ background: 'var(--input-bg)', border: '1px solid var(--border-color)' }}>
              <p className="mb-2 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Print Options</p>
              {[
                { key: 'print_logo_on_receipt', label: 'Print logo on receipt' },
                { key: 'auto_print_after_sale', label: 'Auto-print after sale' },
                { key: 'print_barcode_on_receipt', label: 'Print barcode on receipt' },
              ].map(opt => (
                <label key={opt.key} className="flex items-center gap-3 py-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    className="accent-blue-600"
                    checked={!!form[opt.key]}
                    onChange={e => updateField(opt.key, e.target.checked)}
                  />
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{opt.label}</span>
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
              { label: 'Currency', key: 'currency', options: regionalOptions.currency },
              { label: 'Date Format', key: 'date_format', options: regionalOptions.date_format },
              { label: 'Time Format', key: 'time_format', options: regionalOptions.time_format },
              { label: 'Language', key: 'language', options: regionalOptions.language },
            ].map(({ label, key, options }) => (
              <div key={label}>
                <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-muted)' }}>{label}</label>
                <select value={form[key] ?? ''} onChange={e => updateField(key, e.target.value)} className="input-field">
                  {options.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>
        );

      default:
        return null;
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
            <button onClick={handleDiscard} className="btn-ghost">Discard</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary">
              <Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Search, Plus, Minus, Trash2, ShoppingCart, CreditCard, Banknote, Smartphone, X, Tag, Star, QrCode, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import QRScanner from '../components/QRScanner';
import ReceiptModal from '../components/ReceiptModal';

export default function POS() {
  const {
    products, customers, cart, addToCart, removeFromCart,
    updateCartQty, clearCart, completeSale,
    showNotification, POINTS_VALUE, cashierSession, setActivePage,
    categories, appSettings, MIN_REDEEM_POINTS,
  } = useApp();

  const [search, setSearch]                     = useState('');
  const [selectedCat, setSelectedCat]           = useState('All');
  const [payment, setPayment]                   = useState('Cash');
  const [discount, setDiscount]                 = useState(0);
  const [showReceipt, setShowReceipt]           = useState(false);
  const [showCart, setShowCart]                 = useState(false);
  const [showScanner, setShowScanner]           = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [redeemPoints, setRedeemPoints]         = useState(0);
  const [completedSale, setCompletedSale]       = useState(null);
  const [custSearch, setCustSearch]             = useState('');
  const [showCustDrop, setShowCustDrop]         = useState(false);

  const taxRate = (parseFloat(appSettings?.tax_rate) || 0) / 100;
  const subtotal       = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const tax            = Math.round(subtotal * taxRate);
  const discountAmt    = Math.round(subtotal * discount / 100);
  const appliedRedeemPoints = redeemPoints >= MIN_REDEEM_POINTS ? redeemPoints : 0;
  const pointsDiscount = Math.floor(appliedRedeemPoints * POINTS_VALUE);
  const grandTotal     = Math.max(0, subtotal + tax - discountAmt - pointsDiscount);
  const pointsEarned   = Math.floor(grandTotal * 0.01);

  const handleScan = (code) => {
    setShowScanner(false);
    const product = products.find(p =>
      p.barcode === code || p.sku === code ||
      p.name.toLowerCase().includes(code.toLowerCase())
    );
    if (product) {
      addToCart(product);
      showNotification('Added: ' + product.name);
    } else {
      setSearch(code);
      showNotification('Product not found.', 'error');
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) { showNotification('Cart is empty!', 'error'); return; }
    setShowReceipt(true);
  };

  const handleCompleteSale = async () => {
    if (redeemPoints > 0 && !selectedCustomer) {
      showNotification('Select a customer to redeem loyalty points', 'error');
      return;
    }
    if (redeemPoints > 0 && redeemPoints < MIN_REDEEM_POINTS) {
      showNotification(`Minimum redeem is ${MIN_REDEEM_POINTS} points`, 'error');
      return;
    }

    try {
      const tx = await completeSale({
        customerName: selectedCustomer ? selectedCustomer.name : 'Walk-in Customer',
        customerId:   selectedCustomer ? selectedCustomer.id   : null,
        items:        cart.length,
        total:        grandTotal,
        payment,
        discountAmount: discountAmt,
        redeemPoints: appliedRedeemPoints,
      });
      setCompletedSale(tx);
      setShowReceipt(false);
      setSelectedCustomer(null);
      setDiscount(0);
      setRedeemPoints(0);
      showNotification('Sale completed! Rs. ' + grandTotal.toLocaleString());
    } catch (error) {
      // Error is handled in completeSale notification
    }
  };

  const receiptData = {
    invoiceId:     `INV-2025-${String(900).padStart(4, '0')}`,
    customerName:  selectedCustomer ? selectedCustomer.name : 'Walk-in Customer',
    payment,
    discount,
    discountAmt,
    redeemPoints: appliedRedeemPoints,
    pointsDiscount,
    taxRatePercent: parseFloat(appSettings?.tax_rate) || 0,
    tax,
    grandTotal,
    pointsEarned:  selectedCustomer ? pointsEarned : 0,
    cashierName:   cashierSession ? cashierSession.name : 'Admin',
    storeName: appSettings?.store_name,
    receiptHeader: appSettings?.receipt_header,
    receiptFooter: appSettings?.receipt_footer,
    currency: appSettings?.currency,
  };

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(custSearch.toLowerCase()) ||
    c.phone.includes(custSearch) ||
    (c.email || '').toLowerCase().includes(custSearch.toLowerCase())
  );

  const filtered = products.filter(p => {
    const query = search.trim().toLowerCase();
    const matchCat    = selectedCat === 'All' || p.category === selectedCat;
    const matchSearch = !query ||
                        p.name.toLowerCase().includes(query) ||
                        (p.sku || '').toLowerCase().includes(query) ||
                        (p.barcode || '').toLowerCase().includes(query);
    return matchCat && matchSearch;
  });

  if (!cashierSession) {
    return (
      <div className="flex items-center justify-center h-full p-6 animate-fade-in">
        <div className="max-w-md p-6 text-center glass rounded-2xl">
          <h2 className="mb-2 text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Cashier Login Required</h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Start a cashier session before billing so every sale is stored with the cashier name and login record.
          </p>
          <button
            onClick={() => setActivePage('cashier')}
            className="mt-5 btn-primary"
          >
            Go To Cashier Login
          </button>
        </div>
      </div>
    );
  }

  // ── Cart Content — extracted as JSX, NOT a component ─────────────────────
  const cartContent = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Customer selector */}
      <div style={{ padding: '12px', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ position: 'relative' }}>
          <div
            onClick={() => { setShowCustDrop(p => !p); setCustSearch(''); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 12px', borderRadius: '8px', cursor: 'pointer',
              background: 'var(--input-bg)', border: '1px solid var(--border-color)',
            }}>
            <User size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <span style={{
              flex: 1, fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              color: selectedCustomer ? 'var(--text-primary)' : 'var(--text-muted)',
            }}>
              {selectedCustomer ? selectedCustomer.name : 'Select Customer (optional)'}
            </span>
            {selectedCustomer && (
              <button
                onClick={e => { e.stopPropagation(); setSelectedCustomer(null); setRedeemPoints(0); }}
                style={{ color: 'var(--text-muted)', lineHeight: 1 }}>
                <X size={13} />
              </button>
            )}
          </div>

          {selectedCustomer && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', paddingLeft: '4px', fontSize: '12px', color: '#fbbf24' }}>
              <Star size={10} fill="currentColor" />
              {selectedCustomer.loyaltyPoints} pts available
            </div>
          )}

          {showCustDrop && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
              marginTop: '4px', borderRadius: '12px', maxHeight: '192px', overflowY: 'auto',
              background: 'var(--card-bg)', border: '1px solid var(--border-color)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            }}>
              <div style={{ padding: '8px' }}>
                <input
                  autoFocus
                  value={custSearch}
                  onChange={e => setCustSearch(e.target.value)}
                  placeholder="Search customer..."
                  style={{
                    width: '100%', fontSize: '12px', padding: '6px 8px',
                    borderRadius: '8px', outline: 'none', boxSizing: 'border-box',
                    background: 'var(--input-bg)', border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
              {filteredCustomers.map(c => (
                <button
                  key={c.id}
                  onClick={() => { setSelectedCustomer(c); setShowCustDrop(false); setRedeemPoints(0); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    width: '100%', padding: '8px 12px', fontSize: '12px',
                    textAlign: 'left', background: 'transparent', border: 'none',
                    cursor: 'pointer', color: 'var(--text-primary)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--nav-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <div style={{
                    width: '24px', height: '24px', borderRadius: '8px', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '11px', fontWeight: 'bold',
                    background: 'rgba(21,101,192,0.2)', color: '#42A5F5',
                  }}>
                    {c.name.charAt(0)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</p>
                    <p style={{ margin: 0, color: 'var(--text-muted)' }}>{c.phone}</p>
                  </div>
                  <span style={{ color: '#fbbf24', fontFamily: 'monospace' }}>{c.loyaltyPoints}pt</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cart header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 12px', borderBottom: '1px solid var(--border-color)',
      }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
          <ShoppingCart size={15} /> Cart ({cart.length})
        </h2>
        {cart.length > 0 && (
          <button onClick={clearCart}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#f87171', background: 'none', border: 'none', cursor: 'pointer' }}>
            <Trash2 size={11} /> Clear
          </button>
        )}
      </div>

      {/* Items */}
      {cart.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', color: 'var(--text-muted)' }}>
          <ShoppingCart size={36} style={{ opacity: 0.25, marginBottom: '12px' }} />
          <p style={{ margin: 0, fontSize: '14px' }}>Cart is empty</p>
          <p style={{ margin: '4px 0 0', fontSize: '12px' }}>Scan or tap a product to add</p>
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {cart.map(item => (
            <div key={item.id} style={{
              padding: '12px', borderRadius: '12px',
              background: 'var(--input-bg)', border: '1px solid var(--border-color)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-primary)' }}>
                    {item.name}
                  </p>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                    Rs. {item.price.toLocaleString()}
                  </p>
                </div>
                <button onClick={() => removeFromCart(item.id)} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1 }}>
                  <X size={14} />
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button onClick={() => updateCartQty(item.id, item.qty - 1)}
                    style={{ width: '24px', height: '24px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#42A5F5', border: '1px solid rgba(21,101,192,0.4)', background: 'none', cursor: 'pointer' }}>
                    <Minus size={11} />
                  </button>
                  <span style={{ fontFamily: 'monospace', fontSize: '14px', width: '24px', textAlign: 'center', color: 'var(--text-primary)' }}>
                    {item.qty}
                  </span>
                  <button onClick={() => updateCartQty(item.id, item.qty + 1)}
                    style={{ width: '24px', height: '24px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#42A5F5', border: '1px solid rgba(21,101,192,0.4)', background: 'none', cursor: 'pointer' }}>
                    <Plus size={11} />
                  </button>
                </div>
                <span style={{ fontFamily: 'monospace', fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Rs. {(item.price * item.qty).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary & Checkout */}
      <div style={{ padding: '12px', borderTop: '1px solid var(--border-color)' }}>

        {/* Discount */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Tag size={12} style={{ color: 'var(--text-muted)' }} />
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Discount</span>
          <div style={{ display: 'flex', gap: '4px', marginLeft: 'auto' }}>
            {[0, 5, 10, 15].map(d => (
              <button key={d} onClick={() => setDiscount(d)}
                style={{
                  fontSize: '11px', padding: '2px 8px', borderRadius: '6px',
                  fontFamily: 'monospace', cursor: 'pointer', transition: 'all 0.15s',
                  background: discount === d ? '#1565C0' : 'transparent',
                  color: discount === d ? '#fff' : 'var(--text-muted)',
                  border: discount === d ? '1px solid #1565C0' : '1px solid var(--border-color)',
                }}>
                {d}%
              </button>
            ))}
          </div>
        </div>

        {/* Loyalty redeem */}
          {selectedCustomer && selectedCustomer.loyaltyPoints > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '8px',
            marginBottom: '8px', borderRadius: '8px',
            background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)',
          }}>
            <Star size={11} fill="currentColor" style={{ color: '#fbbf24', flexShrink: 0 }} />
            <span style={{ fontSize: '12px', flex: 1, color: '#fbbf24' }}>Redeem pts:</span>
            <input
              type="number" value={redeemPoints || ''} min="0" max={selectedCustomer.loyaltyPoints}
              onChange={e => setRedeemPoints(Math.min(parseInt(e.target.value) || 0, selectedCustomer.loyaltyPoints))}
              style={{
                width: '64px', fontSize: '12px', textAlign: 'center', padding: '2px 4px',
                borderRadius: '8px', outline: 'none', fontFamily: 'monospace',
                background: 'var(--input-bg)', border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
              }}
            />
            {redeemPoints > 0 && (
              <span style={{ fontSize: '12px', fontFamily: 'monospace', color: '#34d399' }}>
                -Rs.{pointsDiscount}
              </span>
            )}
          </div>
        )}
        {selectedCustomer && redeemPoints > 0 && redeemPoints < MIN_REDEEM_POINTS && (
          <div style={{ marginBottom: '8px', fontSize: '12px', color: '#fbbf24' }}>
            Minimum redeem is {MIN_REDEEM_POINTS} points.
          </div>
        )}

        {/* Totals */}
        <div style={{ marginBottom: '8px', fontSize: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '4px' }}>
            <span>Subtotal</span><span style={{ fontFamily: 'monospace' }}>Rs. {subtotal.toLocaleString()}</span>
          </div>
          {discountAmt > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#34d399', marginBottom: '4px' }}>
              <span>Discount ({discount}%)</span><span style={{ fontFamily: 'monospace' }}>-Rs. {discountAmt.toLocaleString()}</span>
            </div>
          )}
          {pointsDiscount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fbbf24', marginBottom: '4px' }}>
              <span>Points ({appliedRedeemPoints}pt)</span><span style={{ fontFamily: 'monospace' }}>-Rs. {pointsDiscount}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '4px' }}>
            <span>Tax ({parseFloat(appSettings?.tax_rate) || 0}%)</span><span style={{ fontFamily: 'monospace' }}>Rs. {tax.toLocaleString()}</span>
          </div>
          <div style={{
            display: 'flex', justifyContent: 'space-between', fontWeight: 'bold',
            fontSize: '16px', paddingTop: '8px', marginTop: '4px',
            borderTop: '1px solid var(--border-color)', color: 'var(--text-primary)',
          }}>
            <span>Total</span>
            <span style={{ fontFamily: 'monospace', color: '#42A5F5' }}>Rs. {grandTotal.toLocaleString()}</span>
          </div>
        </div>

        {/* Payment method */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', marginBottom: '8px' }}>
          {[{ id: 'Cash', icon: Banknote }, { id: 'Card', icon: CreditCard }, { id: 'Digital', icon: Smartphone }].map(({ id, icon: Icon }) => (
            <button key={id} onClick={() => setPayment(id)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                padding: '8px', borderRadius: '12px', fontSize: '12px', cursor: 'pointer',
                transition: 'all 0.15s',
                background: payment === id ? 'rgba(21,101,192,0.3)' : 'var(--input-bg)',
                border: payment === id ? '1px solid rgba(21,101,192,0.6)' : '1px solid var(--border-color)',
                color: payment === id ? 'var(--text-primary)' : 'var(--text-muted)',
              }}>
              <Icon size={15} />{id}
            </button>
          ))}
        </div>

        {/* Checkout button */}
        <button onClick={handleCheckout}
          style={{
            width: '100%', padding: '12px', borderRadius: '12px',
            fontWeight: 600, fontSize: '14px', color: '#fff', cursor: 'pointer',
            border: 'none', background: 'linear-gradient(135deg,#1565C0,#1E88E5)',
            boxShadow: '0 4px 16px rgba(21,101,192,0.3)',
          }}>
          Checkout · Rs. {grandTotal.toLocaleString()}
        </button>
      </div>
    </div>
  );

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <div style={{ height: 'calc(100vh - 65px)', display: 'flex', overflow: 'hidden' }}
      className="animate-fade-in">

      {/* Products panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Search + scan bar */}
        <div style={{ padding: '12px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name or SKU..."
                className="input-field"
                style={{ paddingLeft: '36px', fontSize: '14px' }}
              />
            </div>
            <button onClick={() => setShowScanner(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px',
                borderRadius: '8px', fontSize: '14px', fontWeight: 500, cursor: 'pointer',
                background: 'rgba(21,101,192,0.15)', border: '1px solid rgba(21,101,192,0.35)', color: '#42A5F5',
              }}>
              <QrCode size={16} />
              <span>Scan</span>
            </button>
          </div>

          {/* Category filter */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
            <button onClick={() => setSelectedCat('All')}
              style={{
                flexShrink: 0, fontSize: '12px', padding: '6px 12px',
                borderRadius: '8px', cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
                background: selectedCat === 'All' ? '#1565C0' : 'var(--input-bg)',
                color: selectedCat === 'All' ? '#fff' : 'var(--text-muted)',
                border: selectedCat === 'All' ? '1px solid #1565C0' : '1px solid var(--border-color)',
              }}>
              All
            </button>
            {categories.map(cat => (
              <button key={cat.id} onClick={() => setSelectedCat(cat.name)}
                style={{
                  flexShrink: 0, fontSize: '12px', padding: '6px 12px',
                  borderRadius: '8px', cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
                  background: selectedCat === cat.name ? '#1565C0' : 'var(--input-bg)',
                  color: selectedCat === cat.name ? '#fff' : 'var(--text-muted)',
                  border: selectedCat === cat.name ? '1px solid #1565C0' : '1px solid var(--border-color)',
                }}>
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product grid */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '12px',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: '10px', alignContent: 'start',
        }}>
          {filtered.map(product => (
            <button key={product.id} onClick={() => addToCart(product)}
              disabled={product.stock === 0}
              className="pos-item-card"
              style={{ opacity: product.stock === 0 ? 0.5 : 1, textAlign: 'left' }}>
              <div style={{
                width: '100%', aspectRatio: '1', borderRadius: '8px', marginBottom: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px',
                background: product.image ? `center / cover no-repeat url(${product.image})` : 'var(--input-bg)',
                color: product.image ? 'transparent' : 'inherit',
              }}>📦</div>
              <p style={{ margin: '0 0 6px', fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {product.name}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'monospace', fontSize: '14px', fontWeight: 600, color: '#42A5F5' }}>
                  Rs. {product.price.toLocaleString()}
                </span>
                <span style={{ fontSize: '11px', color: product.stock <= product.minStock ? '#fbbf24' : 'var(--text-muted)' }}>
                  {product.stock}
                </span>
              </div>
              <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--text-muted)', marginTop: '2px', display: 'block' }}>
                {product.sku}
              </span>
            </button>
          ))}
        </div>

        {/* Mobile checkout button */}
        <div style={{ padding: '12px', borderTop: '1px solid var(--border-color)', display: 'none' }}
          className="mobile-cart-btn">
          <button onClick={() => setShowCart(true)}
            style={{
              width: '100%', padding: '12px', borderRadius: '12px',
              fontWeight: 600, fontSize: '14px', color: '#fff', cursor: 'pointer',
              border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              background: 'linear-gradient(135deg,#1565C0,#1E88E5)',
            }}>
            <ShoppingCart size={16} /> Cart ({cart.length}) · Rs. {grandTotal.toLocaleString()}
          </button>
        </div>
      </div>

      {/* ✅ Desktop cart sidebar — inline styles only, no Tailwind hidden/flex */}
      <div style={{
        width: '300px',
        minWidth: '300px',
        display: 'flex',
        flexDirection: 'column',
        borderLeft: '1px solid var(--border-color)',
        background: 'var(--sidebar-bg)',
        overflow: 'hidden',
      }}>
        {cartContent}
      </div>

      {/* Mobile cart drawer */}
      {showCart && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)' }}
            onClick={() => setShowCart(false)} />
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: '90vh',
            borderRadius: '16px 16px 0 0', display: 'flex', flexDirection: 'column',
            background: 'var(--bg-primary)', border: '1px solid var(--border-color)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Cart</span>
              <button onClick={() => setShowCart(false)} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {cartContent}
            </div>
          </div>
        </div>
      )}

      {/* QR Scanner */}
      {showScanner && <QRScanner onScan={handleScan} onClose={() => setShowScanner(false)} />}

      {/* Receipt Modal */}
      {showReceipt && (
        <ReceiptModal
          saleData={receiptData}
          cart={cart}
          onClose={() => setShowReceipt(false)}
          onConfirm={handleCompleteSale}
        />
      )}

      {/* Sale complete flash */}
      {completedSale && (
        <div onClick={() => setCompletedSale(null)}
          style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)' }}>
          <div className="glass animate-slide-up"
            style={{ borderRadius: '16px', padding: '32px', textAlign: 'center', maxWidth: '280px', margin: '0 16px' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%', margin: '0 auto 16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(52,211,153,0.2)', border: '2px solid rgba(52,211,153,0.5)',
            }}>
              <span style={{ fontSize: '32px', color: '#34d399' }}>✓</span>
            </div>
            <h3 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>Sale Complete!</h3>
            <p style={{ margin: '0 0 8px', fontSize: '12px', color: 'var(--text-muted)' }}>{completedSale.id}</p>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 700, fontFamily: 'monospace', color: '#42A5F5' }}>
              Rs. {completedSale.total.toLocaleString()}
            </p>
            <p style={{ margin: '12px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>Tap anywhere to close</p>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { Star, Gift, TrendingUp, Award, Search, Plus, Minus, RefreshCw, Crown } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function LoyaltyPoints() {
  const { customers, setCustomers, showNotification, POINTS_VALUE } = useApp();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [redeemAmt, setRedeemAmt] = useState('');
  const [addAmt, setAddAmt] = useState('');

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
  );

  const totalPoints = customers.reduce((s, c) => s + c.loyaltyPoints, 0);
  const totalValue = (totalPoints * POINTS_VALUE).toFixed(2);

  const tiers = [
    { name: 'Bronze', min: 0, max: 499, color: '#CD7F32', icon: '🥉' },
    { name: 'Silver', min: 500, max: 1499, color: '#C0C0C0', icon: '🥈' },
    { name: 'Gold', min: 1500, max: 2999, color: '#FFD700', icon: '🥇' },
    { name: 'Platinum', min: 3000, max: Infinity, color: '#42A5F5', icon: '💎' },
  ];

  const getTier = (pts) => tiers.find(t => pts >= t.min && pts <= t.max) || tiers[0];

  const handleRedeem = () => {
    if (!selected || !redeemAmt) return;
    const pts = parseInt(redeemAmt);
    if (pts > selected.loyaltyPoints) { showNotification('Not enough points!', 'error'); return; }
    const discount = (pts * POINTS_VALUE).toFixed(2);
    setCustomers(prev => prev.map(c =>
      c.id === selected.id ? { ...c, loyaltyPoints: c.loyaltyPoints - pts } : c
    ));
    setSelected(prev => ({ ...prev, loyaltyPoints: prev.loyaltyPoints - pts }));
    showNotification(`Redeemed ${pts} pts = Rs. ${discount} discount!`);
    setRedeemAmt('');
  };

  const handleAdd = () => {
    if (!selected || !addAmt) return;
    const pts = parseInt(addAmt);
    setCustomers(prev => prev.map(c =>
      c.id === selected.id ? { ...c, loyaltyPoints: c.loyaltyPoints + pts } : c
    ));
    setSelected(prev => ({ ...prev, loyaltyPoints: prev.loyaltyPoints + pts }));
    showNotification(`Added ${pts} points to ${selected.name}`);
    setAddAmt('');
  };

  return (
    <div className="p-4 md:p-6 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Members', value: customers.length, icon: Star, color: '#42A5F5' },
          { label: 'Total Points Issued', value: totalPoints.toLocaleString(), icon: Gift, color: '#FFD700' },
          { label: 'Points Value', value: `Rs. ${totalValue}`, icon: TrendingUp, color: '#34D399' },
          { label: 'Avg Points/Member', value: Math.round(totalPoints / customers.length), icon: Award, color: '#A78BFA' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${s.color}18`, border: `1px solid ${s.color}28` }}>
                <s.icon size={16} style={{ color: s.color }} />
              </div>
            </div>
            <div className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{s.value}</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tier Info */}
      <div className="glass rounded-xl p-5 mb-6">
        <h3 className="font-semibold mb-4 text-sm" style={{ color: 'var(--text-primary)' }}>Loyalty Tiers</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {tiers.map(t => {
            const count = customers.filter(c => c.loyaltyPoints >= t.min && c.loyaltyPoints <= t.max).length;
            return (
              <div key={t.name} className="p-3 rounded-xl text-center" style={{ background: 'var(--input-bg)', border: `1px solid ${t.color}30` }}>
                <div className="text-2xl mb-1">{t.icon}</div>
                <div className="font-semibold text-sm" style={{ color: t.color }}>{t.name}</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {t.max === Infinity ? `${t.min}+ pts` : `${t.min}–${t.max} pts`}
                </div>
                <div className="text-lg font-bold mt-1" style={{ color: 'var(--text-primary)' }}>{count}</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>members</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Customer List */}
        <div className="xl:col-span-2">
          <div className="relative mb-3">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or phone..."
              className="input-field pl-9" />
          </div>

          <div className="space-y-2">
            {filtered.map(c => {
              const tier = getTier(c.loyaltyPoints);
              const nextTier = tiers[tiers.findIndex(t => t.name === tier.name) + 1];
              const progress = nextTier
                ? Math.min(100, ((c.loyaltyPoints - tier.min) / (nextTier.min - tier.min)) * 100)
                : 100;

              return (
                <button key={c.id} onClick={() => setSelected(s => s?.id === c.id ? null : c)}
                  className="w-full text-left p-4 rounded-xl transition-all"
                  style={{
                    background: selected?.id === c.id ? 'rgba(21,101,192,0.15)' : 'var(--card-bg)',
                    border: selected?.id === c.id ? '1px solid rgba(21,101,192,0.5)' : '1px solid var(--border-color)'
                  }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
                      style={{ background: `${tier.color}20`, color: tier.color, border: `1px solid ${tier.color}30` }}>
                      {c.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{c.name}</span>
                        <span className="text-xs px-1.5 py-0.5 rounded-full font-medium" style={{ background: `${tier.color}20`, color: tier.color }}>
                          {tier.icon} {tier.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                          <Star size={10} className="text-amber-400" fill="currentColor" />
                          <span className="font-mono font-semibold text-amber-400">{c.loyaltyPoints.toLocaleString()}</span>
                          <span>pts</span>
                        </div>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>= Rs. {(c.loyaltyPoints * POINTS_VALUE).toFixed(0)}</span>
                      </div>
                      {nextTier && (
                        <div className="mt-1.5">
                          <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(21,101,192,0.15)' }}>
                            <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${tier.color}, ${nextTier.color})` }} />
                          </div>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                            {nextTier.min - c.loyaltyPoints} pts to {nextTier.name}
                          </p>
                        </div>
                      )}
                      {!nextTier && <p className="text-xs mt-1" style={{ color: tier.color }}>🏆 Maximum tier reached!</p>}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
                        Rs. {c.totalSpent.toLocaleString()}
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>total spent</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions Panel */}
        <div className="space-y-4">
          {selected ? (
            <>
              <div className="glass rounded-xl p-5">
                <div className="flex items-center gap-3 mb-4 pb-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold"
                    style={{ background: 'linear-gradient(135deg,#1565C0,#42A5F5)', color: '#fff' }}>
                    {selected.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{selected.name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{selected.phone}</p>
                  </div>
                </div>

                <div className="text-center py-3 mb-4 rounded-xl" style={{ background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.2)' }}>
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <Star size={16} className="text-amber-400" fill="currentColor" />
                    <span className="text-2xl font-bold font-mono text-amber-400">{selected.loyaltyPoints.toLocaleString()}</span>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Available Points</p>
                  <p className="text-sm font-semibold text-emerald-400 mt-1">= Rs. {(selected.loyaltyPoints * POINTS_VALUE).toFixed(2)}</p>
                </div>

                {/* Redeem */}
                <div className="mb-4">
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
                    <Minus size={12} className="inline mr-1" />Redeem Points
                  </label>
                  <div className="flex gap-2">
                    <input type="number" value={redeemAmt} onChange={e => setRedeemAmt(e.target.value)}
                      placeholder="Enter points" className="input-field flex-1 text-sm" max={selected.loyaltyPoints} />
                    <button onClick={handleRedeem} className="px-3 py-2 rounded-lg text-white text-sm font-medium"
                      style={{ background: 'linear-gradient(135deg,#dc2626,#ef4444)' }}>
                      Redeem
                    </button>
                  </div>
                  {redeemAmt && <p className="text-xs mt-1 text-emerald-400">= Rs. {(parseInt(redeemAmt || 0) * POINTS_VALUE).toFixed(2)} discount</p>}
                </div>

                {/* Add Points */}
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
                    <Plus size={12} className="inline mr-1" />Add Bonus Points
                  </label>
                  <div className="flex gap-2">
                    <input type="number" value={addAmt} onChange={e => setAddAmt(e.target.value)}
                      placeholder="Enter points" className="input-field flex-1 text-sm" />
                    <button onClick={handleAdd} className="px-3 py-2 rounded-lg text-white text-sm font-medium"
                      style={{ background: 'linear-gradient(135deg,#1565C0,#1E88E5)' }}>
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick redeem buttons */}
              <div className="glass rounded-xl p-4">
                <p className="text-xs font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>Quick Redeem</p>
                <div className="grid grid-cols-2 gap-2">
                  {[100, 250, 500, 1000].map(pts => (
                    <button key={pts} onClick={() => {
                      if (pts > selected.loyaltyPoints) { showNotification('Not enough points!', 'error'); return; }
                      setRedeemAmt(String(pts));
                    }}
                      className="py-2 rounded-lg text-xs font-medium transition-all"
                      style={{
                        background: 'var(--input-bg)',
                        border: '1px solid var(--border-color)',
                        color: selected.loyaltyPoints >= pts ? 'var(--text-primary)' : 'var(--text-muted)',
                        opacity: selected.loyaltyPoints >= pts ? 1 : 0.5
                      }}>
                      {pts} pts<br />
                      <span className="text-emerald-400">Rs. {(pts * POINTS_VALUE).toFixed(0)}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="glass rounded-xl p-8 text-center">
              <Crown size={36} className="text-amber-400 mx-auto mb-3 opacity-60" />
              <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Select a customer</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>to manage their loyalty points</p>
            </div>
          )}

          {/* Earning rules */}
          <div className="glass rounded-xl p-4">
            <h4 className="text-xs font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>Earning Rules</h4>
            <div className="space-y-2 text-xs" style={{ color: 'var(--text-muted)' }}>
              <div className="flex justify-between"><span>Every Rs. 100 spent</span><span className="text-amber-400 font-mono">+1 pt</span></div>
              <div className="flex justify-between"><span>1 point value</span><span className="text-emerald-400 font-mono">Rs. 0.50</span></div>
              <div className="flex justify-between"><span>Min redeem</span><span className="font-mono" style={{ color: 'var(--text-primary)' }}>100 pts</span></div>
              <div className="flex justify-between"><span>Points expire</span><span className="font-mono" style={{ color: 'var(--text-primary)' }}>12 months</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

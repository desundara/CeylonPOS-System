import React, { useState } from 'react';
import { Star, Gift, TrendingUp, Award, Search, Plus, Minus, RefreshCw, Crown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { customerService } from '../api/customerService';

export default function LoyaltyPoints() {
  const { customers, refreshData, showNotification, POINTS_VALUE, MIN_REDEEM_POINTS } = useApp();
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

  const handleRedeem = async () => {
    if (!selected || !redeemAmt) return;
    const pts = parseInt(redeemAmt);
    if (Number.isNaN(pts) || pts <= 0) { showNotification('Enter a valid number of points', 'error'); return; }
    if (pts < MIN_REDEEM_POINTS) { showNotification(`Minimum redeem is ${MIN_REDEEM_POINTS} points`, 'error'); return; }
    if (pts > selected.loyaltyPoints) { showNotification('Not enough points!', 'error'); return; }

    try {
      const result = await customerService.redeemPoints(selected.id, pts, 'Manual loyalty redemption');
      await refreshData();
      setSelected(prev => prev ? { ...prev, loyaltyPoints: result.customer.loyalty_points } : prev);
      showNotification(`Redeemed ${pts} pts = Rs. ${parseFloat(result.discount_value).toFixed(2)} discount!`);
      setRedeemAmt('');
    } catch (error) {
      showNotification('Failed to redeem points: ' + error.message, 'error');
    }
  };

  const handleAdd = async () => {
    if (!selected || !addAmt) return;
    const pts = parseInt(addAmt);
    if (Number.isNaN(pts) || pts <= 0) { showNotification('Enter a valid number of points', 'error'); return; }

    try {
      const result = await customerService.addPoints(selected.id, pts, 'Manual loyalty bonus');
      await refreshData();
      setSelected(prev => prev ? { ...prev, loyaltyPoints: result.customer.loyalty_points } : prev);
      showNotification(`Added ${pts} points to ${selected.name}`);
      setAddAmt('');
    } catch (error) {
      showNotification('Failed to add points: ' + error.message, 'error');
    }
  };

  return (
    <div className="p-4 md:p-6 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6 lg:grid-cols-4">
        {[
          { label: 'Total Members', value: customers.length, icon: Star, color: '#42A5F5' },
          { label: 'Total Points Issued', value: totalPoints.toLocaleString(), icon: Gift, color: '#FFD700' },
          { label: 'Points Value', value: `Rs. ${totalValue}`, icon: TrendingUp, color: '#34D399' },
          { label: 'Avg Points/Member', value: customers.length ? Math.round(totalPoints / customers.length) : 0, icon: Award, color: '#A78BFA' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl" style={{ background: `${s.color}18`, border: `1px solid ${s.color}28` }}>
                <s.icon size={16} style={{ color: s.color }} />
              </div>
            </div>
            <div className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{s.value}</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tier Info */}
      <div className="p-5 mb-6 glass rounded-xl">
        <h3 className="mb-4 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Loyalty Tiers</h3>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {tiers.map(t => {
            const count = customers.filter(c => c.loyaltyPoints >= t.min && c.loyaltyPoints <= t.max).length;
            return (
              <div key={t.name} className="p-3 text-center rounded-xl" style={{ background: 'var(--input-bg)', border: `1px solid ${t.color}30` }}>
                <div className="mb-1 text-2xl">{t.icon}</div>
                <div className="text-sm font-semibold" style={{ color: t.color }}>{t.name}</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {t.max === Infinity ? `${t.min}+ pts` : `${t.min}–${t.max} pts`}
                </div>
                <div className="mt-1 text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{count}</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>members</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Customer List */}
        <div className="xl:col-span-2">
          <div className="relative mb-3">
            {/* <Search size={14} className="absolute -translate-y-1/2 left-3 top-1/2" style={{ color: 'var(--text-muted)' }} /> */}
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
                  className="w-full p-4 text-left transition-all rounded-xl"
                  style={{
                    background: selected?.id === c.id ? 'rgba(21,101,192,0.15)' : 'var(--card-bg)',
                    border: selected?.id === c.id ? '1px solid rgba(21,101,192,0.5)' : '1px solid var(--border-color)'
                  }}>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 text-sm font-bold rounded-xl"
                      style={{ background: `${tier.color}20`, color: tier.color, border: `1px solid ${tier.color}30` }}>
                      {c.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{c.name}</span>
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
                          <div className="h-1 overflow-hidden rounded-full" style={{ background: 'rgba(21,101,192,0.15)' }}>
                            <div className="h-full transition-all rounded-full" style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${tier.color}, ${nextTier.color})` }} />
                          </div>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                            {nextTier.min - c.loyaltyPoints} pts to {nextTier.name}
                          </p>
                        </div>
                      )}
                      {!nextTier && <p className="mt-1 text-xs" style={{ color: tier.color }}>🏆 Maximum tier reached!</p>}
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <div className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>
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
              <div className="p-5 glass rounded-xl">
                <div className="flex items-center gap-3 pb-4 mb-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
                  <div className="flex items-center justify-center w-12 h-12 text-xl font-bold rounded-xl"
                    style={{ background: 'linear-gradient(135deg,#1565C0,#42A5F5)', color: '#fff' }}>
                    {selected.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{selected.name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{selected.phone}</p>
                  </div>
                </div>

                <div className="py-3 mb-4 text-center rounded-xl" style={{ background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.2)' }}>
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <Star size={16} className="text-amber-400" fill="currentColor" />
                    <span className="font-mono text-2xl font-bold text-amber-400">{selected.loyaltyPoints.toLocaleString()}</span>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Available Points</p>
                  <p className="mt-1 text-sm font-semibold text-emerald-400">= Rs. {(selected.loyaltyPoints * POINTS_VALUE).toFixed(2)}</p>
                </div>

                {/* Redeem */}
                <div className="mb-4">
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
                    <Minus size={12} className="inline mr-1" />Redeem Points
                  </label>
                  <div className="flex gap-2">
                    <input type="number" value={redeemAmt} onChange={e => setRedeemAmt(e.target.value)}
                      placeholder="Enter points" className="flex-1 text-sm input-field" max={selected.loyaltyPoints} />
                    <button onClick={handleRedeem} className="px-3 py-2 text-sm font-medium text-white rounded-lg"
                      style={{ background: 'linear-gradient(135deg,#dc2626,#ef4444)' }}>
                      Redeem
                    </button>
                  </div>
                  {redeemAmt && <p className="mt-1 text-xs text-emerald-400">= Rs. {(parseInt(redeemAmt || 0) * POINTS_VALUE).toFixed(2)} discount</p>}
                </div>

                {/* Add Points */}
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
                    <Plus size={12} className="inline mr-1" />Add Bonus Points
                  </label>
                  <div className="flex gap-2">
                    <input type="number" value={addAmt} onChange={e => setAddAmt(e.target.value)}
                      placeholder="Enter points" className="flex-1 text-sm input-field" />
                    <button onClick={handleAdd} className="px-3 py-2 text-sm font-medium text-white rounded-lg"
                      style={{ background: 'linear-gradient(135deg,#1565C0,#1E88E5)' }}>
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick redeem buttons */}
              <div className="p-4 glass rounded-xl">
                <p className="mb-3 text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Quick Redeem</p>
                <div className="grid grid-cols-2 gap-2">
                  {[100, 250, 500, 1000].map(pts => (
                    <button key={pts} onClick={() => {
                      if (pts > selected.loyaltyPoints) { showNotification('Not enough points!', 'error'); return; }
                      setRedeemAmt(String(pts));
                    }}
                      className="py-2 text-xs font-medium transition-all rounded-lg"
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
            <div className="p-8 text-center glass rounded-xl">
              <Crown size={36} className="mx-auto mb-3 text-amber-400 opacity-60" />
              <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Select a customer</p>
              <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>to manage their loyalty points</p>
            </div>
          )}

          {/* Earning rules */}
          <div className="p-4 glass rounded-xl">
            <h4 className="mb-3 text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Earning Rules</h4>
            <div className="space-y-2 text-xs" style={{ color: 'var(--text-muted)' }}>
              <div className="flex justify-between"><span>Every Rs. 100 spent</span><span className="font-mono text-amber-400">+1 pt</span></div>
              <div className="flex justify-between"><span>1 point value</span><span className="font-mono text-emerald-400">Rs. 0.50</span></div>
              <div className="flex justify-between"><span>Min redeem</span><span className="font-mono" style={{ color: 'var(--text-primary)' }}>100 pts</span></div>
              <div className="flex justify-between"><span>Points expire</span><span className="font-mono" style={{ color: 'var(--text-primary)' }}>12 months</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

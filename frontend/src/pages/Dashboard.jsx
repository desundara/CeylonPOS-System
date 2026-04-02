import React from 'react';
import { TrendingUp, ShoppingBag, Package, Users, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useApp } from '../context/AppContext';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="px-3 py-2 text-xs rounded-lg glass" style={{ color: 'var(--text-primary)' }}>
        <p className="mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>Rs. {p.value.toLocaleString()}</p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const { lowStockProducts, setActivePage, transactions, products, customers, dailyMetrics, monthlyMetrics, topProducts } = useApp();

  const todayStr = new Date().toLocaleDateString('en-LK');
  const todaySales = transactions.filter(t => t.date === todayStr);
  const todayRevenue = todaySales.reduce((s, t) => s + (parseFloat(t.total) || 0), 0);
  
  const stats = [
    { label: "Today's Revenue", value: `Rs. ${todayRevenue.toLocaleString()}`, sub: 'Live from backend', icon: TrendingUp, trend: 'up', color: '#42A5F5' },
    { label: 'Orders Today', value: todaySales.length.toString(), sub: 'Live from backend', icon: ShoppingBag, trend: 'up', color: '#34D399' },
    { label: 'Low Stock Items', value: lowStockProducts.length, sub: 'Need restocking', icon: AlertTriangle, trend: 'down', color: '#FBBF24' },
    { label: 'Total Customers', value: customers.length.toLocaleString(), sub: 'Registered customers', icon: Users, trend: 'up', color: '#A78BFA' },
  ];

  return (
    <div className="p-4 space-y-6 md:p-6 animate-fade-in" style={{ color: 'var(--text-primary)' }}>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s, i) => (
          <div key={i} className="stat-card animate-slide-up"
            style={{ animationDelay: `${i * 0.08}s`, color: 'var(--text-primary)' }}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl"
                style={{ background: `${s.color}18`, border: `1px solid ${s.color}30` }}>
                <s.icon size={18} style={{ color: s.color }} />
              </div>
              <div className="flex items-center gap-0.5 text-xs font-medium"
                style={{ color: s.trend === 'up' ? '#34d399' : '#fbbf24' }}>
                {s.trend === 'up' ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
              </div>
            </div>
            <div className="text-xl md:text-2xl font-bold mb-0.5" style={{ color: 'var(--text-primary)' }}>
              {s.value}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
            <div className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="p-5 lg:col-span-2 glass rounded-xl" style={{ color: 'var(--text-primary)' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Weekly Revenue</h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Revenue vs Profit this week</p>
            </div>
            <span className="badge badge-blue">This Week</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={dailyMetrics}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#1565C0" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#1565C0" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="profGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#42A5F5" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#42A5F5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip content={CustomTooltip} />
              <Area type="monotone" dataKey="revenue" stroke="#1565C0" strokeWidth={2} fill="url(#revGrad)" />
              <Area type="monotone" dataKey="profit"  stroke="#42A5F5" strokeWidth={2} fill="url(#profGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="p-5 glass rounded-xl" style={{ color: 'var(--text-primary)' }}>
          <div className="mb-4">
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Monthly Sales</h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Past 7 months</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyMetrics} barSize={18}>
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={CustomTooltip} />
              <Bar dataKey="revenue" fill="#1565C0" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="p-5 glass rounded-xl" style={{ color: 'var(--text-primary)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Recent Transactions</h3>
            <button onClick={() => setActivePage('reports')} className="text-xs text-blue-400 hover:text-blue-300">View all</button>
          </div>
          <div className="space-y-2">
            {(transactions.length > 0 ? transactions : []).slice(0, 4).map((sale, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 border-b last:border-0"
                style={{ borderColor: 'var(--border-color)' }}>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{sale.id}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{sale.customer} · {sale.time}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Rs. {sale.total.toLocaleString()}</p>
                  <span className={`badge ${sale.payment === 'Cash' ? 'badge-green' : sale.payment === 'Card' ? 'badge-blue' : 'badge-yellow'}`}>
                    {sale.payment}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 glass rounded-xl" style={{ color: 'var(--text-primary)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Top Products</h3>
            <button onClick={() => setActivePage('inventory')} className="text-xs text-blue-400 hover:text-blue-300">View inventory</button>
          </div>
          <div className="space-y-3">
            {topProducts.map((p, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex items-center justify-center flex-shrink-0 text-xs font-bold rounded-lg w-7 h-7"
                  style={{ background: 'rgba(21,101,192,0.15)', border: '1px solid rgba(21,101,192,0.25)', color: '#42A5F5' }}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{p.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex-1 h-1 rounded-full" style={{ background: 'var(--border-color)' }}>
                      <div className="h-1 rounded-full"
                        style={{ width: `${(p.sold/500)*100}%`, background: 'linear-gradient(90deg,#1565C0,#42A5F5)' }} />
                    </div>
                    <span className="flex-shrink-0 text-xs" style={{ color: 'var(--text-muted)' }}>{p.sold} sold</span>
                  </div>
                </div>
                <p className="flex-shrink-0 font-mono text-xs" style={{ color: '#34d399' }}>
                  Rs. {(p.revenue/1000).toFixed(0)}k
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div className="p-5 glass rounded-xl"
          style={{ borderColor: 'rgba(245,158,11,0.3)', color: 'var(--text-primary)' }}>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} style={{ color: '#fbbf24' }} />
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Low Stock Alerts</h3>
            <span className="ml-auto badge badge-yellow">{lowStockProducts.length} items</span>
          </div>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
            {lowStockProducts.map((p, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg"
                style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
                <Package size={14} style={{ color: '#fbbf24', flexShrink: 0 }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{p.name}</p>
                  <p className="text-xs" style={{ color: '#fbbf24' }}>Stock: {p.stock} / Min: {p.minStock}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

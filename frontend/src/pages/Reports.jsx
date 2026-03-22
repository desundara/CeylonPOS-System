import React, { useState } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Download, Calendar } from 'lucide-react';
import { salesData, monthlyData, topProducts, recentSales } from '../data/mockData';
import { useApp } from '../context/AppContext';

const COLORS = ['#1565C0', '#1E88E5', '#42A5F5', '#64B5F6', '#90CAF9'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="px-3 py-2 text-xs rounded-lg glass">
        <p className="mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>Rs. {p.value?.toLocaleString()}</p>
        ))}
      </div>
    );
  }
  return null;
};

const pieData = [
  { name: 'Cash', value: 58 },
  { name: 'Card', value: 27 },
  { name: 'Digital', value: 15 },
];

export default function Reports() {
  const { transactions } = useApp();
  const [period, setPeriod] = useState('week');

  const summaryStats = [
    { label: 'Total Revenue', value: 'Rs. 1,240,000', change: '+8.2%', up: true },
    { label: 'Net Profit', value: 'Rs. 374,800', change: '+5.1%', up: true },
    { label: 'Orders', value: '1,284', change: '+12.4%', up: true },
    { label: 'Avg Order Value', value: 'Rs. 966', change: '-2.1%', up: false },
  ];

  return (
    <div className="p-4 md:p-6 animate-fade-in">
      <div className="flex flex-col items-start justify-between gap-3 mb-6 sm:flex-row sm:items-center">
        <div className="flex gap-2">
          {['week', 'month', 'quarter'].map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className="text-xs px-3 py-1.5 rounded-lg capitalize transition-all"
              style={period === p
                ? { background: '#1565C0', color: '#fff' }
                : { background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
              {p === 'week' ? 'This Week' : p === 'month' ? 'This Month' : 'This Quarter'}
            </button>
          ))}
        </div>
        <button className="flex-shrink-0 text-sm btn-ghost">
          <Download size={14} /> Export PDF
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6 lg:grid-cols-4">
        {summaryStats.map((s, i) => (
          <div key={i} className="p-4 glass rounded-xl">
            <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{s.value}</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
            <div className={`text-xs mt-1 font-medium ${s.up ? 'text-emerald-400' : 'text-red-400'}`}>{s.change} vs last period</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 mb-4 lg:grid-cols-3">
        <div className="p-5 lg:col-span-2 glass rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Revenue & Profit Trend</h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Daily breakdown</p>
            </div>
            <TrendingUp size={16} className="text-blue-400" />
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={salesData}>
              <defs>
                <linearGradient id="rg2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1565C0" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#1565C0" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="pg2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34D399" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#34D399" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#1565C0" strokeWidth={2} fill="url(#rg2)" />
              <Area type="monotone" dataKey="profit" stroke="#34D399" strokeWidth={2} fill="url(#pg2)" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-4 mt-2">
            <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
              <div className="w-3 h-0.5 bg-blue-600 rounded"></div>Revenue
            </div>
            <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
              <div className="w-3 h-0.5 bg-emerald-400 rounded"></div>Profit
            </div>
          </div>
        </div>

        <div className="p-5 glass rounded-xl">
          <h3 className="mb-1 font-semibold" style={{ color: 'var(--text-primary)' }}>Payment Methods</h3>
          <p className="mb-4 text-xs" style={{ color: 'var(--text-muted)' }}>Distribution this period</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip formatter={(v) => `${v}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 space-y-2">
            {pieData.map((d, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i] }}></div>
                  <span style={{ color: 'var(--text-muted)' }}>{d.name}</span>
                </div>
                <span className="font-mono" style={{ color: 'var(--text-primary)' }}>{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-4 lg:grid-cols-2">
        <div className="p-5 glass rounded-xl">
          <h3 className="mb-1 font-semibold" style={{ color: 'var(--text-primary)' }}>Monthly Revenue</h3>
          <p className="mb-4 text-xs" style={{ color: 'var(--text-muted)' }}>Past 7 months</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={monthlyData} barSize={22}>
              <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                {monthlyData.map((_, i) => <Cell key={i} fill={i === monthlyData.length - 1 ? '#42A5F5' : '#1565C0'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="p-5 glass rounded-xl">
          <h3 className="mb-4 font-semibold" style={{ color: 'var(--text-primary)' }}>Top Selling Products</h3>
          <div className="space-y-3">
            {topProducts.map((p, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-4 font-mono text-xs" style={{ color: 'var(--text-muted)' }}>{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{p.name}</span>
                    <span className="flex-shrink-0 ml-2 text-xs" style={{ color: 'var(--text-muted)' }}>{p.sold} sold</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: 'var(--border-color)' }}>
                    <div className="h-1.5 rounded-full" style={{ width: `${(p.sold / 500) * 100}%`, background: 'linear-gradient(90deg, #1565C0, #42A5F5)' }}></div>
                  </div>
                </div>
                <span className="flex-shrink-0 font-mono text-xs text-emerald-400">Rs. {(p.revenue / 1000).toFixed(0)}k</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-hidden glass rounded-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Recent Transactions</h3>
          <button className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300">
            <Calendar size={12} /> View All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--input-bg)' }}>
                {['Invoice', 'Customer', 'Items', 'Payment', 'Time', 'Amount'].map(h => (
                  <th key={h} className="px-4 py-3 text-xs font-semibold tracking-wider text-left uppercase whitespace-nowrap"
                    style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(transactions || recentSales).slice(0, 8).map((s, i) => (
                <tr key={i} className="table-row">
                  <td className="px-4 py-3 font-mono text-xs text-blue-400">{s.id}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-primary)' }}>{s.customer}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-muted)' }}>{s.items}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${s.payment === 'Cash' ? 'badge-green' : s.payment === 'Card' ? 'badge-blue' : 'badge-yellow'}`}>
                      {s.payment}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--text-muted)' }}>{s.time}</td>
                  <td className="px-4 py-3 font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>Rs. {s.total.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
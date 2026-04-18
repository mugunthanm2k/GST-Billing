import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import {
  FileText, Users, Package, TrendingUp, Plus, ArrowUpRight,
  IndianRupee, Clock, CheckCircle2, AlertCircle, BarChart3
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts'

const StatCard = ({ label, value, icon: Icon, gradient, sub, change }) => (
  <div className="card p-5 hover:border-slate-700/80 transition-all duration-200 hover:-translate-y-0.5 group">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${gradient}`}>
        <Icon size={18} />
      </div>
      {change !== undefined && (
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${change >= 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'}`}>
          {change >= 0 ? '+' : ''}{change}%
        </span>
      )}
    </div>
    <div className="text-2xl font-bold text-white mb-0.5">{value}</div>
    <div className="text-xs text-slate-500 font-medium">{label}</div>
    {sub && <div className="text-xs text-slate-600 mt-1">{sub}</div>}
  </div>
)

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs shadow-xl">
      <p className="text-slate-400 mb-1.5">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name}: ₹{p.value?.toLocaleString('en-IN')}
        </p>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats]               = useState(null)
  const [recentInvoices, setRecent]     = useState([])
  const [chartData, setChartData]       = useState([])
  const [loading, setLoading]           = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/stats'),
      api.get('/invoices'),
    ]).then(([statsRes, invRes]) => {
      setStats(statsRes.data)
      const invList = invRes.data
      setRecent(invList.slice(0, 6))

      // Build last-6-months chart data from invoices
      const months = []
      const now = new Date()
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const label = d.toLocaleString('default', { month: 'short' })
        const revenue = invList
          .filter(inv => {
            const id = new Date(inv.invoiceDate)
            return id.getMonth() === d.getMonth() && id.getFullYear() === d.getFullYear() && inv.status === 'PAID'
          })
          .reduce((sum, inv) => sum + (inv.grandTotal || 0), 0)
        const tax = invList
          .filter(inv => {
            const id = new Date(inv.invoiceDate)
            return id.getMonth() === d.getMonth() && id.getFullYear() === d.getFullYear()
          })
          .reduce((sum, inv) => sum + (inv.totalTax || 0), 0)
        months.push({ month: label, revenue: Math.round(revenue), tax: Math.round(tax) })
      }
      setChartData(months)
    }).finally(() => setLoading(false))
  }, [])

  const fmt = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0)

  const statusBadge = (status) => {
    const map = { PAID: 'badge-paid', DRAFT: 'badge-draft', SENT: 'badge-sent', OVERDUE: 'badge-overdue', CANCELLED: 'badge-cancelled' }
    return map[status] || 'badge-draft'
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Your GST billing overview</p>
        </div>
        <Link to="/invoices/new" className="btn-primary">
          <Plus size={16} /> New Invoice
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total Invoices"
          value={loading ? '—' : stats?.totalInvoices ?? 0}
          icon={FileText}
          gradient="bg-indigo-500/15 text-indigo-400"
          sub={`${stats?.paidInvoices ?? 0} paid`}
        />
        <StatCard
          label="Total Revenue"
          value={loading ? '—' : fmt(stats?.totalRevenue)}
          icon={IndianRupee}
          gradient="bg-emerald-500/15 text-emerald-400"
          sub="All time (paid)"
        />
        <StatCard
          label="This Month"
          value={loading ? '—' : fmt(stats?.monthlyRevenue)}
          icon={TrendingUp}
          gradient="bg-sky-500/15 text-sky-400"
          sub="Monthly revenue"
        />
        <StatCard
          label="Customers"
          value={loading ? '—' : stats?.totalCustomers ?? 0}
          icon={Users}
          gradient="bg-amber-500/15 text-amber-400"
          sub={`${stats?.totalProducts ?? 0} products`}
        />
      </div>

      {/* Status row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pending / Sent',  val: stats?.pendingInvoices,  icon: Clock,         cls: 'text-sky-400',     bg: 'bg-sky-500/10 border-sky-500/20'     },
          { label: 'Overdue',         val: stats?.overdueInvoices,  icon: AlertCircle,   cls: 'text-rose-400',    bg: 'bg-rose-500/10 border-rose-500/20'   },
          { label: 'Paid',            val: stats?.paidInvoices,     icon: CheckCircle2,  cls: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
        ].map(({ label, val, icon: Icon, cls, bg }) => (
          <div key={label} className={`card p-5 border ${bg} flex items-center gap-3`}>
            <Icon className={cls} size={22} />
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">{label}</p>
              <p className={`text-2xl font-bold ${cls}`}>{loading ? '—' : val ?? 0}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Revenue chart */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-white">Revenue Trend</h3>
              <p className="text-xs text-slate-500 mt-0.5">Last 6 months (paid invoices)</p>
            </div>
            <BarChart3 size={16} className="text-slate-600" />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#6366f1" strokeWidth={2} fill="url(#revGrad)" dot={{ fill: '#6366f1', r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* GST collected bar chart */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-white">GST Collected</h3>
              <p className="text-xs text-slate-500 mt-0.5">Monthly tax breakdown</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="tax" name="GST" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="card">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/60">
          <h2 className="font-semibold text-white">Recent Invoices</h2>
          <Link to="/invoices" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
            View all <ArrowUpRight size={12} />
          </Link>
        </div>
        <div className="divide-y divide-slate-800/40">
          {loading && (
            <div className="px-6 py-10 text-center text-slate-500 text-sm">Loading…</div>
          )}
          {!loading && recentInvoices.length === 0 && (
            <div className="px-6 py-12 text-center">
              <FileText size={32} className="text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No invoices yet. Create your first one!</p>
              <Link to="/invoices/new" className="btn-primary mt-4 inline-flex text-xs">
                <Plus size={14} /> Create Invoice
              </Link>
            </div>
          )}
          {recentInvoices.map(inv => (
            <Link
              key={inv.id}
              to={`/invoices/${inv.id}`}
              className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-800/30 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                  <FileText size={14} className="text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white font-mono">{inv.invoiceNumber}</p>
                  <p className="text-xs text-slate-500">{inv.customer?.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-slate-500">{inv.invoiceDate}</span>
                <span className={statusBadge(inv.status)}>{inv.status}</span>
                <span className="text-sm font-semibold text-white font-mono">{fmt(inv.grandTotal)}</span>
                <ArrowUpRight size={14} className="text-slate-700 group-hover:text-indigo-400 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

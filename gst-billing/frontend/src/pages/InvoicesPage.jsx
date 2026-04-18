import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchInvoices, updateInvoiceStatus, deleteInvoice } from '../store/invoiceSlice'
import { Plus, Search, Download, Trash2, Eye, Filter, FileText, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/axios'

const STATUS_OPTIONS = ['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED']
const STATUS_COLORS  = {
  PAID:      'text-emerald-400',
  SENT:      'text-sky-400',
  DRAFT:     'text-slate-400',
  OVERDUE:   'text-rose-400',
  CANCELLED: 'text-amber-400',
}

export default function InvoicesPage() {
  const dispatch = useDispatch()
  const { list, loading } = useSelector(s => s.invoices)
  const [search, setSearch]           = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [downloading, setDownloading]   = useState(null)

  useEffect(() => { dispatch(fetchInvoices()) }, [])

  const filtered = list.filter(inv => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      inv.invoiceNumber?.toLowerCase().includes(q) ||
      inv.customer?.name?.toLowerCase().includes(q)
    const matchStatus = !statusFilter || inv.status === statusFilter
    return matchSearch && matchStatus
  })

  const handleStatusChange = async (e, id) => {
    e.stopPropagation()
    await dispatch(updateInvoiceStatus({ id, status: e.target.value }))
    toast.success('Status updated')
  }

  const handleDelete = async (e, id) => {
    e.stopPropagation()
    if (!confirm('Delete this invoice permanently?')) return
    await dispatch(deleteInvoice(id))
    toast.success('Invoice deleted')
  }

  const handleDownloadPdf = async (e, id, invoiceNumber) => {
    e.stopPropagation()
    setDownloading(id)
    try {
      const res = await api.get(`/invoices/${id}/pdf`, { responseType: 'blob' })
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const a = document.createElement('a')
      a.href = url; a.download = `${invoiceNumber}.pdf`; a.click()
      URL.revokeObjectURL(url)
      toast.success('PDF downloaded')
    } catch {
      toast.error('PDF generation failed')
    } finally {
      setDownloading(null)
    }
  }

  const fmt = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0)

  const totalFiltered = filtered.reduce((sum, i) => sum + (i.grandTotal || 0), 0)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Invoices</h1>
          <p className="text-slate-400 text-sm mt-1">
            {filtered.length} invoices · {fmt(totalFiltered)} total
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => dispatch(fetchInvoices())} className="btn-secondary p-2.5" title="Refresh">
            <RefreshCw size={16} />
          </button>
          <Link to="/invoices/new" className="btn-primary">
            <Plus size={16} /> Create Invoice
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-52">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            className="input pl-9"
            placeholder="Search by invoice # or customer…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-500" />
          <select
            className="input w-44"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        {/* Status quick-filter pills */}
        <div className="flex gap-1.5">
          {STATUS_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(statusFilter === s ? '' : s)}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
                statusFilter === s
                  ? 'bg-indigo-600/30 border-indigo-500/50 text-indigo-300'
                  : 'border-slate-700/60 text-slate-500 hover:text-slate-300 hover:border-slate-600'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800/60">
              {['Invoice #', 'Customer', 'Date', 'Supply Type', 'Tax', 'Amount', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40">
            {loading && (
              <tr><td colSpan={8} className="text-center py-14 text-slate-500 text-sm">
                <div className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Loading invoices…
                </div>
              </td></tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={8} className="text-center py-14">
                <FileText size={32} className="text-slate-700 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No invoices found</p>
              </td></tr>
            )}
            {filtered.map(inv => (
              <tr
                key={inv.id}
                className="hover:bg-slate-800/20 transition-colors group cursor-pointer"
                onClick={() => window.location.href = `/invoices/${inv.id}`}
              >
                <td className="px-5 py-3.5">
                  <span className="font-mono text-indigo-400 font-semibold text-xs bg-indigo-500/10 px-2 py-0.5 rounded-lg">
                    {inv.invoiceNumber}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="font-medium text-slate-200">{inv.customer?.name}</div>
                  <div className="text-xs text-slate-600">{inv.customer?.email}</div>
                </td>
                <td className="px-5 py-3.5 text-slate-400 whitespace-nowrap">{inv.invoiceDate}</td>
                <td className="px-5 py-3.5">
                  {inv.supplyType === 'INTER_STATE' ? (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-lg bg-purple-500/15 text-purple-400 border border-purple-500/25">IGST</span>
                  ) : (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-lg bg-teal-500/15 text-teal-400 border border-teal-500/25">CGST+SGST</span>
                  )}
                </td>
                <td className="px-5 py-3.5 font-mono text-xs text-slate-400">
                  {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(inv.totalTax || 0)}
                </td>
                <td className="px-5 py-3.5 font-semibold text-white font-mono whitespace-nowrap">
                  {fmt(inv.grandTotal)}
                </td>
                <td className="px-5 py-3.5" onClick={e => e.stopPropagation()}>
                  <select
                    value={inv.status}
                    onChange={e => handleStatusChange(e, inv.id)}
                    className={`text-xs font-semibold bg-transparent border-none cursor-pointer focus:outline-none ${STATUS_COLORS[inv.status]}`}
                    style={{ backgroundColor: 'transparent' }}
                  >
                    {STATUS_OPTIONS.map(s => (
                      <option key={s} value={s} style={{ background: '#1e293b', color: '#f1f5f9' }}>{s}</option>
                    ))}
                  </select>
                </td>
                <td className="px-5 py-3.5" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link
                      to={`/invoices/${inv.id}`}
                      className="p-1.5 rounded-lg hover:bg-indigo-500/15 hover:text-indigo-400 text-slate-500 transition-colors"
                      title="View"
                    >
                      <Eye size={14} />
                    </Link>
                    <button
                      onClick={e => handleDownloadPdf(e, inv.id, inv.invoiceNumber)}
                      className="p-1.5 rounded-lg hover:bg-sky-500/15 hover:text-sky-400 text-slate-500 transition-colors"
                      title="Download PDF"
                      disabled={downloading === inv.id}
                    >
                      {downloading === inv.id
                        ? <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                        : <Download size={14} />
                      }
                    </button>
                    <button
                      onClick={e => handleDelete(e, inv.id)}
                      className="p-1.5 rounded-lg hover:bg-rose-500/15 hover:text-rose-400 text-slate-500 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer summary */}
        {filtered.length > 0 && (
          <div className="border-t border-slate-800/60 px-5 py-3 flex items-center justify-between">
            <span className="text-xs text-slate-500">{filtered.length} invoices shown</span>
            <div className="flex gap-6 text-xs">
              <span className="text-slate-500">
                Total Tax: <span className="text-slate-300 font-mono font-semibold">
                  {fmt(filtered.reduce((s, i) => s + (i.totalTax || 0), 0))}
                </span>
              </span>
              <span className="text-slate-500">
                Grand Total: <span className="text-white font-mono font-semibold">{fmt(totalFiltered)}</span>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

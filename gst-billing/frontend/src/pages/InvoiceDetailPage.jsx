import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, Printer, Edit3 } from 'lucide-react'
import api from '../api/axios'
import toast from 'react-hot-toast'

const STATUS_OPTIONS = ['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED']
const STATUS_STYLE   = {
  PAID:      'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  SENT:      'bg-sky-500/15 text-sky-400 border-sky-500/30',
  DRAFT:     'bg-slate-500/15 text-slate-400 border-slate-500/30',
  OVERDUE:   'bg-rose-500/15 text-rose-400 border-rose-500/30',
  CANCELLED: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
}

export default function InvoiceDetailPage() {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pdfLoading, setPdf]  = useState(false)
  const [statusUpdating, setStatusUpdating] = useState(false)

  const loadInvoice = () => {
    setLoading(true)
    api.get(`/invoices/${id}`)
      .then(r => setInvoice(r.data))
      .catch(() => { toast.error('Invoice not found'); navigate('/invoices') })
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadInvoice() }, [id])

  const handleStatusChange = async (status) => {
    setStatusUpdating(true)
    try {
      const res = await api.patch(`/invoices/${id}/status`, null, { params: { status } })
      setInvoice(res.data)
      toast.success(`Status → ${status}`)
    } catch { toast.error('Status update failed') }
    setStatusUpdating(false)
  }

  const handleDownloadPdf = async () => {
    setPdf(true)
    try {
      const res = await api.get(`/invoices/${id}/pdf`, { responseType: 'blob' })
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const a = document.createElement('a')
      a.href = url; a.download = `${invoice.invoiceNumber}.pdf`; a.click()
      URL.revokeObjectURL(url)
      toast.success('PDF downloaded')
    } catch { toast.error('PDF generation failed') }
    setPdf(false)
  }

  const handlePrint = async () => {
    setPdf(true)
    try {
      const res = await api.get(`/invoices/${id}/pdf`, { responseType: 'blob' })
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const win = window.open(url, '_blank')
      win.onload = () => { setTimeout(() => win.print(), 500) }
    } catch { toast.error('Print failed') }
    setPdf(false)
  }

  const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n || 0)
  const isInterState = invoice?.supplyType === 'INTER_STATE'

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        <svg className="animate-spin w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
        Loading invoice…
      </div>
    )
  }

  if (!invoice) return null

  return (
    <div className="max-w-4xl space-y-6 animate-fade-in">
      {/* Top bar */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/invoices')}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-white font-mono">{invoice.invoiceNumber}</h1>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS_STYLE[invoice.status] || STATUS_STYLE.DRAFT}`}>
                {invoice.status}
              </span>
            </div>
            <p className="text-slate-400 text-sm mt-0.5">
              {invoice.customer?.name} · {invoice.invoiceDate}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Status changer */}
          <div className="flex items-center gap-1.5">
            <Edit3 size={13} className="text-slate-500" />
            <select
              value={invoice.status}
              onChange={e => handleStatusChange(e.target.value)}
              disabled={statusUpdating}
              className="text-xs font-semibold bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 cursor-pointer"
            >
              {STATUS_OPTIONS.map(s => (
                <option key={s} value={s} style={{ background: '#1e293b' }}>{s}</option>
              ))}
            </select>
          </div>

          <button onClick={handlePrint} className="btn-secondary" disabled={pdfLoading}>
            <Printer size={15} /> Print
          </button>
          <button onClick={handleDownloadPdf} className="btn-primary" disabled={pdfLoading}>
            {pdfLoading
              ? <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Generating…</>
              : <><Download size={15} /> Download PDF</>
            }
          </button>
        </div>
      </div>

      {/* Invoice preview card */}
      <div className="card p-8 space-y-8">
        {/* Header row */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-white">{invoice.sellerName}</h2>
            <p className="text-slate-400 text-sm mt-1 max-w-xs">{invoice.sellerAddress}</p>
            <p className="text-xs text-slate-500 mt-1 font-mono">GSTIN: {invoice.sellerGstin}</p>
          </div>
          <div className="text-right">
            <div className="text-sky-400 font-bold text-xl tracking-widest">TAX INVOICE</div>
            <div className="font-mono text-white font-bold text-lg mt-1">{invoice.invoiceNumber}</div>
            <div className="text-slate-400 text-sm mt-1">Date: {invoice.invoiceDate}</div>
            {invoice.dueDate && (
              <div className="text-amber-400/80 text-sm">Due: {invoice.dueDate}</div>
            )}
          </div>
        </div>

        {/* Bill to + supply info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/40">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Bill To</p>
            <p className="font-bold text-white text-base">{invoice.customer?.name}</p>
            {invoice.customer?.address && (
              <p className="text-slate-400 text-sm mt-1">{invoice.customer.address}</p>
            )}
            {invoice.customer?.city && (
              <p className="text-slate-400 text-sm">{invoice.customer.city}{invoice.customer.pincode ? ` – ${invoice.customer.pincode}` : ''}</p>
            )}
            {invoice.customer?.gstin && (
              <p className="text-xs font-mono text-slate-500 mt-2">GSTIN: {invoice.customer.gstin}</p>
            )}
            {invoice.customer?.phone && (
              <p className="text-xs text-slate-500 mt-0.5">📞 {invoice.customer.phone}</p>
            )}
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/40">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Supply & Payment</p>
            <div className="space-y-2">
              <div>
                <span className="text-xs text-slate-500">Supply Type</span>
                <div className="mt-0.5">
                  {isInterState ? (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-purple-500/15 text-purple-400 border border-purple-500/25">
                      Inter-State (IGST)
                    </span>
                  ) : (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-teal-500/15 text-teal-400 border border-teal-500/25">
                      Intra-State (CGST + SGST)
                    </span>
                  )}
                </div>
              </div>
              {invoice.paymentMode && (
                <div>
                  <span className="text-xs text-slate-500">Payment Mode</span>
                  <p className="text-sm text-slate-300 font-medium">{invoice.paymentMode}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Items table */}
        <div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-800/70 rounded-xl overflow-hidden">
                  {[
                    ['#',          'w-10  text-center'],
                    ['Description','text-left'],
                    ['HSN',        'w-24  text-center'],
                    ['Qty',        'w-20  text-center'],
                    ['Rate',       'w-28  text-right'],
                    ['Disc',       'w-16  text-center'],
                    ['Taxable',    'w-28  text-right'],
                    ...(isInterState
                      ? [['IGST', 'w-28 text-right']]
                      : [['CGST', 'w-24 text-right'], ['SGST', 'w-24 text-right']]),
                    ['Total', 'w-28 text-right'],
                  ].map(([h, cls], i) => (
                    <th key={i} className={`px-3 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider ${cls} first:pl-4 last:pr-4 first:rounded-l-xl last:rounded-r-xl`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {invoice.items?.map((item, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? '' : 'bg-slate-800/20'}>
                    <td className="px-3 py-3.5 pl-4 text-center text-slate-500 text-xs">{idx + 1}</td>
                    <td className="px-3 py-3.5">
                      <div className="font-medium text-slate-200">{item.description}</div>
                      {item.unit && <div className="text-xs text-slate-500 mt-0.5">Unit: {item.unit}</div>}
                    </td>
                    <td className="px-3 py-3.5 text-center font-mono text-xs text-slate-400">{item.hsnCode || '—'}</td>
                    <td className="px-3 py-3.5 text-center text-slate-300">{item.quantity}</td>
                    <td className="px-3 py-3.5 text-right font-mono text-slate-300">{fmt(item.unitPrice)}</td>
                    <td className="px-3 py-3.5 text-center text-slate-400 text-xs">
                      {item.discountPercent > 0 ? `${item.discountPercent}%` : '—'}
                    </td>
                    <td className="px-3 py-3.5 text-right font-mono text-slate-300">{fmt(item.taxableAmount)}</td>
                    {isInterState ? (
                      <td className="px-3 py-3.5 text-right">
                        <div className="font-mono text-xs text-purple-400">{item.igstRate}%</div>
                        <div className="font-mono text-xs text-slate-300">{fmt(item.igstAmount)}</div>
                      </td>
                    ) : (
                      <>
                        <td className="px-3 py-3.5 text-right">
                          <div className="font-mono text-xs text-teal-400">{item.cgstRate}%</div>
                          <div className="font-mono text-xs text-slate-300">{fmt(item.cgstAmount)}</div>
                        </td>
                        <td className="px-3 py-3.5 text-right">
                          <div className="font-mono text-xs text-teal-400">{item.sgstRate}%</div>
                          <div className="font-mono text-xs text-slate-300">{fmt(item.sgstAmount)}</div>
                        </td>
                      </>
                    )}
                    <td className="px-3 py-3.5 pr-4 text-right font-semibold text-white font-mono">{fmt(item.totalAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom section: notes + totals */}
        <div className="flex gap-6 items-start">
          {/* Notes / amount in words */}
          <div className="flex-1 space-y-3">
            {invoice.amountInWords && (
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/30">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Amount in Words</p>
                <p className="text-sm text-slate-300 italic">{invoice.amountInWords}</p>
              </div>
            )}
            {invoice.notes && (
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/30">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Notes</p>
                <p className="text-sm text-slate-300">{invoice.notes}</p>
              </div>
            )}
          </div>

          {/* Totals */}
          <div className="w-72 space-y-2 text-sm flex-shrink-0">
            {[
              ['Subtotal',       invoice.subtotal,      'text-slate-300'],
              ...(invoice.discountAmount > 0 ? [['Discount', -invoice.discountAmount, 'text-rose-400']] : []),
              ['Taxable Amount', invoice.taxableAmount,  'text-slate-300'],
              ...(isInterState
                ? [['IGST', invoice.igstAmount, 'text-purple-400']]
                : [
                    ['CGST', invoice.cgstAmount, 'text-teal-400'],
                    ['SGST', invoice.sgstAmount, 'text-teal-400'],
                  ]),
              ['Total Tax',      invoice.totalTax,      'text-slate-300'],
            ].map(([label, val, cls]) => (
              <div key={label} className="flex justify-between py-1">
                <span className="text-slate-500">{label}</span>
                <span className={`font-mono font-medium ${cls}`}>{fmt(val)}</span>
              </div>
            ))}
            <div className="border-t border-slate-700 pt-3 flex justify-between items-center">
              <span className="font-bold text-white text-base">Grand Total</span>
              <span className="font-bold text-indigo-400 text-xl font-mono">{fmt(invoice.grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800/60 pt-5 text-center">
          <p className="text-xs text-slate-600 italic">
            This is a computer-generated invoice. No signature required.
          </p>
        </div>
      </div>
    </div>
  )
}

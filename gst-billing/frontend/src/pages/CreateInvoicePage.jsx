import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { createInvoice } from '../store/invoiceSlice'
import { fetchCustomers } from '../store/customerSlice'
import { fetchProducts } from '../store/productSlice'
import { Plus, Trash2, ArrowLeft, Calculator, Info } from 'lucide-react'
import toast from 'react-hot-toast'

const GST_RATES = [0, 5, 12, 18, 28]
const UNITS     = ['Nos', 'Kg', 'L', 'Pcs', 'Box', 'Mtr', 'Sqft', 'Hr', 'Set', 'Pair']

const emptyItem = () => ({
  productId: '', description: '', hsnCode: '', unit: 'Nos',
  quantity: 1, unitPrice: '', discountPercent: 0, gstRate: 18,
})

const calcItem = (item) => {
  const qty  = parseFloat(item.quantity)  || 0
  const price = parseFloat(item.unitPrice) || 0
  const disc  = parseFloat(item.discountPercent) || 0
  const gst   = parseFloat(item.gstRate) || 0
  const lineTotal  = qty * price
  const discAmt    = (lineTotal * disc) / 100
  const taxable    = lineTotal - discAmt
  const taxAmt     = (taxable * gst) / 100
  return { lineTotal, discAmt, taxable, taxAmt, total: taxable + taxAmt }
}

export default function CreateInvoicePage() {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const { list: customers } = useSelector(s => s.customers)
  const { list: products  } = useSelector(s => s.products)

  const [form, setForm] = useState({
    customerId:  '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate:     '',
    supplyType:  'INTRA_STATE',
    paymentMode: 'Bank Transfer',
    notes:       '',
  })
  const [items, setItems]       = useState([emptyItem()])
  const [submitting, setSubmit] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)

  useEffect(() => {
    dispatch(fetchCustomers())
    dispatch(fetchProducts())
  }, [])

  useEffect(() => {
    const c = customers.find(c => c.id === parseInt(form.customerId))
    setSelectedCustomer(c || null)
  }, [form.customerId, customers])

  const isInterState = form.supplyType === 'INTER_STATE'

  const totals = items.reduce((acc, item) => {
    const c = calcItem(item)
    acc.subtotal += c.lineTotal
    acc.discount += c.discAmt
    acc.taxable  += c.taxable
    acc.tax      += c.taxAmt
    acc.grand    += c.total
    return acc
  }, { subtotal: 0, discount: 0, taxable: 0, tax: 0, grand: 0 })

  const handleProductSelect = (idx, productId) => {
    const product = products.find(p => p.id === parseInt(productId))
    if (product) {
      const updated = [...items]
      updated[idx] = {
        ...updated[idx],
        productId:   product.id,
        description: product.name,
        hsnCode:     product.hsnCode || '',
        unit:        product.unit || 'Nos',
        unitPrice:   product.price,
        gstRate:     product.gstRate,
      }
      setItems(updated)
    } else {
      updateItem(idx, 'productId', '')
    }
  }

  const updateItem = (idx, field, value) => {
    const updated = [...items]
    updated[idx] = { ...updated[idx], [field]: value }
    setItems(updated)
  }

  const addItem    = () => setItems([...items, emptyItem()])
  const removeItem = (idx) => items.length > 1 && setItems(items.filter((_, i) => i !== idx))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.customerId)                              return toast.error('Please select a customer')
    if (items.some(it => !it.description))             return toast.error('All items need a description')
    if (items.some(it => !it.unitPrice || it.unitPrice <= 0)) return toast.error('All items need a valid price')

    setSubmit(true)
    const payload = {
      ...form,
      items: items.map(it => ({
        ...it,
        productId:       it.productId ? parseInt(it.productId) : null,
        quantity:        parseFloat(it.quantity),
        unitPrice:       parseFloat(it.unitPrice),
        discountPercent: parseFloat(it.discountPercent) || 0,
        gstRate:         parseFloat(it.gstRate),
      })),
    }
    const result = await dispatch(createInvoice(payload))
    setSubmit(false)
    if (createInvoice.fulfilled.match(result)) {
      toast.success('Invoice created successfully!')
      navigate(`/invoices/${result.payload.id}`)
    } else {
      toast.error('Failed to create invoice')
    }
  }

  const f2 = (n) => n.toFixed(2)
  const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n)

  return (
    <div className="space-y-6 max-w-7xl animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/invoices')}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="page-title">New Invoice</h1>
            <p className="text-slate-400 text-sm mt-0.5">Create a GST tax invoice</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => navigate('/invoices')} className="btn-secondary">Cancel</button>
          <button form="invoice-form" type="submit" className="btn-primary px-8" disabled={submitting}>
            {submitting
              ? <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Creating…</>
              : 'Create Invoice'
            }
          </button>
        </div>
      </div>

      <form id="invoice-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Invoice details */}
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-slate-300 mb-5 flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-indigo-500/20 flex items-center justify-center">
              <span className="text-indigo-400 text-xs font-bold">1</span>
            </div>
            Invoice Details
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            <div className="col-span-2 md:col-span-1">
              <label className="label">Customer *</label>
              <select
                className="input"
                value={form.customerId}
                onChange={e => setForm({ ...form, customerId: e.target.value })}
                required
              >
                <option value="">— Select Customer —</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {selectedCustomer && (
                <div className="mt-2 p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/40">
                  <p className="text-xs text-slate-400">{selectedCustomer.address}, {selectedCustomer.city}</p>
                  {selectedCustomer.gstin && (
                    <p className="text-xs text-slate-500 font-mono mt-0.5">GSTIN: {selectedCustomer.gstin}</p>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="label">Invoice Date</label>
              <input type="date" className="input" value={form.invoiceDate}
                onChange={e => setForm({ ...form, invoiceDate: e.target.value })} />
            </div>
            <div>
              <label className="label">Due Date</label>
              <input type="date" className="input" value={form.dueDate}
                onChange={e => setForm({ ...form, dueDate: e.target.value })} />
            </div>
            <div>
              <label className="label">Supply Type</label>
              <select className="input" value={form.supplyType}
                onChange={e => setForm({ ...form, supplyType: e.target.value })}>
                <option value="INTRA_STATE">Intra-State (CGST + SGST)</option>
                <option value="INTER_STATE">Inter-State (IGST)</option>
              </select>
              <p className="text-xs text-slate-600 mt-1.5 flex items-center gap-1">
                <Info size={10} />
                {isInterState ? 'IGST applies for inter-state supply' : 'CGST+SGST for same state'}
              </p>
            </div>
            <div>
              <label className="label">Payment Mode</label>
              <select className="input" value={form.paymentMode}
                onChange={e => setForm({ ...form, paymentMode: e.target.value })}>
                {['Cash', 'Bank Transfer', 'UPI', 'Cheque', 'Credit Card', 'Credit'].map(m => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="label">Notes / Terms</label>
              <input className="input" placeholder="Payment terms, special instructions…"
                value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-indigo-500/20 flex items-center justify-center">
                <span className="text-indigo-400 text-xs font-bold">2</span>
              </div>
              Line Items
            </h2>
            <button type="button" onClick={addItem} className="btn-secondary text-xs py-1.5 px-3">
              <Plus size={13} /> Add Item
            </button>
          </div>

          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-sm min-w-[960px]">
              <thead>
                <tr className="border-b border-slate-800/60">
                  {[
                    ['Product',      'w-36'],
                    ['Description',  'w-44'],
                    ['HSN',          'w-24'],
                    ['Qty',          'w-16'],
                    ['Unit',         'w-20'],
                    ['Rate (₹)',     'w-24'],
                    ['Disc %',       'w-16'],
                    ['GST %',        'w-20'],
                    ['Taxable',      'w-28 text-right'],
                    ['Total',        'w-28 text-right'],
                    ['',             'w-8'],
                  ].map(([h, cls]) => (
                    <th key={h} className={`pb-3 pr-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider ${cls}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => {
                  const c = calcItem(item)
                  return (
                    <tr key={idx} className="border-b border-slate-800/30 group/row">
                      {/* Product selector */}
                      <td className="py-2.5 pr-3">
                        <select className="input text-xs py-1.5 bg-slate-800/40"
                          value={item.productId}
                          onChange={e => handleProductSelect(idx, e.target.value)}>
                          <option value="">Quick pick…</option>
                          {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </td>
                      {/* Description */}
                      <td className="py-2.5 pr-3">
                        <input className="input text-xs py-1.5"
                          placeholder="Item description *"
                          value={item.description}
                          onChange={e => updateItem(idx, 'description', e.target.value)}
                          required />
                      </td>
                      {/* HSN */}
                      <td className="py-2.5 pr-3">
                        <input className="input text-xs py-1.5 font-mono"
                          placeholder="0000"
                          value={item.hsnCode}
                          onChange={e => updateItem(idx, 'hsnCode', e.target.value)} />
                      </td>
                      {/* Qty */}
                      <td className="py-2.5 pr-3">
                        <input type="number" className="input text-xs py-1.5 text-center"
                          min="0" step="0.01"
                          value={item.quantity}
                          onChange={e => updateItem(idx, 'quantity', e.target.value)} />
                      </td>
                      {/* Unit */}
                      <td className="py-2.5 pr-3">
                        <select className="input text-xs py-1.5"
                          value={item.unit}
                          onChange={e => updateItem(idx, 'unit', e.target.value)}>
                          {UNITS.map(u => <option key={u}>{u}</option>)}
                        </select>
                      </td>
                      {/* Unit price */}
                      <td className="py-2.5 pr-3">
                        <input type="number" className="input text-xs py-1.5 font-mono"
                          min="0" step="0.01" placeholder="0.00"
                          value={item.unitPrice}
                          onChange={e => updateItem(idx, 'unitPrice', e.target.value)} />
                      </td>
                      {/* Discount % */}
                      <td className="py-2.5 pr-3">
                        <input type="number" className="input text-xs py-1.5 text-center"
                          min="0" max="100" step="0.1"
                          value={item.discountPercent}
                          onChange={e => updateItem(idx, 'discountPercent', e.target.value)} />
                      </td>
                      {/* GST Rate */}
                      <td className="py-2.5 pr-3">
                        <select className="input text-xs py-1.5"
                          value={item.gstRate}
                          onChange={e => updateItem(idx, 'gstRate', e.target.value)}>
                          {GST_RATES.map(r => <option key={r} value={r}>{r}%</option>)}
                        </select>
                      </td>
                      {/* Taxable */}
                      <td className="py-2.5 pr-3 text-right">
                        <div className="text-slate-300 font-mono text-xs">₹{f2(c.taxable)}</div>
                        {c.discAmt > 0 && (
                          <div className="text-rose-400/70 text-xs font-mono">-₹{f2(c.discAmt)}</div>
                        )}
                      </td>
                      {/* Total */}
                      <td className="py-2.5 pr-3 text-right">
                        <div className="text-white font-semibold font-mono text-xs">₹{f2(c.total)}</div>
                        <div className="text-slate-500 text-xs font-mono">
                          {isInterState ? `IGST ₹${f2(c.taxAmt)}` : `GST ₹${f2(c.taxAmt)}`}
                        </div>
                      </td>
                      {/* Remove */}
                      <td className="py-2.5">
                        <button
                          type="button"
                          onClick={() => removeItem(idx)}
                          className="p-1.5 rounded-lg text-slate-700 hover:text-rose-400 hover:bg-rose-500/10 transition-colors opacity-0 group-hover/row:opacity-100"
                          disabled={items.length === 1}
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* GST Summary */}
        <div className="flex justify-end">
          <div className="card p-6 w-88 min-w-80">
            <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2 mb-5">
              <Calculator size={15} className="text-indigo-400" /> GST Calculation Summary
            </h3>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Subtotal</span>
                <span className="font-mono text-slate-200">₹{f2(totals.subtotal)}</span>
              </div>
              {totals.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Discount</span>
                  <span className="font-mono text-rose-400">-₹{f2(totals.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-400">Taxable Amount</span>
                <span className="font-mono text-slate-200">₹{f2(totals.taxable)}</span>
              </div>

              <div className="border-t border-slate-800/60 pt-2.5">
                {isInterState ? (
                  <div className="flex justify-between">
                    <span className="text-purple-400 text-xs font-medium">IGST</span>
                    <span className="font-mono text-purple-400">₹{f2(totals.tax)}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-teal-400 text-xs font-medium">CGST</span>
                      <span className="font-mono text-teal-400">₹{f2(totals.tax / 2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-teal-400 text-xs font-medium">SGST</span>
                      <span className="font-mono text-teal-400">₹{f2(totals.tax / 2)}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Total Tax</span>
                <span className="font-mono text-slate-200">₹{f2(totals.tax)}</span>
              </div>
            </div>

            <div className="border-t border-slate-700 mt-4 pt-4 flex justify-between items-center">
              <span className="font-bold text-white">Grand Total</span>
              <span className="font-bold text-indigo-400 text-xl font-mono">{fmt(totals.grand)}</span>
            </div>

            <div className="mt-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700/40">
              <p className="text-xs text-slate-500 text-center">
                {isInterState
                  ? '⚡ Inter-state: single IGST applied'
                  : '⚡ Intra-state: CGST + SGST split equally'}
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

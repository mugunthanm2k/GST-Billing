import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '../store/productSlice'
import { Plus, Search, Edit2, Trash2, X, Package } from 'lucide-react'
import toast from 'react-hot-toast'

const GST_RATES = [0, 5, 12, 18, 28]
const UNITS     = ['Nos', 'Kg', 'L', 'Pcs', 'Box', 'Mtr', 'Sqft', 'Hr', 'Set', 'Pair', 'Dozen']

const empty = {
  name: '', description: '', hsnCode: '', price: '',
  unit: 'Nos', gstRate: 18, stockQuantity: 0,
}

const GST_BADGE = {
  0:  'bg-slate-500/15 text-slate-400 border-slate-500/20',
  5:  'bg-sky-500/15 text-sky-400 border-sky-500/20',
  12: 'bg-teal-500/15 text-teal-400 border-teal-500/20',
  18: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20',
  28: 'bg-rose-500/15 text-rose-400 border-rose-500/20',
}

export default function ProductsPage() {
  const dispatch = useDispatch()
  const { list, loading } = useSelector(s => s.products)
  const [search, setSearch]   = useState('')
  const [showModal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm]       = useState(empty)
  const [saving, setSaving]   = useState(false)
  const [gstFilter, setGst]   = useState('')

  useEffect(() => { dispatch(fetchProducts()) }, [])

  const filtered = list.filter(p => {
    const q = search.toLowerCase()
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.hsnCode?.includes(q)
    const matchGst    = !gstFilter || String(p.gstRate) === gstFilter
    return matchSearch && matchGst
  })

  const openAdd  = () => { setEditing(null); setForm(empty); setModal(true) }
  const openEdit = (p) => { setEditing(p); setForm({ ...p }); setModal(true) }
  const close    = () => { setModal(false); setEditing(null) }

  const handleSave = async () => {
    if (!form.name)  return toast.error('Name is required')
    if (!form.price || form.price <= 0) return toast.error('Valid price is required')
    setSaving(true)
    const data = { ...form, price: parseFloat(form.price), gstRate: parseFloat(form.gstRate) }
    if (editing) {
      await dispatch(updateProduct({ id: editing.id, data }))
      toast.success('Product updated')
    } else {
      await dispatch(createProduct(data))
      toast.success('Product added')
    }
    setSaving(false)
    close()
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return
    await dispatch(deleteProduct(id))
    toast.success('Product deleted')
  }

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n || 0)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Products & Services</h1>
          <p className="text-slate-400 text-sm mt-1">{list.length} items in catalogue</p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Search + GST filter */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input className="input pl-9" placeholder="Search products or HSN code…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1.5 items-center">
          <span className="text-xs text-slate-500">GST:</span>
          {['', ...GST_RATES].map(r => (
            <button key={r}
              onClick={() => setGst(String(r))}
              className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-all ${
                gstFilter === String(r)
                  ? 'bg-indigo-600/30 border-indigo-500/50 text-indigo-300'
                  : 'border-slate-700/60 text-slate-500 hover:text-slate-300 hover:border-slate-600'
              }`}>
              {r === '' ? 'All' : `${r}%`}
            </button>
          ))}
        </div>
      </div>

      {/* Grid view */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800/60">
              {['Product', 'HSN Code', 'Price', 'GST Rate', 'Unit', 'Stock', 'Actions'].map(h => (
                <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40">
            {loading && (
              <tr><td colSpan={7} className="text-center py-14 text-slate-500 text-sm">Loading products…</td></tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={7} className="text-center py-14">
                <Package size={32} className="text-slate-700 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">{search ? 'No products match your search' : 'No products yet'}</p>
                {!search && <button onClick={openAdd} className="btn-primary mt-4 text-xs"><Plus size={13} /> Add First Product</button>}
              </td></tr>
            )}
            {filtered.map(p => (
              <tr key={p.id} className="hover:bg-slate-800/20 transition-colors group">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                      <Package size={14} className="text-indigo-400" />
                    </div>
                    <div>
                      <div className="font-semibold text-white">{p.name}</div>
                      {p.description && (
                        <div className="text-xs text-slate-500 truncate max-w-40">{p.description}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  {p.hsnCode ? (
                    <span className="font-mono text-xs text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-lg border border-sky-500/20">{p.hsnCode}</span>
                  ) : <span className="text-slate-600 text-xs">—</span>}
                </td>
                <td className="px-5 py-3.5">
                  <span className="text-emerald-400 font-semibold font-mono">{fmt(p.price)}</span>
                </td>
                <td className="px-5 py-3.5">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${GST_BADGE[p.gstRate] || GST_BADGE[18]}`}>
                    {p.gstRate}%
                  </span>
                </td>
                <td className="px-5 py-3.5 text-slate-400">{p.unit}</td>
                <td className="px-5 py-3.5">
                  <span className={`text-sm font-semibold ${(p.stockQuantity || 0) > 0 ? 'text-slate-300' : 'text-rose-400'}`}>
                    {p.stockQuantity ?? '—'}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(p)}
                      className="p-1.5 rounded-lg hover:bg-indigo-500/15 hover:text-indigo-400 text-slate-500 transition-colors">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(p.id)}
                      className="p-1.5 rounded-lg hover:bg-rose-500/15 hover:text-rose-400 text-slate-500 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-lg p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-bold text-white text-lg">{editing ? 'Edit Product' : 'Add New Product'}</h2>
                <p className="text-slate-500 text-xs mt-0.5">Item details for invoicing</p>
              </div>
              <button onClick={close} className="p-2 hover:text-white text-slate-400 hover:bg-slate-800 rounded-xl transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="label">Product / Service Name *</label>
                <input className="input" value={form.name} onChange={set('name')} placeholder="Enter product or service name" />
              </div>
              <div className="col-span-2">
                <label className="label">Description</label>
                <input className="input" value={form.description || ''} onChange={set('description')} placeholder="Optional description" />
              </div>
              <div>
                <label className="label">HSN / SAC Code</label>
                <input className="input font-mono" value={form.hsnCode || ''} onChange={set('hsnCode')} placeholder="e.g. 8471" />
              </div>
              <div>
                <label className="label">Price (₹) *</label>
                <input type="number" className="input font-mono" min="0" step="0.01"
                  value={form.price} onChange={set('price')} placeholder="0.00" />
              </div>
              <div>
                <label className="label">Unit</label>
                <select className="input" value={form.unit} onChange={set('unit')}>
                  {UNITS.map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <label className="label">GST Rate</label>
                <select className="input" value={form.gstRate} onChange={set('gstRate')}>
                  {GST_RATES.map(r => (
                    <option key={r} value={r}>{r}% {r === 0 ? '(Exempt)' : r === 18 ? '(Standard)' : ''}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Stock Quantity</label>
                <input type="number" className="input" min="0"
                  value={form.stockQuantity || 0} onChange={set('stockQuantity')} />
              </div>
            </div>

            {/* GST preview */}
            {form.price > 0 && (
              <div className="mt-4 p-3 rounded-xl bg-slate-800/50 border border-slate-700/40">
                <p className="text-xs text-slate-500 mb-2 font-semibold uppercase tracking-wider">GST Preview (per unit)</p>
                <div className="flex gap-4 text-xs">
                  <span className="text-slate-400">Base: <span className="text-white font-mono">₹{parseFloat(form.price).toFixed(2)}</span></span>
                  <span className="text-slate-400">GST ({form.gstRate}%): <span className="text-amber-400 font-mono">₹{(form.price * form.gstRate / 100).toFixed(2)}</span></span>
                  <span className="text-slate-400">Total: <span className="text-emerald-400 font-mono font-semibold">₹{(parseFloat(form.price) * (1 + form.gstRate / 100)).toFixed(2)}</span></span>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-800/60">
              <button onClick={close} className="btn-secondary">Cancel</button>
              <button onClick={handleSave} className="btn-primary" disabled={saving}>
                {saving ? 'Saving…' : editing ? 'Update Product' : 'Add Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

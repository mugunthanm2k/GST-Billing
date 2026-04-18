import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCustomers, createCustomer, updateCustomer, deleteCustomer } from '../store/customerSlice'
import { Plus, Search, Edit2, Trash2, X, Users, Mail, Phone, Building } from 'lucide-react'
import toast from 'react-hot-toast'

const STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan',
  'Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
  'Delhi','Jammu & Kashmir','Ladakh',
]

const empty = {
  name: '', email: '', phone: '', address: '', city: '',
  state: 'Tamil Nadu', stateCode: '33', pincode: '', gstin: '', panNumber: '',
}

export default function CustomersPage() {
  const dispatch = useDispatch()
  const { list, loading } = useSelector(s => s.customers)
  const [search, setSearch]     = useState('')
  const [showModal, setModal]   = useState(false)
  const [editing, setEditing]   = useState(null)
  const [form, setForm]         = useState(empty)
  const [saving, setSaving]     = useState(false)

  useEffect(() => { dispatch(fetchCustomers()) }, [])

  const filtered = list.filter(c =>
    !search ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.gstin?.includes(search) ||
    c.phone?.includes(search)
  )

  const openAdd  = () => { setEditing(null); setForm(empty); setModal(true) }
  const openEdit = (c) => { setEditing(c); setForm({ ...c }); setModal(true) }
  const close    = () => { setModal(false); setEditing(null) }

  const handleSave = async () => {
    if (!form.name)  return toast.error('Name is required')
    if (!form.email) return toast.error('Email is required')
    setSaving(true)
    if (editing) {
      await dispatch(updateCustomer({ id: editing.id, data: form }))
      toast.success('Customer updated')
    } else {
      await dispatch(createCustomer(form))
      toast.success('Customer added')
    }
    setSaving(false)
    close()
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this customer?')) return
    await dispatch(deleteCustomer(id))
    toast.success('Customer deleted')
  }

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="text-slate-400 text-sm mt-1">{list.length} customers registered</p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <Plus size={16} /> Add Customer
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input className="input pl-9" placeholder="Search name, email, GSTIN…"
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800/60">
              {['Customer', 'Contact', 'GSTIN', 'Location', 'Actions'].map(h => (
                <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40">
            {loading && (
              <tr><td colSpan={5} className="text-center py-14 text-slate-500 text-sm">Loading customers…</td></tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={5} className="text-center py-14">
                <Users size={32} className="text-slate-700 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">{search ? 'No customers match your search' : 'No customers yet'}</p>
              </td></tr>
            )}
            {filtered.map(c => (
              <tr key={c.id} className="hover:bg-slate-800/20 transition-colors group">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500/30 to-sky-500/30 border border-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400">
                      {c.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-white">{c.name}</div>
                      {c.panNumber && <div className="text-xs text-slate-500 font-mono">PAN: {c.panNumber}</div>}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-0.5">
                    <Mail size={11} /> {c.email}
                  </div>
                  {c.phone && (
                    <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                      <Phone size={11} /> {c.phone}
                    </div>
                  )}
                </td>
                <td className="px-5 py-3.5">
                  {c.gstin ? (
                    <span className="font-mono text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">{c.gstin}</span>
                  ) : (
                    <span className="text-slate-600 text-xs">—</span>
                  )}
                </td>
                <td className="px-5 py-3.5 text-slate-400 text-xs">
                  {[c.city, c.state, c.pincode].filter(Boolean).join(', ') || '—'}
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(c)}
                      className="p-1.5 rounded-lg hover:bg-indigo-500/15 hover:text-indigo-400 text-slate-500 transition-colors">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(c.id)}
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
          <div className="card w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-bold text-white text-lg">{editing ? 'Edit Customer' : 'Add New Customer'}</h2>
                <p className="text-slate-500 text-xs mt-0.5">Fill in the customer details</p>
              </div>
              <button onClick={close} className="p-2 hover:text-white text-slate-400 hover:bg-slate-800 rounded-xl transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-5">
              {/* Basic info */}
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Basic Information</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="label">Customer Name *</label>
                    <input className="input" value={form.name} onChange={set('name')} placeholder="Full name or company name" />
                  </div>
                  <div>
                    <label className="label">Email *</label>
                    <input type="email" className="input" value={form.email} onChange={set('email')} placeholder="email@example.com" />
                  </div>
                  <div>
                    <label className="label">Phone</label>
                    <input className="input" value={form.phone} onChange={set('phone')} placeholder="+91 XXXXX XXXXX" />
                  </div>
                </div>
              </div>

              {/* Tax info */}
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Tax Information</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">GSTIN</label>
                    <input className="input font-mono" value={form.gstin} onChange={set('gstin')} placeholder="22AAAAA0000A1Z5" />
                  </div>
                  <div>
                    <label className="label">PAN Number</label>
                    <input className="input font-mono" value={form.panNumber} onChange={set('panNumber')} placeholder="AAAAA0000A" />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Address</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="label">Street Address</label>
                    <input className="input" value={form.address} onChange={set('address')} placeholder="Door/Flat No., Street, Area" />
                  </div>
                  <div>
                    <label className="label">City</label>
                    <input className="input" value={form.city} onChange={set('city')} placeholder="City name" />
                  </div>
                  <div>
                    <label className="label">Pincode</label>
                    <input className="input font-mono" value={form.pincode} onChange={set('pincode')} placeholder="600001" />
                  </div>
                  <div>
                    <label className="label">State</label>
                    <select className="input" value={form.state} onChange={set('state')}>
                      {STATES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">State Code</label>
                    <input className="input font-mono" value={form.stateCode} onChange={set('stateCode')} placeholder="33" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-800/60">
              <button onClick={close} className="btn-secondary">Cancel</button>
              <button onClick={handleSave} className="btn-primary" disabled={saving}>
                {saving
                  ? <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Saving…</>
                  : editing ? 'Update Customer' : 'Add Customer'
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

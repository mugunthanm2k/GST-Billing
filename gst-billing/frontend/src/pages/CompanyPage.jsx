import { useEffect, useState } from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { Save, Building2, CreditCard, Receipt, CheckCircle2 } from 'lucide-react'

const STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan',
  'Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
  'Delhi','Jammu & Kashmir','Ladakh',
]

const empty = {
  name: '', address: '', city: '', state: 'Tamil Nadu', stateCode: '33',
  pincode: '', phone: '', email: '', website: '', gstin: '', panNumber: '',
  bankName: '', accountNumber: '', ifscCode: '', bankBranch: '',
  invoicePrefix: 'INV',
}

const Section = ({ icon: Icon, title, children }) => (
  <div className="card p-6">
    <h3 className="font-semibold text-slate-300 flex items-center gap-2 mb-5 pb-4 border-b border-slate-800/60">
      <div className="w-7 h-7 rounded-lg bg-indigo-500/15 flex items-center justify-center">
        <Icon size={14} className="text-indigo-400" />
      </div>
      {title}
    </h3>
    {children}
  </div>
)

export default function CompanyPage() {
  const [form, setForm]   = useState(empty)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)

  useEffect(() => {
    api.get('/company')
      .then(r => setForm({ ...empty, ...r.data }))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const handleSave = async () => {
    if (!form.name)  return toast.error('Company name is required')
    if (!form.gstin) return toast.error('GSTIN is required')
    setSaving(true)
    try {
      const res = await api.post('/company', form)
      setForm({ ...empty, ...res.data })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      toast.success('Company profile saved!')
    } catch (e) {
      toast.error(e.response?.data || 'Save failed')
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        <svg className="animate-spin w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
        Loading company profile…
      </div>
    )
  }

  return (
    <div className="max-w-3xl space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Company Profile</h1>
          <p className="text-slate-400 text-sm mt-1">
            This information appears on all your invoices
          </p>
        </div>
        <button onClick={handleSave} className="btn-primary" disabled={saving}>
          {saving ? (
            <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Saving…</>
          ) : saved ? (
            <><CheckCircle2 size={15} className="text-emerald-400" /> Saved!</>
          ) : (
            <><Save size={15} /> Save Changes</>
          )}
        </button>
      </div>

      {/* Business Info */}
      <Section icon={Building2} title="Business Information">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="label">Company / Business Name *</label>
            <input className="input text-base font-semibold" value={form.name} onChange={set('name')}
              placeholder="Your company name" />
          </div>
          <div>
            <label className="label">GSTIN *</label>
            <input className="input font-mono" value={form.gstin} onChange={set('gstin')}
              placeholder="22AAAAA0000A1Z5" maxLength={15} />
            <p className="text-xs text-slate-600 mt-1.5">15-character GST Identification Number</p>
          </div>
          <div>
            <label className="label">PAN Number</label>
            <input className="input font-mono" value={form.panNumber || ''} onChange={set('panNumber')}
              placeholder="AAAAA0000A" maxLength={10} />
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" value={form.phone || ''} onChange={set('phone')} placeholder="+91 XXXXX XXXXX" />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" className="input" value={form.email || ''} onChange={set('email')} placeholder="billing@company.com" />
          </div>
          <div>
            <label className="label">Website</label>
            <input className="input" value={form.website || ''} onChange={set('website')} placeholder="https://yourcompany.com" />
          </div>
        </div>
      </Section>

      {/* Address */}
      <Section icon={Building2} title="Business Address">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="label">Street Address</label>
            <input className="input" value={form.address || ''} onChange={set('address')}
              placeholder="Building, Street, Area" />
          </div>
          <div>
            <label className="label">City</label>
            <input className="input" value={form.city || ''} onChange={set('city')} placeholder="City" />
          </div>
          <div>
            <label className="label">Pincode</label>
            <input className="input font-mono" value={form.pincode || ''} onChange={set('pincode')} placeholder="600001" />
          </div>
          <div>
            <label className="label">State</label>
            <select className="input" value={form.state || ''} onChange={set('state')}>
              {STATES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="label">State Code</label>
            <input className="input font-mono" value={form.stateCode || ''} onChange={set('stateCode')} placeholder="33" />
          </div>
        </div>
      </Section>

      {/* Bank Details */}
      <Section icon={CreditCard} title="Bank Details (shown on invoice)">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Bank Name</label>
            <input className="input" value={form.bankName || ''} onChange={set('bankName')} placeholder="State Bank of India" />
          </div>
          <div>
            <label className="label">Branch</label>
            <input className="input" value={form.bankBranch || ''} onChange={set('bankBranch')} placeholder="Branch name" />
          </div>
          <div>
            <label className="label">Account Number</label>
            <input className="input font-mono" value={form.accountNumber || ''} onChange={set('accountNumber')} placeholder="XXXXXXXXXXXX" />
          </div>
          <div>
            <label className="label">IFSC Code</label>
            <input className="input font-mono" value={form.ifscCode || ''} onChange={set('ifscCode')} placeholder="SBIN0001234" />
          </div>
        </div>
      </Section>

      {/* Invoice Settings */}
      <Section icon={Receipt} title="Invoice Settings">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Invoice Number Prefix</label>
            <input className="input font-mono" value={form.invoicePrefix || 'INV'} onChange={set('invoicePrefix')}
              placeholder="INV" maxLength={10} />
            <p className="text-xs text-slate-600 mt-1.5">
              Invoices will be numbered like: <span className="font-mono text-slate-400">{form.invoicePrefix || 'INV'}-2024-0001</span>
            </p>
          </div>
        </div>
      </Section>
    </div>
  )
}

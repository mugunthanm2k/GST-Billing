import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { login } from '../store/authSlice'
import { Receipt, Eye, EyeOff, Zap } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const { loading } = useSelector((s) => s.auth)
  const [form, setForm]     = useState({ username: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await dispatch(login(form))
    if (login.fulfilled.match(result)) {
      toast.success('Welcome back!')
      navigate('/dashboard')
    } else {
      toast.error(result.payload || 'Invalid credentials')
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border-r border-slate-800/60 items-center justify-center p-12 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-1/4 -left-20 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-80 h-80 rounded-full bg-sky-500/8 blur-3xl" />

        <div className="relative z-10 max-w-sm">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center shadow-xl shadow-indigo-500/30">
              <Receipt className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-bold text-white text-xl">GST Billing Pro</div>
              <div className="text-xs text-slate-500">Complete billing solution</div>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
            Smart invoicing<br />
            <span className="text-gradient">for Indian businesses</span>
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            Handle CGST, SGST, and IGST effortlessly. Generate professional tax invoices, manage customers, and track payments — all in one place.
          </p>

          {[
            'Auto CGST + SGST / IGST calculation',
            'PDF export & print-ready invoices',
            'Multi-GST rate support (0–28%)',
            'Real-time dashboard & analytics',
          ].map((f) => (
            <div key={f} className="flex items-center gap-2.5 mb-2.5">
              <div className="w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center flex-shrink-0">
                <Zap size={10} className="text-indigo-400" />
              </div>
              <span className="text-slate-300 text-sm">{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-500 shadow-xl shadow-indigo-500/30 mb-3">
              <Receipt className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">GST Billing Pro</h1>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white">Sign in</h2>
            <p className="text-slate-400 text-sm mt-1">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Username</label>
              <input
                className="input"
                placeholder="admin"
                autoComplete="username"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  className="input pr-11"
                  type={showPwd ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary w-full justify-center py-3 text-sm"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Signing in…
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/40">
            <p className="text-xs text-slate-500 text-center">
              Default credentials: <span className="text-slate-300 font-mono">admin</span> / <span className="text-slate-300 font-mono">admin123</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

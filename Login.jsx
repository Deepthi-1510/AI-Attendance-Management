import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../api/axios'
import { HiOutlineEye, HiOutlineEyeSlash, HiOutlineShieldCheck } from 'react-icons/hi2'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authAPI.login(email, password)
      const { token, user } = res.data
      login(user, token)
      const redirectMap = { admin: '/admin', teacher: '/teacher', student: '/student' }
      navigate(redirectMap[user.role] || '/')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const demoLogin = (role) => {
    const map = {
      admin: 'admin@intelliattend.edu',
      teacher: 'teacher@intelliattend.edu',
      student: 'student@intelliattend.edu',
    }
    setEmail(map[role])
    setPassword('demo123')
  }

  return (
    <div className="min-h-screen bg-sidebar flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 to-transparent" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center">
              <span className="text-white font-display font-bold">IA</span>
            </div>
            <div>
              <p className="text-white font-display font-bold text-lg leading-tight">IntelliAttend</p>
              <p className="text-slate-500 text-xs uppercase tracking-widest">AI Attendance Platform</p>
            </div>
          </div>

          <h1 className="font-display text-4xl font-bold text-white leading-tight mb-4">
            Intelligent Attendance<br />
            <span className="text-primary-500">Powered by AI</span>
          </h1>
          <p className="text-slate-400 text-base leading-relaxed max-w-sm">
            Real-time risk scoring, proxy detection, and automated verification workflows for modern universities.
          </p>

          <div className="mt-10 space-y-4">
            {[
              { label: 'Dynamic QR Attendance', sub: 'Rotating codes with device & network validation' },
              { label: 'AI Risk Profiling', sub: 'Cumulative behavioral scoring with trend analysis' },
              { label: 'Automated Penalty Engine', sub: 'Rule-based enforcement with verification workflows' },
            ].map((f) => (
              <div key={f.label} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-primary-600/30 border border-primary-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{f.label}</p>
                  <p className="text-slate-500 text-xs">{f.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-slate-600 text-xs relative z-10">© 2025 IntelliAttend · Final Year Project · All rights reserved</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-md animate-fade-in">
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center">
              <span className="text-white font-display font-bold text-sm">IA</span>
            </div>
            <p className="text-slate-800 font-display font-bold">IntelliAttend</p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-display font-bold text-slate-900">Welcome back</h2>
            <p className="text-slate-500 text-sm mt-1">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email Address</label>
              <input value={email} onChange={e => setEmail(e.target.value)} type="email" className="input" placeholder="you@institution.edu" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password</label>
              <div className="relative">
                <input value={password} onChange={e => setPassword(e.target.value)} type={showPass ? 'text' : 'password'} className="input pr-10" placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPass ? <HiOutlineEyeSlash size={16}/> : <HiOutlineEye size={16}/>}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 text-sm text-red-600">{error}</div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5 text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</> : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-1.5 mb-3">
              <HiOutlineShieldCheck size={13} className="text-slate-400" />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Demo Accounts</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {['admin', 'teacher', 'student'].map(role => (
                <button key={role} onClick={() => demoLogin(role)} className="text-center py-2 px-1 rounded-lg border border-slate-200 hover:border-primary-600 hover:bg-blue-50 transition-all group">
                  <p className="text-xs font-semibold text-slate-700 group-hover:text-primary-600 capitalize">{role}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">demo123</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

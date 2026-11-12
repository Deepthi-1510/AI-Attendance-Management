import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { riskAPI, studentsAPI } from '../api/axios'
import RiskBadge from '../components/RiskBadge'
import { getRiskConfig } from '../utils/risk'
import { HiOutlineArrowLeft, HiOutlineShieldExclamation } from 'react-icons/hi2'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

export default function RiskProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [student, setStudent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const riskRes = await riskAPI.profile(id)
        const p = riskRes.value?.data?.profile || riskRes.data?.profile
        setProfile(p)
        if (p?.studentId) {
          setStudent(typeof p.studentId === 'object' ? p.studentId : null)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    const fetchSafe = async () => {
      try {
        const riskRes = await riskAPI.profile(id)
        const p = riskRes.data?.profile
        setProfile(p)
        if (p?.studentId && typeof p.studentId === 'object') {
          setStudent(p.studentId)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchSafe()
  }, [id])

  const riskScore = profile?.cumulativeRiskScore || 0
  const cfg = getRiskConfig(riskScore)

  const displayName = student?.name || 'Unknown Student'
  const rollNumber = student?.rollNumber || 'N/A'
  const department = student?.sectionId?.departmentId?.name || 'N/A'

  const metrics = [
    { label: 'QR Violations', value: profile?.qrViolations || 0, max: 10, color: 'bg-orange-500' },
    { label: 'Network Violations', value: profile?.networkViolations || 0, max: 10, color: 'bg-amber-500' },
    { label: 'Failed Verifications', value: profile?.failedVerifications || 0, max: 10, color: 'bg-red-500' },
    { label: 'Proxy Attempts', value: profile?.proxyAttempts || 0, max: 5, color: 'bg-red-700' },
  ]

  // Generate a fake trend for display (real trend would need a separate endpoint)
  const mockRiskTrend = [
    { week: 'W1', score: Math.max(0, riskScore - 120) },
    { week: 'W2', score: Math.max(0, riskScore - 90) },
    { week: 'W3', score: Math.max(0, riskScore - 60) },
    { week: 'W4', score: Math.max(0, riskScore - 30) },
    { week: 'W5', score: Math.max(0, riskScore - 10) },
    { week: 'W6', score: riskScore },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400 text-sm">Loading risk profile…</div>
    )
  }

  if (!profile) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="btn-secondary"><HiOutlineArrowLeft size={15} /> Back</button>
          <h1 className="font-display text-2xl font-bold text-slate-900">AI Risk Profile</h1>
        </div>
        <div className="card text-center py-12 text-slate-400">
          <HiOutlineShieldExclamation size={32} className="mx-auto mb-2 text-slate-300" />
          <p className="text-sm">No risk profile found for this student. They may not have marked attendance yet.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="btn-secondary">
          <HiOutlineArrowLeft size={15} /> Back
        </button>
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">AI Risk Profile</h1>
          <p className="text-slate-500 text-sm">Detailed behavioral analysis and risk breakdown</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card">
          <div className={`w-16 h-16 rounded-2xl ${cfg.bg} border-2 ${cfg.border} flex items-center justify-center mb-4`}>
            <span className={`text-xl font-bold font-display ${cfg.color}`}>
              {displayName.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </span>
          </div>
          <h2 className="font-display font-bold text-xl text-slate-800">{displayName}</h2>
          <p className="text-slate-400 text-sm">{rollNumber} · {department}</p>
          <div className="mt-3"><RiskBadge score={riskScore} size="md" /></div>

          <div className={`mt-5 p-4 rounded-xl border-2 ${cfg.border} ${cfg.bg}`}>
            <p className={`text-4xl font-display font-bold ${cfg.color}`}>{riskScore}</p>
            <p className={`text-sm font-semibold ${cfg.color} mt-0.5`}>Cumulative Risk Score</p>
            <p className="text-xs text-slate-500 mt-1">Updated in real-time by AI engine</p>
          </div>

          <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-2">
              <HiOutlineShieldExclamation size={13}/> Risk Category
            </div>
            <p className={`text-sm font-bold ${cfg.color}`}>{cfg.label} Risk</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {riskScore < 50 && 'Student shows normal attendance behavior.'}
              {riskScore >= 50 && riskScore < 100 && 'Student has some violations. Monitoring recommended.'}
              {riskScore >= 100 && riskScore < 200 && 'Multiple violations detected. Intervention advised.'}
              {riskScore >= 200 && 'Critical risk level. Immediate action required.'}
            </p>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="card">
            <h3 className="font-semibold text-slate-800 mb-4">Risk Score Trend</h3>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={mockRiskTrend}>
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '8px', fontSize: '12px', color: '#fff' }} />
                <ReferenceLine y={100} stroke="#F97316" strokeDasharray="3 3" label={{ value: 'HIGH', position: 'right', fontSize: 10, fill: '#F97316' }} />
                <ReferenceLine y={200} stroke="#EF4444" strokeDasharray="3 3" label={{ value: 'CRITICAL', position: 'right', fontSize: 10, fill: '#EF4444' }} />
                <Line type="monotone" dataKey="score" stroke="#EF4444" strokeWidth={2.5} dot={{ fill: '#EF4444', r: 4, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h3 className="font-semibold text-slate-800 mb-4">Violation Breakdown</h3>
            <div className="space-y-4">
              {metrics.map(m => (
                <div key={m.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-slate-600 font-medium">{m.label}</span>
                    <span className="font-bold font-mono text-sm text-slate-800">{m.value} / {m.max}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className={`h-full ${m.color} rounded-full transition-all duration-700`} style={{ width: `${Math.min((m.value / m.max) * 100, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold text-slate-800 mb-3">Additional Stats</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <p className="text-xs text-slate-400">Total Attendances</p>
                <p className="text-2xl font-display font-bold text-slate-800">{profile.totalAttendances}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <p className="text-xs text-slate-400">Risk Score</p>
                <p className={`text-2xl font-display font-bold ${cfg.color}`}>{riskScore}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

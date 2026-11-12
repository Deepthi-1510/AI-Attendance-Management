import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { riskAPI, penaltiesAPI, attendanceAPI } from '../api/axios'
import AttendanceTable from '../components/AttendanceTable'
import RiskBadge from '../components/RiskBadge'
import { HiOutlineUser, HiOutlineIdentification, HiOutlineAcademicCap, HiOutlineShieldCheck } from 'react-icons/hi2'
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts'

export default function StudentDashboard() {
  const { user } = useAuth()
  const [riskProfile, setRiskProfile] = useState(null)
  const [penalties, setPenalties] = useState([])
  const [attendanceRecords, setAttendanceRecords] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return
    const fetchData = async () => {
      try {
        const [riskRes, penaltiesRes, attendanceRes] = await Promise.allSettled([
          riskAPI.profile(user.id),
          penaltiesAPI.list(),
          attendanceAPI.list(),
        ])
        if (riskRes.status === 'fulfilled') setRiskProfile(riskRes.value.data.profile)
        if (penaltiesRes.status === 'fulfilled') {
          const all = penaltiesRes.value.data.penalties || []
          setPenalties(all.filter(p => p.studentId?._id === user.id || p.studentId === user.id))
        }
        if (attendanceRes.status === 'fulfilled') {
          const all = attendanceRes.value.data.records || []
          setAttendanceRecords(all.filter(r => r.studentId?._id === user.id || r.studentId === user.id))
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user])

  const riskScore = riskProfile?.cumulativeRiskScore || 0
  const activePenalty = penalties.find(p => p.status === 'active')

  // Compute attendance percentage from records
  const totalRecords = attendanceRecords.length
  const presentRecords = attendanceRecords.filter(r => r.attendanceStatus === 'present').length
  const overallAttendance = totalRecords > 0 ? Math.round((presentRecords / totalRecords) * 100) : 0

  const attData = [{ name: 'Attendance', value: overallAttendance || 0, fill: overallAttendance >= 75 ? '#10B981' : overallAttendance >= 60 ? '#F59E0B' : '#EF4444' }]

  // Build subject-wise attendance summary
  const subjectMap = {}
  attendanceRecords.forEach(r => {
    const subjectName = r.sessionId?.subjectId?.subjectName || r.sessionId?.subjectName || 'Unknown'
    const subjectCode = r.sessionId?.subjectId?.subjectCode || ''
    if (!subjectMap[subjectName]) subjectMap[subjectName] = { subject: subjectName, code: subjectCode, total: 0, present: 0 }
    subjectMap[subjectName].total++
    if (r.attendanceStatus === 'present') subjectMap[subjectName].present++
  })
  const subjectAttendance = Object.values(subjectMap).map(s => ({
    ...s,
    pct: s.total > 0 ? Math.round((s.present / s.total) * 100) : 0,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">My Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Your attendance and risk summary</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex flex-col items-center text-center py-4">
            <div className="w-16 h-16 rounded-2xl bg-primary-600 flex items-center justify-center text-white text-2xl font-bold font-display mb-4">
              {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'ST'}
            </div>
            <h2 className="font-display font-bold text-xl text-slate-800">{user?.name || 'Student'}</h2>
            <p className="text-slate-400 text-sm mt-0.5">{user?.email}</p>
            <div className="mt-3"><RiskBadge score={riskScore} size="md" /></div>
          </div>
          <div className="border-t border-slate-100 mt-4 pt-4 space-y-3">
            {[
              { icon: HiOutlineUser, label: 'Role', value: 'Student' },
              { icon: HiOutlineShieldCheck, label: 'Risk Score', value: loading ? '…' : riskScore },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3">
                <item.icon size={15} className="text-slate-400 flex-shrink-0" />
                <span className="text-xs text-slate-400 w-20">{item.label}</span>
                <span className="text-sm font-medium text-slate-700">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card flex flex-col items-center justify-center">
          <h3 className="font-semibold text-slate-800 mb-2 self-start">Overall Attendance</h3>
          <div className="relative w-40 h-40">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart cx="50%" cy="50%" innerRadius="65%" outerRadius="90%" data={attData} startAngle={220} endAngle={-40}>
                <RadialBar dataKey="value" background={{ fill: '#F1F5F9' }} cornerRadius={10} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-3xl font-display font-bold ${overallAttendance >= 75 ? 'text-emerald-600' : overallAttendance >= 60 ? 'text-amber-600' : 'text-red-600'}`}>{loading ? '…' : `${overallAttendance}%`}</span>
              <span className="text-xs text-slate-400">Attendance</span>
            </div>
          </div>
          <div className={`mt-2 text-xs font-semibold px-3 py-1.5 rounded-lg ${overallAttendance >= 75 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
            {loading ? 'Loading…' : overallAttendance >= 75 ? '✓ Above minimum threshold' : '⚠ Below 75% — at risk'}
          </div>
        </div>

        <div className="space-y-4">
          <div className="card">
            <h3 className="font-semibold text-slate-800 mb-3">Risk Profile</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-4xl font-display font-bold text-slate-800">{loading ? '…' : riskScore}</p>
                <p className="text-xs text-slate-400 mt-0.5">Cumulative risk score</p>
              </div>
              <RiskBadge score={riskScore} size="md" />
            </div>
            {riskProfile && (
              <div className="mt-3 space-y-1.5">
                {[
                  { label: 'QR Violations', value: riskProfile.qrViolations },
                  { label: 'Network Issues', value: riskProfile.networkViolations },
                  { label: 'Failed Verifications', value: riskProfile.failedVerifications },
                  { label: 'Proxy Attempts', value: riskProfile.proxyAttempts },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">{item.label}</span>
                    <span className={`font-bold ${item.value > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={`card border-l-4 ${activePenalty ? 'border-l-red-500' : 'border-l-emerald-500'}`}>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Penalty Status</p>
            {activePenalty ? (
              <>
                <p className="text-lg font-display font-bold text-red-600 mt-1">Active Penalty</p>
                <p className="text-xs text-slate-400 mt-0.5">Until {activePenalty.endDate?.split('T')[0]}</p>
              </>
            ) : (
              <>
                <p className="text-lg font-display font-bold text-emerald-600 mt-1">No Active Penalties</p>
                <p className="text-xs text-slate-400 mt-0.5">You have a clean record</p>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold text-slate-800 mb-4">Subject-wise Attendance</h3>
        {loading ? (
          <div className="text-center py-8 text-slate-400 text-sm">Loading attendance records…</div>
        ) : subjectAttendance.length > 0 ? (
          <AttendanceTable data={subjectAttendance} />
        ) : (
          <div className="text-center py-8 text-slate-400 text-sm">No attendance records found</div>
        )}
      </div>
    </div>
  )
}

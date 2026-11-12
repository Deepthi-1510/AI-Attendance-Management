import { useState, useEffect } from 'react'
import { studentsAPI, teachersAPI, sessionsAPI, penaltiesAPI, riskAPI, attendanceAPI } from '../api/axios'
import StatCard from '../components/StatCard'
import AIWatchlistTable from '../components/AIWatchlistTable'
import ActivityTimeline from '../components/ActivityTimeline'
import { HiOutlineUsers, HiOutlineAcademicCap, HiOutlineCalendarDays, HiOutlineExclamationTriangle, HiOutlineShieldExclamation, HiOutlineArrowRight } from 'react-icons/hi2'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useNavigate } from 'react-router-dom'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({ totalStudents: 0, totalFaculty: 0, activeSessions: 0, totalPenalties: 0 })
  const [watchlist, setWatchlist] = useState([])
  const [riskDistribution, setRiskDistribution] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [studentsRes, teachersRes, sessionsRes, penaltiesRes, attendanceRes] = await Promise.allSettled([
          studentsAPI.list(),
          teachersAPI.list(),
          sessionsAPI.list(),
          penaltiesAPI.list(),
          attendanceAPI.list(),
        ])

        const students = studentsRes.status === 'fulfilled' ? studentsRes.value.data.students || [] : []
        const teachers = teachersRes.status === 'fulfilled' ? teachersRes.value.data.teachers || [] : []
        const sessions = sessionsRes.status === 'fulfilled' ? sessionsRes.value.data.sessions || [] : []
        const penalties = penaltiesRes.status === 'fulfilled' ? penaltiesRes.value.data.penalties || [] : []

        const activeSessions = sessions.filter(s => s.status === 'active').length
        const activePenalties = penalties.filter(p => p.status === 'active').length

        setStats({
          totalStudents: students.length,
          totalFaculty: teachers.length,
          activeSessions,
          totalPenalties: activePenalties,
        })

        // Build watchlist from students with risk profiles
        const watchlistData = []
        for (const student of students.slice(0, 20)) {
          try {
            const riskRes = await riskAPI.profile(student._id)
            const profile = riskRes.data.profile
            if (profile && profile.cumulativeRiskScore > 0) {
              watchlistData.push({
                id: student._id,
                name: student.name,
                rollNumber: student.rollNumber || 'N/A',
                department: student.sectionId?.departmentId?.name || 'N/A',
                riskScore: profile.cumulativeRiskScore,
                qrViolations: profile.qrViolations,
                networkViolations: profile.networkViolations,
                failedVerifications: profile.failedVerifications,
                proxyAttempts: profile.proxyAttempts,
              })
            }
          } catch {}
        }
        watchlistData.sort((a, b) => b.riskScore - a.riskScore)
        setWatchlist(watchlistData)

        // Risk distribution from watchlist data + all students
        const low = students.length - watchlistData.filter(s => s.riskScore >= 50).length
        const medium = watchlistData.filter(s => s.riskScore >= 50 && s.riskScore < 100).length
        const high = watchlistData.filter(s => s.riskScore >= 100 && s.riskScore < 200).length
        const critical = watchlistData.filter(s => s.riskScore >= 200).length
        setRiskDistribution([
          { name: 'Low', value: Math.max(low, 0), color: '#10B981' },
          { name: 'Medium', value: medium, color: '#F59E0B' },
          { name: 'High', value: high, color: '#F97316' },
          { name: 'Critical', value: critical, color: '#EF4444' },
        ])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  // Build recent activity from sessions/penalties as proxy
  const mockActivity = [
    { id: 1, type: 'session_start', message: 'Dashboard data loaded from backend', time: 'just now', user: 'System' },
  ]

  const mockAttendanceTrend = [
    { month: 'Oct', rate: 88 }, { month: 'Nov', rate: 84 }, { month: 'Dec', rate: 76 },
    { month: 'Jan', rate: 82 }, { month: 'Feb', rate: 79 }, { month: 'Mar', rate: 85 },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">System overview and real-time intelligence</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Students" value={loading ? '…' : stats.totalStudents} icon={HiOutlineUsers} trend={3.2} trendLabel="this month" color="blue" />
        <StatCard label="Total Faculty" value={loading ? '…' : stats.totalFaculty} icon={HiOutlineAcademicCap} trend={1.1} trendLabel="this month" color="green" />
        <StatCard label="Active Sessions" value={loading ? '…' : stats.activeSessions} icon={HiOutlineCalendarDays} sub="Currently running" color="amber" />
        <StatCard label="Active Penalties" value={loading ? '…' : stats.totalPenalties} icon={HiOutlineExclamationTriangle} trend={-5} trendLabel="vs last month" color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-slate-800">Attendance Trend</h3>
              <p className="text-xs text-slate-400 mt-0.5">Monthly average across all departments</p>
            </div>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">+3.2% MoM</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={mockAttendanceTrend}>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis domain={[70, 95]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '8px', fontSize: '12px' }}
                labelStyle={{ color: '#94a3b8' }}
                itemStyle={{ color: '#fff' }}
                formatter={v => [`${v}%`, 'Avg. Attendance']}
              />
              <Line type="monotone" dataKey="rate" stroke="#2563EB" strokeWidth={2.5} dot={{ fill: '#2563EB', r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="font-semibold text-slate-800 mb-1">Risk Distribution</h3>
          <p className="text-xs text-slate-400 mb-4">Students by risk category</p>
          <ResponsiveContainer width="100%" height={130}>
            <PieChart>
              <Pie data={riskDistribution.length ? riskDistribution : [{ name: 'No data', value: 1, color: '#e2e8f0' }]} cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={2} dataKey="value">
                {(riskDistribution.length ? riskDistribution : [{ color: '#e2e8f0' }]).map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v, n) => [v, n]} contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '8px', fontSize: '12px', color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {riskDistribution.map(item => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                  <span className="text-xs text-slate-600">{item.name}</span>
                </div>
                <span className="text-xs font-semibold text-slate-700">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <HiOutlineShieldExclamation size={18} className="text-red-500" />
              <h3 className="font-semibold text-slate-800">AI Watchlist</h3>
              <span className="text-xs bg-red-50 text-red-600 border border-red-200 font-semibold px-2 py-0.5 rounded-full">{watchlist.length} flagged</span>
            </div>
            <button onClick={() => navigate('/watchlist')} className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium">
              View all <HiOutlineArrowRight size={12} />
            </button>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-10 text-slate-400 text-sm">Loading watchlist…</div>
          ) : (
            <AIWatchlistTable data={watchlist.slice(0, 5)} compact />
          )}
        </div>

        <div className="card">
          <h3 className="font-semibold text-slate-800 mb-4">Recent Activity</h3>
          <ActivityTimeline activities={mockActivity} />
        </div>
      </div>
    </div>
  )
}

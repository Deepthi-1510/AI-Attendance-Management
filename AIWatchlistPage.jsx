import { useState, useEffect } from 'react'
import { studentsAPI, riskAPI } from '../api/axios'
import AIWatchlistTable from '../components/AIWatchlistTable'
import { HiOutlineShieldExclamation, HiOutlineFunnel, HiOutlineMagnifyingGlass } from 'react-icons/hi2'

export default function AIWatchlistPage() {
  const [watchlist, setWatchlist] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchWatchlist = async () => {
      try {
        const res = await studentsAPI.list()
        const students = res.data.students || []
        const profiles = []
        for (const student of students) {
          try {
            const riskRes = await riskAPI.profile(student._id)
            const profile = riskRes.data.profile
            if (profile) {
              profiles.push({
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
        profiles.sort((a, b) => b.riskScore - a.riskScore)
        setWatchlist(profiles)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchWatchlist()
  }, [])

  const getRiskLevel = (score) => {
    if (score >= 200) return 'critical'
    if (score >= 100) return 'high'
    if (score >= 50) return 'medium'
    return 'low'
  }

  const filtered = watchlist.filter(s => {
    const level = getRiskLevel(s.riskScore)
    const matchFilter = filter === 'all' || level === filter
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.rollNumber.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const counts = {
    all: watchlist.length,
    low: watchlist.filter(s => getRiskLevel(s.riskScore) === 'low').length,
    medium: watchlist.filter(s => getRiskLevel(s.riskScore) === 'medium').length,
    high: watchlist.filter(s => getRiskLevel(s.riskScore) === 'high').length,
    critical: watchlist.filter(s => getRiskLevel(s.riskScore) === 'critical').length,
  }

  const filterTabs = [
    { key: 'all', label: 'All', color: 'text-slate-700 bg-slate-100' },
    { key: 'critical', label: 'Critical', color: 'text-red-700 bg-red-50 border border-red-200' },
    { key: 'high', label: 'High', color: 'text-orange-700 bg-orange-50 border border-orange-200' },
    { key: 'medium', label: 'Medium', color: 'text-amber-700 bg-amber-50 border border-amber-200' },
    { key: 'low', label: 'Low', color: 'text-emerald-700 bg-emerald-50 border border-emerald-200' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <HiOutlineShieldExclamation size={22} className="text-red-500" />
            <h1 className="font-display text-2xl font-bold text-slate-900">AI Watchlist</h1>
          </div>
          <p className="text-slate-500 text-sm">Students flagged by the AI risk engine for behavioral anomalies</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Critical', count: counts.critical, color: 'border-red-300 bg-red-50', text: 'text-red-700', sub: '200+ risk score' },
          { label: 'High', count: counts.high, color: 'border-orange-300 bg-orange-50', text: 'text-orange-700', sub: '100–199 risk score' },
          { label: 'Medium', count: counts.medium, color: 'border-amber-300 bg-amber-50', text: 'text-amber-700', sub: '50–99 risk score' },
          { label: 'Low', count: counts.low, color: 'border-emerald-300 bg-emerald-50', text: 'text-emerald-700', sub: '0–49 risk score' },
        ].map(item => (
          <div key={item.label} className={`rounded-xl border-2 ${item.color} p-4`}>
            <p className={`text-3xl font-display font-bold ${item.text}`}>{loading ? '…' : item.count}</p>
            <p className={`text-sm font-semibold ${item.text}`}>{item.label} Risk</p>
            <p className="text-xs text-slate-500 mt-0.5">{item.sub}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1 max-w-xs">
            <HiOutlineMagnifyingGlass size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} className="input pl-8" placeholder="Search students..." />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <HiOutlineFunnel size={15} className="text-slate-400" />
            {filterTabs.map(tab => (
              <button key={tab.key} onClick={() => setFilter(tab.key)} className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${filter === tab.key ? tab.color : 'text-slate-500 bg-slate-50 border border-slate-200 hover:bg-slate-100'}`}>
                {tab.label} ({counts[tab.key]})
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400 text-sm">Loading risk profiles…</div>
        ) : (
          <AIWatchlistTable data={filtered} />
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <HiOutlineShieldExclamation size={32} className="mx-auto mb-2 text-slate-300" />
            <p className="text-sm">No students match the current filters</p>
          </div>
        )}
      </div>
    </div>
  )
}

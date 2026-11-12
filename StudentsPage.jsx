import { useState, useEffect } from 'react'
import { studentsAPI, riskAPI } from '../api/axios'
import RiskBadge from '../components/RiskBadge'
import { getAttendanceColor } from '../utils/risk'
import { HiOutlinePlus, HiOutlineMagnifyingGlass, HiOutlineUser } from 'react-icons/hi2'
import { useNavigate } from 'react-router-dom'

export default function StudentsPage() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await studentsAPI.list()
        const raw = res.data.students || []
        // Fetch risk scores in parallel
        const enriched = await Promise.all(
          raw.map(async (s) => {
            let riskScore = 0
            try {
              const riskRes = await riskAPI.profile(s._id)
              riskScore = riskRes.data.profile?.cumulativeRiskScore || 0
            } catch {}
            return {
              id: s._id,
              name: s.name,
              rollNumber: s.rollNumber || 'N/A',
              email: s.email,
              department: s.sectionId?.departmentId?.name || 'N/A',
              section: s.sectionId?.section || 'N/A',
              attendancePct: 0, // not computed by backend directly
              riskScore,
            }
          })
        )
        setStudents(enriched)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchStudents()
  }, [])

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.rollNumber.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Students</h1>
          <p className="text-slate-500 text-sm mt-1">{loading ? '…' : students.length} enrolled students</p>
        </div>
        <button className="btn-primary"><HiOutlinePlus size={15}/> Add Student</button>
      </div>

      <div className="card">
        <div className="flex items-center gap-3 mb-5">
          <div className="relative flex-1 max-w-xs">
            <HiOutlineMagnifyingGlass size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
            <input value={search} onChange={e => setSearch(e.target.value)} className="input pl-8" placeholder="Search by name or roll number..." />
          </div>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400 text-sm">Loading students…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="table-th">Student</th>
                  <th className="table-th">Department</th>
                  <th className="table-th">Section</th>
                  <th className="table-th text-center">Attendance</th>
                  <th className="table-th">Risk Level</th>
                  <th className="table-th text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="table-td">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-600/10 flex items-center justify-center text-primary-600 text-xs font-bold flex-shrink-0">
                          {s.name.split(' ').map(n => n[0]).join('').slice(0,2)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{s.name}</p>
                          <p className="text-xs text-slate-400">{s.rollNumber}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-td text-slate-600">{s.department}</td>
                    <td className="table-td text-slate-600">{s.section !== 'N/A' ? `Section ${s.section}` : 'N/A'}</td>
                    <td className="table-td text-center">
                      <span className={`font-bold font-mono text-sm ${getAttendanceColor(s.attendancePct)}`}>{s.attendancePct}%</span>
                    </td>
                    <td className="table-td"><RiskBadge score={s.riskScore} /></td>
                    <td className="table-td text-right">
                      <button onClick={() => navigate(`/risk-profile/${s.id}`)} className="inline-flex items-center gap-1 text-xs text-primary-600 hover:underline font-medium">
                        <HiOutlineUser size={12}/> View Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-sm">No students found</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

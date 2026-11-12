import { useState, useEffect } from 'react'
import { subjectsAPI } from '../api/axios'
import { getAttendanceColor } from '../utils/risk'
import { HiOutlinePlus, HiOutlineBookOpen } from 'react-icons/hi2'

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await subjectsAPI.list()
        setSubjects(res.data.subjects || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchSubjects()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Subjects</h1>
          <p className="text-slate-500 text-sm mt-1">{loading ? '…' : subjects.length} subjects across departments</p>
        </div>
        <button className="btn-primary"><HiOutlinePlus size={15}/> Add Subject</button>
      </div>

      <div className="card">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400 text-sm">Loading subjects…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="table-th">Subject</th>
                  <th className="table-th">Code</th>
                  <th className="table-th">Faculty</th>
                  <th className="table-th">Section</th>
                  <th className="table-th">Department</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {subjects.map(s => (
                  <tr key={s._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="table-td">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-primary-600">
                          <HiOutlineBookOpen size={14}/>
                        </div>
                        <p className="font-medium text-slate-800">{s.subjectName}</p>
                      </div>
                    </td>
                    <td className="table-td font-mono text-slate-500 text-xs">{s.subjectCode}</td>
                    <td className="table-td text-slate-600 text-sm">{s.teacherId?.name || 'N/A'}</td>
                    <td className="table-td text-slate-600 text-sm">
                      {s.sectionId ? `Year ${s.sectionId.year} – Sec ${s.sectionId.section}` : 'N/A'}
                    </td>
                    <td className="table-td text-slate-600 text-sm">{s.sectionId?.departmentId?.name || 'N/A'}</td>
                  </tr>
                ))}
                {subjects.length === 0 && (
                  <tr>
                    <td colSpan={5} className="table-td text-center text-slate-400 py-8">No subjects found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

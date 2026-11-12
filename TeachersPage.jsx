import { useState, useEffect } from 'react'
import { teachersAPI } from '../api/axios'
import { HiOutlinePlus, HiOutlineAcademicCap } from 'react-icons/hi2'

export default function TeachersPage() {
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await teachersAPI.list()
        setTeachers(res.data.teachers || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchTeachers()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Faculty</h1>
          <p className="text-slate-500 text-sm mt-1">{loading ? '…' : teachers.length} faculty members</p>
        </div>
        <button className="btn-primary"><HiOutlinePlus size={15}/> Add Faculty</button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-slate-400 text-sm">Loading faculty…</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {teachers.map(t => (
            <div key={t._id} className="card hover:shadow-card-hover transition-shadow animate-fade-in">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm flex-shrink-0">
                  {t.name.split(' ').slice(-2).map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800">{t.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{t.email}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="text-xs bg-blue-50 text-primary-600 border border-blue-100 px-2 py-0.5 rounded-full font-medium">
                      {t.departmentId?.name || 'N/A'}
                    </span>
                    {t.employeeId && (
                      <span className="text-xs text-slate-400">ID: {t.employeeId}</span>
                    )}
                  </div>
                </div>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full capitalize">
                  {t.isActive ? 'active' : 'inactive'}
                </span>
              </div>
            </div>
          ))}
          {teachers.length === 0 && (
            <div className="col-span-2 text-center py-12 text-slate-400 text-sm">No faculty members found</div>
          )}
        </div>
      )}
    </div>
  )
}

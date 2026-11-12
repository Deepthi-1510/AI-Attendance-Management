import { HiOutlineClock, HiOutlineUserGroup, HiOutlineCheckCircle } from 'react-icons/hi2'
import { formatTime, getStatusConfig } from '../utils/risk'

export default function SessionCard({ session, onView, onReport }) {
  const sc = getStatusConfig(session.status)
  return (
    <div className="card hover:shadow-card-hover transition-shadow animate-fade-in">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-slate-800">{session.subject}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{session.code} · {session.faculty}</p>
        </div>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${sc.bg} ${sc.color}`}>{sc.label}</span>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-slate-50 rounded-lg p-2.5">
          <div className="flex items-center gap-1 text-slate-400 text-xs mb-1"><HiOutlineClock size={11}/> Start</div>
          <p className="text-sm font-medium text-slate-700">{formatTime(session.startTime)}</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-2.5">
          <div className="flex items-center gap-1 text-slate-400 text-xs mb-1"><HiOutlineUserGroup size={11}/> Students</div>
          <p className="text-sm font-medium text-slate-700">{session.totalStudents}</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-2.5">
          <div className="flex items-center gap-1 text-slate-400 text-xs mb-1"><HiOutlineCheckCircle size={11}/> Present</div>
          <p className={`text-sm font-bold ${session.attendancePct >= 75 ? 'text-emerald-600' : 'text-amber-600'}`}>{session.attendancePct}%</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => onView?.(session)} className="btn-secondary flex-1 justify-center text-xs">View Session</button>
        <button onClick={() => onReport?.(session)} className="btn-secondary flex-1 justify-center text-xs">Generate Report</button>
      </div>
    </div>
  )
}

import { HiOutlinePlay, HiOutlineCheckCircle, HiOutlineExclamationTriangle, HiOutlineXCircle, HiOutlineShieldExclamation } from 'react-icons/hi2'

const typeConfig = {
  session_start: { icon: HiOutlinePlay, color: 'bg-blue-100 text-blue-600', dot: 'bg-blue-500' },
  session_end: { icon: HiOutlineXCircle, color: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' },
  attendance_verified: { icon: HiOutlineCheckCircle, color: 'bg-emerald-100 text-emerald-600', dot: 'bg-emerald-500' },
  penalty_applied: { icon: HiOutlineExclamationTriangle, color: 'bg-red-100 text-red-600', dot: 'bg-red-500' },
  penalty_revoked: { icon: HiOutlineCheckCircle, color: 'bg-amber-100 text-amber-600', dot: 'bg-amber-500' },
  risk_alert: { icon: HiOutlineShieldExclamation, color: 'bg-red-100 text-red-600', dot: 'bg-red-500' },
}

export default function ActivityTimeline({ activities = [] }) {
  return (
    <div className="space-y-0">
      {activities.map((item, i) => {
        const cfg = typeConfig[item.type] || typeConfig.session_start
        const Icon = cfg.icon
        return (
          <div key={item.id} className="flex gap-3 group">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
                <Icon size={14} />
              </div>
              {i < activities.length - 1 && <div className="w-px h-full bg-slate-100 my-1" />}
            </div>
            <div className="pb-4 flex-1 min-w-0">
              <p className="text-sm text-slate-700 leading-relaxed">{item.message}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-slate-400">{item.time}</span>
                <span className="text-slate-300">·</span>
                <span className="text-xs text-slate-400">{item.user}</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

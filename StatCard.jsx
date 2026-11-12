export default function StatCard({ label, value, icon: Icon, trend, trendLabel, color = 'blue', sub }) {
  const colors = {
    blue: { icon: 'bg-blue-50 text-primary-600', trend: 'text-emerald-600' },
    green: { icon: 'bg-emerald-50 text-emerald-600', trend: 'text-emerald-600' },
    amber: { icon: 'bg-amber-50 text-amber-600', trend: 'text-amber-600' },
    red: { icon: 'bg-red-50 text-red-600', trend: 'text-red-600' },
  }
  const c = colors[color]
  return (
    <div className="card flex flex-col gap-4 animate-fade-in hover:shadow-card-hover transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
          <p className="text-3xl font-display font-bold text-slate-900 mt-1.5">{value?.toLocaleString()}</p>
          {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
        </div>
        {Icon && (
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${c.icon}`}>
            <Icon size={20} />
          </div>
        )}
      </div>
      {(trend !== undefined) && (
        <div className={`flex items-center gap-1 text-xs font-medium ${c.trend}`}>
          <span>{trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%</span>
          {trendLabel && <span className="text-slate-400 font-normal">{trendLabel}</span>}
        </div>
      )}
    </div>
  )
}

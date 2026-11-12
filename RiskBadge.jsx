import { getRiskConfig } from '../utils/risk'

export default function RiskBadge({ score, size = 'sm' }) {
  const config = getRiskConfig(score)
  const sizes = {
    xs: 'text-[10px] px-1.5 py-0.5',
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
  }
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold border ${config.bg} ${config.color} ${config.border} ${sizes[size]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  )
}

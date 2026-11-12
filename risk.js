export function getRiskLevel(score) {
  if (score < 50) return 'LOW'
  if (score < 100) return 'MEDIUM'
  if (score < 200) return 'HIGH'
  return 'CRITICAL'
}

export function getRiskConfig(score) {
  const level = getRiskLevel(score)
  const configs = {
    LOW: { label: 'Low', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-500' },
    MEDIUM: { label: 'Medium', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-500' },
    HIGH: { label: 'High', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', dot: 'bg-orange-500' },
    CRITICAL: { label: 'Critical', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', dot: 'bg-red-500' },
  }
  return { level, ...configs[level] }
}

export function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatTime(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '—'
  return `${formatDate(dateStr)}, ${formatTime(dateStr)}`
}

export function getAttendanceColor(pct) {
  if (pct >= 75) return 'text-emerald-600'
  if (pct >= 60) return 'text-amber-600'
  return 'text-red-600'
}

export function getStatusConfig(status) {
  const map = {
    active: { label: 'Active', color: 'text-emerald-700', bg: 'bg-emerald-50' },
    ended: { label: 'Ended', color: 'text-slate-600', bg: 'bg-slate-100' },
    pending: { label: 'Pending', color: 'text-amber-700', bg: 'bg-amber-50' },
    verified: { label: 'Verified', color: 'text-emerald-700', bg: 'bg-emerald-50' },
    flagged: { label: 'Flagged', color: 'text-red-700', bg: 'bg-red-50' },
    revoked: { label: 'Revoked', color: 'text-slate-600', bg: 'bg-slate-100' },
  }
  return map[status?.toLowerCase()] || { label: status, color: 'text-slate-600', bg: 'bg-slate-100' }
}

import RiskBadge from './RiskBadge'
import {
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineFingerPrint,
  HiOutlineClock,
  HiOutlineShieldCheck,
} from 'react-icons/hi2'

export default function VerificationTable({ data = [], onApprove, onReject }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <th className="table-th">Student</th>
            <th className="table-th">Audit Reason</th>
            <th className="table-th">Biometric Status</th>
            <th className="table-th">Risk Score</th>
            <th className="table-th text-right">Teacher Override</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {data.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center py-8 text-sm text-slate-400">
                No active biometric verification candidates
              </td>
            </tr>
          )}
          {data.map((row) => (
            <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
              <td className="table-td">
                <p className="font-semibold text-slate-800">{row.student}</p>
                <p className="text-xs text-slate-400">{row.rollNumber}</p>
              </td>

              <td className="table-td">
                <span className="inline-flex items-center bg-slate-100 text-slate-700 text-[11px] font-medium px-2 py-0.5 rounded-full border border-slate-200">
                  {row.reason}
                </span>
              </td>

              <td className="table-td">
                {row.status === 'verified' ? (
                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-lg border border-emerald-200">
                    <HiOutlineCheckCircle size={14} className="text-emerald-600" />
                    Biometric Confirmed ({row.biometricType || 'Fingerprint'})
                  </span>
                ) : row.status === 'failed' ? (
                  <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 text-xs font-semibold px-2.5 py-1 rounded-lg border border-red-200">
                    <HiOutlineXCircle size={14} className="text-red-500" />
                    Biometric Failed · 7-Day Lock
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-lg border border-amber-200 animate-pulse">
                    <HiOutlineClock size={14} className="text-amber-500" />
                    Awaiting Student Biometric...
                  </span>
                )}
              </td>

              <td className="table-td">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm text-slate-700">{row.riskScore}</span>
                  <RiskBadge score={row.riskScore} size="xs" />
                </div>
              </td>

              <td className="table-td text-right">
                {row.status === 'pending' ? (
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => onApprove?.(row.id)}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-1 rounded-md transition-colors"
                      title="Manual override: Confirm student is present in class"
                    >
                      Override Pass
                    </button>
                    <button
                      onClick={() => onReject?.(row.id)}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-2 py-1 rounded-md transition-colors"
                      title="Manual override: Reject and enforce 7-day penalty"
                    >
                      Penalty Lock
                    </button>
                  </div>
                ) : (
                  <span className="text-[11px] text-slate-400 font-medium">Autonomous</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

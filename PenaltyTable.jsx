import { formatDate, getStatusConfig } from '../utils/risk'
import { HiOutlineXCircle } from 'react-icons/hi2'

export default function PenaltyTable({ data = [], onRevoke, showActions = true }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="table-th">Student</th>
            <th className="table-th">Reason</th>
            <th className="table-th">Start Date</th>
            <th className="table-th">End Date</th>
            <th className="table-th">Status</th>
            {showActions && <th className="table-th text-right">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {data.map((row) => {
            const sc = getStatusConfig(row.status)
            return (
              <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="table-td">
                  <p className="font-medium text-slate-800">{row.student}</p>
                  <p className="text-xs text-slate-400">{row.rollNumber}</p>
                </td>
                <td className="table-td text-slate-600 max-w-xs text-sm">{row.reason}</td>
                <td className="table-td text-slate-500 text-xs">{formatDate(row.startDate)}</td>
                <td className="table-td text-slate-500 text-xs">{formatDate(row.endDate)}</td>
                <td className="table-td">
                  <span className={`inline-flex text-xs font-semibold px-2 py-0.5 rounded-full ${sc.bg} ${sc.color}`}>{sc.label}</span>
                </td>
                {showActions && (
                  <td className="table-td text-right">
                    {row.status === 'active' && (
                      <button onClick={() => onRevoke?.(row.id)} className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-2.5 py-1 rounded-lg transition-colors">
                        <HiOutlineXCircle size={13} /> Revoke
                      </button>
                    )}
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

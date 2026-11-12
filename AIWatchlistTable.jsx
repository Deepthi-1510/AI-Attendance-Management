import { useNavigate } from 'react-router-dom'
import RiskBadge from './RiskBadge'
import { HiOutlineUser } from 'react-icons/hi2'

export default function AIWatchlistTable({ data = [], compact = false }) {
  const navigate = useNavigate()
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="table-th">Student</th>
            <th className="table-th text-right">Risk Score</th>
            <th className="table-th">Risk Level</th>
            {!compact && <>
              <th className="table-th text-center">QR Violations</th>
              <th className="table-th text-center">Network</th>
              <th className="table-th text-center">Failed Verif.</th>
              <th className="table-th text-center">Proxy</th>
            </>}
            <th className="table-th text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {data.map((row) => (
            <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
              <td className="table-td">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-xs font-semibold flex-shrink-0">
                    {row.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-medium text-slate-800 text-sm">{row.name}</p>
                    <p className="text-xs text-slate-400">{row.rollNumber} · {row.department}</p>
                  </div>
                </div>
              </td>
              <td className="table-td text-right">
                <span className="font-mono font-bold text-slate-800">{row.riskScore}</span>
              </td>
              <td className="table-td">
                <RiskBadge score={row.riskScore} />
              </td>
              {!compact && <>
                <td className="table-td text-center"><span className={`font-semibold ${row.qrViolations > 4 ? 'text-red-600' : 'text-slate-700'}`}>{row.qrViolations}</span></td>
                <td className="table-td text-center"><span className={`font-semibold ${row.networkViolations > 3 ? 'text-red-600' : 'text-slate-700'}`}>{row.networkViolations}</span></td>
                <td className="table-td text-center"><span className="font-semibold text-slate-700">{row.failedVerifications}</span></td>
                <td className="table-td text-center"><span className={`font-semibold ${row.proxyAttempts > 0 ? 'text-red-600' : 'text-slate-400'}`}>{row.proxyAttempts}</span></td>
              </>}
              <td className="table-td text-right">
                <button
                  onClick={() => navigate(`/risk-profile/${row.id}`)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-700 hover:underline"
                >
                  <HiOutlineUser size={13} />
                  View Profile
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

import { getAttendanceColor } from '../utils/risk'

export default function AttendanceTable({ data = [] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="table-th">Subject</th>
            <th className="table-th">Code</th>
            <th className="table-th text-center">Total Classes</th>
            <th className="table-th text-center">Present</th>
            <th className="table-th text-center">Absent</th>
            <th className="table-th text-right">Attendance %</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {data.map((row, i) => (
            <tr key={i} className="hover:bg-slate-50/60 transition-colors">
              <td className="table-td font-medium text-slate-800">{row.subject}</td>
              <td className="table-td font-mono text-slate-500 text-xs">{row.code}</td>
              <td className="table-td text-center text-slate-600">{row.total}</td>
              <td className="table-td text-center text-emerald-600 font-medium">{row.present}</td>
              <td className="table-td text-center text-red-500 font-medium">{row.total - row.present}</td>
              <td className="table-td text-right">
                <div className="flex items-center justify-end gap-3">
                  <div className="w-20 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className={`h-full rounded-full ${row.pct >= 75 ? 'bg-emerald-500' : row.pct >= 60 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${row.pct}%` }} />
                  </div>
                  <span className={`font-bold font-mono text-sm w-10 text-right ${getAttendanceColor(row.pct)}`}>{row.pct}%</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { penaltiesAPI } from '../api/axios'
import PenaltyTable from '../components/PenaltyTable'
import { HiOutlineExclamationTriangle, HiOutlinePlus } from 'react-icons/hi2'

export default function PenaltiesPage() {
  const [penalties, setPenalties] = useState([])
  const [loading, setLoading] = useState(true)
  const [showConfirm, setShowConfirm] = useState(null)
  const [revoking, setRevoking] = useState(false)

  useEffect(() => {
    fetchPenalties()
  }, [])

  const fetchPenalties = async () => {
    try {
      const res = await penaltiesAPI.list()
      const raw = res.data.penalties || []
      const mapped = raw.map(p => ({
        id: p._id,
        student: p.studentId?.name || 'Unknown',
        rollNumber: p.studentId?.rollNumber || 'N/A',
        reason: p.reason,
        startDate: p.startDate?.split('T')[0],
        endDate: p.endDate?.split('T')[0],
        status: p.status,
      }))
      setPenalties(mapped)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleRevoke = (id) => setShowConfirm(id)
  const confirmRevoke = async () => {
    if (!showConfirm) return
    setRevoking(true)
    try {
      await penaltiesAPI.revoke(showConfirm)
      setPenalties(p => p.map(x => x.id === showConfirm ? { ...x, status: 'revoked' } : x))
    } catch (err) {
      console.error(err)
    } finally {
      setRevoking(false)
      setShowConfirm(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Penalty Management</h1>
          <p className="text-slate-500 text-sm mt-1">Manage academic penalties and revocations</p>
        </div>
        <button className="btn-primary">
          <HiOutlinePlus size={15} /> Apply Penalty
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Penalties', value: penalties.length, color: 'bg-slate-100 text-slate-700 border-slate-200' },
          { label: 'Active', value: penalties.filter(p => p.status === 'active').length, color: 'bg-red-50 text-red-700 border-red-200' },
          { label: 'Revoked', value: penalties.filter(p => p.status === 'revoked').length, color: 'bg-slate-100 text-slate-500 border-slate-200' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border ${s.color} p-4`}>
            <p className="text-3xl font-display font-bold">{loading ? '…' : s.value}</p>
            <p className="text-sm font-semibold mt-0.5 opacity-80">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="card">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400 text-sm">Loading penalties…</div>
        ) : (
          <PenaltyTable data={penalties} onRevoke={handleRevoke} />
        )}
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
              <HiOutlineExclamationTriangle size={22} className="text-amber-600" />
            </div>
            <h3 className="font-display font-bold text-lg text-slate-800 text-center">Revoke Penalty?</h3>
            <p className="text-slate-500 text-sm text-center mt-2">This action will remove the academic penalty for this student. Are you sure?</p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowConfirm(null)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button onClick={confirmRevoke} disabled={revoking} className="btn-primary flex-1 justify-center bg-amber-500 hover:bg-amber-600 disabled:opacity-60">
                {revoking ? 'Revoking…' : 'Confirm Revoke'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { sessionsAPI, attendanceAPI, subjectsAPI } from '../api/axios'
import QRDisplay from '../components/QRDisplay'
import VerificationTable from '../components/VerificationTable'
import {
  HiOutlinePlay,
  HiOutlineStop,
  HiOutlineQueueList,
  HiOutlineXMark,
  HiOutlineBookOpen,
  HiOutlineSparkles,
  HiOutlineCheckCircle,
  HiOutlineArchiveBox,
} from 'react-icons/hi2'

export default function TeacherDashboard() {
  const { user } = useAuth()

  const [activeSession, setActiveSession] = useState(null)
  const [verifyOpen, setVerifyOpen] = useState(false)
  const [queue, setQueue] = useState([])
  const [attendanceRecords, setAttendanceRecords] = useState([])
  const [loadingSession, setLoadingSession] = useState(true)

  // Start Session States
  const [subjects, setSubjects] = useState([])
  const [selectedSubject, setSelectedSubject] = useState('')
  const [showStartModal, setShowStartModal] = useState(false)
  const [startingSession, setStartingSession] = useState(false)

  // -----------------------------
  // INITIAL LOAD
  // -----------------------------

  useEffect(() => {
    if (user?.id) {
      fetchActiveSession()
      fetchSubjects()
    }
  }, [user])

  // -----------------------------
  // AUTO REFRESH LIVE DATA
  // -----------------------------

  useEffect(() => {
    if (!activeSession) return

    const interval = setInterval(() => {
      fetchAttendanceRecords()
      fetchVerificationQueue(activeSession._id)
    }, 5000)

    return () => clearInterval(interval)
  }, [activeSession])

  // -----------------------------
  // FETCH TEACHER SUBJECTS
  // -----------------------------

  const fetchSubjects = async () => {
    try {
      const res = await subjectsAPI.list()

      const allSubjects = res.data.subjects || []

      // Show only subjects assigned to logged-in teacher
      const teacherSubjects = allSubjects.filter(
        (subject) =>
          subject.teacherId?._id === user?.id ||
          subject.teacherId === user?.id
      )

      setSubjects(teacherSubjects)

    } catch (error) {
      console.error('Error fetching subjects:', error)
    }
  }

  // -----------------------------
  // FETCH ACTIVE SESSION
  // -----------------------------

  const fetchActiveSession = async () => {
    try {
      const res = await sessionsAPI.active()

      const session = res.data.session

      setActiveSession(session)

      if (session?._id) {
        fetchVerificationQueue(session._id)
        fetchAttendanceRecords()
      }

    } catch (error) {
      setActiveSession(null)
    } finally {
      setLoadingSession(false)
    }
  }

  // -----------------------------
  // FETCH ATTENDANCE RECORDS
  // -----------------------------

  const fetchAttendanceRecords = async () => {
    try {
      const res = await attendanceAPI.list()

      setAttendanceRecords(res.data.records || [])

    } catch (error) {
      console.error('Attendance fetch error:', error)
    }
  }

  // -----------------------------
  // FETCH VERIFICATION STUDENTS
  // -----------------------------

  const fetchVerificationQueue = async (sessionId) => {
    if (!sessionId) return

    try {
      const res =
        await attendanceAPI.verificationCandidates(sessionId)

      const raw = res.data.students || []

      const mapped = raw.map((record) => ({
        id: record._id,
        student:
          record.student ||
          record.studentId?.name ||
          'Unknown Student',
        rollNumber:
          record.rollNumber ||
          record.studentId?.rollNumber ||
          'N/A',
        reason:
          record.reason ||
          record.verificationReason ||
          'AI Multi-Factor Audit Selection',
        riskScore:
          record.riskScore || 0,
        status:
          record.status ||
          record.verificationStatus ||
          'pending',
        biometricType:
          record.biometricType || '',
        time:
          record.time ||
          new Date(
            record.scanTime ||
            record.createdAt
          ).toLocaleTimeString(),
        attendanceRecordId:
          record._id,
      }))

      setQueue(mapped)

    } catch (error) {
      console.error(
        'Verification queue error:',
        error
      )
    }
  }

  // -----------------------------
  // START ATTENDANCE SESSION
  // -----------------------------

  const handleStartSession = async () => {

    if (!selectedSubject) {
      alert('Please select a subject')
      return
    }

    try {

      setStartingSession(true)

      const now = new Date()

      // Demo class duration = 30 minutes
      const endTime = new Date(
        now.getTime() +
        30 * 60 * 1000
      )

      const res =
        await sessionsAPI.start({

          subjectId:
            selectedSubject,

          teacherId:
            user.id,

          sessionStartTime:
            now.toISOString(),

          sessionEndTime:
            endTime.toISOString(),

        })

      setActiveSession(
        res.data.session
      )

      setShowStartModal(false)

      setSelectedSubject('')

      // Refresh data
      fetchAttendanceRecords()

      alert(
        'Attendance session started successfully!'
      )

    } catch (error) {

      console.error(
        'Start session error:',
        error
      )

      alert(
        error.response?.data?.message ||
        'Failed to start attendance session'
      )

    } finally {

      setStartingSession(false)

    }
  }

  // -----------------------------
  // RUN AI VERIFICATION ENGINE
  // -----------------------------
  const handleRunAIVerification = async () => {
    if (!activeSession) return
    try {
      const res = await sessionsAPI.aiVerify(activeSession._id)
      alert(res.data.message || 'AI Verification completed!')
      setVerifyOpen(true)
      fetchActiveSession()
      fetchAttendanceRecords()
      if (activeSession._id) fetchVerificationQueue(activeSession._id)
    } catch (error) {
      console.error('AI Verification error:', error)
      alert(error.response?.data?.message || 'Failed to run AI verification')
    }
  }

  // -----------------------------
  // APPROVE ALL REMAINING
  // -----------------------------
  const handleApproveAll = async () => {
    if (queue.length === 0) return
    try {
      for (const item of queue) {
        await attendanceAPI.verify(item.attendanceRecordId, 'verified')
      }
      setQueue([])
      fetchAttendanceRecords()
      alert('All remaining verification candidates approved!')
    } catch (error) {
      console.error(error)
      alert('Error verifying some students')
    }
  }

  // -----------------------------
  // FINALIZE SESSION
  // -----------------------------
  const handleFinalizeSession = async () => {
    if (!activeSession) return
    const confirmFinalize = window.confirm(
      'Are you sure you want to finalize and archive this attendance session? All statistics will be locked.'
    )
    if (!confirmFinalize) return

    try {
      const res = await sessionsAPI.finalize(activeSession._id)
      alert(res.data.message || 'Session finalized successfully!')
      setActiveSession(null)
      setQueue([])
      fetchAttendanceRecords()
    } catch (error) {
      console.error(error)
      alert(error.response?.data?.message || 'Failed to finalize session')
    }
  }

  // -----------------------------
  // END SESSION
  // -----------------------------
  const handleEndSession = async () => {
    if (!activeSession) return
    const confirmEnd = window.confirm(
      'End this attendance session and transition to verification?'
    )
    if (!confirmEnd) return

    try {
      await sessionsAPI.end(activeSession._id)
      handleRunAIVerification()
    } catch (error) {
      console.error(error)
      alert(error.response?.data?.message || 'Failed to end session')
    }
  }

  // -----------------------------
  // APPROVE VERIFICATION
  // -----------------------------

  const handleApprove = async (id) => {

    const item =
      queue.find(
        (x) => x.id === id
      )

    if (!item) return

    try {

      await attendanceAPI.verify(
        item.attendanceRecordId,
        'verified'
      )

      setQueue(
        (currentQueue) =>
          currentQueue.filter(
            (x) => x.id !== id
          )
      )

      fetchAttendanceRecords()

    } catch (error) {

      console.error(error)

      alert(
        'Failed to verify student'
      )
    }
  }

  // -----------------------------
  // REJECT VERIFICATION
  // -----------------------------

  const handleReject = async (id) => {

    const item =
      queue.find(
        (x) => x.id === id
      )

    if (!item) return

    const confirmReject =
      window.confirm(
        'Reject this student? A penalty will be applied.'
      )

    if (!confirmReject) return

    try {

      await attendanceAPI.verify(
        item.attendanceRecordId,
        'failed'
      )

      setQueue(
        (currentQueue) =>
          currentQueue.filter(
            (x) => x.id !== id
          )
      )

      fetchAttendanceRecords()

    } catch (error) {

      console.error(error)

      alert(
        'Failed to reject student'
      )
    }
  }

  // -----------------------------
  // CURRENT SESSION RECORDS
  // -----------------------------

  const sessionRecords =
    activeSession
      ? attendanceRecords.filter(
          (record) =>
            record.sessionId?._id ===
              activeSession._id ||
            record.sessionId ===
              activeSession._id
        )
      : []

  // -----------------------------
  // LIVE STATISTICS
  // -----------------------------

  const temporary =
    sessionRecords.filter(
      (record) =>
        record.attendanceStatus ===
        'temporary'
    ).length

  const present =
    sessionRecords.filter(
      (record) =>
        record.attendanceStatus ===
        'present'
    ).length

  const absent =
    sessionRecords.filter(
      (record) =>
        record.attendanceStatus ===
        'absent'
    ).length

  const total =
    sessionRecords.length

  const stats = {
    total,
    present,
    absent,
    pending: temporary,
    verification: queue.length,
  }

  const attendanceRate =
    total > 0
      ? Math.round(
          (
            (present + temporary) /
            total
          ) * 100
        )
      : 0

  const sessionLabel =
    activeSession
      ? `${activeSession.subjectId?.subjectName || 'Session'} · ${
          activeSession.teacherId?.name ||
          user?.name ||
          ''
        }`
      : ''

  // ==========================================
  // UI
  // ==========================================

  return (

    <div className="space-y-6">

      {/* HEADER */}

      <div className="flex items-start justify-between">

        <div>

          <h1 className="font-display text-2xl font-bold text-slate-900">
            Teacher Dashboard
          </h1>

          <p className="text-slate-500 text-sm mt-1">

            {user?.name || 'Teacher'}

            {activeSession &&
              ` · ${
                activeSession.subjectId?.subjectName || ''
              } · Active Session`
            }

          </p>

        </div>


        {/* ACTION BUTTONS */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {activeSession ? (
            <>
              {activeSession.status === 'active' && (
                <button
                  onClick={handleRunAIVerification}
                  className="btn-primary bg-gradient-to-r from-indigo-600 to-primary-600 border-none shadow-md hover:shadow-lg flex items-center gap-1.5"
                >
                  <HiOutlineSparkles size={16} className="text-amber-300" />
                  Run AI Verification
                </button>
              )}

              <button
                onClick={handleEndSession}
                className="btn-secondary border-red-200 text-red-600 hover:bg-red-50 flex items-center gap-1"
              >
                <HiOutlineStop size={15} />
                End Scanning
              </button>

              <button
                onClick={handleFinalizeSession}
                className="btn-danger flex items-center gap-1"
                title="Finalize & lock all attendance statistics"
              >
                <HiOutlineArchiveBox size={15} />
                Finalize Session
              </button>

              <button
                onClick={() => setVerifyOpen(!verifyOpen)}
                className="btn-secondary relative flex items-center gap-1"
              >
                <HiOutlineQueueList size={15} />
                Verification
                {queue.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full text-[10px] text-white font-bold flex items-center justify-center">
                    {queue.length}
                  </span>
                )}
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowStartModal(true)}
              className="btn-primary"
            >
              <HiOutlinePlay size={15} />
              Start Session
            </button>
          )}
        </div>

      </div>


      {/* MAIN DASHBOARD */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">


        {/* QR CODE */}

        <div className="card lg:col-span-1">

          <div className="flex items-center justify-between mb-4">

            <h3 className="font-semibold text-slate-800">
              Dynamic QR Code
            </h3>

            {activeSession && (

              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">

                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />

                Live

              </span>

            )}

          </div>


          <QRDisplay
            sessionId={
              activeSession?._id
            }
            active={
              !!activeSession
            }
          />

        </div>


        {/* LIVE ATTENDANCE */}

        <div className="lg:col-span-2 space-y-4">


          <div className="card">

            <h3 className="font-semibold text-slate-800 mb-4">

              Live Attendance

            </h3>


            <div className="grid grid-cols-4 gap-3">

              {[
                {
                  label: 'Total',
                  value: stats.total,
                  color:
                    'bg-slate-100 text-slate-700',
                  border:
                    'border-slate-200',
                },

                {
                  label: 'Present',
                  value: stats.present,
                  color:
                    'bg-emerald-50 text-emerald-700',
                  border:
                    'border-emerald-200',
                },

                {
                  label: 'Absent',
                  value: stats.absent,
                  color:
                    'bg-red-50 text-red-700',
                  border:
                    'border-red-200',
                },

                {
                  label: 'Pending',
                  value: stats.pending,
                  color:
                    'bg-amber-50 text-amber-700',
                  border:
                    'border-amber-200',
                },

              ].map((item) => (

                <div
                  key={item.label}
                  className={`rounded-xl border ${item.border} ${item.color} p-3 text-center`}
                >

                  <p className="text-2xl font-display font-bold">

                    {item.value}

                  </p>

                  <p className="text-xs font-medium mt-0.5 opacity-70">

                    {item.label}

                  </p>

                </div>

              ))}

            </div>


            {/* ATTENDANCE RATE */}

            {activeSession &&
              total > 0 && (

              <div className="mt-5">

                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">

                  <span>
                    Attendance Rate
                  </span>

                  <span className="font-bold text-slate-700">

                    {attendanceRate}%

                  </span>

                </div>


                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">

                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                    style={{
                      width:
                        `${attendanceRate}%`,
                    }}
                  />

                </div>

              </div>

            )}

          </div>


          {/* SESSION STATUS */}

          {activeSession && (

            <div className="card border-l-4 border-l-primary-600">

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-primary-600">

                  <HiOutlineQueueList
                    size={20}
                  />

                </div>


                <div>

                  <p className="font-semibold text-slate-800">

                    Session Active

                  </p>

                  <p className="text-xs text-slate-400">

                    {sessionLabel}

                  </p>

                </div>


                <div className="ml-auto text-right">

                  <p className="text-xs text-slate-400">

                    Status

                  </p>

                  <p className="font-mono font-bold text-emerald-600 text-sm">

                    LIVE

                  </p>

                </div>

              </div>

            </div>

          )}


          {/* NO SESSION */}

          {!loadingSession &&
            !activeSession && (

            <div className="card border-l-4 border-l-slate-300">

              <p className="text-slate-500 text-sm">

                No active session.
                Click "Start Session" to begin attendance.

              </p>

            </div>

          )}

        </div>

      </div>


      {/* VERIFICATION QUEUE */}

      {(activeSession || verifyOpen) && (

        <div className="card animate-fade-in">

          <div className="flex items-center justify-between mb-4">

            <div className="flex items-center gap-2.5">
              <h3 className="font-semibold text-slate-800">
                Autonomous Biometric Verification Feed
              </h3>

              {queue.filter((q) => q.status === 'pending').length > 0 ? (
                <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                  {queue.filter((q) => q.status === 'pending').length} awaiting student biometric
                </span>
              ) : queue.length > 0 ? (
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2 py-0.5 rounded-full">
                  All biometrics confirmed
                </span>
              ) : null}
            </div>

            {queue.length > 0 && (
              <button
                onClick={handleApproveAll}
                className="btn-secondary text-xs flex items-center gap-1.5 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              >
                <HiOutlineCheckCircle size={14} className="text-emerald-600" />
                Approve All Remaining
              </button>
            )}
          </div>


          <VerificationTable
            data={queue}
            onApprove={handleApprove}
            onReject={handleReject}
          />

        </div>

      )}


      {/* ================================= */}
      {/* START SESSION MODAL */}
      {/* ================================= */}

      {showStartModal && (

        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">

          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">


            {/* MODAL HEADER */}

            <div className="flex items-center justify-between mb-6">

              <div>

                <h2 className="text-xl font-bold text-slate-800">

                  Start Attendance Session

                </h2>

                <p className="text-sm text-slate-500 mt-1">

                  Select a subject to begin the class.

                </p>

              </div>


              <button
                onClick={() =>
                  setShowStartModal(false)
                }
                className="text-slate-400 hover:text-slate-700"
              >

                <HiOutlineXMark size={24} />

              </button>

            </div>


            {/* SUBJECT SELECT */}

            <div className="mb-6">

              <label className="block text-sm font-semibold text-slate-700 mb-2">

                Select Subject

              </label>


              <div className="relative">

                <HiOutlineBookOpen
                  className="absolute left-3 top-3 text-slate-400"
                  size={18}
                />


                <select
                  value={selectedSubject}
                  onChange={(e) =>
                    setSelectedSubject(
                      e.target.value
                    )
                  }
                  className="w-full border border-slate-300 rounded-xl px-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >

                  <option value="">

                    Choose Subject

                  </option>


                  {subjects.map(
                    (subject) => (

                      <option
                        key={subject._id}
                        value={subject._id}
                      >

                        {subject.subjectName}
                        {' ('}
                        {subject.subjectCode}
                        {')'}

                      </option>

                    )
                  )}

                </select>

              </div>


              {subjects.length === 0 && (

                <p className="text-xs text-red-500 mt-2">

                  No subjects assigned to this teacher.

                </p>

              )}

            </div>


            {/* SESSION INFO */}

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">

              <p className="text-sm font-semibold text-blue-800">

                Demo Session Configuration

              </p>

              <ul className="text-xs text-blue-700 mt-2 space-y-1">

                <li>
                  • Class duration: 30 minutes
                </li>

                <li>
                  • Attendance window: First 5 minutes
                </li>

                <li>
                  • QR rotation: Every 60 seconds
                </li>

                <li>
                  • Verification: Risk-based selection
                </li>

              </ul>

            </div>


            {/* BUTTONS */}

            <div className="flex gap-3 justify-end">

              <button
                onClick={() =>
                  setShowStartModal(false)
                }
                className="btn-secondary"
                disabled={startingSession}
              >

                Cancel

              </button>


              <button
                onClick={handleStartSession}
                disabled={
                  startingSession ||
                  !selectedSubject
                }
                className="btn-primary disabled:opacity-50"
              >

                <HiOutlinePlay size={16} />

                {startingSession
                  ? 'Starting...'
                  : 'Start Session'
                }

              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  )
}
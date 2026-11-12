import { useState, useEffect } from 'react'
import { sessionsAPI, subjectsAPI } from '../api/axios'
import { useAuth } from '../context/AuthContext'
import SessionCard from '../components/SessionCard'
import {
  HiOutlinePlus,
  HiOutlineXMark,
} from 'react-icons/hi2'
import { getStatusConfig, formatTime } from '../utils/risk'

export default function AttendanceSessionsPage() {
  const { user } = useAuth()

  const [sessions, setSessions] = useState([])
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [starting, setStarting] = useState(false)

  const [formData, setFormData] = useState({
    subjectId: '',
    sessionStartTime: '',
    sessionEndTime: '',
  })

  // Load sessions and subjects
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)

      const [sessionsRes, subjectsRes] = await Promise.all([
        sessionsAPI.list(),
        subjectsAPI.list(),
      ])

      // Sessions
      setSessions(sessionsRes.data.sessions || [])

      // All subjects
      const allSubjects = subjectsRes.data.subjects || []

      console.log('Logged In User:', user)
      console.log('All Subjects:', allSubjects)

      // If teacher, show only subjects assigned to that teacher
      if (user?.role === 'teacher') {
        const loggedInTeacherId = String(user.id || user._id || '')

        const teacherSubjects = allSubjects.filter((subject) => {
          const subjectTeacherId =
            subject.teacherId?._id ||
            subject.teacherId

          return String(subjectTeacherId) === loggedInTeacherId
        })

        console.log('Logged In Teacher ID:', loggedInTeacherId)
        console.log('Teacher Subjects:', teacherSubjects)

        setSubjects(teacherSubjects)
      } else {
        // Admin can see all subjects
        setSubjects(allSubjects)
      }

    } catch (error) {
      console.error('Error loading sessions or subjects:', error)
      alert(
        error.response?.data?.message ||
        'Failed to load sessions or subjects'
      )
    } finally {
      setLoading(false)
    }
  }


  // End Session
  const handleEnd = async (id) => {
    try {
      await sessionsAPI.end(id)

      alert('Session ended successfully')

      await fetchData()

    } catch (error) {
      console.error(error)

      alert(
        error.response?.data?.message ||
        'Failed to end session'
      )
    }
  }


  // Start New Session
  const handleStartSession = async (e) => {
    e.preventDefault()

    if (!formData.subjectId) {
      alert('Please select a subject')
      return
    }

    if (!formData.sessionStartTime) {
      alert('Please select session start time')
      return
    }

    if (!formData.sessionEndTime) {
      alert('Please select session end time')
      return
    }

    const startTime = new Date(formData.sessionStartTime)
    const endTime = new Date(formData.sessionEndTime)

    if (endTime <= startTime) {
      alert('End time must be after start time')
      return
    }

    try {
      setStarting(true)

      const teacherId =
        user?.id ||
        user?._id

      await sessionsAPI.start({
        subjectId: formData.subjectId,
        teacherId: teacherId,
        sessionStartTime: startTime.toISOString(),
        sessionEndTime: endTime.toISOString(),
      })

      alert('Attendance session started successfully!')

      setShowModal(false)

      setFormData({
        subjectId: '',
        sessionStartTime: '',
        sessionEndTime: '',
      })

      await fetchData()

    } catch (error) {
      console.error('Start Session Error:', error)

      alert(
        error.response?.data?.message ||
        'Failed to start attendance session'
      )

    } finally {
      setStarting(false)
    }
  }


  // Map backend session to frontend format
  const mapSession = (s) => ({
    id: s._id,

    subject:
      s.subjectId?.subjectName ||
      'Unknown Subject',

    code:
      s.subjectId?.subjectCode ||
      '',

    faculty:
      s.teacherId?.name ||
      'Unknown Teacher',

    startTime:
      s.sessionStartTime,

    endTime:
      s.sessionEndTime,

    status:
      s.status,

    totalStudents:
      s.totalStudents || 0,

    present:
      s.totalPresent || 0,

    attendancePct:
      s.totalStudents > 0
        ? Math.round(
            (s.totalPresent / s.totalStudents) * 100
          )
        : 0,
  })


  const activeSessions = sessions
    .filter((s) => s.status === 'active')
    .map(mapSession)


  const allSessions = sessions.map(mapSession)


  return (
    <div className="space-y-6">

      {/* PAGE HEADER */}

      <div className="flex items-start justify-between">

        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            Attendance Sessions
          </h1>

          <p className="text-slate-500 text-sm mt-1">
            Manage attendance sessions and QR attendance
          </p>
        </div>


        {(user?.role === 'teacher' ||
          user?.role === 'admin') && (

          <button
            onClick={() => setShowModal(true)}
            className="btn-primary"
          >
            <HiOutlinePlus size={16} />
            New Session
          </button>

        )}

      </div>


      {/* LOADING */}

      {loading ? (

        <div className="flex items-center justify-center py-16 text-slate-400 text-sm">
          Loading sessions...
        </div>

      ) : (

        <>

          {/* ACTIVE SESSIONS */}

          {activeSessions.length > 0 && (

            <div>

              <div className="flex items-center gap-2 mb-3">

                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />

                <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                  Active Now
                </h2>

              </div>


              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                {activeSessions.map((session) => (

                  <SessionCard
                    key={session.id}
                    session={session}
                    onEnd={handleEnd}
                  />

                ))}

              </div>

            </div>

          )}


          {/* ALL SESSIONS */}

          <div className="card">

            <h3 className="font-semibold text-slate-800 mb-4">
              All Sessions
            </h3>


            <div className="overflow-x-auto">

              <table className="w-full">

                <thead>

                  <tr className="border-b border-slate-100">

                    <th className="table-th">
                      Subject
                    </th>

                    <th className="table-th">
                      Faculty
                    </th>

                    <th className="table-th">
                      Start Time
                    </th>

                    <th className="table-th">
                      End Time
                    </th>

                    <th className="table-th">
                      Status
                    </th>

                    <th className="table-th text-center">
                      Attendance %
                    </th>

                    <th className="table-th text-right">
                      Actions
                    </th>

                  </tr>

                </thead>


                <tbody className="divide-y divide-slate-50">

                  {allSessions.map((session) => {

                    const statusConfig =
                      getStatusConfig(session.status)

                    return (

                      <tr
                        key={session.id}
                        className="hover:bg-slate-50/60 transition-colors"
                      >

                        {/* SUBJECT */}

                        <td className="table-td">

                          <p className="font-medium text-slate-800">
                            {session.subject}
                          </p>

                          <p className="text-xs text-slate-400">
                            {session.code}
                          </p>

                        </td>


                        {/* FACULTY */}

                        <td className="table-td text-slate-600 text-sm">
                          {session.faculty}
                        </td>


                        {/* START */}

                        <td className="table-td text-xs text-slate-500">
                          {formatTime(session.startTime)}
                        </td>


                        {/* END */}

                        <td className="table-td text-xs text-slate-500">

                          {session.endTime
                            ? formatTime(session.endTime)
                            : '—'}

                        </td>


                        {/* STATUS */}

                        <td className="table-td">

                          <span
                            className={`
                              text-xs
                              font-semibold
                              px-2
                              py-0.5
                              rounded-full
                              ${statusConfig.bg}
                              ${statusConfig.color}
                            `}
                          >
                            {statusConfig.label}
                          </span>

                        </td>


                        {/* ATTENDANCE */}

                        <td className="table-td text-center">

                          <span
                            className={`
                              font-bold
                              font-mono
                              text-sm
                              ${
                                session.attendancePct >= 75
                                  ? 'text-emerald-600'
                                  : session.attendancePct >= 60
                                  ? 'text-amber-600'
                                  : 'text-red-600'
                              }
                            `}
                          >
                            {session.attendancePct}%
                          </span>

                        </td>


                        {/* ACTIONS */}

                        <td className="table-td text-right">

                          {session.status === 'active' && (

                            <button
                              onClick={() =>
                                handleEnd(session.id)
                              }
                              className="text-xs text-red-500 hover:underline font-medium"
                            >
                              End
                            </button>

                          )}

                        </td>

                      </tr>

                    )

                  })}


                  {/* EMPTY */}

                  {allSessions.length === 0 && (

                    <tr>

                      <td
                        colSpan={7}
                        className="table-td text-center text-slate-400 py-10"
                      >
                        No sessions found
                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>

          </div>

        </>

      )}


      {/* ========================================= */}
      {/* START SESSION MODAL */}
      {/* ========================================= */}

      {showModal && (

        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">

          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">


            {/* CLOSE */}

            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors"
            >
              <HiOutlineXMark size={22} />
            </button>


            {/* TITLE */}

            <div className="mb-6">

              <h2 className="text-xl font-bold text-slate-900">
                Start Attendance Session
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Select a subject and start QR-based attendance.
              </p>

            </div>


            <form
              onSubmit={handleStartSession}
              className="space-y-5"
            >


              {/* SUBJECT SELECT */}

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Subject
                </label>


                <select
                  value={formData.subjectId}

                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      subjectId: e.target.value,
                    })
                  }

                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >

                  <option value="">
                    Select Subject
                  </option>


                  {subjects.map((subject) => (

                    <option
                      key={subject._id}
                      value={subject._id}
                    >

                      {subject.subjectName}
                      {' '}
                      ({subject.subjectCode})

                    </option>

                  ))}

                </select>


                {/* NO SUBJECT */}

                {subjects.length === 0 && (

                  <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200">

                    <p className="text-xs text-red-600 font-medium">
                      No subjects assigned to this teacher.
                    </p>

                    <p className="text-xs text-red-500 mt-1">
                      Please check the subject teacher assignment.
                    </p>

                  </div>

                )}

              </div>


              {/* START TIME */}

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Session Start Time
                </label>

                <input
                  type="datetime-local"

                  value={formData.sessionStartTime}

                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sessionStartTime: e.target.value,
                    })
                  }

                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />

              </div>


              {/* END TIME */}

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Session End Time
                </label>

                <input
                  type="datetime-local"

                  value={formData.sessionEndTime}

                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sessionEndTime: e.target.value,
                    })
                  }

                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />

              </div>


              {/* START BUTTON */}

              <button
                type="submit"

                disabled={
                  starting ||
                  subjects.length === 0
                }

                className="btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >

                {starting
                  ? 'Starting Session...'
                  : 'Start Attendance Session'}

              </button>


            </form>

          </div>

        </div>

      )}

    </div>
  )
}
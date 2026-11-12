import { useState, useEffect, useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { sessionsAPI } from '../api/axios'
import { HiOutlineQrCode, HiOutlineArrowPath } from 'react-icons/hi2'

export default function QRDisplay({ sessionId, active = false }) {
  const [qrData, setQrData] = useState(null)
  const [timeLeft, setTimeLeft] = useState(60)
  const [refreshing, setRefreshing] = useState(false)

  const intervalRef = useRef(null)

  // Fetch current QR data from backend
  const fetchQr = async () => {
    if (!sessionId || !active) return

    try {
      const res = await sessionsAPI.qr(sessionId)

      setQrData(res.data)

      // Reset timer when QR updates
      setTimeLeft(60)
    } catch (error) {
      console.error('QR Error:', error)

      setQrData(null)
    }
  }

  useEffect(() => {
    if (!active || !sessionId) return

    // Fetch QR immediately
    fetchQr()

    // Countdown every second
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {

        if (prev <= 1) {
          fetchQr()
          return 60
        }

        return prev - 1
      })
    }, 1000)

    return () => {
      clearInterval(intervalRef.current)
    }

  }, [active, sessionId])

  // Manual refresh
  const handleRefresh = async () => {
    setRefreshing(true)

    await fetchQr()

    setTimeout(() => {
      setRefreshing(false)
    }, 400)
  }

  // QR Countdown Circle
  const pct = (timeLeft / 60) * 100

  const circumference = 2 * Math.PI * 20

  const offset =
    circumference -
    (pct / 100) * circumference


  // QR Content
  // This is the actual data encoded inside the QR code
  const qrValue = qrData
    ? JSON.stringify({
        sessionId: qrData.sessionId,
        qrVersion: qrData.qrVersion,
      })
    : ''

  // If no session active
  if (!active) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-400">

        <HiOutlineQrCode
          size={48}
          className="mb-3 text-slate-300"
        />

        <p className="text-sm font-medium">
          Start a session to generate QR
        </p>

      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-5">

      {/* REAL QR CODE */}

      <div className="relative">

        <div
          className={`
            w-60 h-60
            bg-white
            rounded-2xl
            border-2
            border-slate-200
            flex
            items-center
            justify-center
            p-4
            shadow-sm
            transition-all
            duration-300

            ${
              refreshing
                ? 'opacity-50 scale-95'
                : 'opacity-100 scale-100'
            }
          `}
        >

          {qrData ? (

            <QRCodeSVG
              value={qrValue}
              size={220}
              level="H"
              includeMargin={true}
              bgColor="#FFFFFF"
              fgColor="#0F172A"
            />

          ) : (

            <div className="flex flex-col items-center text-slate-400">

              <HiOutlineQrCode size={50} />

              <p className="text-xs mt-2">
                Generating QR...
              </p>

            </div>

          )}

        </div>

      </div>


      {/* QR INFORMATION */}

      {qrData && (

        <div className="text-center">

          <p className="text-xs text-slate-400">
            Dynamic Attendance QR
          </p>

          <p className="text-xs text-primary-600 font-semibold mt-1">
            QR Version {qrData.qrVersion}
          </p>

          <p className="text-[10px] text-slate-400 mt-1">
            Scan using IntelliAttend Student Scanner
          </p>

        </div>

      )}


      {/* QR NOT AVAILABLE */}

      {!qrData && active && (

        <div
          className="
            text-center
            text-xs
            text-amber-600
            bg-amber-50
            border
            border-amber-200
            px-3
            py-2
            rounded-lg
          "
        >

          Attendance window may be closed
          or not yet open

        </div>

      )}


      {/* TIMER + REFRESH */}

      <div className="flex items-center gap-4">

        {/* Countdown Circle */}

        <div className="relative w-12 h-12">

          <svg
            className="w-full h-full -rotate-90"
            viewBox="0 0 50 50"
          >

            <circle
              cx="25"
              cy="25"
              r="20"
              fill="none"
              stroke="#F1F5F9"
              strokeWidth="4"
            />

            <circle
              cx="25"
              cy="25"
              r="20"
              fill="none"

              stroke={
                timeLeft > 20
                  ? '#10B981'
                  : '#EF4444'
              }

              strokeWidth="4"

              strokeDasharray={circumference}

              strokeDashoffset={offset}

              style={{
                transition:
                  'stroke-dashoffset 1s linear'
              }}

              strokeLinecap="round"
            />

          </svg>


          <span
            className={`
              absolute
              inset-0
              flex
              items-center
              justify-center
              text-xs
              font-bold
              font-mono

              ${
                timeLeft > 20
                  ? 'text-emerald-600'
                  : 'text-red-500'
              }
            `}
          >
            {timeLeft}
          </span>

        </div>


        {/* QR Status */}

        <div>

          <p className="text-sm font-medium text-slate-700">
            Auto-refreshing
          </p>

          <p className="text-xs text-slate-400">
            QR rotates every 60 seconds
          </p>

        </div>


        {/* Refresh Button */}

        <button
          onClick={handleRefresh}
          className="btn-secondary ml-2"
        >

          <HiOutlineArrowPath
            size={14}
            className={
              refreshing
                ? 'animate-spin'
                : ''
            }
          />

          Refresh

        </button>

      </div>


      {/* Security Message */}

      <div
        className="
          text-center
          text-[11px]
          text-slate-400
          max-w-xs
        "
      >

        Each QR code contains a unique session ID
        and rotating QR version.

      </div>

    </div>
  )
}
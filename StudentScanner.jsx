import { useState } from 'react'
import { Scanner } from '@yudiel/react-qr-scanner'
import { useAuth } from '../context/AuthContext'
import { attendanceAPI } from '../api/axios'
import BiometricVerificationModal from '../components/BiometricVerificationModal'
import {
  HiOutlineQrCode,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineVideoCamera,
  HiOutlineExclamationTriangle,
  HiOutlineShieldCheck,
  HiOutlineArrowPath,
  HiOutlineLockClosed,
  HiOutlineFingerPrint,
} from 'react-icons/hi2'

export default function StudentScanner() {
  const { user } = useAuth()

  const [scanning, setScanning] = useState(false)
  const [loading, setLoading] = useState(false)
  const [cameraError, setCameraError] = useState(null)
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(null)
  const [showBiometricModal, setShowBiometricModal] = useState(false)
  const [pendingBiometric, setPendingBiometric] = useState(null)

  const isSecure =
    typeof window !== 'undefined' &&
    (window.isSecureContext ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1')

  // Process decoded QR data
  const processRawValue = async (rawValue) => {
    try {
      setLoading(true)
      setScanning(false)
      setCameraError(null)

      // Provide instant haptic feedback on mobile if supported
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([100, 50, 100])
      }

      if (!rawValue) {
        setSuccess(false)
        setMessage('Invalid or unreadable QR code')
        return
      }

      let qrData
      try {
        qrData = JSON.parse(rawValue)
      } catch {
        setSuccess(false)
        setMessage('Invalid IntelliAttend QR Code format')
        return
      }

      const { sessionId, qrVersion } = qrData

      if (!sessionId || !qrVersion) {
        setSuccess(false)
        setMessage('Invalid QR attendance data: missing session or version')
        return
      }

      const deviceId = `${navigator.userAgent}-${window.screen.width}x${window.screen.height}`
      const browserFingerprint = `${navigator.platform}-${navigator.language}-${navigator.userAgent}`

      const res = await attendanceAPI.mark({
        sessionId,
        studentId: user?.id || user?._id,
        deviceId,
        browserFingerprint,
        qrVersion,
      })

      if (res.data.success) {
        // If selected by AI multi-factor audit, trigger on-device biometric check immediately!
        if (res.data.selectedForVerification || res.data.requiresBiometric) {
          setPendingBiometric({
            recordId: res.data.attendanceRecordId || res.data.attendance?._id,
            riskScore: res.data.riskScore,
            reason: res.data.reason || 'AI Audit Selection (On-Device Biometric Required)',
          })
          setShowBiometricModal(true)
          return
        }

        setSuccess(true)
        setMessage(`Attendance marked successfully! Risk Score: ${res.data.riskScore}`)
      }
    } catch (error) {
      console.error('Attendance mark error:', error)
      setSuccess(false)
      setMessage(error.response?.data?.message || 'Failed to mark attendance. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleBiometricSuccess = (data) => {
    setShowBiometricModal(false)
    setPendingBiometric(null)
    setSuccess(true)
    setMessage(data?.message || 'Biometric identity confirmed! Your attendance has been officially marked as Present.')
  }

  const handleBiometricFailure = (data) => {
    setShowBiometricModal(false)
    setPendingBiometric(null)
    setSuccess(false)
    setMessage(data?.message || 'Biometric verification failed or expired. Marked absent with 7-day penalty applied.')
  }

  // Handle Live Camera Scan Result from @yudiel/react-qr-scanner
  const handleLiveScan = (result) => {
    if (!result || loading) return
    const rawValue = result[0]?.rawValue
    if (rawValue) {
      processRawValue(rawValue)
    }
  }

  // Handle Scanner Errors gracefully
  const handleCameraError = (error) => {
    console.error('Scanner error:', error)
    if (error?.kind === 'permission-denied') {
      setCameraError(
        'Camera permission was denied. Please tap the lock/settings icon in your browser address bar and allow camera access.'
      )
    } else if (error?.kind === 'insecure-context' || !isSecure) {
      setCameraError(
        'Mobile browsers require an HTTPS secure connection to access the live camera stream.'
      )
    } else if (error?.kind === 'no-camera') {
      setCameraError('No camera found on this device.')
    } else {
      setCameraError(
        error?.message || 'Could not start camera stream. Please verify permissions and try again.'
      )
    }
  }

  const startScanner = () => {
    setSuccess(null)
    setMessage('')
    setCameraError(null)
    setScanning(true)
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">Scan Attendance</h1>
        <p className="text-slate-500 text-sm mt-1">
          Scan the dynamic rotating QR code displayed by your instructor to record your presence
        </p>
      </div>

      {/* Main Card */}
      <div className="card">
        {/* State 1: Idle - Ready to Scan */}
        {!scanning && success === null && !loading && (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-24 h-24 rounded-3xl bg-primary-50 flex items-center justify-center text-primary-600 mb-5 shadow-inner border border-primary-100">
              <HiOutlineQrCode size={52} />
            </div>

            <h2 className="font-display font-bold text-slate-900 text-xl">
              Live Real-Time Scanner
            </h2>
            <p className="text-sm text-slate-500 mt-2 max-w-sm">
              Point your camera at the teacher's screen to automatically detect and mark your attendance in real-time.
            </p>

            {/* Mobile Camera Setup Helper */}
            {!isSecure && (
              <div className="mt-5 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-left w-full text-xs text-amber-900 flex items-start gap-3">
                <HiOutlineLockClosed className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1.5 leading-relaxed">
                  <p className="font-bold text-amber-950">First-time Mobile Camera Setup</p>
                  <p className="text-amber-800">
                    To allow your mobile Chrome browser to use the camera over Wi-Fi:
                  </p>
                  <ol className="list-decimal ml-4 space-y-1 text-amber-900 font-medium">
                    <li>In Chrome, open: <code className="bg-amber-100 px-1 py-0.5 rounded text-[11px] font-mono">chrome://flags/#unsafely-treat-insecure-origin-as-secure</code></li>
                    <li>Add <code className="bg-amber-100 px-1 py-0.5 rounded text-[11px] font-mono">http://{window.location.host}</code> and set to <strong>Enabled</strong>.</li>
                    <li>Tap <strong>Relaunch</strong> at the bottom.</li>
                  </ol>
                </div>
              </div>
            )}

            {/* Primary Action Button */}
            <div className="mt-6 w-full max-w-xs">
              <button
                onClick={startScanner}
                className="btn-primary w-full flex items-center justify-center gap-2.5 py-3.5 text-base font-semibold shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30"
              >
                <HiOutlineVideoCamera size={22} />
                Open Live Camera Scanner
              </button>
            </div>
          </div>
        )}

        {/* State 2: Active Live Camera Scanning */}
        {scanning && (
          <div className="space-y-4 animate-in fade-in">
            {cameraError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs flex items-start gap-3">
                <HiOutlineExclamationTriangle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
                <div className="space-y-1.5">
                  <p className="font-bold text-red-800">Camera Access Notice</p>
                  <p className="leading-relaxed">{cameraError}</p>
                  {!isSecure && (
                    <p className="text-slate-600 mt-1">
                      Tip: Follow the 3-step Chrome flag setup above or use a secure origin.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Viewfinder Window */}
            <div className="relative rounded-3xl overflow-hidden border-4 border-primary-500/20 bg-slate-950 aspect-square flex items-center justify-center shadow-xl">
              <Scanner
                onScan={handleLiveScan}
                onError={handleCameraError}
                constraints={{ facingMode: { ideal: 'environment' } }}
                components={{
                  finder: true,
                  torch: true,
                  zoom: true,
                }}
                styles={{
                  container: { width: '100%', height: '100%' },
                  video: { objectFit: 'cover' },
                }}
              />

              {/* Laser Scanning Indicator */}
              <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 pointer-events-none">
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-primary-400 to-transparent shadow-[0_0_12px_rgba(99,102,241,0.8)] animate-pulse" />
              </div>
            </div>

            <div className="text-center space-y-1">
              <p className="text-sm font-semibold text-slate-800">
                Scanning for Dynamic Attendance QR...
              </p>
              <p className="text-xs text-slate-400">
                Point your camera directly at the QR code projected on the teacher's screen
              </p>
            </div>

            <div className="flex justify-center pt-2">
              <button
                onClick={() => setScanning(false)}
                className="btn-secondary text-xs px-6 py-2.5"
              >
                Close Scanner
              </button>
            </div>
          </div>
        )}

        {/* State 3: Loading / Verifying */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in">
            <div className="relative">
              <div className="w-14 h-14 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin" />
              <HiOutlineShieldCheck
                size={22}
                className="absolute inset-0 m-auto text-primary-600"
              />
            </div>
            <p className="text-base font-semibold text-slate-800 mt-5">
              Verifying Attendance...
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Analyzing device telemetry and AI anti-proxy credentials
            </p>
          </div>
        )}

        {/* State 4: Success */}
        {!loading && success === true && (
          <div className="flex flex-col items-center justify-center py-10 text-center animate-in fade-in">
            <div className="w-20 h-20 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 shadow-sm">
              <HiOutlineCheckCircle size={52} />
            </div>
            <h2 className="font-display font-bold text-2xl text-emerald-700">
              Attendance Recorded!
            </h2>
            <p className="text-sm text-slate-600 mt-2 max-w-md leading-relaxed">
              {message}
            </p>
            <div className="mt-8 flex gap-3">
              <button
                onClick={startScanner}
                className="btn-primary flex items-center gap-2 text-sm shadow-md"
              >
                <HiOutlineVideoCamera size={18} />
                Scan Another QR
              </button>
            </div>
          </div>
        )}

        {/* State 5: Failure */}
        {!loading && success === false && (
          <div className="flex flex-col items-center justify-center py-10 text-center animate-in fade-in">
            <div className="w-20 h-20 rounded-3xl bg-red-100 text-red-600 flex items-center justify-center mb-4 shadow-sm">
              <HiOutlineXCircle size={52} />
            </div>
            <h2 className="font-display font-bold text-2xl text-red-700">
              Attendance Failed
            </h2>
            <p className="text-sm text-slate-600 mt-2 max-w-md leading-relaxed">
              {message}
            </p>
            <div className="mt-8 flex gap-3">
              <button
                onClick={startScanner}
                className="btn-primary flex items-center gap-2 text-sm shadow-md"
              >
                <HiOutlineArrowPath size={18} />
                Try Scanning Again
              </button>
              <button
                onClick={() => {
                  setSuccess(null)
                  setMessage('')
                }}
                className="btn-secondary text-sm"
              >
                Back
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Security & Attendance Policies */}
      <div className="card bg-slate-50/80 border border-slate-200/80">
        <h3 className="font-semibold text-slate-800 text-sm mb-3 flex items-center gap-2">
          <HiOutlineShieldCheck className="text-primary-600" size={18} />
          Anti-Proxy Attendance Guidelines
        </h3>
        <ul className="space-y-2 text-xs text-slate-600">
          <li className="flex items-start gap-2">
            <span className="text-primary-600 font-bold">•</span>
            <span><strong>Dynamic QR Security:</strong> QR codes rotate automatically every 60 seconds. Screenshots or forwarded codes are instantly invalidated.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-600 font-bold">•</span>
            <span><strong>One Scan Per Device:</strong> Each physical device is permitted to mark attendance for only one student account.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-600 font-bold">•</span>
            <span><strong>Autonomous Biometrics:</strong> Audited students verify on-device using Fingerprint or Face ID within 90 seconds. Unverified or proxy attempts trigger a <strong>7-day penalty lock</strong>.</span>
          </li>
        </ul>
      </div>

      {/* Biometric Verification Modal */}
      {showBiometricModal && pendingBiometric && (
        <BiometricVerificationModal
          recordId={pendingBiometric.recordId}
          studentName={user?.name || 'Student'}
          riskScore={pendingBiometric.riskScore}
          reason={pendingBiometric.reason}
          onSuccess={handleBiometricSuccess}
          onFailure={handleBiometricFailure}
        />
      )}
    </div>
  )
}
import { useState, useEffect } from 'react'
import { Mail, Shield, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { sendOTPToEmail, verifyOTP } from '../../services/verificationService'

interface Props {
  email: string
  onVerified: () => void
  onClose: () => void
}

const EmailVerificationModal = ({ email, onVerified, onClose }: Props) => {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [timeLeft, setTimeLeft] = useState(600)
  const [canResend, setCanResend] = useState(false)

  useEffect(() => {
    sendOTP()
  }, [])

  useEffect(() => {
    if (timeLeft > 0) {
      const t = setTimeout(() => setTimeLeft(t => t - 1), 1000)
      return () => clearTimeout(t)
    } else {
      setCanResend(true)
    }
  }, [timeLeft])

  const sendOTP = async () => {
    setIsLoading(true)
    try {
      const result = await sendOTPToEmail(email)
      if (result.success) {
        toast.success(`Verification code sent to ${email}`)
        setTimeLeft(600)
        setCanResend(false)
      } else {
        toast.error(result.message || 'Failed to send verification code')
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to send verification email')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpChange = (i: number, val: string) => {
    if (val.length > 1) return
    const newOtp = [...otp]
    newOtp[i] = val
    setOtp(newOtp)

    if (val && i < 5) {
      document.getElementById(`otp-${i + 1}`)?.focus()
    }

    if (newOtp.every(x => x !== '')) {
      handleVerify(newOtp.join(''))
    }
  }

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) {
      document.getElementById(`otp-${i - 1}`)?.focus()
    }
  }

  const handleVerify = async (code: string) => {
    setIsVerifying(true)
    try {
      const result = await verifyOTP(email, code)
      if (result.success) {
        toast.success('Email verified!')
        onVerified()
      } else {
        toast.error(result.message || 'Invalid or expired code')
        setOtp(['', '', '', '', '', ''])
      }
    } catch (e: any) {
      toast.error(e.message || 'Verification failed')
      setOtp(['', '', '', '', '', ''])
    } finally {
      setIsVerifying(false)
    }
  }

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <Mail size={32} />
            </div>
          </div>
          <h2 className="text-xl font-bold text-center">Verify Your Email</h2>
          <p className="text-center text-blue-100">We’ve sent a 6-digit code to</p>
          <p className="text-center font-medium">{email}</p>
        </div>

        {/* Content */}
        <div className="p-6">
          <label className="block text-center text-sm font-medium mb-4">
            Enter verification code
          </label>

          <div className="flex justify-center gap-2 mb-4">
            {otp.map((d, i) => (
              <input
                key={i}
                id={`otp-${i}`}
                type="text"
                maxLength={1}
                value={d}
                onChange={e => handleOtpChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                disabled={isVerifying}
                className="w-12 h-12 text-center text-xl font-bold border-2 rounded-lg focus:border-blue-500"
              />
            ))}
          </div>

          {timeLeft > 0 ? (
            <p className="text-center text-sm text-gray-600 mb-4">
              Code expires in <span className="font-mono font-bold text-blue-600">{formatTime(timeLeft)}</span>
            </p>
          ) : (
            <p className="text-center text-sm text-red-600 mb-4">Verification code has expired</p>
          )}

          <div className="text-center mb-4">
            <button
              onClick={sendOTP}
              disabled={!canResend || isLoading}
              className={`text-sm font-medium ${canResend && !isLoading ? 'text-blue-600 hover:text-blue-700' : 'text-gray-400'}`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <RefreshCw size={16} className="animate-spin mr-2" /> Sending...
                </span>
              ) : (
                `Didn't receive the code? Resend`
              )}
            </button>
          </div>

          <button
            onClick={() => handleVerify(otp.join(''))}
            disabled={otp.some(x => x === '') || isVerifying}
            className={`w-full py-3 rounded-lg font-medium ${otp.some(x => x === '') || isVerifying ? 'bg-gray-300 text-gray-500' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
          >
            {isVerifying ? (
              <span className="flex items-center justify-center">
                <RefreshCw size={20} className="animate-spin mr-2" /> Verifying...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <Shield size={20} className="mr-2" /> Verify Email
              </span>
            )}
          </button>

          <button
            onClick={onClose}
            className="w-full mt-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default EmailVerificationModal

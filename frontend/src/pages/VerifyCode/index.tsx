import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, ArrowRight, RefreshCw } from 'lucide-react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { verifyCode, sendVerificationCode } from '@/services/api'

export function VerifyCode() {
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email || ''

  const [code, setCode] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [timeLeft, setTimeLeft] = useState(600) // 10 minutes in seconds

  useEffect(() => {
    if (!email) {
      navigate('/signup')
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [email, navigate])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsVerifying(true)
    
    try {
      await verifyCode(email, code)
      // Navigate to password setup page with email and code
      navigate('/setup-password', { state: { email, code } })
    } catch (err: any) {
      setError(err.message || 'Invalid verification code')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResendCode = async () => {
    setError('')
    setSuccess('')
    setIsResending(true)
    
    try {
      await sendVerificationCode(email)
      setSuccess('New verification code sent to your email')
      setTimeLeft(600) // Reset timer
      setCode('') // Clear code input
    } catch (err: any) {
      setError(err.message || 'Failed to resend code')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Verify Your Email</CardTitle>
          <CardDescription className="text-lg">
            Enter the 6-digit code sent to
          </CardDescription>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Mail className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-blue-600">{email}</span>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
                {success}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="code" className="text-base">
                Verification Code
              </Label>
              <Input
                id="code"
                type="text"
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                maxLength={6}
                className="h-12 text-center text-2xl tracking-widest font-semibold"
              />
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Code expires in: {formatTime(timeLeft)}</span>
                {timeLeft === 0 && (
                  <span className="text-red-600 font-medium">Expired</span>
                )}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base"
              disabled={isVerifying || code.length !== 6 || timeLeft === 0}
            >
              {isVerifying ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Verifying...
                </>
              ) : (
                <>
                  Verify Code
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>

            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                Didn't receive the code?
              </p>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleResendCode}
                disabled={isResending}
              >
                {isResending ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Resending...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Resend Code
                  </>
                )}
              </Button>
            </div>

            <div className="text-center text-sm">
              <Link to="/signup" className="text-blue-600 hover:underline">
                ← Back to sign up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

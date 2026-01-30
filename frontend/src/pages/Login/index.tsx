import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Mail, Lock, Loader2 } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const [step, setStep] = useState<'email' | 'code'>('email')
  // Prefill email if coming from signup
  const [email, setEmail] = useState(sessionStorage.getItem('loginEmail') || '')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('http://localhost:5000/api/auth/patient-login/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send verification code')
      }

      sessionStorage.setItem('loginEmail', email)
      setStep('code')
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code')
    } finally {
      setLoading(false)
    }
  }

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('http://localhost:5000/api/auth/patient-login/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Invalid verification code')
      }

      // Store authentication data
      sessionStorage.setItem('patientEmail', email)
      sessionStorage.setItem('authToken', data.token)
      sessionStorage.setItem('isAuthenticated', 'true')
      
      // Navigate to dashboard
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Invalid verification code')
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    setError('')
    setLoading(true)
    try {
      const response = await fetch('http://localhost:5000/api/auth/patient-login/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      if (!response.ok) throw new Error('Failed to resend code')
      alert('Verification code sent!')
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="min-h-screen bg-white">
      <div className="flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-12">
        <div className="w-full max-w-md mx-auto">
          <Button type="button" variant="ghost" onClick={() => step === 'code' ? setStep('email') : navigate('/')} className="mb-8 -ml-4">
            <ArrowLeft className="w-4 h-4 mr-2" />Back
          </Button>
          <div className="mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">{step === 'email' ? 'Welcome Back' : 'Enter Verification Code'}</h1>
            <p className="text-lg text-gray-600">{step === 'email' ? 'Sign in to manage your appointments' : `We've sent a verification code to ${email}`}</p>
          </div>
          {step === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div>
                <Label htmlFor="email" className="text-base font-medium">Email Address</Label>
                <div className="relative mt-2">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your.email@example.com" className="pl-10 h-12 text-base" required />
                </div>
              </div>
              {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg"><p className="text-sm text-red-600">{error}</p></div>}
              <Button type="submit" className="w-full h-12 text-base" disabled={loading}>{loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending Code...</> : 'Send Verification Code'}</Button>
              <p className="text-center text-sm text-gray-600">Don't have an account? <button type="button" onClick={() => navigate('/signup')} className="text-green-600 hover:text-green-700 font-medium">Sign up</button></p>
            </form>
          )}
          {step === 'code' && (
            <form onSubmit={handleCodeSubmit} className="space-y-6">
              <div>
                <Label htmlFor="code" className="text-base font-medium">Verification Code</Label>
                <div className="relative mt-2">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input id="code" type="text" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter 6-digit code" className="pl-10 h-12 text-base tracking-widest text-center" maxLength={6} required />
                </div>
              </div>
              {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg"><p className="text-sm text-red-600">{error}</p></div>}
              <Button type="submit" className="w-full h-12 text-base" disabled={loading || code.length !== 6}>{loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Verifying...</> : 'Sign In'}</Button>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Didn't receive the code?</p>
                <button type="button" onClick={handleResendCode} disabled={loading} className="text-sm text-green-600 hover:text-green-700 font-medium disabled:opacity-50">Resend Code</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </motion.div>
  )
}

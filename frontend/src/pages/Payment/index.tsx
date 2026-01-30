import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Loader2, CreditCard, Calendar, Clock, Shield } from 'lucide-react'

export default function Payment() {
  const navigate = useNavigate()
  const email = sessionStorage.getItem('signupEmail') || ''
  const code = sessionStorage.getItem('verificationCode') || ''
  const service = JSON.parse(sessionStorage.getItem('selectedService') || '{}')
  const bookingDate = sessionStorage.getItem('bookingDate') || ''
  const bookingTime = sessionStorage.getItem('bookingTime') || ''
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [name, setName] = useState('')

  useEffect(() => {
    if (!email || !code || !service.id || !bookingDate || !bookingTime) {
      navigate('/signup')
    }
  }, [email, code, service, bookingDate, bookingTime, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('http://localhost:5000/api/booking/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          code,
          serviceId: service.id,
          bookingDate,
          bookingTime,
          firstName: name.split(' ')[0] || 'Guest',
          lastName: name.split(' ').slice(1).join(' ') || 'User',
          phoneNumber: '09000000000',
          paymentMethod: 'card'
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Payment failed')
      }

      sessionStorage.setItem('bookingConfirmation', JSON.stringify(data))
      navigate('/confirmation')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0
    }).format(parseFloat(price))
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    return parts.length ? parts.join(' ') : value
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen flex"
    >
      {/* Left Side - Payment Form */}
      <div className="flex-1 flex flex-col px-6 sm:px-12 lg:px-20 py-12 bg-white overflow-auto">
        <div className="w-full max-w-lg mx-auto">
          {/* Back Button & Logo */}
          <div className="mb-8 flex items-center justify-between">
            <button
              onClick={() => navigate('/choose-schedule')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">N</span>
              </div>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-2">
              Complete payment
            </h1>
            <p className="text-lg text-gray-600">
              Enter your payment details to confirm your booking
            </p>
          </div>

          {/* Booking Summary */}
          <div className="bg-gray-50 rounded-2xl p-5 mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">Booking Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Service</span>
                <span className="font-medium">{service.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  {formatDate(bookingDate)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-gray-400" />
                  {formatTime(bookingTime)}
                </span>
              </div>
              <div className="pt-3 border-t flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-xl text-teal-600">{formatPrice(service.price)}</span>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Cardholder Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="card">Card Number</Label>
              <div className="relative">
                <Input
                  id="card"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  className="h-12 pr-12"
                  maxLength={19}
                  required
                />
                <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry">Expiry Date</Label>
                <Input
                  id="expiry"
                  placeholder="MM / YY"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  className="h-12"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  type="password"
                  placeholder=""
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className="h-12"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 text-base bg-teal-600 hover:bg-teal-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Pay ${formatPrice(service.price)}`
              )}
            </Button>

            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Shield className="h-4 w-4" />
              <span>Secured by 256-bit encryption</span>
            </div>
          </form>
        </div>
      </div>

      {/* Right Side - Decorative */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-teal-500 via-teal-600 to-emerald-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-white text-center">
          <div className="w-24 h-24 bg-white/20 rounded-3xl flex items-center justify-center mb-8 backdrop-blur-sm">
            <CreditCard className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Secure Payment</h2>
          <p className="text-lg text-white/80 max-w-md">
            Your payment information is encrypted and secure. We never store your full card details.
          </p>
        </div>
      </div>
    </motion.div>
  )
}

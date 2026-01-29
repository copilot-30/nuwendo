import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CreditCard, Wallet, Building2, QrCode, Calendar, Clock, User, Phone, CheckCircle2 } from 'lucide-react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { createBooking, Service } from '@/services/api'

interface LocationState {
  email: string
  code: string
  service: Service
  bookingDate: string
  bookingTime: string
  firstName: string
  lastName: string
  phoneNumber: string
  notes: string
}

type PaymentMethod = 'gcash' | 'maya' | 'card' | 'bank'

const paymentMethods = [
  { id: 'gcash' as PaymentMethod, name: 'GCash', icon: Wallet, color: 'bg-blue-500' },
  { id: 'maya' as PaymentMethod, name: 'Maya', icon: Wallet, color: 'bg-green-500' },
  { id: 'card' as PaymentMethod, name: 'Credit/Debit Card', icon: CreditCard, color: 'bg-purple-500' },
  { id: 'bank' as PaymentMethod, name: 'Bank Transfer', icon: Building2, color: 'bg-gray-500' },
]

export function Payment() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState
  const { email, code, service, bookingDate, bookingTime, firstName, lastName, phoneNumber, notes } = state || {}

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null)
  const [referenceNumber, setReferenceNumber] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!email || !code || !service || !bookingDate || !bookingTime || !firstName || !lastName || !phoneNumber) {
      navigate('/signup')
    }
  }, [email, code, service, bookingDate, bookingTime, firstName, lastName, phoneNumber, navigate])

  const handlePayment = async () => {
    if (!selectedMethod) return

    setIsProcessing(true)
    setError('')

    try {
      const result = await createBooking({
        email,
        serviceId: service.id,
        bookingDate,
        bookingTime,
        firstName,
        lastName,
        phoneNumber,
        notes,
        paymentMethod: selectedMethod,
        paymentReference: referenceNumber || `REF-${Date.now()}`
      })

      // Navigate to confirmation page
      navigate('/confirmation', { 
        state: { 
          bookingId: result.bookingId,
          service,
          bookingDate,
          bookingTime,
          firstName,
          lastName,
          email,
          phoneNumber,
          paymentMethod: selectedMethod
        } 
      })
    } catch (err: any) {
      setError(err.message || 'Payment failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  }

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0
    }).format(parseFloat(price))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="flex items-center gap-1">
            <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-medium">✓</div>
            <span className="text-sm text-gray-600 hidden sm:inline">Email</span>
          </div>
          <div className="w-8 h-0.5 bg-green-500"></div>
          <div className="flex items-center gap-1">
            <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-medium">✓</div>
            <span className="text-sm text-gray-600 hidden sm:inline">Verify</span>
          </div>
          <div className="w-8 h-0.5 bg-green-500"></div>
          <div className="flex items-center gap-1">
            <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-medium">✓</div>
            <span className="text-sm text-gray-600 hidden sm:inline">Service</span>
          </div>
          <div className="w-8 h-0.5 bg-green-500"></div>
          <div className="flex items-center gap-1">
            <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-medium">✓</div>
            <span className="text-sm text-gray-600 hidden sm:inline">Schedule</span>
          </div>
          <div className="w-8 h-0.5 bg-green-500"></div>
          <div className="flex items-center gap-1">
            <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-medium">✓</div>
            <span className="text-sm text-gray-600 hidden sm:inline">Details</span>
          </div>
          <div className="w-8 h-0.5 bg-blue-500"></div>
          <div className="flex items-center gap-1">
            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium">6</div>
            <span className="text-sm text-blue-600 font-medium hidden sm:inline">Payment</span>
          </div>
        </div>

        {/* Order Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-start pb-4 border-b">
              <div>
                <p className="font-semibold text-lg">{service?.name}</p>
                <p className="text-sm text-gray-600">{service?.duration_minutes} minutes</p>
              </div>
              <p className="font-semibold text-lg">{formatPrice(service?.price || '0')}</p>
            </div>
            
            <div className="grid gap-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>{bookingDate && formatDate(bookingDate)}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="h-4 w-4" />
                <span>{bookingTime && formatTime(bookingTime)}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <User className="h-4 w-4" />
                <span>{firstName} {lastName}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="h-4 w-4" />
                <span>{phoneNumber}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <p className="font-semibold text-lg">Total Amount</p>
              <p className="font-bold text-2xl text-green-600">{formatPrice(service?.price || '0')}</p>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Payment Method</CardTitle>
            <CardDescription>
              Choose how you'd like to pay
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="p-4 text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              {paymentMethods.map((method) => {
                const Icon = method.icon
                const isSelected = selectedMethod === method.id
                
                return (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all text-left
                      ${isSelected 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-blue-300'
                      }`}
                  >
                    <div className={`p-2 rounded-full ${method.color} text-white`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{method.name}</p>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="h-5 w-5 text-blue-500" />
                    )}
                  </button>
                )
              })}
            </div>

            {selectedMethod && (
              <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                {selectedMethod === 'gcash' && (
                  <div className="text-center space-y-3">
                    <div className="w-32 h-32 mx-auto bg-white rounded-lg flex items-center justify-center border">
                      <QrCode className="h-20 w-20 text-blue-500" />
                    </div>
                    <p className="text-sm text-gray-600">Scan QR code or send to:</p>
                    <p className="font-mono font-bold text-lg">0917-123-4567</p>
                    <p className="text-sm text-gray-500">Nowendo Health Services</p>
                  </div>
                )}

                {selectedMethod === 'maya' && (
                  <div className="text-center space-y-3">
                    <div className="w-32 h-32 mx-auto bg-white rounded-lg flex items-center justify-center border">
                      <QrCode className="h-20 w-20 text-green-500" />
                    </div>
                    <p className="text-sm text-gray-600">Scan QR code or send to:</p>
                    <p className="font-mono font-bold text-lg">0917-123-4567</p>
                    <p className="text-sm text-gray-500">Nowendo Health Services</p>
                  </div>
                )}

                {selectedMethod === 'card' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Card Number</Label>
                      <Input placeholder="1234 5678 9012 3456" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Expiry Date</Label>
                        <Input placeholder="MM/YY" />
                      </div>
                      <div className="space-y-2">
                        <Label>CVV</Label>
                        <Input placeholder="123" type="password" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Cardholder Name</Label>
                      <Input placeholder="JUAN DELA CRUZ" />
                    </div>
                  </div>
                )}

                {selectedMethod === 'bank' && (
                  <div className="space-y-3">
                    <p className="font-medium">Bank Transfer Details:</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bank:</span>
                        <span className="font-medium">BDO Unibank</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Account Name:</span>
                        <span className="font-medium">Nowendo Health Services</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Account Number:</span>
                        <span className="font-mono font-medium">1234-5678-9012</span>
                      </div>
                    </div>
                  </div>
                )}

                {(selectedMethod === 'gcash' || selectedMethod === 'maya' || selectedMethod === 'bank') && (
                  <div className="space-y-2 pt-4">
                    <Label>Reference Number (optional)</Label>
                    <Input
                      placeholder="Enter your payment reference number"
                      value={referenceNumber}
                      onChange={(e) => setReferenceNumber(e.target.value)}
                    />
                    <p className="text-xs text-gray-500">
                      Enter the reference number from your payment confirmation
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between pt-4">
              <Link 
                to="/patient-details" 
                state={state} 
                className="text-blue-600 hover:underline"
              >
                ← Back
              </Link>
              <Button
                size="lg"
                onClick={handlePayment}
                disabled={!selectedMethod || isProcessing}
                className="px-8"
              >
                {isProcessing ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Processing...
                  </>
                ) : (
                  <>
                    Complete Booking
                    <CheckCircle2 className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, User, Phone, FileText, Calendar, Clock } from 'lucide-react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Service } from '@/services/api'

interface LocationState {
  email: string
  code: string
  service: Service
  bookingDate: string
  bookingTime: string
}

export function PatientDetails() {
  const navigate = useNavigate()
  const location = useLocation()
  const { email, code, service, bookingDate, bookingTime } = (location.state as LocationState) || {}

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (!email || !code || !service || !bookingDate || !bookingTime) {
      navigate('/signup')
    }
  }, [email, code, service, bookingDate, bookingTime, navigate])

  const handleContinue = () => {
    if (firstName && lastName && phoneNumber) {
      navigate('/payment', { 
        state: { 
          email, 
          code, 
          service, 
          bookingDate,
          bookingTime,
          firstName,
          lastName,
          phoneNumber,
          notes
        } 
      })
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

  const formatPhoneNumber = (value: string) => {
    // Remove non-digits
    const digits = value.replace(/\D/g, '')
    // Format as Philippine number
    if (digits.startsWith('63')) {
      return digits.slice(0, 12)
    } else if (digits.startsWith('09') || digits.startsWith('9')) {
      return digits.slice(0, 11)
    }
    return digits.slice(0, 11)
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
          <div className="w-8 h-0.5 bg-blue-500"></div>
          <div className="flex items-center gap-1">
            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium">5</div>
            <span className="text-sm text-blue-600 font-medium hidden sm:inline">Details</span>
          </div>
          <div className="w-8 h-0.5 bg-gray-300"></div>
          <div className="flex items-center gap-1">
            <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center text-sm font-medium">6</div>
            <span className="text-sm text-gray-400 hidden sm:inline">Payment</span>
          </div>
        </div>

        {/* Booking Summary */}
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="grid gap-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Service</p>
                  <p className="font-semibold">{service?.name}</p>
                </div>
                <p className="font-semibold text-green-600">{formatPrice(service?.price || '0')}</p>
              </div>
              <div className="flex gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{bookingDate && formatDate(bookingDate)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{bookingTime && formatTime(bookingTime)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Your Details</CardTitle>
            <CardDescription className="text-lg">
              Please provide your information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); handleContinue(); }} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-base">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="Juan"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      className="pl-10 h-12"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-base">
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Dela Cruz"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className="pl-10 h-12"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-base">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="09123456789"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
                    required
                    className="pl-10 h-12"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  We'll send appointment reminders to this number
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-base">
                  Notes <span className="text-gray-400">(optional)</span>
                </Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
                  <Textarea
                    id="notes"
                    placeholder="Any special requests or information we should know..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="pl-10 min-h-[100px] resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <Link 
                  to="/choose-schedule" 
                  state={{ email, code, service }} 
                  className="text-blue-600 hover:underline"
                >
                  ← Back
                </Link>
                <Button
                  type="submit"
                  size="lg"
                  disabled={!firstName || !lastName || !phoneNumber}
                  className="px-8"
                >
                  Continue to Payment
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

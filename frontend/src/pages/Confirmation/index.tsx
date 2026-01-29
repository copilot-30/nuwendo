import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, Calendar, Clock, User, Phone, Mail, MapPin, Download, Share2, Home } from 'lucide-react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Service } from '@/services/api'

interface LocationState {
  bookingId: number
  service: Service
  bookingDate: string
  bookingTime: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  paymentMethod: string
}

export function Confirmation() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState
  const { bookingId, service, bookingDate, bookingTime, firstName, lastName, email, phoneNumber, paymentMethod } = state || {}

  useEffect(() => {
    if (!bookingId || !service) {
      navigate('/')
    }
  }, [bookingId, service, navigate])

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

  const getPaymentMethodName = (method: string) => {
    const methods: Record<string, string> = {
      'gcash': 'GCash',
      'maya': 'Maya',
      'card': 'Credit/Debit Card',
      'bank': 'Bank Transfer'
    }
    return methods[method] || method
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 mb-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-green-700 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600">Your appointment has been successfully scheduled</p>
        </div>

        {/* Booking Reference */}
        <Card className="mb-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardContent className="p-6 text-center">
            <p className="text-sm opacity-90 mb-1">Booking Reference</p>
            <p className="text-3xl font-mono font-bold tracking-wider">NW-{String(bookingId).padStart(6, '0')}</p>
            <p className="text-sm opacity-75 mt-2">Please save this reference number</p>
          </CardContent>
        </Card>

        {/* Appointment Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Appointment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="font-semibold text-lg text-blue-900">{service?.name}</p>
              <p className="text-sm text-blue-700">{service?.duration_minutes} minutes • {formatPrice(service?.price || '0')}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="p-2 bg-white rounded-full">
                  <Calendar className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Date</p>
                  <p className="font-medium">{bookingDate && formatDate(bookingDate)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="p-2 bg-white rounded-full">
                  <Clock className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Time</p>
                  <p className="font-medium">{bookingTime && formatTime(bookingTime)}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="p-2 bg-white rounded-full">
                <MapPin className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Location</p>
                <p className="font-medium">Nowendo Health Center</p>
                <p className="text-sm text-gray-600">123 Healthcare Ave, Makati City</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Patient Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Patient Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-gray-400" />
              <span className="font-medium">{firstName} {lastName}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-gray-400" />
              <span>{email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-gray-400" />
              <span>{phoneNumber}</span>
            </div>
          </CardContent>
        </Card>

        {/* Payment Information */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Payment Method</p>
                <p className="font-medium">{getPaymentMethodName(paymentMethod)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Amount Paid</p>
                <p className="font-bold text-lg text-green-600">{formatPrice(service?.price || '0')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Important Notes */}
        <Card className="mb-6 bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">📋 Important Reminders</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Please arrive 15 minutes before your appointment</li>
              <li>• Bring a valid ID and this booking reference</li>
              <li>• A confirmation email has been sent to {email}</li>
              <li>• For cancellations, please contact us 24 hours in advance</li>
            </ul>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" className="flex-1" onClick={() => window.print()}>
            <Download className="mr-2 h-4 w-4" />
            Download Receipt
          </Button>
          <Button variant="outline" className="flex-1" onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: 'My Appointment',
                text: `Appointment on ${formatDate(bookingDate)} at ${formatTime(bookingTime)}`,
              })
            }
          }}>
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Link to="/" className="flex-1">
            <Button className="w-full">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Contact Support */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Need help? Contact us at</p>
          <p className="font-medium text-blue-600">support@nowendo.com | (02) 8123-4567</p>
        </div>
      </div>
    </div>
  )
}

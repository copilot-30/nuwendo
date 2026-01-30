import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { CheckCircle, Calendar, Clock, Mail, Download, PartyPopper } from 'lucide-react'

export default function Confirmation() {
  const navigate = useNavigate()
  const email = sessionStorage.getItem('signupEmail') || ''
  const service = JSON.parse(sessionStorage.getItem('selectedService') || '{}')
  const bookingDate = sessionStorage.getItem('bookingDate') || ''
  const bookingTime = sessionStorage.getItem('bookingTime') || ''

  useEffect(() => {
    if (!email || !service.id || !bookingDate || !bookingTime) {
      navigate('/signup')
    }
  }, [email, service, bookingDate, bookingTime, navigate])

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
      day: 'numeric',
      year: 'numeric'
    })
  }

  const handleDone = () => {
    sessionStorage.clear()
    navigate('/')
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen flex"
    >
      {/* Left Side - Confirmation Details */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-12 bg-white">
        <div className="w-full max-w-lg mx-auto">
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="mb-8"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </motion.div>

          {/* Heading */}
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              Booking Confirmed!
            </h1>
            <p className="text-lg text-gray-600">
              Your appointment has been successfully booked
            </p>
          </div>

          {/* Booking Details */}
          <div className="bg-gray-50 rounded-2xl p-6 mb-8">
            <h3 className="font-semibold text-xl text-gray-900 mb-6">{service.name}</h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Date</div>
                  <div className="font-medium text-gray-900">{formatDate(bookingDate)}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Time</div>
                  <div className="font-medium text-gray-900">{formatTime(bookingTime)}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Confirmation sent to</div>
                  <div className="font-medium text-gray-900">{email}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button 
              className="w-full h-12 text-base bg-teal-600 hover:bg-teal-700"
              onClick={handleDone}
            >
              Done
            </Button>
            
            <Button 
              variant="outline"
              className="w-full h-12 text-base"
              onClick={() => {}}
            >
              <Download className="w-4 h-4 mr-2" />
              Add to Calendar
            </Button>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            A confirmation email has been sent to your email address with all the details.
          </p>
        </div>
      </div>

      {/* Right Side - Decorative */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-green-500 via-teal-500 to-emerald-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-white text-center">
          <div className="w-24 h-24 bg-white/20 rounded-3xl flex items-center justify-center mb-8 backdrop-blur-sm">
            <PartyPopper className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-bold mb-4">You're all set!</h2>
          <p className="text-lg text-white/80 max-w-md">
            We look forward to seeing you. Remember to arrive 10 minutes before your scheduled time.
          </p>
        </div>
      </div>
    </motion.div>
  )
}

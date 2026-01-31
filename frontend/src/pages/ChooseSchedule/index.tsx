import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2, Clock, ChevronLeft, ChevronRight, Monitor, Building2 } from 'lucide-react'

interface TimeSlot {
  id: number
  start_time: string
  end_time: string
}

type AppointmentType = 'online' | 'on-site'

export default function ChooseSchedule() {
  const navigate = useNavigate()
  
  // Support both signup flow and logged-in patient flow
  const signupEmail = sessionStorage.getItem('signupEmail') || ''
  const verificationCode = sessionStorage.getItem('verificationCode') || ''
  const patientEmail = sessionStorage.getItem('patientEmail') || ''
  const isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true'
  const isValidUser = (signupEmail && verificationCode) || (patientEmail && isAuthenticated)
  
  const service = JSON.parse(sessionStorage.getItem('selectedService') || '{}')
  
  const [appointmentType, setAppointmentType] = useState<AppointmentType>('on-site')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  useEffect(() => {
    if (!isValidUser || !service.id) {
      navigate('/signup')
    }
  }, [isValidUser, service, navigate])

  useEffect(() => {
    if (selectedDate) {
      const fetchSlots = async () => {
        setIsLoading(true)
        try {
          // Format date as YYYY-MM-DD in local timezone (avoid UTC conversion)
          const year = selectedDate.getFullYear()
          const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
          const day = String(selectedDate.getDate()).padStart(2, '0')
          const dateStr = `${year}-${month}-${day}`
          
          const response = await fetch(`http://localhost:5000/api/availability?date=${dateStr}&type=${appointmentType}`)
          const data = await response.json()
          setAvailableSlots(data.availableSlots || [])
          setSelectedSlot(null)
        } catch (err) {
          setAvailableSlots([])
        } finally {
          setIsLoading(false)
        }
      }
      fetchSlots()
    }
  }, [selectedDate, appointmentType])

  const handleContinue = () => {
    if (selectedDate && selectedSlot) {
      // Format date as YYYY-MM-DD in local timezone (avoid UTC conversion)
      const year = selectedDate.getFullYear()
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
      const day = String(selectedDate.getDate()).padStart(2, '0')
      const dateStr = `${year}-${month}-${day}`
      
      sessionStorage.setItem('bookingDate', dateStr)
      sessionStorage.setItem('bookingTime', selectedSlot.start_time)
      sessionStorage.setItem('appointmentType', appointmentType)
      navigate('/payment')
    }
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  
  const isToday = (day: number) => {
    const today = new Date()
    return currentMonth.getFullYear() === today.getFullYear() &&
           currentMonth.getMonth() === today.getMonth() &&
           day === today.getDate()
  }
  
  const isPast = (day: number) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const checkDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    return checkDate < today
  }
  
  const isSelected = (day: number) => {
    return selectedDate &&
           selectedDate.getFullYear() === currentMonth.getFullYear() &&
           selectedDate.getMonth() === currentMonth.getMonth() &&
           selectedDate.getDate() === day
  }

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth)
    const firstDay = getFirstDayOfMonth(currentMonth)
    const days = []
    
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10" />)
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const past = isPast(day)
      days.push(
        <button
          key={day}
          disabled={past}
          onClick={() => setSelectedDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))}
          className={`h-10 w-10 rounded-full text-sm font-medium transition-all
            ${past ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-brand-100'}
            ${isToday(day) && !isSelected(day) ? 'ring-2 ring-brand ring-offset-2' : ''}
            ${isSelected(day) ? 'bg-brand text-white hover:bg-brand-600' : ''}
          `}
        >
          {day}
        </button>
      )
    }
    
    return days
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-white"
    >
      {/* Full Width - Calendar */}
      <div className="flex flex-col px-6 sm:px-12 lg:px-20 py-12 max-w-5xl mx-auto">
        {/* Back Button & Logo */}
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={() => navigate('/choose-service')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <img src="/logo-icon.svg" alt="Nuwendo" className="h-8 w-8" />
        </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-2">
              Pick a date & time
            </h1>
            <p className="text-lg text-gray-600">
              Select when you'd like your appointment
            </p>
          </div>

          {/* Appointment Type Selection */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Appointment Type</h2>
            <div className="grid grid-cols-2 gap-4">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setAppointmentType('online')
                  setSelectedSlot(null)
                }}
                className={`p-4 rounded-xl border-2 transition-all ${
                  appointmentType === 'online'
                    ? 'border-brand bg-brand-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    appointmentType === 'online' ? 'bg-brand-100' : 'bg-gray-100'
                  }`}>
                    <Monitor className={`w-6 h-6 ${
                      appointmentType === 'online' ? 'text-brand' : 'text-gray-600'
                    }`} />
                  </div>
                  <div>
                    <p className={`font-semibold ${
                      appointmentType === 'online' ? 'text-brand-900' : 'text-gray-900'
                    }`}>
                      Online
                    </p>
                    <p className="text-sm text-gray-600">
                      {service.duration_minutes || 30} min video call
                    </p>
                  </div>
                </div>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setAppointmentType('on-site')
                  setSelectedSlot(null)
                }}
                className={`p-4 rounded-xl border-2 transition-all ${
                  appointmentType === 'on-site'
                    ? 'border-brand bg-brand-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    appointmentType === 'on-site' ? 'bg-brand-100' : 'bg-gray-100'
                  }`}>
                    <Building2 className={`w-6 h-6 ${
                      appointmentType === 'on-site' ? 'text-brand' : 'text-gray-600'
                    }`} />
                  </div>
                  <div>
                    <p className={`font-semibold ${
                      appointmentType === 'on-site' ? 'text-brand-900' : 'text-gray-900'
                    }`}>
                      On-Site
                    </p>
                    <p className="text-sm text-gray-600">60 min clinic visit</p>
                  </div>
                </div>
              </motion.button>
            </div>
          </div>

          {/* Calendar */}
          <div className="bg-gray-50 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <button 
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="font-semibold text-lg">
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
              <button 
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-center mb-3">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} className="text-xs text-gray-500 font-medium py-2">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 justify-items-center">
              {renderCalendar()}
            </div>
          </div>

          {/* Time Slots */}
          {selectedDate && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-gray-500" />
                <span className="font-semibold text-gray-900">Available times</span>
              </div>
              
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-brand" />
                </div>
              ) : availableSlots.length === 0 ? (
                <p className="text-center text-gray-500 py-8 bg-gray-50 rounded-xl">
                  No available slots for this date
                </p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-3 text-sm font-medium rounded-xl border-2 transition-all
                        ${selectedSlot?.id === slot.id
                          ? 'bg-brand text-white border-brand'
                          : 'border-gray-200 hover:border-brand-300 bg-white'}
                      `}
                    >
                      {formatTime(slot.start_time)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

        <Button 
          className="w-full h-12 text-base bg-brand hover:bg-brand-600"
          disabled={!selectedDate || !selectedSlot}
          onClick={handleContinue}
        >
          Continue
        </Button>
      </div>
    </motion.div>
  )
}

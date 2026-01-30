import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2, Clock, ChevronLeft, ChevronRight, Calendar } from 'lucide-react'

interface TimeSlot {
  id: number
  start_time: string
  end_time: string
}

export default function ChooseSchedule() {
  const navigate = useNavigate()
  const email = sessionStorage.getItem('signupEmail') || ''
  const code = sessionStorage.getItem('verificationCode') || ''
  const service = JSON.parse(sessionStorage.getItem('selectedService') || '{}')
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  useEffect(() => {
    if (!email || !code || !service.id) {
      navigate('/signup')
    }
  }, [email, code, service, navigate])

  useEffect(() => {
    if (selectedDate) {
      const fetchSlots = async () => {
        setIsLoading(true)
        try {
          const dateStr = selectedDate.toISOString().split('T')[0]
          const response = await fetch(`http://localhost:5000/api/availability?date=${dateStr}`)
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
  }, [selectedDate])

  const handleContinue = () => {
    if (selectedDate && selectedSlot) {
      sessionStorage.setItem('bookingDate', selectedDate.toISOString().split('T')[0])
      sessionStorage.setItem('bookingTime', selectedSlot.start_time)
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
            ${past ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-teal-100'}
            ${isToday(day) && !isSelected(day) ? 'ring-2 ring-teal-500 ring-offset-2' : ''}
            ${isSelected(day) ? 'bg-teal-500 text-white hover:bg-teal-600' : ''}
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
      className="min-h-screen flex"
    >
      {/* Left Side - Calendar */}
      <div className="flex-1 flex flex-col px-6 sm:px-12 lg:px-20 py-12 bg-white overflow-auto">
        <div className="w-full max-w-2xl mx-auto">
          {/* Back Button & Logo */}
          <div className="mb-8 flex items-center justify-between">
            <button
              onClick={() => navigate('/choose-service')}
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
              Pick a date & time
            </h1>
            <p className="text-lg text-gray-600">
              Select when you'd like to come in for your appointment
            </p>
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
                  <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
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
                          ? 'bg-teal-500 text-white border-teal-500'
                          : 'border-gray-200 hover:border-teal-300 bg-white'}
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
            className="w-full h-12 text-base bg-teal-600 hover:bg-teal-700"
            disabled={!selectedDate || !selectedSlot}
            onClick={handleContinue}
          >
            Continue
          </Button>
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
            <Calendar className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Flexible Scheduling</h2>
          <p className="text-lg text-white/80 max-w-md">
            Choose a time that works best for you. We offer appointments throughout the week.
          </p>
        </div>
      </div>
    </motion.div>
  )
}

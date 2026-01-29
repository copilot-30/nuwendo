import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { getAvailableSlots, TimeSlot, Service } from '@/services/api'

export function ChooseSchedule() {
  const navigate = useNavigate()
  const location = useLocation()
  const { email, code, service } = location.state as { email: string; code: string; service: Service } || {}

  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentMonth, setCurrentMonth] = useState(new Date())

  useEffect(() => {
    if (!email || !code || !service) {
      navigate('/signup')
      return
    }
  }, [email, code, service, navigate])

  useEffect(() => {
    if (selectedDate) {
      const fetchSlots = async () => {
        setIsLoading(true)
        setError('')
        try {
          const dateStr = selectedDate.toISOString().split('T')[0]
          const data = await getAvailableSlots(dateStr)
          setAvailableSlots(data.availableSlots)
          setSelectedSlot(null)
        } catch (err: any) {
          setError(err.message || 'Failed to load available slots')
        } finally {
          setIsLoading(false)
        }
      }
      fetchSlots()
    }
  }, [selectedDate])

  const handleContinue = () => {
    if (selectedDate && selectedSlot) {
      navigate('/patient-details', { 
        state: { 
          email, 
          code, 
          service, 
          bookingDate: selectedDate.toISOString().split('T')[0],
          bookingTime: selectedSlot.start_time
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

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0
    }).format(parseFloat(price))
  }

  // Calendar helper functions
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()
    
    const days: (Date | null)[] = []
    
    // Add empty slots for days before the first of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(null)
    }
    
    // Add all days in the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }
    
    return days
  }

  const isDateDisabled = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Disable past dates
    if (date < today) return true
    
    // Disable Sundays (day 0)
    if (date.getDay() === 0) return true
    
    return false
  }

  const isDateSelected = (date: Date) => {
    if (!selectedDate) return false
    return date.toDateString() === selectedDate.toDateString()
  }

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const monthYear = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const days = getDaysInMonth(currentMonth)
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 py-8">
      <div className="max-w-4xl mx-auto">
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
          <div className="w-8 h-0.5 bg-blue-500"></div>
          <div className="flex items-center gap-1">
            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium">4</div>
            <span className="text-sm text-blue-600 font-medium hidden sm:inline">Schedule</span>
          </div>
          <div className="w-8 h-0.5 bg-gray-300"></div>
          <div className="flex items-center gap-1">
            <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center text-sm font-medium">5</div>
            <span className="text-sm text-gray-400 hidden sm:inline">Details</span>
          </div>
          <div className="w-8 h-0.5 bg-gray-300"></div>
          <div className="flex items-center gap-1">
            <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center text-sm font-medium">6</div>
            <span className="text-sm text-gray-400 hidden sm:inline">Payment</span>
          </div>
        </div>

        {/* Selected Service Summary */}
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Selected Service</p>
                <p className="font-semibold text-lg">{service?.name}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">{service?.duration_minutes} min</p>
                <p className="font-semibold text-green-600">{formatPrice(service?.price || '0')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Choose Date & Time</CardTitle>
            <CardDescription className="text-lg">
              Select your preferred appointment schedule
            </CardDescription>
          </CardHeader>
        </Card>

        {error && (
          <div className="p-4 mb-6 text-red-600 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Calendar */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {monthYear}
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={handleNextMonth}>
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map(day => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {days.map((date, index) => (
                  <div key={index} className="aspect-square">
                    {date ? (
                      <button
                        onClick={() => !isDateDisabled(date) && setSelectedDate(date)}
                        disabled={isDateDisabled(date)}
                        className={`w-full h-full rounded-lg text-sm font-medium transition-colors
                          ${isDateDisabled(date) 
                            ? 'text-gray-300 cursor-not-allowed' 
                            : isDateSelected(date)
                              ? 'bg-blue-500 text-white'
                              : 'hover:bg-blue-100 text-gray-700'
                          }`}
                      >
                        {date.getDate()}
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Time Slots */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Available Times
              </CardTitle>
              <CardDescription>
                {selectedDate 
                  ? `Showing times for ${selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`
                  : 'Select a date to see available times'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedDate ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Please select a date first</p>
                </div>
              ) : isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin text-4xl mb-4">⏳</div>
                  <p className="text-gray-600">Loading available slots...</p>
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No available slots for this date</p>
                  <p className="text-sm mt-1">Please select another date</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {availableSlots.map((slot) => (
                    <Button
                      key={slot.id}
                      variant={selectedSlot?.id === slot.id ? 'default' : 'outline'}
                      className="w-full"
                      onClick={() => setSelectedSlot(slot)}
                    >
                      {formatTime(slot.start_time)}
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-between mt-6">
          <Link to="/choose-service" state={{ email, code }} className="text-blue-600 hover:underline">
            ← Back
          </Link>
          <Button
            size="lg"
            onClick={handleContinue}
            disabled={!selectedDate || !selectedSlot}
            className="px-8"
          >
            Continue
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}

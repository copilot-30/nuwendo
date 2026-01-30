import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, LogOut, Plus, Monitor, Building2, User, Mail } from 'lucide-react'

interface Appointment {
  id: number
  service_name: string
  booking_date: string
  booking_time: string
  appointment_type: string
  status: string
  first_name?: string
  last_name?: string
  phone_number?: string
}

interface PatientProfile {
  first_name: string
  last_name: string
  email: string
  phone: string
}

export default function PatientDashboard() {
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [profile, setProfile] = useState<PatientProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const patientEmail = sessionStorage.getItem('patientEmail')
    
    if (!patientEmail) {
      navigate('/login')
      return
    }

    fetchDashboardData(patientEmail)
  }, [navigate])

  const fetchDashboardData = async (email: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/booking/patient?email=${encodeURIComponent(email)}`)
      const data = await response.json()
      
      if (response.ok && data.success) {
        const bookings = data.bookings || []
        setAppointments(bookings)
        
        // Set profile from first booking or from sessionStorage
        if (bookings.length > 0) {
          const firstBooking = bookings[0]
          setProfile({
            first_name: firstBooking.first_name || sessionStorage.getItem('patientFirstName') || '',
            last_name: firstBooking.last_name || sessionStorage.getItem('patientLastName') || '',
            email: email,
            phone: firstBooking.phone_number || sessionStorage.getItem('patientPhone') || ''
          })
        } else {
          // No bookings yet, try to get from sessionStorage
          setProfile({
            first_name: sessionStorage.getItem('patientFirstName') || '',
            last_name: sessionStorage.getItem('patientLastName') || '',
            email: email,
            phone: sessionStorage.getItem('patientPhone') || ''
          })
        }
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    sessionStorage.clear()
    navigate('/')
  }

  const handleNewAppointment = () => {
    // Store profile for pre-filling in patientDetails format (used by Payment page)
    if (profile) {
      const patientDetails = {
        firstName: profile.first_name,
        lastName: profile.last_name,
        contactNumber: profile.phone,
        age: '',
        cityAddress: '',
        height: '',
        weight: '',
        reasonForConsult: '',
        healthGoals: []
      }
      sessionStorage.setItem('patientDetails', JSON.stringify(patientDetails))
      sessionStorage.setItem('patientFirstName', profile.first_name)
      sessionStorage.setItem('patientLastName', profile.last_name)
      sessionStorage.setItem('patientPhone', profile.phone)
    }
    navigate('/choose-service')
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-lg text-gray-600">Loading...</p>
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {profile?.first_name || 'Patient'}!</h1>
            <p className="text-gray-600 mt-1">Manage your appointments and health services</p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut className="w-4 h-4" />Logout
          </Button>
        </div>

        {profile && (
          <div className="bg-white rounded-lg p-6 mb-6 shadow-sm border">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900">{profile.first_name} {profile.last_name}</h2>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />{profile.email}
                  </div>
                  <div>{profile.phone}</div>
                </div>
              </div>
              <Button onClick={handleNewAppointment} className="gap-2">
                <Plus className="w-4 h-4" />New Appointment
              </Button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Appointments</h2>
          
          {appointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-lg text-gray-600 mb-4">No appointments yet</p>
              <Button onClick={handleNewAppointment} className="gap-2">
                <Plus className="w-4 h-4" />Book Your First Appointment
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="border rounded-lg p-4 hover:border-green-500 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900">{appointment.service_name}</h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />{formatDate(appointment.booking_date)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />{formatTime(appointment.booking_time)}
                        </div>
                        <div className="flex items-center gap-1">
                          {appointment.appointment_type === 'online' ? <Monitor className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                          {appointment.appointment_type === 'online' ? 'Online' : 'On-Site'}
                        </div>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${appointment.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {appointment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { API_URL, BASE_URL } from '@/config/api'
import { 
  Calendar, 
  LogOut, 
  ChevronRight,
  Phone,
  X,
  AlertCircle,
  Bell,
  Pencil,
  Check,
  Loader2,
  Video,
  ExternalLink
} from 'lucide-react'

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
  duration_minutes?: number
  video_call_link?: string
}

interface PatientProfile {
  first_name: string
  last_name: string
  email: string
  phone: string
  age?: string
  cityAddress?: string
  height?: string
  weight?: string
  reasonForConsult?: string
  healthGoals?: string[]
}

type TabType = 'home' | 'services' | 'shop' | 'account'

export default function PatientDashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabType>('home')
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [profile, setProfile] = useState<PatientProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState<number | null>(null)
  const [cancelError, setCancelError] = useState<string | null>(null)
  const [hasShopAccess, setHasShopAccess] = useState(false)
  const [shopItems, setShopItems] = useState<any[]>([])
  
  // Edit mode states
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isEditingAddress, setIsEditingAddress] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    age: '',
    cityAddress: '',
    height: '',
    weight: '',
    reasonForConsult: ''
  })

  useEffect(() => {
    const patientEmail = sessionStorage.getItem('patientEmail')
    
    if (!patientEmail) {
      navigate('/login')
      return
    }

    fetchPatientProfile(patientEmail)
    fetchDashboardData(patientEmail)
    checkShopAccess()

    // Check shop access every 5 seconds
    const shopAccessInterval = setInterval(() => {
      checkShopAccess()
    }, 5000)

    // Also check when window/tab becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkShopAccess()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(shopAccessInterval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [navigate])

  const checkShopAccess = async () => {
    try {
      const token = sessionStorage.getItem('authToken')
      const email = sessionStorage.getItem('patientEmail')
      
      // If no token, use email-based endpoint (for legacy sessions)
      if (!token && email) {
        const response = await fetch(`${BASE_URL}/api/shop/access/by-email?email=${encodeURIComponent(email)}`)
        const data = await response.json()
        
        if (data.success) {
          setHasShopAccess(data.hasAccess)
          if (data.hasAccess) {
            fetchShopItems() // Now this will work for legacy sessions too!
          }
        }
        return
      }

      if (!token) {
        console.log('No auth token found')
        return
      }

      const response = await fetch(`${BASE_URL}/api/shop/access`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      
      if (data.success) {
        setHasShopAccess(data.hasAccess)
        if (data.hasAccess) {
          fetchShopItems()
        }
      }
    } catch (error) {
      console.error('Failed to check shop access:', error)
    }
  }

  const fetchShopItems = async () => {
    try {
      const token = sessionStorage.getItem('authToken')
      const email = sessionStorage.getItem('patientEmail')
      
      // If no token, use email-based endpoint (for legacy sessions)
      if (!token && email) {
        const response = await fetch(`${BASE_URL}/api/shop/items/by-email?email=${encodeURIComponent(email)}`)
        const data = await response.json()
        
        if (data.success) {
          setShopItems(data.items)
        }
        return
      }

      if (!token) return

      const response = await fetch(`${BASE_URL}/api/shop/items`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      
      if (data.success) {
        setShopItems(data.items)
      }
    } catch (error) {
      console.error('Failed to fetch shop items:', error)
    }
  }

  const fetchPatientProfile = async (email: string) => {
    try {
      const response = await fetch(`${BASE_URL}/api/patient/profile?email=${encodeURIComponent(email)}`)
      const data = await response.json()
      
      if (response.ok && data.success) {
        const p = data.profile
        setProfile({
          first_name: p.firstName || '',
          last_name: p.lastName || '',
          email: email,
          phone: p.phone || '',
          age: p.age || '',
          cityAddress: p.address || '',
          height: p.height || '',
          weight: p.weight || '',
          reasonForConsult: p.reasonForConsult || '',
          healthGoals: p.healthGoals || []
        })
        // Also update edit form
        setEditForm({
          firstName: p.firstName || '',
          lastName: p.lastName || '',
          phone: p.phone || '',
          age: p.age || '',
          cityAddress: p.address || '',
          height: p.height || '',
          weight: p.weight || '',
          reasonForConsult: p.reasonForConsult || ''
        })
      }
    } catch (error) {
      console.error('Failed to fetch patient profile:', error)
      // Fall back to session storage
      loadPatientDetailsFromSession()
    }
  }

  const loadPatientDetailsFromSession = () => {
    // Load patient details from sessionStorage
    const storedDetails = sessionStorage.getItem('patientDetails')
    if (storedDetails) {
      try {
        const details = JSON.parse(storedDetails)
        setProfile(prev => ({
          ...prev!,
          age: details.age || '',
          cityAddress: details.cityAddress || '',
          height: details.height || '',
          weight: details.weight || '',
          reasonForConsult: details.reasonForConsult || '',
          healthGoals: details.healthGoals || []
        }))
      } catch (e) {
        console.error('Error parsing patient details:', e)
      }
    }
  }

  const fetchDashboardData = async (email: string) => {
    try {
      const response = await fetch(`${BASE_URL}/api/booking/patient?email=${encodeURIComponent(email)}`)
      const data = await response.json()
      
      if (response.ok && data.success) {
        const bookings = data.bookings || []
        setAppointments(bookings)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {
      const email = sessionStorage.getItem('patientEmail')
      if (!email) return

      const response = await fetch(`${BASE_URL}/api/patient/profile/${encodeURIComponent(email)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firstName: editForm.firstName,
          lastName: editForm.lastName,
          phone: editForm.phone,
          address: editForm.cityAddress,
          age: editForm.age,
          height: editForm.height,
          weight: editForm.weight,
          reasonForConsult: editForm.reasonForConsult,
          healthGoals: profile?.healthGoals || []
        })
      })

      if (response.ok) {
        // Update local profile state
        setProfile(prev => ({
          ...prev!,
          first_name: editForm.firstName,
          last_name: editForm.lastName,
          phone: editForm.phone,
          cityAddress: editForm.cityAddress,
          age: editForm.age,
          height: editForm.height,
          weight: editForm.weight,
          reasonForConsult: editForm.reasonForConsult
        }))
        setIsEditingProfile(false)
        setIsEditingAddress(false)
      }
    } catch (error) {
      console.error('Failed to save profile:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const startEditingProfile = () => {
    setEditForm({
      firstName: profile?.first_name || '',
      lastName: profile?.last_name || '',
      phone: profile?.phone || '',
      age: profile?.age || '',
      cityAddress: profile?.cityAddress || '',
      height: profile?.height || '',
      weight: profile?.weight || '',
      reasonForConsult: profile?.reasonForConsult || ''
    })
    setIsEditingProfile(true)
  }

  const startEditingAddress = () => {
    setEditForm(prev => ({
      ...prev,
      cityAddress: profile?.cityAddress || ''
    }))
    setIsEditingAddress(true)
  }

  const handleLogout = () => {
    sessionStorage.clear()
    navigate('/')
  }

  // Check if appointment can be cancelled (24 hours before)
  const canCancelAppointment = (bookingDate: string, bookingTime: string) => {
    // Parse the date properly - booking_date comes as ISO string from DB
    const dateStr = bookingDate.split('T')[0] // Get just the date part (YYYY-MM-DD)
    const appointmentDateTime = new Date(`${dateStr}T${bookingTime}`)
    const now = new Date()
    const hoursUntilAppointment = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)
    console.log('Cancellation check:', { dateStr, bookingTime, appointmentDateTime, now, hoursUntilAppointment })
    return hoursUntilAppointment >= 24
  }

  // Calculate end time based on start time and duration
  const getEndTime = (startTime: string, durationMinutes: number = 30) => {
    const [hours, minutes] = startTime.split(':').map(Number)
    const totalMinutes = hours * 60 + minutes + durationMinutes
    const endHours = Math.floor(totalMinutes / 60) % 24
    const endMins = totalMinutes % 60
    return `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`
  }

  const handleCancelAppointment = async (appointmentId: number) => {
    setCancellingId(appointmentId)
    setCancelError(null)
    
    try {
      const response = await fetch(`${BASE_URL}/api/booking/${appointmentId}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: profile?.email
        })
      })
      
      const data = await response.json()
      
      if (response.ok && data.success) {
        // Refresh appointments
        const patientEmail = sessionStorage.getItem('patientEmail')
        if (patientEmail) {
          fetchDashboardData(patientEmail)
        }
      } else {
        setCancelError(data.message || 'Failed to cancel appointment')
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error)
      setCancelError('Failed to cancel appointment')
    } finally {
      setCancellingId(null)
    }
  }

  const handleNewAppointment = () => {
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
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin text-4xl">⏳</div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-white flex flex-col"
    >
      {/* Header - Sticky like admin dashboard */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <img src="/logo-full.svg" alt="Nuwendo Metabolic Clinic" className="h-12" />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
          <div className="inline-flex bg-gray-100 rounded-full p-1 my-4">
            {(['home', 'services', ...(hasShopAccess ? ['shop' as const] : []), 'account'] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  activeTab === tab
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'home' && (
          <div className="space-y-8">
            {/* Welcome Message */}
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Welcome back{profile?.first_name ? `, ${profile.first_name}` : ''}
              </h1>
            </div>

            {/* Explore Card */}
            <div 
              onClick={handleNewAppointment}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-800 to-brand-600 p-6 cursor-pointer hover:shadow-lg transition-shadow"
            >
              <div className="relative z-10">
                <h2 className="text-xl font-semibold text-white mb-1">Explore your options</h2>
                <p className="text-white/80 text-sm mb-4">
                  See why thousands of Filipinos<br />
                  choose Nuwendo for their journey
                </p>
                <Button 
                  variant="secondary" 
                  className="bg-white text-gray-900 hover:bg-gray-100"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleNewAppointment()
                  }}
                >
                  Get Started
                </Button>
              </div>
              {/* Decorative image placeholder */}
              <div className="absolute right-4 bottom-0 w-32 h-32 opacity-50">
                <div className="w-full h-full bg-white/20 rounded-full" />
              </div>
            </div>

            {/* Recent Treatments */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Recent Treatments</h2>
                {appointments.length > 0 && (
                  <button 
                    onClick={() => setActiveTab('services')}
                    className="text-sm text-brand hover:underline"
                  >
                    View all
                  </button>
                )}
              </div>

              {appointments.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-gray-500">No services booked yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {appointments.slice(0, 3).map((apt) => (
                    <div
                      key={apt.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-brand" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{apt.service_name}</h3>
                          <p className="text-sm text-gray-500">
                            {formatDate(apt.booking_date)} at {formatTime(apt.booking_time)} - {formatTime(getEndTime(apt.booking_time, apt.duration_minutes || 30))}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                          apt.status === 'confirmed' 
                            ? 'bg-green-100 text-green-700' 
                            : apt.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {apt.status}
                        </span>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-gray-900">Your Services</h1>
            
            {cancelError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-red-600">{cancelError}</p>
              </div>
            )}
            
            {appointments.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-500">No services booked yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {appointments.map((apt) => {
                  const isCancellable = apt.status !== 'cancelled' && canCancelAppointment(apt.booking_date, apt.booking_time)
                  const isCancelling = cancellingId === apt.id
                  
                  return (
                    <div
                      key={apt.id}
                      className="p-4 border border-gray-200 rounded-xl"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-brand" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{apt.service_name}</h3>
                            <p className="text-sm text-gray-500">
                              {formatDate(apt.booking_date)} at {formatTime(apt.booking_time)} - {formatTime(getEndTime(apt.booking_time, apt.duration_minutes || 30))}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                            apt.status === 'confirmed' 
                              ? 'bg-green-100 text-green-700' 
                              : apt.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : apt.status === 'cancelled'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {apt.status}
                          </span>
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                            apt.appointment_type === 'online'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-purple-100 text-purple-700'
                          }`}>
                            {apt.appointment_type}
                          </span>
                        </div>
                      </div>
                      
                      {/* Meeting Link for confirmed online appointments */}
                      {apt.appointment_type === 'online' && apt.status === 'confirmed' && apt.video_call_link && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <Video className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 mb-1">🎥 Video Consultation Link</p>
                              <a
                                href={apt.video_call_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:text-blue-700 hover:underline break-all flex items-center gap-1"
                              >
                                {apt.video_call_link}
                                <ExternalLink className="w-3 h-3 flex-shrink-0" />
                              </a>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Cancel button - only show if 24+ hours before */}
                      {apt.status !== 'cancelled' && (
                        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                          {isCancellable ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancelAppointment(apt.id)}
                              disabled={isCancelling}
                              className="text-red-600 border-red-200 hover:bg-red-50"
                            >
                              {isCancelling ? (
                                <>
                                  <span className="animate-spin mr-2">⏳</span>
                                  Cancelling...
                                </>
                              ) : (
                                <>
                                  <X className="w-4 h-4 mr-2" />
                                  Cancel Appointment
                                </>
                              )}
                            </Button>
                          ) : (
                            <p className="text-sm text-gray-400">
                              Cancellation not available (less than 24 hours before appointment)
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'shop' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-gray-900">Shop</h1>
            <p className="text-gray-600">Browse and purchase available products</p>
            
            {shopItems.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-500">No items available at the moment.</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {shopItems.map((item) => (
                  <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardContent className="p-0">
                      {item.image_url && (
                        <div className="h-48 bg-gray-100 overflow-hidden">
                          <img 
                            src={item.image_url} 
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                        {item.category && (
                          <p className="text-xs text-gray-500 mb-2">{item.category}</p>
                        )}
                        {item.description && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-brand">
                            ₱{parseFloat(item.price).toLocaleString()}
                          </span>
                          <span className="text-sm text-gray-500">
                            Stock: {item.stock_quantity}
                          </span>
                        </div>
                        <Button 
                          className="w-full mt-3 bg-brand hover:bg-brand/90"
                          disabled={item.stock_quantity === 0}
                        >
                          {item.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'account' && (
          <div className="space-y-6">
            {/* About You */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">About You</CardTitle>
                {!isEditingProfile ? (
                  <Button variant="outline" size="sm" onClick={startEditingProfile}>
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setIsEditingProfile(false)}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="bg-brand hover:bg-brand-600"
                    >
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Check className="w-4 h-4 mr-2" />
                      )}
                      Save
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditingProfile ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-900">First Name</label>
                      <Input
                        value={editForm.firstName}
                        onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-900">Last Name</label>
                      <Input
                        value={editForm.lastName}
                        onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-900">Email</label>
                      <p className="text-brand mt-1">{profile?.email || '-'}</p>
                      <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-900">Phone</label>
                      <Input
                        value={editForm.phone}
                        onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-900">Age</label>
                      <Input
                        value={editForm.age}
                        onChange={(e) => setEditForm(prev => ({ ...prev, age: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-900">City / Address</label>
                      <Input
                        value={editForm.cityAddress}
                        onChange={(e) => setEditForm(prev => ({ ...prev, cityAddress: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-900">Height (cm)</label>
                      <Input
                        value={editForm.height}
                        onChange={(e) => setEditForm(prev => ({ ...prev, height: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-900">Weight (kg)</label>
                      <Input
                        value={editForm.weight}
                        onChange={(e) => setEditForm(prev => ({ ...prev, weight: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-sm font-medium text-gray-900">Reason for Consultation</label>
                      <Textarea
                        value={editForm.reasonForConsult}
                        onChange={(e) => setEditForm(prev => ({ ...prev, reasonForConsult: e.target.value }))}
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-900">Name</label>
                        <p className="text-gray-600">
                          {profile?.first_name && profile?.last_name 
                            ? `${profile.first_name} ${profile.last_name}` 
                            : '-'}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-900">Email</label>
                        <p className="text-brand">{profile?.email || '-'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-900">Phone</label>
                        <p className="text-gray-600">{profile?.phone || '-'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-900">Age</label>
                        <p className="text-gray-600">{profile?.age || '-'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-900">City / Address</label>
                        <p className="text-gray-600">{profile?.cityAddress || '-'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-900">Height</label>
                        <p className="text-gray-600">{profile?.height ? `${profile.height} cm` : '-'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-900">Weight</label>
                        <p className="text-gray-600">{profile?.weight ? `${profile.weight} kg` : '-'}</p>
                      </div>
                    </div>
                    {profile?.reasonForConsult && (
                      <div>
                        <label className="text-sm font-medium text-gray-900">Reason for Consultation</label>
                        <p className="text-gray-600">{profile.reasonForConsult}</p>
                      </div>
                    )}
                    {profile?.healthGoals && profile.healthGoals.length > 0 && (
                      <div>
                        <label className="text-sm font-medium text-gray-900">Health Goals</label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {profile.healthGoals.map((goal, index) => (
                            <span 
                              key={index}
                              className="px-3 py-1 bg-brand-100 text-brand-800 rounded-full text-sm"
                            >
                              {goal}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Default Address */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Default Address</CardTitle>
                {!isEditingAddress ? (
                  <Button variant="outline" size="sm" onClick={startEditingAddress}>
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setIsEditingAddress(false)}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="bg-brand hover:bg-brand-600"
                    >
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Check className="w-4 h-4 mr-2" />
                      )}
                      Save
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {isEditingAddress ? (
                  <div>
                    <label className="text-sm font-medium text-gray-900">Address</label>
                    <Textarea
                      value={editForm.cityAddress}
                      onChange={(e) => setEditForm(prev => ({ ...prev, cityAddress: e.target.value }))}
                      className="mt-1"
                      rows={3}
                      placeholder="Enter your full address"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="text-sm font-medium text-gray-900">Address</label>
                    <p className="text-gray-600 mt-1">{profile?.cityAddress || 'No address saved yet.'}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Logout Button */}
            <Button 
              onClick={handleLogout}
              className="w-full sm:w-auto bg-gray-900 hover:bg-gray-800"
            >
              Log out <LogOut className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-start mb-8">
            <div>
              <img src="/logo-full.svg" alt="Nuwendo" className="h-14 brightness-0 invert mb-4" />
            </div>
            <p className="text-lg text-white/90">Your health always comes first</p>
          </div>
          
          <div className="border-t border-gray-800 pt-8 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-4">Pages</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-brand hover:text-brand-300">About Us</a></li>
                <li><a href="#" className="text-brand hover:text-brand-300">Health Club</a></li>
                <li><a href="#" className="text-brand hover:text-brand-300">FAQs</a></li>
                <li><a href="#" className="text-brand hover:text-brand-300">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-4">Learn</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-brand hover:text-brand-300">Weight Loss</a></li>
                <li><a href="#" className="text-brand hover:text-brand-300">Metabolic Health</a></li>
                <li><a href="#" className="text-brand hover:text-brand-300">Nutrition</a></li>
              </ul>
            </div>
            <div className="col-span-2 md:col-span-2 md:text-right">
              <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-4">Contact Us</h4>
              <p className="text-brand text-sm">hello@nuwendo.com</p>
              <p className="text-brand text-sm flex items-center md:justify-end gap-2 mt-2">
                <Phone className="w-4 h-4" />
                (02) 8888-NUWE
              </p>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
            <div className="flex gap-4 mb-4 md:mb-0">
              <a href="#">Terms & Conditions</a>
              <a href="#">Privacy Policy</a>
            </div>
            <p>© 2026 Nuwendo Metabolic Clinic. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </motion.div>
  )
}

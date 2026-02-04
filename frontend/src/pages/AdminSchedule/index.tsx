import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Clock, 
  Save,
  X,
  ToggleLeft,
  ToggleRight,
  Monitor,
  Building2,
  Info,
  Loader2
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AdminLayout } from '@/components/AdminLayout'

const API_URL = 'http://localhost:5000/api'

interface WorkingHours {
  id: number
  day_of_week: number
  start_time: string
  end_time: string
  appointment_type: 'online' | 'on-site'
  slot_interval_minutes: number
  is_active: boolean
  created_at: string
  updated_at: string | null
  created_by_name: string | null
  updated_by_name: string | null
}

export function AdminSchedule() {
  const navigate = useNavigate()
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingHours, setEditingHours] = useState<WorkingHours | null>(null)
  const [formData, setFormData] = useState({
    day_of_week: 1,
    start_time: '07:30',
    end_time: '17:30',
    appointment_type: 'online' as 'online' | 'on-site',
    slot_interval_minutes: 30,
    is_active: true
  })

  const dayNames = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ]

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      navigate('/admin/login')
      return
    }
    fetchWorkingHours()
  }, [navigate])

  const fetchWorkingHours = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`${API_URL}/admin/time-slots`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      
      if (!response.ok) {
        if (response.status === 401) {
          navigate('/admin/login')
          return
        }
        throw new Error(data.message || 'Failed to fetch working hours')
      }

      setWorkingHours(data.timeSlots)
    } catch (err: any) {
      setError(err.message || 'Failed to load working hours')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate times
    if (formData.start_time >= formData.end_time) {
      setError('End time must be after start time')
      return
    }

    // Check if this day already has a different appointment type (only when creating new hours)
    if (!editingHours) {
      const existingType = getDayAppointmentType(formData.day_of_week)
      if (existingType && existingType !== formData.appointment_type) {
        setError(`This day is already set to ${existingType}. Each day can only have one appointment type. Please delete the existing schedule first.`)
        return
      }
    }

    try {
      const token = localStorage.getItem('adminToken')
      const url = editingHours 
        ? `${API_URL}/admin/time-slots/${editingHours.id}`
        : `${API_URL}/admin/time-slots`
      
      const method = editingHours ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to save working hours')
      }

      await fetchWorkingHours()
      resetForm()
    } catch (err: any) {
      setError(err.message || 'Failed to save working hours')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete these working hours?')) {
      return
    }

    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`${API_URL}/admin/time-slots/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete working hours')
      }

      await fetchWorkingHours()
    } catch (err: any) {
      setError(err.message || 'Failed to delete working hours')
    }
  }

  const handleToggleActive = async (hours: WorkingHours) => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`${API_URL}/admin/time-slots/${hours.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...hours,
          is_active: !hours.is_active
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update working hours')
      }

      await fetchWorkingHours()
    } catch (err: any) {
      setError(err.message || 'Failed to update working hours')
    }
  }

  const resetForm = () => {
    setFormData({
      day_of_week: 1,
      start_time: '07:30',
      end_time: '17:30',
      appointment_type: 'online',
      slot_interval_minutes: 30,
      is_active: true
    })
    setEditingHours(null)
    setShowForm(false)
  }

  const startEdit = (hours: WorkingHours) => {
    setFormData({
      day_of_week: hours.day_of_week,
      start_time: hours.start_time,
      end_time: hours.end_time,
      appointment_type: hours.appointment_type,
      slot_interval_minutes: hours.slot_interval_minutes,
      is_active: hours.is_active
    })
    setEditingHours(hours)
    setShowForm(true)
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  // Calculate number of slots generated
  const calculateSlots = (startTime: string, endTime: string, intervalMinutes: number = 30) => {
    const [startHours, startMinutes] = startTime.split(':').map(Number)
    const [endHours, endMinutes] = endTime.split(':').map(Number)
    
    const startTotalMinutes = startHours * 60 + startMinutes
    const endTotalMinutes = endHours * 60 + endMinutes
    
    const durationMinutes = endTotalMinutes - startTotalMinutes
    return Math.floor(durationMinutes / intervalMinutes)
  }

  // Get the appointment type for a specific day
  const getDayAppointmentType = (dayIndex: number): 'online' | 'on-site' | null => {
    const dayHours = hoursByDay[dayIndex]?.find(h => h.is_active)
    return dayHours?.appointment_type || null
  }

  // Group working hours by day
  const hoursByDay = workingHours.reduce((acc, hours) => {
    if (!acc[hours.day_of_week]) {
      acc[hours.day_of_week] = []
    }
    acc[hours.day_of_week].push(hours)
    return acc
  }, {} as Record<number, WorkingHours[]>)

  // Sort days to show Monday-Sunday
  const sortedDays = [1, 2, 3, 4, 5, 6, 0]

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="min-h-[80vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-brand" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Schedule</h1>
            <p className="text-gray-500">Set working hours for each day</p>
          </div>
          <Button onClick={() => setShowForm(true)} disabled={showForm} className="bg-brand hover:bg-brand/90">
            <Plus className="h-4 w-4 mr-2" />
            Add Working Hours
          </Button>
        </div>
        {error && (
          <div className="p-4 mb-6 text-red-600 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}

        {/* Info banner */}
        <div className="p-4 mb-6 bg-blue-50 border border-blue-200 rounded-md flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium">How it works:</p>
            <p>Set start and end times for each day, and the system automatically generates 30-minute appointment slots. Each day can only have one appointment type (online or on-site).</p>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{editingHours ? 'Edit Working Hours' : 'Add Working Hours'}</CardTitle>
              <CardDescription>
                {editingHours ? 'Update working hours for this day' : 'Set working hours for a specific day'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="day">Day of Week *</Label>
                    <select
                      id="day"
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
                      value={formData.day_of_week}
                      onChange={(e) => setFormData({...formData, day_of_week: parseInt(e.target.value)})}
                      required
                    >
                      {dayNames.map((name, index) => (
                        <option key={index} value={index}>{name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="start_time">Start Time *</Label>
                    <Input
                      id="start_time"
                      type="time"
                      value={formData.start_time}
                      onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="end_time">End Time *</Label>
                    <Input
                      id="end_time"
                      type="time"
                      value={formData.end_time}
                      onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Will create {calculateSlots(formData.start_time, formData.end_time, formData.slot_interval_minutes)} slots
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="block mb-2">Appointment Type *</Label>
                  {getDayAppointmentType(formData.day_of_week) && getDayAppointmentType(formData.day_of_week) !== formData.appointment_type && !editingHours && (
                    <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-900 flex items-start gap-2">
                      <Info className="h-4 w-4 mt-0.5" />
                      <span>This day is already set to <strong>{getDayAppointmentType(formData.day_of_week)}</strong>. Each day can only have one appointment type.</span>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, appointment_type: 'online'})}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        formData.appointment_type === 'online'
                          ? 'border-brand bg-brand-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Monitor className={`h-5 w-5 ${formData.appointment_type === 'online' ? 'text-brand' : 'text-gray-400'}`} />
                        <span className="font-medium">Online Only</span>
                      </div>
                      <p className="text-xs text-gray-600">For virtual consultations</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({...formData, appointment_type: 'on-site'})}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        formData.appointment_type === 'on-site'
                          ? 'border-brand bg-brand-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Building2 className={`h-5 w-5 ${formData.appointment_type === 'on-site' ? 'text-brand' : 'text-gray-400'}`} />
                        <span className="font-medium">On-Site Only</span>
                      </div>
                      <p className="text-xs text-gray-600">For in-person appointments</p>
                    </button>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button type="submit">
                    <Save className="h-4 w-4 mr-2" />
                    {editingHours ? 'Update' : 'Create'} Working Hours
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Working Hours by Day */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedDays.map((dayIndex) => {
            const dayHours = hoursByDay[dayIndex] || []
            const activeDayHours = dayHours.filter(h => h.is_active)
            
            return (
              <Card key={dayIndex}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-brand" />
                      <CardTitle className="text-lg">{dayNames[dayIndex]}</CardTitle>
                    </div>
                    <span className="text-sm text-gray-500">
                      {activeDayHours.length} type{activeDayHours.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {dayHours.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No hours set</p>
                  ) : (
                    dayHours.map((hours) => (
                      <div
                        key={hours.id}
                        className={`p-4 rounded-lg border-2 ${
                          hours.is_active ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50 opacity-60'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {hours.appointment_type === 'online' ? (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                <Monitor className="h-3 w-3 mr-1" />
                                Online
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <Building2 className="h-3 w-3 mr-1" />
                                On-Site
                              </Badge>
                            )}
                            <Badge variant="outline" className={hours.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}>
                              {hours.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </div>

                        <div className="text-sm font-medium text-gray-900 mb-1">
                          {formatTime(hours.start_time)} - {formatTime(hours.end_time)}
                        </div>

                        <div className="text-xs text-gray-500 mb-3">
                          {calculateSlots(hours.start_time, hours.end_time, hours.slot_interval_minutes)} slots × {hours.slot_interval_minutes}min
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleActive(hours)}
                            className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900"
                            title={hours.is_active ? 'Deactivate' : 'Activate'}
                          >
                            {hours.is_active ? (
                              <ToggleRight className="h-4 w-4 text-green-600" />
                            ) : (
                              <ToggleLeft className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                          <button
                            onClick={() => startEdit(hours)}
                            className="flex items-center gap-1 text-xs text-gray-600 hover:text-brand"
                          >
                            <Edit className="h-4 w-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(hours.id)}
                            className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminSchedule

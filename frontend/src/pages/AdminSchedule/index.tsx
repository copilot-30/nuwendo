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
  ArrowLeft, 
  Clock, 
  Save,
  X,
  ToggleLeft,
  ToggleRight,
  Monitor,
  Building2
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const API_URL = 'http://localhost:5000/api'

interface TimeSlot {
  id: number
  day_of_week: number
  start_time: string
  end_time: string
  appointment_type: 'online' | 'on-site'
  is_active: boolean
  created_at: string
  updated_at: string | null
  created_by_name: string | null
  updated_by_name: string | null
}

export function AdminSchedule() {
  const navigate = useNavigate()
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null)
  const [formData, setFormData] = useState({
    day_of_week: 1,
    start_time: '09:00',
    end_time: '10:00',
    appointment_type: 'on-site' as 'online' | 'on-site',
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
    fetchTimeSlots()
  }, [navigate])

  // Auto-calculate end_time based on appointment type:
  // ON-SITE: Always 60 minutes (1 hour)
  // ONLINE: Always 30 minutes (services needing 60 mins will book 2 consecutive slots)
  useEffect(() => {
    if (formData.start_time) {
      const [hours, minutes] = formData.start_time.split(':').map(Number)
      const durationMinutes = formData.appointment_type === 'on-site' ? 60 : 30
      const totalMinutes = hours * 60 + minutes + durationMinutes
      const endHours = Math.floor(totalMinutes / 60) % 24
      const endMinutes = totalMinutes % 60
      const endTime = `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`
      if (formData.end_time !== endTime) {
        setFormData(prev => ({ ...prev, end_time: endTime }))
      }
    }
  }, [formData.start_time, formData.appointment_type])

  const fetchTimeSlots = async () => {
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
        throw new Error(data.message || 'Failed to fetch time slots')
      }

      setTimeSlots(data.timeSlots)
    } catch (err: any) {
      setError(err.message || 'Failed to load time slots')
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

    try {
      const token = localStorage.getItem('adminToken')
      const url = editingSlot 
        ? `${API_URL}/admin/time-slots/${editingSlot.id}`
        : `${API_URL}/admin/time-slots`
      
      const method = editingSlot ? 'PUT' : 'POST'

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
        throw new Error(data.message || 'Failed to save time slot')
      }

      await fetchTimeSlots()
      resetForm()
    } catch (err: any) {
      setError(err.message || 'Failed to save time slot')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this time slot?')) {
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
        throw new Error(data.message || 'Failed to delete time slot')
      }

      await fetchTimeSlots()
    } catch (err: any) {
      setError(err.message || 'Failed to delete time slot')
    }
  }

  const handleToggleActive = async (slot: TimeSlot) => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`${API_URL}/admin/time-slots/${slot.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...slot,
          is_active: !slot.is_active
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update time slot')
      }

      await fetchTimeSlots()
    } catch (err: any) {
      setError(err.message || 'Failed to update time slot')
    }
  }

  const resetForm = () => {
    setFormData({
      day_of_week: 1,
      start_time: '09:00',
      end_time: '10:00',
      appointment_type: 'on-site',
      is_active: true
    })
    setEditingSlot(null)
    setShowForm(false)
  }

  const startEdit = (slot: TimeSlot) => {
    setFormData({
      day_of_week: slot.day_of_week,
      start_time: slot.start_time,
      end_time: slot.end_time,
      appointment_type: slot.appointment_type,
      is_active: slot.is_active
    })
    setEditingSlot(slot)
    setShowForm(true)
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  // Get the appointment type for a specific day (all slots on a day must match)
  const getDayAppointmentType = (dayIndex: number): 'online' | 'on-site' | null => {
    const daySlotsActive = slotsByDay[dayIndex]?.filter(s => s.is_active)
    if (daySlotsActive && daySlotsActive.length > 0) {
      return daySlotsActive[0].appointment_type
    }
    return null
  }

  // Group slots by day
  const slotsByDay = timeSlots.reduce((acc, slot) => {
    if (!acc[slot.day_of_week]) {
      acc[slot.day_of_week] = []
    }
    acc[slot.day_of_week].push(slot)
    return acc
  }, {} as Record<number, TimeSlot[]>)

  // Sort slots within each day
  Object.keys(slotsByDay).forEach(day => {
    slotsByDay[parseInt(day)].sort((a, b) => a.start_time.localeCompare(b.start_time))
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Loading schedule...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin/dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Manage Schedule</h1>
                <p className="text-sm text-gray-500">Configure available appointment times</p>
              </div>
            </div>
            <Button onClick={() => setShowForm(true)} disabled={showForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Time Slot
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="p-4 mb-6 text-red-600 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}

        {/* Time Slot Form */}
        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{editingSlot ? 'Edit Time Slot' : 'Add New Time Slot'}</CardTitle>
              <CardDescription>
                {editingSlot ? 'Update time slot information' : 'Create a new available time slot'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="day_of_week">Day of Week *</Label>
                    <select
                      id="day_of_week"
                      value={formData.day_of_week}
                      onChange={(e) => setFormData({...formData, day_of_week: parseInt(e.target.value)})}
                      required
                      className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {dayNames.map((day, index) => (
                        <option key={index} value={index}>{day}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="start_time">Start Time *</Label>
                    <Input
                      id="start_time"
                      type="time"
                      value={formData.start_time}
                      onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end_time">
                      End Time (Auto: {formData.appointment_type === 'on-site' ? '60 min' : '30 min'})
                    </Label>
                    <Input
                      id="end_time"
                      type="time"
                      value={formData.end_time}
                      disabled
                      className="bg-gray-100"
                      title={formData.appointment_type === 'on-site' 
                        ? 'On-site slots are always 60 minutes' 
                        : 'Online slots are always 30 minutes (60 min services book 2 slots)'}
                    />
                    <p className="text-xs text-gray-500">
                      {formData.appointment_type === 'on-site' 
                        ? 'On-site: 60 min per slot' 
                        : 'Online: 30 min per slot (60 min services use 2 consecutive slots)'}
                    </p>
                  </div>
                </div>

                {/* Appointment Type Selection */}
                <div className="space-y-2">
                  <Label>Appointment Type *</Label>
                  {(() => {
                    const existingType = getDayAppointmentType(formData.day_of_week)
                    return existingType && !editingSlot ? (
                      <div className="mb-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                          ℹ️ This day is already set to <strong>{existingType}</strong>. All slots must match.
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-amber-600 mb-2">
                        ⚠️ All time slots on the same day must have the same appointment type
                      </p>
                    )
                  })()}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, appointment_type: 'online'})}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                        formData.appointment_type === 'online'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Monitor className="h-5 w-5" />
                      <span className="font-medium">Online Only</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, appointment_type: 'on-site'})}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                        formData.appointment_type === 'on-site'
                          ? 'border-brand bg-brand-50 text-brand'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Building2 className="h-5 w-5" />
                      <span className="font-medium">On-Site Only</span>
                    </button>
                  </div>
                  <p className="text-sm text-gray-500">
                    {formData.appointment_type === 'online' && 'This slot will only be available for online appointments'}
                    {formData.appointment_type === 'on-site' && 'This slot will only be available for on-site appointments'}
                  </p>
                </div>

                {editingSlot && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="is_active">Active (available for booking)</Label>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button type="submit">
                    <Save className="h-4 w-4 mr-2" />
                    {editingSlot ? 'Update Time Slot' : 'Create Time Slot'}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Schedule Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {[1, 2, 3, 4, 5, 6].map((dayIndex) => (
            <Card key={dayIndex}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  {dayNames[dayIndex]}
                </CardTitle>
                <CardDescription>
                  {slotsByDay[dayIndex]?.length || 0} time slots
                </CardDescription>
              </CardHeader>
              <CardContent>
                {slotsByDay[dayIndex] && slotsByDay[dayIndex].length > 0 ? (
                  <div className="space-y-3">
                    {slotsByDay[dayIndex].map((slot) => (
                      <div 
                        key={slot.id} 
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          slot.is_active ? 'bg-gray-50' : 'bg-gray-100 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-medium">
                              {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge 
                                variant={slot.is_active ? "default" : "secondary"}
                                className="text-xs"
                              >
                                {slot.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                              {slot.appointment_type === 'online' && (
                                <Badge className="text-xs bg-blue-500">
                                  <Monitor className="h-3 w-3 mr-1" />
                                  Online
                                </Badge>
                              )}
                              {slot.appointment_type === 'on-site' && (
                                <Badge className="text-xs bg-brand">
                                  <Building2 className="h-3 w-3 mr-1" />
                                  On-Site
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleActive(slot)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {slot.is_active ? (
                              <ToggleRight className="h-5 w-5 text-brand" />
                            ) : (
                              <ToggleLeft className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => startEdit(slot)}
                            disabled={showForm}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDelete(slot.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No time slots configured</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2" 
                      onClick={() => {
                        setFormData({...formData, day_of_week: dayIndex})
                        setShowForm(true)
                      }}
                      disabled={showForm}
                    >
                      Add Slot
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {timeSlots.length === 0 && !showForm && (
          <div className="text-center py-12">
            <Clock className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 mb-4">No time slots configured</p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Time Slot
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
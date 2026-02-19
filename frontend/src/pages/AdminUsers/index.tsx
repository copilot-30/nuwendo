import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Users, Search, Mail, Phone, Calendar, 
  ChevronLeft, ChevronRight, User, X, FileText, Target, Activity, Loader2
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { AdminLayout } from '@/components/AdminLayout'
import { API_URL } from '@/config/api'

interface UserData {
  id: number
  email: string
  first_name: string
  last_name: string
  role: string
  is_verified: boolean
  created_at: string
  updated_at: string
  phone_number: string | null
  date_of_birth: string | null
  gender: string | null
  booking_count: number
  last_booking: string | null
}

interface PatientProfile {
  id: number
  email: string
  first_name: string
  last_name: string
  phone_number: string
  date_of_birth: string
  gender: string
  address: string
  medical_conditions: string
  allergies: string
  created_at: string
  bookings: Array<{
    id: number
    booking_date: string
    booking_time: string
    status: string
    service_name: string
    amount_paid: number
  }>
}

interface Pagination {
  current_page: number
  total_pages: number
  total_records: number
  per_page: number
}

export function AdminUsers() {
  const navigate = useNavigate()
  const [users, setUsers] = useState<UserData[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<PatientProfile | null>(null)
  const [isLoadingPatient, setIsLoadingPatient] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      navigate('/login')
      return
    }
    fetchUsers()
  }, [navigate])

  const fetchUsers = async (page = 1, search = searchQuery) => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem('adminToken')
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (search) params.append('search', search)

      const response = await fetch(`${API_URL}/admin/users?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          navigate('/login')
          return
        }
        throw new Error(data.message || 'Failed to fetch users')
      }

      setUsers(data.users)
      setPagination(data.pagination)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load users')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchPatientProfile = async (email: string) => {
    setIsLoadingPatient(true)
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`${API_URL}/admin/patients/${encodeURIComponent(email)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Failed to fetch patient')
      setSelectedPatient(data.patient)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load patient')
    } finally {
      setIsLoadingPatient(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchUsers(1, searchQuery)
  }

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const formatTime = (time: string) => { const [h, m] = time.split(':'); const hr = parseInt(h); return (hr % 12 || 12) + ':' + m + ' ' + (hr >= 12 ? 'PM' : 'AM') }
  const formatPrice = (price: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0 }).format(price)
  const getStatusColor = (s: string) => s === 'confirmed' ? 'bg-green-100 text-green-700' : s === 'pending' ? 'bg-yellow-100 text-yellow-700' : s === 'completed' ? 'bg-blue-100 text-blue-700' : s === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'

  if (isLoading && users.length === 0) {
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
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500">
            {pagination ? `${pagination.total_records} total users` : 'Loading...'}
          </p>
        </div>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 mb-6 text-red-600 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between"
          >
            <span>{error}</span>
            <button onClick={() => setError('')}><X className="h-4 w-4" /></button>
          </motion.div>
        )}

        {/* Search */}
        <Card className="mb-6 border-0 shadow-md">
          <CardContent className="p-4">
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit" className="bg-brand hover:bg-brand-600">Search</Button>
            </form>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="border-0 shadow-md">
          <CardHeader className="border-b bg-gray-50/50">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-brand" />
              All Users
            </CardTitle>
            <CardDescription>Click on a user to view their full profile</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {users.length > 0 ? (
              <div className="divide-y">
                {users.map((user) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => fetchPatientProfile(user.email)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center">
                        <span className="text-brand font-semibold text-lg">
                          {user.first_name?.[0] || user.email[0].toUpperCase()}
                          {user.last_name?.[0] || ''}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-medium text-gray-900">
                            {user.first_name && user.last_name 
                              ? `${user.first_name} ${user.last_name}` 
                              : user.email}
                          </p>
                          <Badge variant={user.is_verified ? 'default' : 'secondary'} className="text-xs">
                            {user.is_verified ? 'Verified' : 'Unverified'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </span>
                          {user.phone_number && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {user.phone_number}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{user.booking_count} bookings</p>
                      <p className="text-xs text-gray-500">
                        Joined {formatDate(user.created_at)}
                      </p>
                      {user.last_booking && (
                        <p className="text-xs text-brand">
                          Last: {formatDate(user.last_booking)}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No users found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {pagination && pagination.total_pages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-gray-600">
              Showing page {pagination.current_page} of {pagination.total_pages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.current_page === 1}
                onClick={() => fetchUsers(pagination.current_page - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.current_page === pagination.total_pages}
                onClick={() => fetchUsers(pagination.current_page + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Patient Profile Modal */}
      <AnimatePresence>
        {(selectedPatient || isLoadingPatient) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedPatient(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {isLoadingPatient ? (
                <div className="p-12 text-center">
                  <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Loading profile...</p>
                </div>
              ) : selectedPatient && (
                <>
                  <div className="bg-gradient-to-r from-brand to-brand-600 p-6 text-white">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                          <User className="w-8 h-8" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold">{selectedPatient.first_name} {selectedPatient.last_name}</h2>
                          <p className="text-white/80">Patient since {formatDate(selectedPatient.created_at)}</p>
                        </div>
                      </div>
                      <button onClick={() => setSelectedPatient(null)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <div className="p-6 overflow-y-auto max-h-[60vh]">
                    {(() => {
                      let details: { age?: string; height?: string; weight?: string; reasonForConsult?: string; healthGoals?: string[] } = {}
                      try { if (selectedPatient.medical_conditions) details = JSON.parse(selectedPatient.medical_conditions) } catch {}
                      return (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                          {details.age && (
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                              <User className="h-5 w-5 text-gray-400" />
                              <div>
                                <p className="text-xs text-gray-500">Age</p>
                                <p className="font-medium text-sm">{details.age} years old</p>
                              </div>
                            </div>
                          )}
                          {details.height && (
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                              <Activity className="h-5 w-5 text-gray-400" />
                              <div>
                                <p className="text-xs text-gray-500">Height</p>
                                <p className="font-medium text-sm">{details.height} cm</p>
                              </div>
                            </div>
                          )}
                          {details.weight && (
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                              <Activity className="h-5 w-5 text-gray-400" />
                              <div>
                                <p className="text-xs text-gray-500">Weight</p>
                                <p className="font-medium text-sm">{details.weight} kg</p>
                              </div>
                            </div>
                          )}
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                            <Mail className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">Email</p>
                              <p className="font-medium text-sm">{selectedPatient.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                            <Phone className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">Phone</p>
                              <p className="font-medium text-sm">{selectedPatient.phone_number || 'Not provided'}</p>
                            </div>
                          </div>
                          {selectedPatient.address && (
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl sm:col-span-2">
                              <Calendar className="h-5 w-5 text-gray-400" />
                              <div>
                                <p className="text-xs text-gray-500">Address</p>
                                <p className="font-medium text-sm">{selectedPatient.address}</p>
                              </div>
                            </div>
                          )}
                          {details.reasonForConsult && (
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl sm:col-span-2">
                              <FileText className="h-5 w-5 text-gray-400" />
                              <div>
                                <p className="text-xs text-gray-500">Reason for Consultation</p>
                                <p className="font-medium text-sm">{details.reasonForConsult}</p>
                              </div>
                            </div>
                          )}
                          {details.healthGoals && details.healthGoals.length > 0 && (
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl sm:col-span-2">
                              <Target className="h-5 w-5 text-gray-400" />
                              <div>
                                <p className="text-xs text-gray-500">Health Goals</p>
                                <p className="font-medium text-sm">{details.healthGoals.join(', ')}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })()}
                    <h3 className="font-semibold text-gray-900 mb-3">Booking History</h3>
                    {selectedPatient.bookings && selectedPatient.bookings.length > 0 ? (
                      <div className="space-y-2">
                        {selectedPatient.bookings.map((b) => (
                          <div key={b.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <div>
                              <p className="font-medium text-sm">{b.service_name}</p>
                              <p className="text-xs text-gray-500">{formatDate(b.booking_date)} at {formatTime(b.booking_time)}</p>
                            </div>
                            <div className="text-right">
                              <Badge className={getStatusColor(b.status)}>{b.status}</Badge>
                              <p className="text-xs text-gray-500 mt-1">{formatPrice(b.amount_paid)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No booking history</p>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  )
}

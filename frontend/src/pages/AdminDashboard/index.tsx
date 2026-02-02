import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, DollarSign, Settings, LogOut, Bell, Activity, FileText, Users, X, Mail, Phone, MapPin, User, ChevronRight, TrendingUp, CreditCard, Target } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const API_URL = 'http://localhost:5000/api'

interface DashboardStats {
  totalBookings: number
  todayAppointments: number
  thisWeekAppointments: number
  monthlyRevenue: number
  recentBookings: Array<{
    id: number
    booking_date: string
    booking_time: string
    status: string
    amount_paid: number
    first_name: string
    last_name: string
    email: string
    phone_number: string
    service_name: string
    appointment_type: string
  }>
}

interface AdminUser {
  id: number
  username: string
  email: string
  full_name: string
  role: string
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
  current_medications: string
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

export function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<PatientProfile | null>(null)
  const [isLoadingPatient, setIsLoadingPatient] = useState(false)

  useEffect(() => {
    const adminData = localStorage.getItem('adminUser')
    if (adminData) {
      setAdminUser(JSON.parse(adminData))
    } else {
      navigate('/admin/login')
      return
    }
    fetchDashboardStats()
  }, [navigate])

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      if (!token) { navigate('/admin/login'); return }
      const response = await fetch(API_URL + '/admin/auth/dashboard/stats', { headers: { 'Authorization': 'Bearer ' + token } })
      const data = await response.json()
      if (!response.ok) {
        if (response.status === 401) { handleLogout(); return }
        throw new Error(data.message || 'Failed to fetch stats')
      }
      setStats(data.stats)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchPatientProfile = async (email: string) => {
    setIsLoadingPatient(true)
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(API_URL + '/admin/patients/' + encodeURIComponent(email), { headers: { 'Authorization': 'Bearer ' + token } })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Failed to fetch patient')
      setSelectedPatient(data.patient)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load patient')
    } finally {
      setIsLoadingPatient(false)
    }
  }

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      if (token) { await fetch(API_URL + '/admin/auth/logout', { method: 'POST', headers: { 'Authorization': 'Bearer ' + token } }) }
    } catch { /* continue */ }
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    navigate('/admin/login')
  }

  const formatPrice = (price: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0 }).format(price)
  const formatTime = (time: string) => { const [h, m] = time.split(':'); const hr = parseInt(h); return (hr % 12 || 12) + ':' + m + ' ' + (hr >= 12 ? 'PM' : 'AM') }
  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const formatDateShort = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const getStatusColor = (s: string) => s === 'confirmed' ? 'bg-green-100 text-green-700' : s === 'pending' ? 'bg-yellow-100 text-yellow-700' : s === 'completed' ? 'bg-blue-100 text-blue-700' : s === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'

  if (isLoading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <img src="/logo-full.svg" alt="Nuwendo" className="h-12" />
              <div className="hidden sm:block border-l border-gray-200 pl-4">
                <h1 className="text-lg font-semibold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">Welcome, {adminUser?.full_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="relative"><Bell className="h-5 w-5" />{(stats?.todayAppointments || 0) > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{stats?.todayAppointments}</span>}</Button>
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin/payments')} className="hidden lg:flex"><CreditCard className="h-4 w-4 mr-2" />Payments</Button>
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin/services')} className="hidden lg:flex"><Settings className="h-4 w-4 mr-2" />Services</Button>
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin/schedule')} className="hidden lg:flex"><Clock className="h-4 w-4 mr-2" />Schedule</Button>
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin/users')} className="hidden lg:flex"><Users className="h-4 w-4 mr-2" />Users</Button>
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin/audit-logs')} className="hidden xl:flex"><FileText className="h-4 w-4 mr-2" />Logs</Button>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-600 hover:text-red-700 hover:bg-red-50"><LogOut className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Logout</span></Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 mb-6 text-red-600 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between"><span>{error}</span><button onClick={() => setError('')}><X className="h-4 w-4" /></button></motion.div>}

        <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="hover:shadow-lg transition-shadow border-0 shadow-md">
              <CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-500">Total Bookings</p><p className="text-3xl font-bold text-gray-900 mt-1">{stats?.totalBookings || 0}</p><p className="text-xs text-gray-400 mt-1">All time</p></div><div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/20"><Calendar className="h-6 w-6 text-white" /></div></div></CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="hover:shadow-lg transition-shadow border-0 shadow-md bg-gradient-to-br from-brand to-brand-600 text-white">
              <CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-white/80">Today</p><p className="text-3xl font-bold mt-1">{stats?.todayAppointments || 0}</p><p className="text-xs text-white/60 mt-1">Appointments</p></div><div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm"><Clock className="h-6 w-6 text-white" /></div></div></CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="hover:shadow-lg transition-shadow border-0 shadow-md">
              <CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-500">This Week</p><p className="text-3xl font-bold text-gray-900 mt-1">{stats?.thisWeekAppointments || 0}</p><div className="flex items-center gap-1 mt-1"><TrendingUp className="h-3 w-3 text-green-500" /><p className="text-xs text-green-600">Active</p></div></div><div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg shadow-purple-500/20"><Activity className="h-6 w-6 text-white" /></div></div></CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="hover:shadow-lg transition-shadow border-0 shadow-md">
              <CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-500">Revenue</p><p className="text-2xl font-bold text-gray-900 mt-1">{formatPrice(stats?.monthlyRevenue || 0)}</p><p className="text-xs text-gray-400 mt-1">This month</p></div><div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg shadow-green-500/20"><DollarSign className="h-6 w-6 text-white" /></div></div></CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-2">
            <Card className="border-0 shadow-md">
              <CardHeader className="border-b bg-gray-50/50"><div className="flex items-center justify-between"><div><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-brand" />Recent Bookings</CardTitle><CardDescription>Click on a patient to view their profile</CardDescription></div><Button variant="outline" size="sm" onClick={() => navigate('/admin/bookings')}>View All<ChevronRight className="h-4 w-4 ml-1" /></Button></div></CardHeader>
              <CardContent className="p-0">
                {stats?.recentBookings && stats.recentBookings.length > 0 ? (
                  <div className="divide-y">
                    {stats.recentBookings.map((b) => (
                      <div key={b.id} className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => fetchPatientProfile(b.email)}>
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center"><span className="text-brand font-semibold">{b.first_name?.[0]}{b.last_name?.[0]}</span></div>
                          <div><div className="flex items-center gap-2 mb-0.5"><p className="font-medium text-gray-900">{b.first_name} {b.last_name}</p><Badge className={getStatusColor(b.status)}>{b.status}</Badge>{b.appointment_type && <Badge variant="outline" className="text-xs">{b.appointment_type === 'online' ? ' Online' : ' On-site'}</Badge>}</div><p className="text-sm text-gray-600">{b.service_name}</p><p className="text-xs text-gray-400">{formatDateShort(b.booking_date)} at {formatTime(b.booking_time)}</p></div>
                        </div>
                        <div className="text-right"><p className="font-semibold text-brand">{formatPrice(b.amount_paid)}</p><p className="text-xs text-gray-400">#{b.id}</p></div>
                      </div>
                    ))}
                  </div>
                ) : <div className="text-center py-12"><Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">No recent bookings</p></div>}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card className="border-0 shadow-md">
              <CardHeader className="border-b bg-gray-50/50"><CardTitle>Quick Actions</CardTitle><CardDescription>Manage your clinic</CardDescription></CardHeader>
              <CardContent className="p-4 space-y-2">
                <Button variant="outline" className="w-full justify-start h-12 hover:bg-brand-50 hover:text-brand hover:border-brand" onClick={() => navigate('/admin/services')}><Settings className="mr-3 h-5 w-5" />Manage Services</Button>
                <Button variant="outline" className="w-full justify-start h-12 hover:bg-brand-50 hover:text-brand hover:border-brand" onClick={() => navigate('/admin/schedule')}><Clock className="mr-3 h-5 w-5" />Manage Schedule</Button>
                <Button variant="outline" className="w-full justify-start h-12 hover:bg-brand-50 hover:text-brand hover:border-brand" onClick={() => navigate('/admin/payments')}><CreditCard className="mr-3 h-5 w-5" />Payment Settings</Button>
                <Button variant="outline" className="w-full justify-start h-12 hover:bg-brand-50 hover:text-brand hover:border-brand" onClick={() => navigate('/admin/bookings')}><Calendar className="mr-3 h-5 w-5" />View All Bookings</Button>
                <Button variant="outline" className="w-full justify-start h-12 hover:bg-brand-50 hover:text-brand hover:border-brand" onClick={() => navigate('/admin/users')}><Users className="mr-3 h-5 w-5" />View All Users</Button>
                <Button variant="outline" className="w-full justify-start h-12 hover:bg-brand-50 hover:text-brand hover:border-brand" onClick={() => navigate('/admin/audit-logs')}><FileText className="mr-3 h-5 w-5" />Audit Logs</Button>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md mt-6">
              <CardHeader className="border-b bg-gray-50/50"><CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5 text-brand" />Today's Schedule</CardTitle></CardHeader>
              <CardContent className="p-4">
                {stats?.todayAppointments && stats.todayAppointments > 0 ? <div className="text-center py-4"><p className="text-4xl font-bold text-brand">{stats.todayAppointments}</p><p className="text-sm text-gray-500 mt-1">appointments today</p><Button className="mt-4 bg-brand hover:bg-brand-600" onClick={() => navigate('/admin/schedule')}>View Schedule</Button></div> : <div className="text-center py-4"><p className="text-gray-400">No appointments today</p></div>}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {(selectedPatient || isLoadingPatient) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedPatient(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
              {isLoadingPatient ? <div className="p-12 text-center"><div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4" /><p className="text-gray-600">Loading patient profile...</p></div> : selectedPatient && (
                <>
                  <div className="bg-gradient-to-r from-brand to-brand-600 p-6 text-white">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4"><div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm"><User className="w-8 h-8" /></div><div><h2 className="text-2xl font-bold">{selectedPatient.first_name} {selectedPatient.last_name}</h2><p className="text-white/80">Patient since {formatDate(selectedPatient.created_at)}</p></div></div>
                      <button onClick={() => setSelectedPatient(null)} className="p-2 hover:bg-white/20 rounded-full transition-colors"><X className="h-5 w-5" /></button>
                    </div>
                  </div>
                  <div className="p-6 overflow-y-auto max-h-[60vh]">
                    {(() => {
                      let details: { age?: string; height?: string; weight?: string; reasonForConsult?: string; healthGoals?: string[] } = {}
                      try { if (selectedPatient.medical_conditions) details = JSON.parse(selectedPatient.medical_conditions) } catch {}
                      return (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                          {details.age && <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"><User className="h-5 w-5 text-gray-400" /><div><p className="text-xs text-gray-500">Age</p><p className="font-medium text-sm">{details.age} years old</p></div></div>}
                          {details.height && <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"><Activity className="h-5 w-5 text-gray-400" /><div><p className="text-xs text-gray-500">Height</p><p className="font-medium text-sm">{details.height} cm</p></div></div>}
                          {details.weight && <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"><Activity className="h-5 w-5 text-gray-400" /><div><p className="text-xs text-gray-500">Weight</p><p className="font-medium text-sm">{details.weight} kg</p></div></div>}
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"><Mail className="h-5 w-5 text-gray-400" /><div><p className="text-xs text-gray-500">Email</p><p className="font-medium text-sm">{selectedPatient.email}</p></div></div>
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"><Phone className="h-5 w-5 text-gray-400" /><div><p className="text-xs text-gray-500">Phone</p><p className="font-medium text-sm">{selectedPatient.phone_number || 'Not provided'}</p></div></div>
                          {selectedPatient.address && <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"><MapPin className="h-5 w-5 text-gray-400" /><div><p className="text-xs text-gray-500">Address</p><p className="font-medium text-sm">{selectedPatient.address}</p></div></div>}
                          {details.reasonForConsult && <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl sm:col-span-2"><FileText className="h-5 w-5 text-gray-400" /><div><p className="text-xs text-gray-500">Reason for Consultation</p><p className="font-medium text-sm">{details.reasonForConsult}</p></div></div>}
                          {details.healthGoals && details.healthGoals.length > 0 && <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl sm:col-span-2"><Target className="h-5 w-5 text-gray-400" /><div><p className="text-xs text-gray-500">Health Goals</p><p className="font-medium text-sm">{details.healthGoals.join(', ')}</p></div></div>}
                        </div>
                      )
                    })()}
                    <h3 className="font-semibold text-gray-900 mb-3">Booking History</h3>
                    {selectedPatient.bookings && selectedPatient.bookings.length > 0 ? <div className="space-y-2">{selectedPatient.bookings.map((b) => <div key={b.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"><div><p className="font-medium text-sm">{b.service_name}</p><p className="text-xs text-gray-500">{formatDate(b.booking_date)} at {formatTime(b.booking_time)}</p></div><div className="text-right"><Badge className={getStatusColor(b.status)}>{b.status}</Badge><p className="text-xs text-gray-500 mt-1">{formatPrice(b.amount_paid)}</p></div></div>)}</div> : <p className="text-gray-500 text-sm">No booking history</p>}
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

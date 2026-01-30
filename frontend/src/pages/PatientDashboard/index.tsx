import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  Clock, 
  FileText, 
  Bell,
  LogOut,
  Activity,
  Pill,
  ClipboardList,
  Loader2
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { 
  getProfile, 
  getDashboardStats, 
  getAppointments, 
  getMedications, 
  getMedicalRecords,
  logout as logoutApi 
} from '@/services/api'

export function PatientDashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    initials: ''
  })
  const [stats, setStats] = useState({
    upcomingAppointments: 0,
    activeMedications: 0,
    medicalRecords: 0,
    healthStatus: 'Good'
  })
  const [appointments, setAppointments] = useState<any[]>([])
  const [medications, setMedications] = useState<any[]>([])
  const [medicalRecords, setMedicalRecords] = useState<any[]>([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch all data in parallel
      const [profileData, statsData, appointmentsData, medicationsData, recordsData] = await Promise.all([
        getProfile(),
        getDashboardStats(),
        getAppointments(),
        getMedications(),
        getMedicalRecords()
      ])

      // Set user profile
      const userData = profileData.data
      setUser({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || '',
        initials: `${userData.firstName?.[0] || ''}${userData.lastName?.[0] || ''}`
      })

      // Set dashboard stats
      setStats(statsData.data)

      // Set appointments
      setAppointments(appointmentsData.data || [])

      // Set medications
      setMedications(medicationsData.data || [])

      // Set medical records
      setMedicalRecords(recordsData.data || [])

    } catch (error: any) {
      console.error('Error fetching dashboard data:', error)
      // If authentication fails, redirect to login
      if (error.message.includes('Token') || error.message.includes('authentication')) {
        navigate('/login')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logoutApi()
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Nuwendo
              </h1>
              <Badge variant="outline" className="ml-2">Patient Portal</Badge>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </Button>
              
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-blue-600 text-white">
                    {user.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
              
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back, {user.firstName}!</h2>
          <p className="text-gray-600">Here's an overview of your health information</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Upcoming</p>
                  <p className="text-2xl font-bold">{stats.upcomingAppointments}</p>
                  <p className="text-xs text-gray-500">Appointments</p>
                </div>
                <Calendar className="h-10 w-10 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-2xl font-bold">{stats.activeMedications}</p>
                  <p className="text-xs text-gray-500">Medications</p>
                </div>
                <Pill className="h-10 w-10 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Recent</p>
                  <p className="text-2xl font-bold">{stats.medicalRecords}</p>
                  <p className="text-xs text-gray-500">Records</p>
                </div>
                <FileText className="h-10 w-10 text-purple-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Health</p>
                  <p className="text-2xl font-bold">{stats.healthStatus}</p>
                  <p className="text-xs text-gray-500">Status</p>
                </div>
                <Activity className="h-10 w-10 text-orange-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="appointments" className="space-y-4">
          <TabsList>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="medications">Medications</TabsTrigger>
            <TabsTrigger value="records">Medical Records</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Upcoming Appointments</h3>
              <Button>
                <Calendar className="mr-2 h-4 w-4" />
                Book Appointment
              </Button>
            </div>
            
            <div className="grid gap-4">
              {appointments.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center text-gray-500">
                    No upcoming appointments
                  </CardContent>
                </Card>
              ) : (
                appointments.map((apt: any) => (
                  <Card key={apt.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-4">
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <Calendar className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-lg">{apt.doctorName}</h4>
                            <p className="text-sm text-gray-600">{apt.specialty}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {new Date(apt.date).toLocaleDateString('en-US', { 
                                  month: 'long', 
                                  day: 'numeric', 
                                  year: 'numeric' 
                                })}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {apt.time}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Reschedule</Button>
                          <Button variant="outline" size="sm">Cancel</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Medications Tab */}
          <TabsContent value="medications" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Current Medications</h3>
              <Button>
                <Pill className="mr-2 h-4 w-4" />
                Request Refill
              </Button>
            </div>
            
            <div className="grid gap-4">
              {medications.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center text-gray-500">
                    No active medications
                  </CardContent>
                </Card>
              ) : (
                medications.map((med: any) => (
                  <Card key={med.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-4">
                          <div className="bg-green-50 p-3 rounded-lg">
                            <Pill className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-lg">{med.name}</h4>
                            <p className="text-sm text-gray-600">{med.dosage} - {med.frequency}</p>
                            <p className="text-xs text-gray-500 mt-1">Prescribed by {med.prescribedBy}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">Details</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Medical Records Tab */}
          <TabsContent value="records" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Recent Medical Records</h3>
              <Button>
                <ClipboardList className="mr-2 h-4 w-4" />
                View All
              </Button>
            </div>
            
            <div className="grid gap-4">
              {medicalRecords.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center text-gray-500">
                    No medical records available
                  </CardContent>
                </Card>
              ) : (
                medicalRecords.map((record: any) => (
                  <Card key={record.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-4">
                          <div className="bg-purple-50 p-3 rounded-lg">
                            <FileText className="h-6 w-6 text-purple-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-lg">{record.type}</h4>
                            <p className="text-sm text-gray-600">{record.doctorName}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(record.date).toLocaleDateString('en-US', { 
                                month: 'long', 
                                day: 'numeric', 
                                year: 'numeric' 
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-green-600">
                            {record.status}
                          </Badge>
                          <Button variant="outline" size="sm">Download</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Manage your account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">First Name</label>
                    <p className="text-lg">{user.firstName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Last Name</label>
                    <p className="text-lg">{user.lastName}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium">Email</label>
                    <p className="text-lg">{user.email}</p>
                  </div>
                </div>
                <Button>Edit Profile</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

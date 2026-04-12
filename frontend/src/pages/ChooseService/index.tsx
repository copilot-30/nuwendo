import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { BASE_URL } from '@/config/api'
import { 
  ArrowLeft, 
  Loader2, 
  Check, 
  Clock, 
  Stethoscope,
  Pill,
  Monitor,
  Building2
} from 'lucide-react'

interface Service {
  id: number
  name: string
  description: string
  price: string
  duration_minutes: number
  category: string
  availability_type: 'online' | 'on-site' | 'both'
}

type AppointmentType = 'online' | 'on-site'

const categoryIcons: Record<string, any> = {
  'Services': Stethoscope,
  'Peptides': Pill
}

const categoryOrder = ['Services', 'Peptides']

export default function ChooseService() {
  const navigate = useNavigate()
  
  // Support both signup flow and logged-in patient flow
  const signupEmail = sessionStorage.getItem('signupEmail') || ''
  const verificationCode = sessionStorage.getItem('verificationCode') || ''
  const patientEmail = sessionStorage.getItem('patientEmail') || localStorage.getItem('patientEmail') || ''
  const isAuthenticated =
    sessionStorage.getItem('isAuthenticated') === 'true' ||
    localStorage.getItem('isAuthenticated') === 'true' ||
    !!localStorage.getItem('authToken')
  
  // User is valid if they're either going through signup OR already logged in
  const isValidUser = (signupEmail && verificationCode) || (patientEmail && isAuthenticated)

  const handleBack = () => {
    // If user is authenticated (logged in), go back to dashboard
    if (isAuthenticated && patientEmail) {
      navigate('/dashboard')
    } else {
      // Signup flow: return to patient details, not verification code
      navigate('/patient-details')
    }
  }
  
  const [services, setServices] = useState<Service[]>([])
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedAppointmentType, setSelectedAppointmentType] = useState<AppointmentType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isValidUser) {
      navigate('/signup')
      return
    }

    const fetchServices = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/services`)
        const data = await response.json()
        setServices(data.services || [])
      } catch (err) {
        setError('Failed to load services')
      } finally {
        setIsLoading(false)
      }
    }

    fetchServices()
  }, [isValidUser, navigate])

  const handleContinue = () => {
    if (selectedService && selectedAppointmentType) {
      sessionStorage.setItem('selectedService', JSON.stringify(selectedService))
      sessionStorage.setItem('appointmentType', selectedAppointmentType)
      navigate('/choose-schedule')
    }
  }

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service)
    setSelectedAppointmentType(null)
  }

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0
    }).format(parseFloat(price))
  }

  // Group services by category
  const servicesByCategory = services.reduce((acc, service) => {
    const category = service.category || 'Other'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(service)
    return acc
  }, {} as Record<string, Service[]>)

  // Sort categories by defined order
  const sortedCategories = Object.keys(servicesByCategory).sort((a, b) => {
    const indexA = categoryOrder.indexOf(a)
    const indexB = categoryOrder.indexOf(b)
    if (indexA === -1) return 1
    if (indexB === -1) return -1
    return indexA - indexB
  })

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-white"
    >
      {/* Full Width - Services Only */}
  <div className="flex flex-col px-4 sm:px-12 lg:px-20 py-8 sm:py-12 max-w-7xl mx-auto">
        {/* Back Button & Logo */}
  <div className="mb-6 sm:mb-8 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <img src="/9.svg" alt="Nuwendo" className="h-10 w-10 sm:h-12 sm:w-12" />
        </div>

        {/* Heading */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 leading-tight mb-2">
            Choose a service
          </h1>
          <p className="text-base sm:text-lg text-gray-600">
            Select the service you would like to book
          </p>
        </div>

          {/* Services List by Category */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-brand" />
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          ) : (
            <TooltipProvider>
            <div className="space-y-8 mb-8">
              {sortedCategories.map((category) => {
                const Icon = categoryIcons[category] || Stethoscope
                return (
                  <div key={category}>
                    {/* Category Header */}
                    <div className="flex items-center gap-2 sm:gap-3 mb-4">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-brand-100 flex items-center justify-center">
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-brand" />
                      </div>
                      <h2 className="text-lg sm:text-xl font-semibold text-gray-900">{category}</h2>
                    </div>

                    {/* Services in this category */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {servicesByCategory[category].map((service) => (
                        <motion.div
                          key={service.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleServiceSelect(service)}
                          className={`p-4 sm:p-5 rounded-xl border-2 cursor-pointer transition-all ${
                            selectedService?.id === service.id
                              ? 'border-brand bg-brand-50'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                                <h3 className="font-semibold text-base sm:text-lg text-gray-900">{service.name}</h3>
                                {selectedService?.id === service.id && (
                                  <div className="w-5 h-5 rounded-full bg-brand flex items-center justify-center">
                                    <Check className="h-3 w-3 text-white" />
                                  </div>
                                )}
                              </div>
                              <p className="text-sm sm:text-base text-gray-600 mb-3">{service.description}</p>
                              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                                <span className="flex items-center gap-1 text-gray-500">
                                  <Clock className="h-4 w-4" />
                                  {service.duration_minutes} min
                                </span>
                                <span className="font-semibold text-brand">
                                  {formatPrice(service.price)}
                                </span>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full cursor-help bg-purple-100 text-purple-700">
                                      <Monitor className="h-3 w-3" />
                                      Online & Clinic
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Choose Online or On-Site in the next step.</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
            </TooltipProvider>
          )}

          {/* Appointment Type Selection */}
          {selectedService && (
            <div className="mb-8">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Choose appointment type</h2>
              <p className="text-sm text-gray-600 mb-4">
                Select how you want to attend this consultation.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setSelectedAppointmentType('online')}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    selectedAppointmentType === 'online'
                      ? 'border-brand bg-brand-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Monitor className="h-4 w-4 text-brand" />
                    <span className="font-semibold text-gray-900">Online</span>
                  </div>
                  <p className="text-sm text-gray-600">Video consultation</p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedAppointmentType('on-site')}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    selectedAppointmentType === 'on-site'
                      ? 'border-brand bg-brand-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 className="h-4 w-4 text-brand" />
                    <span className="font-semibold text-gray-900">On-Site</span>
                  </div>
                  <p className="text-sm text-gray-600">Clinic visit</p>
                </button>
              </div>
            </div>
          )}

        <Button 
          className="w-full h-11 sm:h-12 text-sm sm:text-base bg-brand hover:bg-brand-600"
          disabled={!selectedService || !selectedAppointmentType}
          onClick={handleContinue}
        >
          Continue
        </Button>
      </div>
    </motion.div>
  )
}

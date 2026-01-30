import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { 
  ArrowLeft, 
  Loader2, 
  Check, 
  Clock, 
  Stethoscope,
  Pill
} from 'lucide-react'

interface Service {
  id: number
  name: string
  description: string
  price: string
  duration_minutes: number
  category: string
}

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
  const patientEmail = sessionStorage.getItem('patientEmail') || ''
  const isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true'
  
  // User is valid if they're either going through signup OR already logged in
  const isValidUser = (signupEmail && verificationCode) || (patientEmail && isAuthenticated)
  
  const [services, setServices] = useState<Service[]>([])
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isValidUser) {
      navigate('/signup')
      return
    }

    const fetchServices = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/services')
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
    if (selectedService) {
      sessionStorage.setItem('selectedService', JSON.stringify(selectedService))
      navigate('/choose-schedule')
    }
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
      <div className="flex flex-col px-6 sm:px-12 lg:px-20 py-12 max-w-7xl mx-auto">
        {/* Back Button & Logo */}
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={() => navigate('/verify-code')}
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
            Choose a service
          </h1>
          <p className="text-lg text-gray-600">
            Select the service you would like to book
          </p>
        </div>

          {/* Services List by Category */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          ) : (
            <div className="space-y-8 mb-8">
              {sortedCategories.map((category) => {
                const Icon = categoryIcons[category] || Stethoscope
                return (
                  <div key={category}>
                    {/* Category Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-teal-600" />
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900">{category}</h2>
                    </div>

                    {/* Services in this category */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {servicesByCategory[category].map((service) => (
                        <motion.div
                          key={service.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedService(service)}
                          className={`p-5 rounded-xl border-2 cursor-pointer transition-all ${
                            selectedService?.id === service.id
                              ? 'border-teal-500 bg-teal-50'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-lg text-gray-900">{service.name}</h3>
                                {selectedService?.id === service.id && (
                                  <div className="w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center">
                                    <Check className="h-3 w-3 text-white" />
                                  </div>
                                )}
                              </div>
                              <p className="text-gray-600 mb-3">{service.description}</p>
                              <div className="flex items-center gap-4 text-sm">
                                <span className="flex items-center gap-1 text-gray-500">
                                  <Clock className="h-4 w-4" />
                                  {service.duration_minutes} min
                                </span>
                                <span className="font-semibold text-teal-600">
                                  {formatPrice(service.price)}
                                </span>
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
          )}

        <Button 
          className="w-full h-12 text-base bg-teal-600 hover:bg-teal-700"
          disabled={!selectedService}
          onClick={handleContinue}
        >
          Continue
        </Button>
      </div>
    </motion.div>
  )
}

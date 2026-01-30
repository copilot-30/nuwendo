import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2, Check, Clock, Stethoscope } from 'lucide-react'

interface Service {
  id: number
  name: string
  description: string
  price: string
  duration_minutes: number
  category: string
}

export default function ChooseService() {
  const navigate = useNavigate()
  const email = sessionStorage.getItem('signupEmail') || ''
  const code = sessionStorage.getItem('verificationCode') || ''
  
  const [services, setServices] = useState<Service[]>([])
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!email || !code) {
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
  }, [email, code, navigate])

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

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen flex"
    >
      {/* Left Side - Services */}
      <div className="flex-1 flex flex-col px-6 sm:px-12 lg:px-20 py-12 bg-white overflow-auto">
        <div className="w-full max-w-2xl mx-auto">
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

          {/* Services List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          ) : (
            <div className="space-y-4 mb-8">
              {services.map((service) => (
                <motion.div
                  key={service.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
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
          )}

          <Button 
            className="w-full h-12 text-base bg-teal-600 hover:bg-teal-700"
            disabled={!selectedService}
            onClick={handleContinue}
          >
            Continue
          </Button>
        </div>
      </div>

      {/* Right Side - Decorative */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-teal-500 via-teal-600 to-emerald-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-white text-center">
          <div className="w-24 h-24 bg-white/20 rounded-3xl flex items-center justify-center mb-8 backdrop-blur-sm">
            <Stethoscope className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Quality Care</h2>
          <p className="text-lg text-white/80 max-w-md">
            Choose from our wide range of healthcare services delivered by experienced professionals.
          </p>
        </div>
      </div>
    </motion.div>
  )
}

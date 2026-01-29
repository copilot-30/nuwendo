import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, Clock, DollarSign, Stethoscope, Smile, Eye, Activity, TestTube, Brain } from 'lucide-react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { getServices, Service } from '@/services/api'

const categoryIcons: Record<string, React.ComponentType<any>> = {
  'Consultation': Stethoscope,
  'Dental': Smile,
  'Ophthalmology': Eye,
  'Therapy': Activity,
  'Laboratory': TestTube,
  'Mental Health': Brain,
}

export function ChooseService() {
  const navigate = useNavigate()
  const location = useLocation()
  const { email, code } = location.state || {}

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
        const data = await getServices()
        setServices(data.services)
      } catch (err: any) {
        setError(err.message || 'Failed to load services')
      } finally {
        setIsLoading(false)
      }
    }

    fetchServices()
  }, [email, code, navigate])

  const handleContinue = () => {
    if (selectedService) {
      navigate('/choose-schedule', { 
        state: { email, code, service: selectedService } 
      })
    }
  }

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0
    }).format(parseFloat(price))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Loading services...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="flex items-center gap-1">
            <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-medium">✓</div>
            <span className="text-sm text-gray-600 hidden sm:inline">Email</span>
          </div>
          <div className="w-8 h-0.5 bg-green-500"></div>
          <div className="flex items-center gap-1">
            <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-medium">✓</div>
            <span className="text-sm text-gray-600 hidden sm:inline">Verify</span>
          </div>
          <div className="w-8 h-0.5 bg-blue-500"></div>
          <div className="flex items-center gap-1">
            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium">3</div>
            <span className="text-sm text-blue-600 font-medium hidden sm:inline">Service</span>
          </div>
          <div className="w-8 h-0.5 bg-gray-300"></div>
          <div className="flex items-center gap-1">
            <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center text-sm font-medium">4</div>
            <span className="text-sm text-gray-400 hidden sm:inline">Schedule</span>
          </div>
          <div className="w-8 h-0.5 bg-gray-300"></div>
          <div className="flex items-center gap-1">
            <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center text-sm font-medium">5</div>
            <span className="text-sm text-gray-400 hidden sm:inline">Details</span>
          </div>
          <div className="w-8 h-0.5 bg-gray-300"></div>
          <div className="flex items-center gap-1">
            <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center text-sm font-medium">6</div>
            <span className="text-sm text-gray-400 hidden sm:inline">Payment</span>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Choose a Service</CardTitle>
            <CardDescription className="text-lg">
              Select the service you'd like to book
            </CardDescription>
          </CardHeader>
        </Card>

        {error && (
          <div className="p-4 mb-6 text-red-600 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
          {services.map((service) => {
            const Icon = categoryIcons[service.category] || Stethoscope
            const isSelected = selectedService?.id === service.id
            
            return (
              <Card
                key={service.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  isSelected 
                    ? 'ring-2 ring-blue-500 bg-blue-50' 
                    : 'hover:border-blue-300'
                }`}
                onClick={() => setSelectedService(service)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-full ${isSelected ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-600'}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{service.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-gray-500">
                          <Clock className="h-4 w-4" />
                          <span>{service.duration_minutes} min</span>
                        </div>
                        <div className="flex items-center gap-1 font-semibold text-green-600">
                          <DollarSign className="h-4 w-4" />
                          <span>{formatPrice(service.price)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="mt-4 pt-4 border-t border-blue-200">
                      <span className="text-sm text-blue-600 font-medium">✓ Selected</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="flex items-center justify-between">
          <Link to="/verify-code" state={{ email }} className="text-blue-600 hover:underline">
            ← Back
          </Link>
          <Button
            size="lg"
            onClick={handleContinue}
            disabled={!selectedService}
            className="px-8"
          >
            Continue
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}

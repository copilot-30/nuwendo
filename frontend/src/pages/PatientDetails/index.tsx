import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2, User } from 'lucide-react'
import { BASE_URL } from '@/config/api'
import {
  getPhilippinePhoneValidationMessage,
  maskPhilippinePhone,
  normalizePhilippinePhone
} from '@/lib/phone'

const PATIENT_DETAILS_DRAFT_KEY = 'patientDetailsDraft'

interface PatientDetailsFormData {
  firstName: string
  lastName: string
  age: string
  contactNumber: string
  address: string
  height: string
  weight: string
  reasonForConsult: string
  healthGoals: string[]
}

interface PatientDetailsDraft {
  formData: PatientDetailsFormData
}

const hasUsableDraftData = (draft: Partial<PatientDetailsDraft> | null | undefined) => {
  if (!draft || !draft.formData) return false

  const data = draft.formData

  return Boolean(
    data.firstName?.trim() ||
      data.lastName?.trim() ||
      data.age?.trim() ||
      data.contactNumber?.trim() ||
      data.address?.trim() ||
      data.height?.trim() ||
      data.weight?.trim() ||
      data.reasonForConsult?.trim() ||
      (Array.isArray(data.healthGoals) && data.healthGoals.length > 0)
  )
}

export default function PatientDetails() {
  const navigate = useNavigate()
  const email = sessionStorage.getItem('signupEmail') || ''
  const code = sessionStorage.getItem('verificationCode') || ''

  const initialFormData: PatientDetailsFormData = {
    firstName: '',
    lastName: '',
    age: '',
    contactNumber: '',
    address: '',
    height: '',
    weight: '',
    reasonForConsult: '',
    healthGoals: []
  }

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [formData, setFormData] = useState<PatientDetailsFormData>(initialFormData)
  const [isDraftHydrated, setIsDraftHydrated] = useState(false)

  useEffect(() => {
    const initializeForm = () => {
      const rawDraft = sessionStorage.getItem(PATIENT_DETAILS_DRAFT_KEY)
      const rawSavedDetails = sessionStorage.getItem('patientDetails')

      let parsedDraft: PatientDetailsDraft | null = null
      let parsedSavedDetails: PatientDetailsFormData | null = null

      if (rawDraft) {
        try {
          parsedDraft = JSON.parse(rawDraft)
        } catch (draftParseError) {
          console.error('Failed to parse patient details draft:', draftParseError)
        }
      }

      if (rawSavedDetails) {
        try {
          parsedSavedDetails = JSON.parse(rawSavedDetails)
        } catch (savedParseError) {
          console.error('Failed to parse saved patient details:', savedParseError)
        }
      }

      const source = hasUsableDraftData(parsedDraft)
        ? parsedDraft?.formData
        : parsedSavedDetails

      if (!source) {
        setIsDraftHydrated(true)
        return
      }

      const parsedFormData: PatientDetailsFormData = {
        ...initialFormData,
        ...source,
        healthGoals: Array.isArray(source.healthGoals) ? source.healthGoals : []
      }

      if (parsedFormData.contactNumber) {
        parsedFormData.contactNumber = maskPhilippinePhone(parsedFormData.contactNumber)
      }

      setFormData(parsedFormData)
      setIsDraftHydrated(true)
    }

    initializeForm()
  }, [])

  useEffect(() => {
    if (!email || !code) {
      navigate('/signup', { replace: true })
    }
  }, [email, code, navigate])

  useEffect(() => {
    if (!isDraftHydrated) return

    const draft: PatientDetailsDraft = {
      formData
    }

    sessionStorage.setItem(PATIENT_DETAILS_DRAFT_KEY, JSON.stringify(draft))
  }, [formData, isDraftHydrated])

  const healthGoalOptions = [
    'Weight loss / fat loss',
    'Improve energy / reduce fatigue',
    'Blood sugar control / insulin resistance',
    'Hormonal balance',
    'Thyroid health',
    'Improve digestion / gut health',
    'Body recomposition / gain muscle',
    'Reduce cravings / appetite control',
    'Long term metabolic health',
    'Considering weight loss medications'
  ]

  const handleHealthGoalToggle = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      healthGoals: prev.healthGoals.includes(goal)
        ? prev.healthGoals.filter(g => g !== goal)
        : [...prev.healthGoals, goal]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const phoneValidationMessage = getPhilippinePhoneValidationMessage(formData.contactNumber)
    if (phoneValidationMessage) {
      setPhoneError(phoneValidationMessage)
      setError(phoneValidationMessage)
      return
    }

    const normalizedPhone = normalizePhilippinePhone(formData.contactNumber)
    if (!normalizedPhone) {
      setPhoneError('Please enter a valid Philippine mobile number (e.g., 0912 345 6789).')
      setError('Please enter a valid Philippine mobile number (e.g., 0912 345 6789).')
      return
    }

    if (formData.healthGoals.length === 0) {
      setError('Please select at least one health goal')
      return
    }

    if (!formData.address.trim()) {
      setError('Please enter your complete address')
      return
    }

    setError('')
    setPhoneError('')
    setIsLoading(true)

    try {
      const payload = {
        ...formData,
        contactNumber: normalizedPhone
      }

      sessionStorage.setItem('patientDetails', JSON.stringify(payload))

      const response = await fetch(`${BASE_URL}/api/patient/profile/${encodeURIComponent(email)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: normalizedPhone,
          address: formData.address,
          region: '',
          province: '',
          city: '',
          barangay: '',
          street_address: formData.address,
          age: formData.age,
          height: formData.height,
          weight: formData.weight,
          reasonForConsult: formData.reasonForConsult,
          healthGoals: formData.healthGoals
        })
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        console.error('Profile save failed:', response.status, errData)
        setError('Failed to save your details. Please try again.')
        return
      }

      navigate('/choose-service')
    } catch (err) {
      console.error('Profile save error:', err)
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!email || !code) return null

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen flex"
    >
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col px-4 sm:px-12 lg:px-20 py-8 sm:py-12 bg-white overflow-auto">
        <div className="w-full max-w-2xl mx-auto">
          {/* Logo */}
          <div className="mb-6 sm:mb-8 flex items-center justify-end">
            <img src="/9.svg" alt="Nuwendo" className="h-10 w-10 sm:h-12 sm:w-12" />
          </div>

          {/* Heading */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 leading-tight mb-2">
              Tell us about yourself
            </h1>
            <p className="text-base sm:text-lg text-gray-600">
              Help us personalize your healthcare experience
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Age and Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age *</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="25"
                  min="1"
                  max="150"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactNumber">Contact Number *</Label>
                <Input
                  id="contactNumber"
                  type="tel"
                  placeholder="0912 345 6789"
                  value={formData.contactNumber}
                  onChange={(e) => {
                    const maskedPhone = maskPhilippinePhone(e.target.value)
                    setFormData({ ...formData, contactNumber: maskedPhone })
                    if (phoneError) setPhoneError('')
                    if (error) setError('')
                  }}
                  onBlur={() => {
                    const validationMessage = getPhilippinePhoneValidationMessage(formData.contactNumber)
                    setPhoneError(validationMessage)
                  }}
                  maxLength={13}
                  required
                />
                {phoneError ? (
                  <p className="text-xs text-red-600">{phoneError}</p>
                ) : (
                  <p className="text-xs text-gray-500">Use PH format: 0912 345 6789</p>
                )}
              </div>
            </div>

            {/* Address Fields */}
            <div className="space-y-2">
              <Label htmlFor="address">Complete Address *</Label>
              <Input
                id="address"
                placeholder="e.g., Unit 4B, 123 Main Street, Brgy. Poblacion, Makati City"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
              />
            </div>

            {/* Height and Weight */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm) *</Label>
                <Input
                  id="height"
                  type="number"
                  placeholder="170"
                  min="50"
                  max="300"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg) *</Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="70"
                  min="20"
                  max="500"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Reason for Consult */}
            <div className="space-y-2">
              <Label htmlFor="reasonForConsult">Reason for Consult *</Label>
              <Textarea
                id="reasonForConsult"
                placeholder="Please describe your primary reason for seeking consultation..."
                value={formData.reasonForConsult}
                onChange={(e) => setFormData({ ...formData, reasonForConsult: e.target.value })}
                className="min-h-[100px]"
                required
              />
            </div>

            {/* Health Goals */}
            <div className="space-y-3">
              <Label>Health Goals * (Select all that apply)</Label>
              <div className="space-y-3 bg-gray-50 rounded-xl p-3 sm:p-4">
                {healthGoalOptions.map((goal) => (
                  <div key={goal} className="flex items-start gap-3">
                    <Checkbox
                      id={goal}
                      checked={formData.healthGoals.includes(goal)}
                      onCheckedChange={() => handleHealthGoalToggle(goal)}
                    />
                    <label htmlFor={goal} className="text-sm leading-tight cursor-pointer">
                      {goal}
                    </label>
                  </div>
                ))}
              </div>
              {formData.healthGoals.length > 0 && (
                <p className="text-sm text-brand">
                  {formData.healthGoals.length} goal{formData.healthGoals.length > 1 ? 's' : ''} selected
                </p>
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 sm:h-12 text-sm sm:text-base bg-brand hover:bg-brand-600"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Continue'
              )}
            </Button>
          </form>
        </div>
      </div>

      {/* Right Side - Decorative */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-brand via-brand-600 to-brand-800 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-white text-center">
          <div className="w-24 h-24 bg-white/20 rounded-3xl flex items-center justify-center mb-8 backdrop-blur-sm">
            <User className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Personalized Care</h2>
          <p className="text-lg text-white/80 max-w-md">
            Your health information helps us create a customized care plan tailored to your unique needs and goals.
          </p>
        </div>
      </div>
    </motion.div>
  )
}

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { AlertCircle, ChevronLeft, ChevronRight, Loader2, Upload, CheckCircle } from 'lucide-react'
import { cartService, Cart as CartType } from '@/services/cartService'
import { API_URL } from '@/config/api'

interface CheckoutFlowProps {
  cart: CartType
  onBack: () => void
  onSuccess: () => void
}

interface PatientProfile {
  firstName?: string
  lastName?: string
  phone?: string
  address?: string
}

const ALLOWED_RECEIPT_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
])

export default function CheckoutFlow({ cart, onBack, onSuccess }: CheckoutFlowProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Address state
  const [useDefaultAddress, setUseDefaultAddress] = useState(true)
  const [defaultProfile, setDefaultProfile] = useState<PatientProfile | null>(null)
  const [recipientName, setRecipientName] = useState('')
  const [recipientPhone, setRecipientPhone] = useState('')
  const [nameTouched, setNameTouched] = useState(false)
  const [phoneTouched, setPhoneTouched] = useState(false)
  const [deliveryAddress, setDeliveryAddress] = useState('')

  // Order details
  const [notes, setNotes] = useState('')

  // Payment state
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null)
  const [paymentSettings, setPaymentSettings] = useState<{
    payment_qr_code?: string
    payment_instructions?: string
    payment_account_name?: string
    payment_account_number?: string
  }>({})

  // Load default address and provinces on mount
  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      const [profile, pmtSettings] = await Promise.all([
        loadDefaultProfile(),
        loadPaymentSettings()
      ])
      setDefaultProfile(profile)
      setPaymentSettings(pmtSettings)
    } catch (err: any) {
      setError(err.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const loadPaymentSettings = async () => {
    try {
      const response = await fetch(`${API_URL}/shop/payment-settings`)
      const data = await response.json()
      if (data.success) return data.settings || {}
      return {}
    } catch {
      return {}
    }
  }

  const loadDefaultProfile = async (): Promise<PatientProfile> => {
    const email = sessionStorage.getItem('patientEmail') || localStorage.getItem('patientEmail')
    if (!email) {
      console.warn('No patient email found in session')
      return {}
    }
    
    const authToken = sessionStorage.getItem('authToken') || localStorage.getItem('authToken')
    const response = await fetch(`${API_URL}/patient/profile?email=${encodeURIComponent(email)}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    })
    const data = await response.json()
    console.log('Profile data:', data)
    if (data.success) {
      const p = data.profile || {}
      const fullAddress = (p.address || p.street_address || '').trim()
      const profile = {
        firstName: p.firstName || '',
        lastName: p.lastName || '',
        phone: p.phone || '',
        address: fullAddress,
      }
      setRecipientName([p.firstName, p.lastName].filter(Boolean).join(' '))
      setRecipientPhone(p.phone || '')
      return profile
    }
    return {}
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!ALLOWED_RECEIPT_MIME_TYPES.has(file.type.toLowerCase())) {
      setError('Invalid receipt format. Please upload a JPG, PNG, or WEBP image file.')
      setReceiptFile(null)
      setReceiptPreview(null)
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Receipt image is too large. Please upload an image under 5MB.')
      return
    }

    setError(null)

    const reader = new FileReader()
    reader.onloadend = () => {
      setReceiptFile(file)
      setReceiptPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const uploadReceiptToStorage = async (base64Data: string): Promise<string> => {
    const authToken = sessionStorage.getItem('authToken') || localStorage.getItem('authToken')
    const email = sessionStorage.getItem('patientEmail') || localStorage.getItem('patientEmail')
    const url = email
      ? `${API_URL}/cart/upload-receipt?email=${encodeURIComponent(email)}`
      : `${API_URL}/cart/upload-receipt`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { Authorization: `Bearer ${authToken}` })
      },
      body: JSON.stringify({ receiptData: base64Data })
    })
    const data = await response.json()
    if (!data.success) throw new Error(data.message || 'Receipt upload failed')
    return data.url
  }

  const handleSubmitOrder = async () => {
    try {
      setLoading(true)
      setError(null)

      // Validate required fields
      if (!useDefaultAddress) {
        if (!deliveryAddress.trim()) {
          setError('Please enter your delivery address')
          return
        }
      } else {
        if (!defaultProfile?.address?.trim()) {
          setError('No default address set. Please use a different address.')
          return
        }
      }

      if (!receiptFile || !receiptPreview) {
        setError('Please upload your payment receipt')
        return
      }

      // Upload receipt to Supabase Storage via backend
      const receiptUrl = await uploadReceiptToStorage(receiptPreview)
      const selectedDeliveryAddress = useDefaultAddress
        ? defaultProfile?.address?.trim() || ''
        : deliveryAddress.trim()

      // Submit order
      const checkoutData = {
        notes,
        payment_receipt_url: receiptUrl,
        recipient_name: recipientName,
        recipient_phone: recipientPhone,
        use_default_address: useDefaultAddress,
        delivery_address: selectedDeliveryAddress,
        delivery_province: '',
        delivery_city: '',
        delivery_barangay: '',
        delivery_street_address: selectedDeliveryAddress
      }

      await cartService.checkout(checkoutData)
      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  const isValidPhilippinePhone = (phone: string) => {
    // Accepts 09XXXXXXXXX (11 digits) or +639XXXXXXXXX (13 chars)
    return /^(09\d{9}|\+639\d{9})$/.test(phone.trim())
  }

  const canProceedFromStep1 = () => {
    if (!recipientName.trim()) return false
    if (!recipientPhone.trim() || !isValidPhilippinePhone(recipientPhone)) return false
    if (useDefaultAddress) {
      return !!defaultProfile?.address?.trim()
    }
    return !!deliveryAddress.trim()
  }

  const canProceedFromStep3 = () => {
    return receiptFile !== null
  }

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="relative flex items-start justify-between">
        {/* Connector lines drawn behind the circles */}
        <div className="absolute top-4 left-0 right-0 flex px-4" style={{ zIndex: 0 }}>
          <div className="flex-1 flex">
            <div className={`flex-1 h-1 ${step > 1 ? 'bg-green-500' : 'bg-gray-200'}`} />
          </div>
          <div className="flex-1 flex">
            <div className={`flex-1 h-1 ${step > 2 ? 'bg-green-500' : 'bg-gray-200'}`} />
          </div>
        </div>

        {/* Step 1 */}
        <div className="flex flex-col items-center relative" style={{ zIndex: 1 }}>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
            step > 1 ? 'bg-green-500 text-white' : step === 1 ? 'bg-brand text-white' : 'bg-gray-200 text-gray-500'
          }`}>
            {step > 1 ? <CheckCircle className="w-5 h-5" /> : 1}
          </div>
          <span className={`mt-1 text-xs whitespace-nowrap ${step === 1 ? 'font-semibold text-brand' : 'text-gray-500'}`}>
            Delivery
          </span>
        </div>

        {/* Step 2 */}
        <div className="flex flex-col items-center relative" style={{ zIndex: 1 }}>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
            step > 2 ? 'bg-green-500 text-white' : step === 2 ? 'bg-brand text-white' : 'bg-gray-200 text-gray-500'
          }`}>
            {step > 2 ? <CheckCircle className="w-5 h-5" /> : 2}
          </div>
          <span className={`mt-1 text-xs whitespace-nowrap ${step === 2 ? 'font-semibold text-brand' : 'text-gray-500'}`}>
            Review
          </span>
        </div>

        {/* Step 3 */}
        <div className="flex flex-col items-center relative" style={{ zIndex: 1 }}>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
            step === 3 ? 'bg-brand text-white' : 'bg-gray-200 text-gray-500'
          }`}>
            3
          </div>
          <span className={`mt-1 text-xs whitespace-nowrap ${step === 3 ? 'font-semibold text-brand' : 'text-gray-500'}`}>
            Payment
          </span>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Step Content */}
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="space-y-4"
      >
        {step === 1 && (
          <div className="space-y-4">

            {/* Recipient Details */}
            <h3 className="font-semibold text-lg">Recipient Details</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="recipient-name">Full Name</Label>
                <Input
                  id="recipient-name"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  onBlur={() => setNameTouched(true)}
                  placeholder="e.g. Juan dela Cruz"
                  className="mt-1"
                />
                {nameTouched && recipientName.trim() === '' && (
                  <p className="text-xs text-red-500 mt-1">Full name is required</p>
                )}
              </div>
              <div>
                <Label htmlFor="recipient-phone">Phone Number</Label>
                <Input
                  id="recipient-phone"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  onBlur={() => setPhoneTouched(true)}
                  placeholder="e.g. 09123456789"
                  className="mt-1"
                  maxLength={13}
                />
                {phoneTouched && (
                  recipientPhone.trim() === '' ? (
                    <p className="text-xs text-red-500 mt-1">Phone number is required</p>
                  ) : !isValidPhilippinePhone(recipientPhone) ? (
                    <p className="text-xs text-red-500 mt-1">Enter a valid PH number (e.g. 09XXXXXXXXX)</p>
                  ) : (
                    <p className="text-xs text-green-600 mt-1">✓ Valid phone number</p>
                  )
                )}
              </div>
            </div>

            {/* Delivery Address */}
            <h3 className="font-semibold text-lg">Delivery Address</h3>
            <RadioGroup value={useDefaultAddress ? 'default' : 'custom'} onValueChange={(val: string) => setUseDefaultAddress(val === 'default')}>
              <div className="space-y-3">
                <div className="flex items-start space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="default" id="default" />
                  <div className="flex-1">
                    <Label htmlFor="default" className="font-medium cursor-pointer">
                      Use Default Address
                    </Label>
                    {defaultProfile?.address ? (
                      <p className="text-sm text-gray-600 mt-1">
                        {defaultProfile.address}
                      </p>
                    ) : (
                      <p className="text-sm text-amber-600 mt-1">
                        No default address set. Please select "Use Different Address".
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="custom" id="custom" />
                  <Label htmlFor="custom" className="font-medium cursor-pointer">
                    Use Different Address
                  </Label>
                </div>
              </div>
            </RadioGroup>

            {!useDefaultAddress && (
              <div className="space-y-3 pl-6">
                <div>
                  <Label htmlFor="deliveryAddress">Complete Address</Label>
                  <Input
                    id="deliveryAddress"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="e.g., 123 Main Street, Brgy. San Jose, Quezon City"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Review Order</h3>

            <div className="space-y-2 border rounded-lg p-4">
              <h4 className="font-medium text-sm text-gray-700">Order Items</h4>
              {cart.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium">{item.item.name}</p>
                    {item.variant && <p className="text-gray-600 text-xs">{item.variant.name}</p>}
                    <p className="text-gray-600 text-xs">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium">₱{item.subtotal.toLocaleString()}</p>
                </div>
              ))}
              <div className="flex justify-between pt-2 font-semibold">
                <p>Total</p>
                <p className="text-brand">₱{cart.total.toLocaleString()}</p>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-medium text-sm text-gray-700 mb-2">Delivery Details</h4>
              {recipientName && (
                <p className="text-sm font-medium">{recipientName}</p>
              )}
              {recipientPhone && (
                <p className="text-sm text-gray-600 mb-1">{recipientPhone}</p>
              )}
              <p className="text-sm">
                {useDefaultAddress ? (
                  defaultProfile?.address || '-'
                ) : (
                  deliveryAddress || '-'
                )}
              </p>
            </div>

            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special instructions..."
                rows={3}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Payment</h3>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Payment Instructions</h4>
              {paymentSettings.payment_instructions ? (
                <p className="text-sm text-blue-900 whitespace-pre-line">{paymentSettings.payment_instructions}</p>
              ) : (
                <ol className="text-sm text-blue-900 space-y-1 list-decimal list-inside">
                  <li>Scan the QR code below to pay</li>
                  <li>Take a screenshot of your payment confirmation</li>
                  <li>Upload your payment receipt for verification</li>
                </ol>
              )}
            </div>

            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="font-medium text-sm mb-2">Scan to Pay</h4>
              {paymentSettings.payment_qr_code ? (
                <div className="flex flex-col items-center gap-2">
                  <img 
                    src={paymentSettings.payment_qr_code} 
                    alt="Payment QR Code" 
                    className="w-48 h-48 object-contain rounded-lg border bg-white"
                  />
                  {paymentSettings.payment_account_name && (
                    <p className="text-sm font-medium text-gray-700">{paymentSettings.payment_account_name}</p>
                  )}
                  {paymentSettings.payment_account_number && (
                    <p className="text-sm text-gray-600">{paymentSettings.payment_account_number}</p>
                  )}
                </div>
              ) : (
                <div className="bg-white p-4 rounded-lg border-2 border-dashed">
                  <p className="text-center text-gray-500 text-sm">
                    QR Code not yet configured
                  </p>
                  <p className="text-center text-xs text-gray-400 mt-2">
                    Please contact the clinic for payment details
                  </p>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="receipt-upload">Upload Payment Receipt *</Label>
              <div className="mt-2">
                <input
                  id="receipt-upload"
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                  onChange={(e) => handleFileChange(e)}
                  className="hidden"
                />
                <label
                  htmlFor="receipt-upload"
                  className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <Upload className="w-5 h-5" />
                  <span className="text-sm">
                    {receiptFile ? receiptFile.name : 'Click to upload receipt'}
                  </span>
                </label>
                {receiptPreview && (
                  <div className="mt-2">
                    <img src={receiptPreview} alt="Receipt Preview" className="w-32 h-32 object-cover rounded border" />
                  </div>
                )}
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                Your order will be processed after payment verification by our admin team.
              </p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Navigation Buttons */}
      <div className="flex gap-3 pt-4 border-t">
        <Button
          onClick={step === 1 ? onBack : () => setStep(step - 1)}
          variant="outline"
          className="flex-1"
          disabled={loading}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
        
        {step < 3 ? (
          <Button
            onClick={() => setStep(step + 1)}
            className="flex-1 bg-brand hover:bg-brand/90"
            disabled={step === 1 && !canProceedFromStep1()}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmitOrder}
            className="flex-1 bg-brand hover:bg-brand/90"
            disabled={loading || !canProceedFromStep3()}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Submitting...
              </>
            ) : (
              'Place Order'
            )}
          </Button>
        )}
      </div>
    </div>
  )
}

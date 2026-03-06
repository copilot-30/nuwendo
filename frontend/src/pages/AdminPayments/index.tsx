import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  Save,
  Check,
  X,
  Image as ImageIcon,
  Loader2,
  QrCode,
  CreditCard,
  Eye,
  Calendar,
  Clock,
  Settings,
  Search,
  Package,
  User,
  Mail,
  CheckCircle
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AdminLayout } from '@/components/AdminLayout'

import { API_URL } from '@/config/api'

interface PaymentSettings {
  payment_qr_code: string
  payment_instructions: string
  payment_account_name: string
  payment_account_number: string
}

interface PendingBooking {
  id: number
  booking_date: string
  booking_time: string
  status: string
  amount_paid: number
  first_name: string
  last_name: string
  email: string
  service_name: string
  duration_minutes: number
  price: string
  payment_receipt_url: string
  payment_receipt_uploaded_at: string
  appointment_type: string
  created_at: string
}

interface ShopOrder {
  id: number
  email: string
  first_name: string
  last_name: string
  total_amount: number
  status: string
  payment_verified: boolean
  payment_receipt_url: string | null
  created_at: string
  item_count: number
  items: {
    id: number
    item_name: string
    variant_name: string | null
    quantity: number
    price_at_purchase: number
  }[]
}

export function AdminPayments() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [settings, setSettings] = useState<PaymentSettings>({
    payment_qr_code: '',
    payment_instructions: '',
    payment_account_name: '',
    payment_account_number: ''
  })
  const [pendingBookings, setPendingBookings] = useState<PendingBooking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [qrPreview, setQrPreview] = useState<string | null>(null)
  const [viewingReceipt, setViewingReceipt] = useState<string | null>(null)
  const [approvingId, setApprovingId] = useState<number | null>(null)
  const [rejectingId, setRejectingId] = useState<number | null>(null)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'yesterday' | 'last7days' | 'last30days'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Shop order payment states
  const [shopOrders, setShopOrders] = useState<ShopOrder[]>([])
  const [shopVerifyingId, setShopVerifyingId] = useState<number | null>(null)
  const [shopReceiptUrl, setShopReceiptUrl] = useState<string | null>(null)
  const [activePaymentTab, setActivePaymentTab] = useState<'bookings' | 'orders'>('bookings')

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken')
    if (!adminToken) {
      navigate('/login')
      return
    }
    fetchData()
  }, [navigate])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      await Promise.all([fetchPaymentSettings(), fetchPendingPayments(), fetchShopOrders()])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchPaymentSettings = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`${API_URL}/admin/payment-settings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (data.success) {
        setSettings(data.settings)
        if (data.settings.payment_qr_code) {
          setQrPreview(data.settings.payment_qr_code)
        }
      }
    } catch (error) {
      console.error('Failed to fetch payment settings:', error)
    }
  }

  const fetchPendingPayments = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`${API_URL}/admin/pending-payments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (data.success) {
        setPendingBookings(data.bookings)
      }
    } catch (error) {
      console.error('Failed to fetch pending payments:', error)
    }
  }

  const fetchShopOrders = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`${API_URL}/admin/orders?payment_verified=false&limit=50`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (response.ok) {
        setShopOrders(data.orders || [])
      }
    } catch (error) {
      console.error('Failed to fetch shop orders:', error)
    }
  }

  const handleVerifyShopPayment = async (orderId: number, verified: boolean) => {
    setShopVerifyingId(orderId)
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`${API_URL}/admin/orders/${orderId}/verify-payment`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ payment_verified: verified })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Failed to verify payment')
      
      setShopOrders(prev => prev.filter(o => o.id !== orderId))
      setSuccess(verified ? 'Shop order payment verified!' : 'Payment verification removed')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to verify payment')
    } finally {
      setShopVerifyingId(null)
    }
  }

  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file')
        return
      }
      if (file.size > 2 * 1024 * 1024) {
        setError('File size must be less than 2MB')
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        setQrPreview(base64)
        setSettings(prev => ({ ...prev, payment_qr_code: base64 }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveSettings = async () => {
    setIsSaving(true)
    setError('')
    setSuccess('')

    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`${API_URL}/admin/payment-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          qr_code: settings.payment_qr_code,
          instructions: settings.payment_instructions,
          account_name: settings.payment_account_name,
          account_number: settings.payment_account_number
        })
      })

      const data = await response.json()
      if (data.success) {
        setSuccess('Payment settings saved successfully!')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        throw new Error(data.message || 'Failed to save settings')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handleApprovePayment = async (bookingId: number) => {
    const booking = pendingBookings.find(b => b.id === bookingId)
    setApprovingId(bookingId)
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`${API_URL}/admin/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'confirmed' })
      })

      const data = await response.json()
      if (data.success) {
        setPendingBookings(prev => prev.filter(b => b.id !== bookingId))
        
        // Show success message with meeting link for online appointments
        if (booking?.appointment_type === 'online' && data.booking?.meeting_link) {
          setSuccess(`Payment approved! Meeting link generated: ${data.booking.meeting_link}`)
        } else {
          setSuccess('Payment approved and booking confirmed!')
        }
        setTimeout(() => setSuccess(''), 5000)
      } else {
        throw new Error(data.message || 'Failed to approve payment')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to approve payment')
    } finally {
      setApprovingId(null)
    }
  }

  const handleRejectPayment = async (bookingId: number) => {
    setRejectingId(bookingId)
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`${API_URL}/admin/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'cancelled' })
      })

      const data = await response.json()
      if (data.success) {
        setPendingBookings(prev => prev.filter(b => b.id !== bookingId))
        setSuccess('Booking rejected')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        throw new Error(data.message || 'Failed to reject payment')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to reject payment')
    } finally {
      setRejectingId(null)
    }
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatPrice = (price: string | number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0
    }).format(typeof price === 'string' ? parseFloat(price) : price)
  }

  // Helper function to check if a date matches the filter
  const matchesDateFilter = (createdAt: string) => {
    if (dateFilter === 'all') return true
    if (!createdAt) return false

    const bookingDate = new Date(createdAt)
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterdayStart = new Date(todayStart)
    yesterdayStart.setDate(yesterdayStart.getDate() - 1)

    switch (dateFilter) {
      case 'today':
        return bookingDate >= todayStart
      case 'yesterday':
        const yesterdayEnd = new Date(todayStart)
        return bookingDate >= yesterdayStart && bookingDate < yesterdayEnd
      case 'last7days':
        const sevenDaysAgo = new Date(todayStart)
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        return bookingDate >= sevenDaysAgo
      case 'last30days':
        const thirtyDaysAgo = new Date(todayStart)
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        return bookingDate >= thirtyDaysAgo
      default:
        return true
    }
  }

  // Filter pending bookings
  const filteredBookings = pendingBookings
    .filter(b => matchesDateFilter(b.created_at))
    .filter(b => {
      if (!searchQuery.trim()) return true
      const query = searchQuery.toLowerCase()
      const fullName = `${b.first_name} ${b.last_name}`.toLowerCase()
      return fullName.includes(query) || b.email.toLowerCase().includes(query)
    })

  if (isLoading) {
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
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payment Management</h1>
            <p className="text-gray-500">Review pending payments and configure settings</p>
          </div>
          <Button onClick={() => setShowSettingsModal(true)} variant="outline" className="gap-2">
            <Settings className="h-4 w-4" />
            QR Code Settings
          </Button>
        </div>

        {error && (
          <div className="p-4 mb-6 text-red-600 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 mb-6 text-green-600 bg-green-50 border border-green-200 rounded-md">
            {success}
          </div>
        )}

        {/* Payment Type Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activePaymentTab === 'bookings' ? 'default' : 'outline'}
            onClick={() => setActivePaymentTab('bookings')}
            className={activePaymentTab === 'bookings' ? 'bg-brand hover:bg-brand/90' : ''}
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Booking Payments
            {pendingBookings.length > 0 && (
              <Badge className="ml-2 bg-yellow-100 text-yellow-800">{pendingBookings.length}</Badge>
            )}
          </Button>
          <Button
            variant={activePaymentTab === 'orders' ? 'default' : 'outline'}
            onClick={() => setActivePaymentTab('orders')}
            className={activePaymentTab === 'orders' ? 'bg-brand hover:bg-brand/90' : ''}
          >
            <Package className="h-4 w-4 mr-2" />
            Shop Order Payments
            {shopOrders.length > 0 && (
              <Badge className="ml-2 bg-yellow-100 text-yellow-800">{shopOrders.length}</Badge>
            )}
          </Button>
        </div>

        {activePaymentTab === 'bookings' && (
        <Card>
          <CardHeader className="space-y-4">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              <CardTitle>Pending Payments</CardTitle>
              {pendingBookings.length > 0 && (
                <Badge className="bg-yellow-100 text-yellow-800">{pendingBookings.length}</Badge>
              )}
            </div>
            
            <CardDescription>
              Review and approve payment receipts
            </CardDescription>

            {/* Search and Filter Row */}
            <div className="flex flex-col lg:flex-row gap-3 pt-2">
              {/* Search Input */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-9"
                />
              </div>

              {/* Date Filter Buttons */}
              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant={dateFilter === 'all' ? 'default' : 'outline'}
                  onClick={() => setDateFilter('all')}
                  className={dateFilter === 'all' ? 'bg-brand hover:bg-brand/90' : ''}
                >
                  All Time
                </Button>
                <Button
                  size="sm"
                  variant={dateFilter === 'today' ? 'default' : 'outline'}
                  onClick={() => setDateFilter('today')}
                  className={dateFilter === 'today' ? 'bg-brand hover:bg-brand/90' : ''}
                >
                  Today
                </Button>
                <Button
                  size="sm"
                  variant={dateFilter === 'yesterday' ? 'default' : 'outline'}
                  onClick={() => setDateFilter('yesterday')}
                  className={dateFilter === 'yesterday' ? 'bg-brand hover:bg-brand/90' : ''}
                >
                  Yesterday
                </Button>
                <Button
                  size="sm"
                  variant={dateFilter === 'last7days' ? 'default' : 'outline'}
                  onClick={() => setDateFilter('last7days')}
                  className={dateFilter === 'last7days' ? 'bg-brand hover:bg-brand/90' : ''}
                >
                  Last 7 Days
                </Button>
                <Button
                  size="sm"
                  variant={dateFilter === 'last30days' ? 'default' : 'outline'}
                  onClick={() => setDateFilter('last30days')}
                  className={dateFilter === 'last30days' ? 'bg-brand hover:bg-brand/90' : ''}
                >
                  Last 30 Days
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredBookings.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <CreditCard className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>
                  {searchQuery.trim() 
                    ? `No payments found matching "${searchQuery}"` 
                    : dateFilter !== 'all'
                    ? `No pending payments ${dateFilter === 'today' ? 'booked today' : dateFilter === 'yesterday' ? 'booked yesterday' : dateFilter === 'last7days' ? 'booked in the last 7 days' : 'booked in the last 30 days'}`
                    : 'No pending payments'
                  }
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredBookings.map((booking) => (
                  <div key={booking.id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{booking.service_name}</h4>
                        <p className="text-sm text-gray-500">{booking.first_name} {booking.last_name}</p>
                        <p className="text-xs text-gray-400">{booking.email}</p>
                        {booking.created_at && (
                          <p className="text-xs text-gray-400 mt-1">
                            Booked: {formatDateTime(booking.created_at)}
                          </p>
                        )}
                      </div>
                      <span className="font-bold text-brand">{formatPrice(booking.price)}</span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(booking.booking_date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatTime(booking.booking_time)}
                      </span>
                      <Badge variant="outline" className={
                        booking.appointment_type === 'online' 
                          ? 'border-blue-200 text-blue-700' 
                          : 'border-purple-200 text-purple-700'
                      }>
                        {booking.appointment_type}
                      </Badge>
                    </div>

                    {/* Receipt Preview */}
                    {booking.payment_receipt_url && (
                      <div className="mb-3">
                        <button
                          onClick={() => setViewingReceipt(booking.payment_receipt_url)}
                          className="flex items-center gap-2 text-sm text-brand hover:underline"
                        >
                          <Eye className="w-4 h-4" />
                          View Payment Receipt
                        </button>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => handleApprovePayment(booking.id)}
                        disabled={approvingId === booking.id || rejectingId === booking.id}
                      >
                        {approvingId === booking.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Check className="w-4 h-4 mr-1" />
                            Approve
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                        onClick={() => handleRejectPayment(booking.id)}
                        disabled={approvingId === booking.id || rejectingId === booking.id}
                      >
                        {rejectingId === booking.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <X className="w-4 h-4 mr-1" />
                            Reject
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        )}

        {activePaymentTab === 'orders' && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              <CardTitle>Unverified Shop Order Payments</CardTitle>
              {shopOrders.length > 0 && (
                <Badge className="bg-yellow-100 text-yellow-800">{shopOrders.length}</Badge>
              )}
            </div>
            <CardDescription>
              Review and verify payment receipts for shop orders
            </CardDescription>
          </CardHeader>
          <CardContent>
            {shopOrders.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>All shop order payments are verified</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {shopOrders.map((order) => (
                  <div key={order.id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">Order #{order.id}</h4>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <User className="w-3 h-3" />
                          <span>{order.first_name} {order.last_name}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Mail className="w-3 h-3" />
                          <span>{order.email}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          Ordered: {formatDateTime(order.created_at)}
                        </p>
                      </div>
                      <span className="font-bold text-brand">
                        {formatPrice(order.total_amount)}
                      </span>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-1 mb-3 text-sm">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-gray-600">
                          <span>{item.item_name} {item.variant_name ? `(${item.variant_name})` : ''} x{item.quantity}</span>
                          <span className="font-medium">
                            {formatPrice(item.price_at_purchase * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Receipt */}
                    {order.payment_receipt_url && (
                      <div className="mb-3">
                        <button
                          onClick={() => setShopReceiptUrl(order.payment_receipt_url)}
                          className="flex items-center gap-2 text-sm text-brand hover:underline"
                        >
                          <Eye className="w-4 h-4" />
                          View Payment Receipt
                        </button>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => handleVerifyShopPayment(order.id, true)}
                        disabled={shopVerifyingId === order.id}
                      >
                        {shopVerifyingId === order.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Check className="w-4 h-4 mr-1" />
                            Verify Payment
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        )}
      </div>

      {/* Shop Receipt Modal */}
      {shopReceiptUrl && (
        <div 
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setShopReceiptUrl(null)}
        >
          <div 
            className="bg-white rounded-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b flex items-center justify-between bg-gray-50 sticky top-0">
              <h3 className="font-semibold text-lg">Shop Order Receipt</h3>
              <div className="flex items-center gap-2">
                <a 
                  href={shopReceiptUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 text-sm bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors"
                >
                  Open in New Tab
                </a>
                <Button variant="ghost" size="sm" onClick={() => setShopReceiptUrl(null)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
            <div className="p-6 overflow-auto flex-1 bg-gray-100">
              <div className="flex justify-center">
                <img 
                  src={shopReceiptUrl} 
                  alt="Payment Receipt" 
                  className="max-w-full h-auto rounded-lg shadow-lg bg-white"
                  style={{ maxHeight: 'calc(95vh - 120px)' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Settings Modal */}
      <Dialog open={showSettingsModal} onOpenChange={setShowSettingsModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Payment QR Code Settings
            </DialogTitle>
            <DialogDescription>
              Configure the QR code and payment details shown to patients
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* QR Code Upload */}
            <div className="space-y-2">
              <Label>Payment QR Code</Label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleQrUpload}
                accept="image/*"
                className="hidden"
              />
              
              {qrPreview ? (
                <div className="relative inline-block">
                  <img 
                    src={qrPreview} 
                    alt="QR Code Preview" 
                    className="w-48 h-48 object-contain border border-gray-200 rounded-xl"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-white transition-colors shadow-sm"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-48 h-48 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center hover:border-brand hover:bg-brand-50/50 transition-colors"
                >
                  <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">Upload QR Code</span>
                </button>
              )}
            </div>

            {/* Account Name */}
            <div className="space-y-2">
              <Label htmlFor="accountName">Account Name</Label>
              <Input
                id="accountName"
                placeholder="e.g., Nuwendo Clinic"
                value={settings.payment_account_name}
                onChange={(e) => setSettings(prev => ({ ...prev, payment_account_name: e.target.value }))}
              />
            </div>

            {/* Account Number */}
            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account Number (GCash/Bank)</Label>
              <Input
                id="accountNumber"
                placeholder="e.g., 09123456789"
                value={settings.payment_account_number}
                onChange={(e) => setSettings(prev => ({ ...prev, payment_account_number: e.target.value }))}
              />
            </div>

            {/* Instructions */}
            <div className="space-y-2">
              <Label htmlFor="instructions">Payment Instructions</Label>
              <Textarea
                id="instructions"
                placeholder="Instructions for patients..."
                value={settings.payment_instructions}
                onChange={(e) => setSettings(prev => ({ ...prev, payment_instructions: e.target.value }))}
                rows={4}
              />
            </div>

            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowSettingsModal(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  handleSaveSettings()
                  setShowSettingsModal(false)
                }} 
                className="bg-brand hover:bg-brand-600"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Settings
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Receipt Modal */}
      {viewingReceipt && (
        <div 
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setViewingReceipt(null)}
        >
          <div 
            className="bg-white rounded-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b flex items-center justify-between bg-gray-50 sticky top-0">
              <h3 className="font-semibold text-lg">Payment Receipt</h3>
              <div className="flex items-center gap-2">
                <a 
                  href={viewingReceipt} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 text-sm bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors"
                >
                  Open in New Tab
                </a>
                <Button variant="ghost" size="sm" onClick={() => setViewingReceipt(null)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
            <div className="p-6 overflow-auto flex-1 bg-gray-100">
              <div className="flex justify-center">
                <img 
                  src={viewingReceipt} 
                  alt="Payment Receipt" 
                  className="max-w-full h-auto rounded-lg shadow-lg bg-white"
                  style={{ maxHeight: 'calc(95vh - 120px)' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

export default AdminPayments

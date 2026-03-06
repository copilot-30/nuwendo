import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useNavigate } from 'react-router-dom'
import {
  Package, ChevronLeft, ChevronRight,
  CheckCircle, Clock, ExternalLink,
  User, Mail, MapPin, Loader2, AlertCircle,
  DollarSign, Image
} from 'lucide-react'
import { AdminLayout } from '@/components/AdminLayout'
import { API_URL } from '@/config/api'

interface OrderItem {
  id: number
  shop_item_id: number
  variant_id: number | null
  quantity: number
  price_at_purchase: number
  item_name: string
  variant_name: string | null
}

interface Order {
  id: number
  user_id: number
  email: string
  first_name: string
  last_name: string
  total_amount: number
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  payment_verified: boolean
  payment_verified_by: number | null
  payment_verified_at: string | null
  verified_by_name: string | null
  payment_receipt_url: string | null
  delivery_region: string | null
  delivery_province: string | null
  delivery_city: string | null
  delivery_barangay: string | null
  delivery_street_address: string | null
  notes: string | null
  created_at: string
  updated_at: string
  item_count: number
  items: OrderItem[]
}

interface Pagination {
  current_page: number
  total_pages: number
  total_records: number
  per_page: number
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

export function AdminOrders() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [paymentFilter, setPaymentFilter] = useState<string>('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [showReceiptModal, setShowReceiptModal] = useState(false)
  const [receiptUrl, setReceiptUrl] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      navigate('/login')
      return
    }
    fetchOrders()
  }, [navigate, statusFilter, paymentFilter])

  const fetchOrders = async (page = 1) => {
    setIsLoading(true)
    setError('')
    try {
      const token = localStorage.getItem('adminToken')
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (paymentFilter !== 'all') params.append('payment_verified', paymentFilter)

      const response = await fetch(`${API_URL}/admin/orders?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          navigate('/login')
          return
        }
        throw new Error(data.message || 'Failed to fetch orders')
      }

      setOrders(data.orders)
      setPagination(data.pagination)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load orders')
    } finally {
      setIsLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: number, status: string) => {
    setIsUpdating(true)
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`${API_URL}/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Failed to update status')

      // Refresh orders
      fetchOrders(pagination?.current_page)
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: status as any })
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update status')
    } finally {
      setIsUpdating(false)
    }
  }

  const verifyPayment = async (orderId: number, verified: boolean) => {
    setIsUpdating(true)
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

      // Refresh orders
      fetchOrders(pagination?.current_page)
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({
          ...selectedOrder,
          payment_verified: verified,
          payment_verified_at: verified ? new Date().toISOString() : null
        })
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to verify payment')
    } finally {
      setIsUpdating(false)
    }
  }

  const viewReceipt = (url: string) => {
    setReceiptUrl(url)
    setShowReceiptModal(true)
  }

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  const formatPrice = (price: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0 }).format(price)

  if (isLoading && orders.length === 0) {
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
          <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-600 mt-1">View and manage shop orders and verify payments</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Order Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Payment Status</label>
                <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All payments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Payments</SelectItem>
                    <SelectItem value="true">Verified</SelectItem>
                    <SelectItem value="false">Unverified</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
        )}

        {/* Orders List */}
        <div className="space-y-4">
          {orders.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-600">No orders found</p>
              </CardContent>
            </Card>
          ) : (
            orders.map((order) => (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">Order #{order.id}</h3>
                        <Badge className={statusColors[order.status]}>
                          {order.status}
                        </Badge>
                        {order.payment_verified ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Payment Verified
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <Clock className="w-3 h-3 mr-1" />
                            Awaiting Verification
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>{order.first_name} {order.last_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          <span>{order.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          <span>{order.item_count} item(s)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          <span className="font-semibold text-gray-900">{formatPrice(order.total_amount)}</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Ordered: {formatDate(order.created_at)}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={() => setSelectedOrder(order)}
                        variant="outline"
                        className="w-full"
                      >
                        View Details
                      </Button>
                      {order.payment_receipt_url && (
                        <Button
                          onClick={() => viewReceipt(order.payment_receipt_url!)}
                          variant="outline"
                          className="w-full"
                        >
                          <Image className="w-4 h-4 mr-2" />
                          View Receipt
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.total_pages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {((pagination.current_page - 1) * pagination.per_page) + 1} - {Math.min(pagination.current_page * pagination.per_page, pagination.total_records)} of {pagination.total_records}
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => fetchOrders(pagination.current_page - 1)}
                disabled={pagination.current_page === 1}
                variant="outline"
                size="sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="px-4 py-2 text-sm">
                Page {pagination.current_page} of {pagination.total_pages}
              </span>
              <Button
                onClick={() => fetchOrders(pagination.current_page + 1)}
                disabled={pagination.current_page === pagination.total_pages}
                variant="outline"
                size="sm"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Order Details Dialog */}
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            {selectedOrder && (
              <>
                <DialogHeader>
                  <DialogTitle>Order #{selectedOrder.id}</DialogTitle>
                  <DialogDescription>
                    View order details and manage payment verification
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 mt-4">
                  {/* Customer Info */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Customer Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span>{selectedOrder.first_name} {selectedOrder.last_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span>{selectedOrder.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Address */}
                  {selectedOrder.delivery_street_address && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Delivery Address</h3>
                      <div className="flex items-start gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div>
                          <p>{selectedOrder.delivery_street_address}</p>
                          <p>{selectedOrder.delivery_barangay}, {selectedOrder.delivery_city}</p>
                          <p>{selectedOrder.delivery_province}, {selectedOrder.delivery_region}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Order Items */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Order Items</h3>
                    <div className="border rounded-lg divide-y">
                      {selectedOrder.items?.map((item) => (
                        <div key={item.id} className="p-4 flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-900">{item.item_name}</p>
                            {item.variant_name && (
                              <p className="text-sm text-gray-600">Variant: {item.variant_name}</p>
                            )}
                            <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                          </div>
                          <p className="font-semibold text-gray-900">{formatPrice(item.price_at_purchase * item.quantity)}</p>
                        </div>
                      ))}
                      <div className="p-4 bg-gray-50 flex justify-between items-center font-semibold">
                        <span>Total</span>
                        <span className="text-lg">{formatPrice(selectedOrder.total_amount)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Status */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Payment Status</h3>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          {selectedOrder.payment_verified ? (
                            <>
                              <CheckCircle className="w-5 h-5 text-green-600" />
                              <span className="font-medium text-green-800">Payment Verified</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-5 h-5 text-yellow-600" />
                              <span className="font-medium text-yellow-800">Awaiting Verification</span>
                            </>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {!selectedOrder.payment_verified ? (
                            <Button
                              onClick={() => verifyPayment(selectedOrder.id, true)}
                              disabled={isUpdating}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Verify Payment</>}
                            </Button>
                          ) : (
                            <Button
                              onClick={() => verifyPayment(selectedOrder.id, false)}
                              disabled={isUpdating}
                              size="sm"
                              variant="outline"
                            >
                              Unverify
                            </Button>
                          )}
                        </div>
                      </div>
                      {selectedOrder.payment_verified_at && (
                        <p className="text-xs text-gray-600">
                          Verified on {formatDate(selectedOrder.payment_verified_at)}
                          {selectedOrder.verified_by_name && ` by ${selectedOrder.verified_by_name}`}
                        </p>
                      )}
                      {selectedOrder.payment_receipt_url && (
                        <Button
                          onClick={() => viewReceipt(selectedOrder.payment_receipt_url!)}
                          variant="outline"
                          size="sm"
                          className="mt-3 w-full"
                        >
                          <Image className="w-4 h-4 mr-2" />
                          View Payment Receipt
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Order Status */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Order Status</h3>
                    <Select
                      value={selectedOrder.status}
                      onValueChange={(value) => updateOrderStatus(selectedOrder.id, value)}
                      disabled={isUpdating}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Notes */}
                  {selectedOrder.notes && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">Customer Notes</h3>
                      <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">{selectedOrder.notes}</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Receipt Modal */}
        <Dialog open={showReceiptModal} onOpenChange={setShowReceiptModal}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Payment Receipt</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <img src={receiptUrl} alt="Payment Receipt" className="w-full h-auto rounded-lg" />
              <Button
                onClick={() => window.open(receiptUrl, '_blank')}
                variant="outline"
                className="w-full mt-4"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open in New Tab
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}

export default AdminOrders

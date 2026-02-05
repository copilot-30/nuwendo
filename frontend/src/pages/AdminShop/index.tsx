import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  Plus, 
  Edit, 
  Trash2, 
  DollarSign, 
  Save,
  ToggleLeft,
  ToggleRight,
  Loader2,
  Package,
  Users,
  ArrowLeft
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AdminLayout } from '@/components/AdminLayout'

const API_URL = 'http://localhost:5000/api'

interface ShopItem {
  id: number
  name: string
  description: string
  price: string
  category: string
  image_url: string
  stock_quantity: number
  is_active: boolean
  created_at: string
  updated_at: string
  created_by_name: string | null
}

interface Patient {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  has_shop_access: boolean
  granted_at: string | null
  granted_by_name: string | null
  notes: string | null
}

export function AdminShop() {
  const navigate = useNavigate()
  const [items, setItems] = useState<ShopItem[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showItemForm, setShowItemForm] = useState(false)
  const [showAccessModal, setShowAccessModal] = useState(false)
  const [editingItem, setEditingItem] = useState<ShopItem | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showCustomCategory, setShowCustomCategory] = useState(false)
  const [customCategory, setCustomCategory] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image_url: '',
    stock_quantity: 0,
    is_active: true
  })

  const defaultCategories = ['Peptides', 'Supplements', 'Equipment']
  
  // Get unique categories from existing items
  const existingCategories = Array.from(new Set(items.map(s => s.category).filter(Boolean)))
  
  // Combine default and existing categories
  const allCategories = Array.from(new Set([...defaultCategories, ...existingCategories])).sort()

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      navigate('/admin/login')
      return
    }
    fetchData()
  }, [navigate])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      await Promise.all([fetchItems(), fetchPatients()])
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`${API_URL}/admin/shop`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      
      if (!response.ok) {
        if (response.status === 401) {
          navigate('/admin/login')
          return
        }
        throw new Error(data.message || 'Failed to fetch items')
      }

      setItems(data.items)
    } catch (err: any) {
      setError(err.message || 'Failed to load shop items')
    }
  }

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`${API_URL}/admin/shop/access/patients`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch patients')
      }

      setPatients(data.patients)
    } catch (err: any) {
      console.error('Error fetching patients:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      const token = localStorage.getItem('adminToken')
      const url = editingItem 
        ? `${API_URL}/admin/shop/${editingItem.id}`
        : `${API_URL}/admin/shop`
      
      const method = editingItem ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to save item')
      }

      await fetchItems()
      resetForm()
    } catch (err: any) {
      setError(err.message || 'Failed to save item')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      return
    }

    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`${API_URL}/admin/shop/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete item')
      }

      await fetchItems()
    } catch (err: any) {
      setError(err.message || 'Failed to delete item')
    }
  }

  const handleToggleActive = async (item: ShopItem) => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`${API_URL}/admin/shop/${item.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...item,
          is_active: !item.is_active
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update item')
      }

      await fetchItems()
    } catch (err: any) {
      setError(err.message || 'Failed to update item')
    }
  }

  const handleToggleAccess = async (userId: number, currentAccess: boolean) => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`${API_URL}/admin/shop/access/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          has_access: !currentAccess,
          notes: ''
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update access')
      }

      await fetchPatients()
    } catch (err: any) {
      setError(err.message || 'Failed to update access')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      image_url: '',
      stock_quantity: 0,
      is_active: true
    })
    setEditingItem(null)
    setShowItemForm(false)
    setShowCustomCategory(false)
    setCustomCategory('')
  }

  const handleEdit = (item: ShopItem) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      image_url: item.image_url,
      stock_quantity: item.stock_quantity,
      is_active: item.is_active
    })
    setShowItemForm(true)
  }

  const filteredItems = selectedCategory === 'all' 
    ? items 
    : items.filter(item => item.category === selectedCategory)

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
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/admin/services')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Shop Management</h1>
              <p className="text-gray-500">Manage shop items and patient access</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => setShowAccessModal(true)} 
              variant="outline"
              className="border-purple-200 text-purple-700 hover:bg-purple-50"
            >
              <Users className="h-4 w-4 mr-2" />
              Manage Access
            </Button>
            <Button onClick={() => setShowItemForm(true)} disabled={showItemForm} className="bg-brand hover:bg-brand/90">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        </div>

        {error && (
          <div className="p-4 mb-6 text-red-600 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}

        {/* Item Form Modal */}
        <Dialog open={showItemForm} onOpenChange={setShowItemForm}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Edit Item' : 'Add New Item'}</DialogTitle>
              <DialogDescription>
                {editingItem ? 'Update the shop item details' : 'Add a new item to the shop'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <Label htmlFor="name">Item Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g., BPC-157 Peptide"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="Item description..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price (PHP) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="stock">Stock Quantity *</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) || 0 })}
                    required
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                {!showCustomCategory ? (
                  <div className="flex gap-2">
                    <select
                      id="category"
                      value={formData.category}
                      onChange={(e) => {
                        if (e.target.value === 'custom') {
                          setShowCustomCategory(true)
                          setFormData({ ...formData, category: '' })
                        } else {
                          setFormData({ ...formData, category: e.target.value })
                        }
                      }}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                      required
                    >
                      <option value="">Select category...</option>
                      {allCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                      <option value="custom">+ Add new category</option>
                    </select>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      value={customCategory}
                      onChange={(e) => {
                        setCustomCategory(e.target.value)
                        setFormData({ ...formData, category: e.target.value })
                      }}
                      placeholder="Enter new category..."
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowCustomCategory(false)
                        setCustomCategory('')
                        setFormData({ ...formData, category: '' })
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="h-4 w-4"
                />
                <Label htmlFor="is_active" className="!mb-0">Active (available for purchase)</Label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1 bg-brand hover:bg-brand/90">
                  <Save className="h-4 w-4 mr-2" />
                  {editingItem ? 'Update Item' : 'Add Item'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetForm}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Patient Access Modal */}
        <Dialog open={showAccessModal} onOpenChange={setShowAccessModal}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Manage Patient Shop Access</DialogTitle>
              <DialogDescription>
                Control which patients can access the shop
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 space-y-2">
              {patients.length === 0 ? (
                <p className="text-center py-8 text-gray-500">No patients found</p>
              ) : (
                patients.map(patient => (
                  <div key={patient.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div>
                      <p className="font-medium">{patient.first_name} {patient.last_name}</p>
                      <p className="text-sm text-gray-500">{patient.email}</p>
                      {patient.has_shop_access && patient.granted_at && (
                        <p className="text-xs text-green-600 mt-1">
                          Access granted on {new Date(patient.granted_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant={patient.has_shop_access ? 'destructive' : 'default'}
                      onClick={() => handleToggleAccess(patient.id, patient.has_shop_access)}
                      className={!patient.has_shop_access ? 'bg-green-600 hover:bg-green-700' : ''}
                    >
                      {patient.has_shop_access ? 'Revoke Access' : 'Grant Access'}
                    </Button>
                  </div>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Category Filter */}
        <div className="mb-6">
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('all')}
              className={selectedCategory === 'all' ? 'bg-brand hover:bg-brand/90' : ''}
            >
              All Items ({items.length})
            </Button>
            {allCategories.map(category => {
              const count = items.filter(item => item.category === category).length
              return (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(category)}
                  className={selectedCategory === category ? 'bg-brand hover:bg-brand/90' : ''}
                >
                  {category} ({count})
                </Button>
              )
            })}
          </div>
        </div>

        {/* Items Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No items found</p>
            <Button 
              onClick={() => setShowItemForm(true)} 
              variant="outline" 
              className="mt-4"
            >
              Add your first item
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <Card key={item.id} className={`overflow-hidden ${!item.is_active && 'opacity-60'}`}>
                <CardContent className="p-0">
                  {item.image_url && (
                    <div className="h-48 bg-gray-100 overflow-hidden">
                      <img 
                        src={item.image_url} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        <Badge variant="outline" className="mt-1">{item.category}</Badge>
                      </div>
                      <button
                        onClick={() => handleToggleActive(item)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {item.is_active ? (
                          <ToggleRight className="h-6 w-6 text-green-600" />
                        ) : (
                          <ToggleLeft className="h-6 w-6" />
                        )}
                      </button>
                    </div>

                    {item.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {item.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-sm mb-3">
                      <span className="flex items-center text-gray-600">
                        <DollarSign className="h-4 w-4 mr-1" />
                        ₱{parseFloat(item.price).toLocaleString()}
                      </span>
                      <span className="flex items-center text-gray-600">
                        <Package className="h-4 w-4 mr-1" />
                        Stock: {item.stock_quantity}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(item)}
                        className="flex-1"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-700 hover:border-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

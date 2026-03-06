import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Calendar, 
  Clock, 
  CreditCard, 
  Settings, 
  Users, 
  FileText, 
  LogOut, 
  Bell, 
  Menu,
  X,
  Home,
  ShoppingBag,
  Cog,
  Video
} from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { API_URL, BASE_URL } from '@/config/api'

interface AdminLayoutProps {
  children: React.ReactNode
  adminUser?: {
    full_name: string
    role: string
  } | null
  notificationCount?: number
}

const navItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: Home },
  { path: '/admin/bookings', label: 'Bookings', icon: Calendar },
  { path: '/admin/payments', label: 'Payments', icon: CreditCard },
  { path: '/admin/services', label: 'Services', icon: Settings },
  { path: '/admin/shop', label: 'Shop', icon: ShoppingBag },
  { path: '/admin/schedule', label: 'Schedule', icon: Clock },
  { path: '/admin/users', label: 'Users', icon: Users },
  { path: '/admin/audit-logs', label: 'Logs', icon: FileText },
  { path: '/admin/settings', label: 'Settings', icon: Cog },
]

export function AdminLayout({ children, notificationCount = 0 }: AdminLayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [googleConnected, setGoogleConnected] = useState<boolean | null>(null)
  const [bannerDismissed, setBannerDismissed] = useState(false)

  useEffect(() => {
    fetch(`${BASE_URL}/api/oauth/google/status`)
      .then(r => r.json())
      .then(d => setGoogleConnected(d.connected))
      .catch(() => setGoogleConnected(false))
  }, [location.pathname]) // recheck on every page change

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      if (token) {
        await fetch(`${API_URL}/admin/auth/logout`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        })
      }
    } catch {
      // Continue with logout even if API call fails
    }
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    navigate('/login')
  }

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Fixed Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo & Brand */}
            <div className="flex items-center gap-4">
              <img 
                src="/logo-full.svg" 
                alt="Nuwendo" 
                className="h-10 cursor-pointer" 
                onClick={() => navigate('/admin/dashboard')}
              />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(item.path)}
                  className={`${
                    isActive(item.path)
                      ? 'bg-brand-50 text-brand border-b-2 border-brand rounded-b-none'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Button>
              ))}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notificationCount}
                  </span>
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white py-2 px-4">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigate(item.path)
                    setMobileMenuOpen(false)
                  }}
                  className={`justify-start ${
                    isActive(item.path)
                      ? 'bg-brand-50 text-brand'
                      : 'text-gray-600'
                  }`}
                >
                  <item.icon className="h-4 w-4 mr-3" />
                  {item.label}
                </Button>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Page Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Floating Google warning — bottom-right, visible on every page */}
      {googleConnected === false && !bannerDismissed && location.pathname !== '/admin/settings' && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full shadow-lg rounded-xl border border-red-200 bg-white overflow-hidden">
          <div className="bg-red-600 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Video className="h-4 w-4 text-white shrink-0" />
              <span className="text-sm font-semibold text-white">Google Account Not Connected</span>
            </div>
            <button
              onClick={() => setBannerDismissed(true)}
              className="text-white/80 hover:text-white ml-2"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="px-4 py-3">
            <p className="text-sm text-gray-600">
              Online appointments won't receive a Google Meet link until you connect your Google account.
            </p>
            <Button
              size="sm"
              onClick={() => navigate('/admin/settings')}
              className="mt-3 w-full bg-red-600 hover:bg-red-700 text-white"
            >
              Connect Now
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminLayout

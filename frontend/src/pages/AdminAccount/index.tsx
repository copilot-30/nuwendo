import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AdminLayout } from '@/components/AdminLayout'
import { API_URL } from '@/config/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, ShieldCheck, Eye, EyeOff, Pencil } from 'lucide-react'

interface AdminProfile {
  id: number
  username: string
  email: string
  full_name: string
  role: string
  last_login?: string | null
}

export function AdminAccount() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [profile, setProfile] = useState<AdminProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showResetPasswordNotice, setShowResetPasswordNotice] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      navigate('/login')
      return
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch(`${API_URL}/admin/auth/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        const data = await response.json()

        if (!response.ok) {
          if (response.status === 401) {
            navigate('/login')
            return
          }
          throw new Error(data.message || 'Failed to load account profile')
        }

        setProfile(data.admin)
        setEmail(data.admin?.email || '')
      } catch (err: any) {
        setError(err.message || 'Failed to load account profile')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [navigate])

  useEffect(() => {
    const shouldForcePasswordChange =
      searchParams.get('forcePasswordChange') === '1' ||
      localStorage.getItem('adminForcePasswordChange') === 'true'

    if (shouldForcePasswordChange) {
      setShowResetPasswordNotice(true)
      localStorage.removeItem('adminForcePasswordChange')

      if (searchParams.has('forcePasswordChange')) {
        const nextParams = new URLSearchParams(searchParams)
        nextParams.delete('forcePasswordChange')
        setSearchParams(nextParams, { replace: true })
      }
    }
  }, [searchParams])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const trimmedEmail = email.trim().toLowerCase()

    if (newPassword && newPassword.length < 6) {
      setError('New password must be at least 6 characters')
      return
    }

    if (newPassword && newPassword !== confirmNewPassword) {
      setError('New password and confirm password do not match')
      return
    }

    if (profile && trimmedEmail === (profile.email || '').toLowerCase() && !newPassword) {
      setError('No changes to save')
      return
    }

    const saveConfirmed = window.confirm('Save changes to admin account?')
    if (!saveConfirmed) {
      return
    }

    try {
      setIsSaving(true)
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`${API_URL}/admin/auth/account`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: trimmedEmail,
          newPassword: newPassword || undefined
        })
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          navigate('/login')
          return
        }

        const validationMessage = Array.isArray(data.errors) && data.errors.length > 0
          ? data.errors[0].msg
          : null

        throw new Error(validationMessage || data.message || 'Failed to update account')
      }

      setProfile(data.admin)
      setEmail(data.admin?.email || trimmedEmail)
      setNewPassword('')
      setConfirmNewPassword('')
      setIsEditing(false)
      setSuccess('Account updated successfully')
      setShowResetPasswordNotice(false)
      localStorage.removeItem('adminForcePasswordChange')

      if (searchParams.has('forcePasswordChange')) {
        const nextParams = new URLSearchParams(searchParams)
        nextParams.delete('forcePasswordChange')
        setSearchParams(nextParams, { replace: true })
      }

      const storedAdmin = localStorage.getItem('adminUser')
      if (storedAdmin) {
        try {
          const parsed = JSON.parse(storedAdmin)
          parsed.email = data.admin?.email || trimmedEmail
          localStorage.setItem('adminUser', JSON.stringify(parsed))
        } catch {
          // Ignore malformed local cache
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update account')
    } finally {
      setIsSaving(false)
    }
  }

  const handleStartEdit = () => {
    setError('')
    setSuccess('')
    setEmail(profile?.email || '')
    setNewPassword('')
    setConfirmNewPassword('')
    setShowNewPassword(false)
    setShowConfirmPassword(false)
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setError('')
    setSuccess('')
    setEmail(profile?.email || '')
    setNewPassword('')
    setConfirmNewPassword('')
    setShowNewPassword(false)
    setShowConfirmPassword(false)
    setIsEditing(false)
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-sm sm:text-base text-gray-500">
            Update your admin email and password. Booking notifications are sent to this admin email.
          </p>
        </div>

  <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-brand" />
              Admin Account
            </CardTitle>
            <CardDescription>
              Keep your login credentials secure and up to date.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showResetPasswordNotice && (
              <div className="mb-4 p-3 text-sm bg-orange-50 border border-orange-200 rounded-md">
                <p className="text-orange-900">
                  You signed in using the forgot-password code. You can set a new password anytime from Edit.
                </p>
              </div>
            )}

            {isLoading ? (
              <div className="py-10 flex justify-center">
                <Loader2 className="h-7 w-7 animate-spin text-brand" />
              </div>
            ) : (
              <form onSubmit={handleSave} className="space-y-5">
                {error && (
                  <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md">
                    {success}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="account-email">Admin Email</Label>
                  <Input
                    id="account-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@nuwendo.com"
                    readOnly={!isEditing}
                    className={!isEditing ? 'bg-white text-gray-900' : undefined}
                    required
                  />
                </div>

                {!isEditing ? (
                  <div className="space-y-2">
                    <Label htmlFor="password-preview">Password</Label>
                    <Input
                      id="password-preview"
                      type="password"
                      value="••••••••••"
                      readOnly
                      className="bg-white text-gray-900"
                    />
                  </div>
                ) : (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <div className="relative">
                          <Input
                            id="new-password"
                            type={showNewPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="At least 6 characters"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1 h-8 w-8 text-gray-500"
                            onClick={() => setShowNewPassword((prev) => !prev)}
                          >
                            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <div className="relative">
                          <Input
                            id="confirm-password"
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            placeholder="Re-enter new password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1 h-8 w-8 text-gray-500"
                            onClick={() => setShowConfirmPassword((prev) => !prev)}
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div className="flex justify-end gap-2">
                  {isEditing ? (
                    <>
                      <Button type="button" variant="outline" onClick={handleCancelEdit} disabled={isSaving}>
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-brand hover:bg-brand/90" disabled={isSaving}>
                        {isSaving ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          'Save Changes'
                        )}
                      </Button>
                    </>
                  ) : (
                    <Button type="button" className="bg-brand hover:bg-brand/90" onClick={handleStartEdit}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  )}
                  </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}

import { useEffect, useState } from 'react'
import { AdminLayout } from '@/components/AdminLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Settings, Video, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import { BASE_URL } from '@/config/api'

export default function AdminSettings() {
  const [googleStatus, setGoogleStatus] = useState<'loading' | 'connected' | 'disconnected'>('loading')

  const checkGoogleStatus = async () => {
    try {
      setGoogleStatus('loading')
      const res = await fetch(`${BASE_URL}/api/oauth/google/status`)
      const data = await res.json()
      setGoogleStatus(data.connected ? 'connected' : 'disconnected')
    } catch {
      setGoogleStatus('disconnected')
    }
  }

  useEffect(() => {
    checkGoogleStatus()
  }, [])

  const handleGoogleAuthorize = () => {
    const popup = window.open(
      `${BASE_URL}/api/oauth/google/authorize`,
      'google-auth',
      'width=500,height=650,scrollbars=yes'
    )
    // Poll until popup closes, then recheck status
    const timer = setInterval(() => {
      if (popup?.closed) {
        clearInterval(timer)
        checkGoogleStatus()
      }
    }, 500)
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your system settings</p>
        </div>

        {/* Google Calendar Integration */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Video className="h-5 w-5" />
            Google Calendar Integration
          </h2>
          <Card>
            <CardHeader>
              <CardTitle>Google Meet Links</CardTitle>
              <CardDescription>
                Authorize the app to create Google Calendar events and Meet links automatically when confirming online appointments.
                You only need to do this once.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {googleStatus === 'loading' ? (
                    <RefreshCw className="h-5 w-5 text-gray-400 animate-spin" />
                  ) : googleStatus === 'connected' ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">
                      {googleStatus === 'loading'
                        ? 'Checking status...'
                        : googleStatus === 'connected'
                        ? 'Connected'
                        : 'Not connected'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {googleStatus === 'connected'
                        ? 'Google Meet links will be created automatically for online appointments.'
                        : 'Connect your Google account to enable automatic Google Meet link generation.'}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleGoogleAuthorize}
                  variant={googleStatus === 'connected' ? 'outline' : 'default'}
                  className={googleStatus !== 'connected' ? 'bg-[#2c4d5c] hover:bg-[#1e3a47] text-white' : ''}
                >
                  {googleStatus === 'connected' ? 'Re-authorize' : 'Connect Google Account'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Info */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Information
          </h2>
          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
              <CardDescription>Current system configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">API Server</span>
                  <span className="font-medium">{BASE_URL}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Environment</span>
                  <Badge variant="outline">Development</Badge>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Video Conferencing</span>
                  <span className="font-medium text-green-600">Google Meet</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}


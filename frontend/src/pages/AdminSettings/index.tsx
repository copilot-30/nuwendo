import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/AdminLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, CheckCircle, Settings, RefreshCw } from 'lucide-react'

export default function AdminSettings() {
  const [googleConnected, setGoogleConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const checkGoogleConnection = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/oauth/google/status')
      const data = await response.json()
      setGoogleConnected(data.connected)
    } catch (error) {
      console.error('Error checking Google connection:', error)
      setGoogleConnected(false)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkGoogleConnection()
  }, [])

  const handleConnectGoogle = () => {
    window.open('http://localhost:5000/api/oauth/google/authorize', '_blank')
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your integrations and system settings</p>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Integrations
          </h2>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      Google Calendar
                      {isLoading ? (
                        <RefreshCw className="h-4 w-4 animate-spin text-gray-400" />
                      ) : googleConnected ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Connected
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-500">
                          Not Connected
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      Connect Google Calendar for automatic Google Meet link generation
                    </CardDescription>
                  </div>
                </div>
                {!googleConnected && (
                  <Button onClick={handleConnectGoogle}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Connect Google
                  </Button>
                )}
              </div>
            </CardHeader>
            {googleConnected && (
              <CardContent>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 mb-2">Google Calendar Connected</h4>
                  <p className="text-sm text-green-700">
                    When you confirm online appointments, Google Meet links will be automatically generated.
                  </p>
                </div>
              </CardContent>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
              <CardDescription>Current system configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">API Server</span>
                  <span className="font-medium">http://localhost:5000</span>
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

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, ArrowRight } from 'lucide-react'

export function SignUp() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setIsSubmitting(false)
    setSubmitted(true)
    
    // Reset after 3 seconds
    setTimeout(() => {
      setSubmitted(false)
      setEmail('')
    }, 3000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Sign Up</CardTitle>
          <CardDescription className="text-lg">
            Join us today and get started with your journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div className="text-center py-8">
              <div className="mb-4 text-green-600">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Welcome aboard!
              </h3>
              <p className="text-gray-600">
                Check your email for confirmation
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-base">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 h-12 text-base"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Creating your account...
                  </>
                ) : (
                  <>
                    Sign Up
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>

              <div className="text-center text-sm text-gray-600">
                By signing up, you agree to our{' '}
                <a href="#" className="text-blue-600 hover:underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-blue-600 hover:underline">
                  Privacy Policy
                </a>
              </div>

              <div className="text-center text-sm">
                Already have an account?{' '}
                <a href="#" className="text-blue-600 hover:underline font-medium">
                  Log in
                </a>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

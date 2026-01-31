import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

interface FunnelLayoutProps {
  children: ReactNode
  showBack?: boolean
  onBack?: () => void
}

export function FunnelLayout({ 
  children, 
  showBack = true,
  onBack 
}: FunnelLayoutProps) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      navigate(-1)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Simple header */}
      <header className="p-4 sm:p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {showBack ? (
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="text-sm font-medium">Back</span>
            </button>
          ) : (
            <div />
          )}
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo-full.svg" alt="Nuwendo Metabolic Clinic" className="h-8" />
          </Link>
        </div>
      </header>

      {/* Content with slide animation */}
      <motion.div
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -60 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="px-4 sm:px-6 pb-8"
      >
        {children}
      </motion.div>
    </div>
  )
}

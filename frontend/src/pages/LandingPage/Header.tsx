import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'
import { Link } from 'react-router-dom'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Nuwendo
          </h1>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <a
            href="#home"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Home
          </a>
          <a
            href="#about"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            About Us
          </a>
          <a
            href="#services"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Services
          </a>
          <a
            href="#addon"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Add On
          </a>
        </nav>

        <div className="flex items-center gap-4">
          <Link to="/login">
            <Button variant="outline" className="hidden md:inline-flex">Login</Button>
          </Link>
          <Link to="/signup">
            <Button className="hidden md:inline-flex">Get Started</Button>
          </Link>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}

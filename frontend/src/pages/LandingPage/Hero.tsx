import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export function Hero() {
  return (
    <section id="home" className="container flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-20">
      <div className="flex flex-col items-center text-center space-y-8 max-w-4xl">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Nowendo
            </span>
          </h1>
          <p className="mx-auto max-w-[700px] text-lg text-muted-foreground md:text-xl">
            Transform your business with our innovative solutions. We help you achieve your goals with cutting-edge technology and expert support.
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Link to="/signup">
            <Button size="lg" className="gap-2">
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Button size="lg" variant="outline">
            Learn More
          </Button>
        </div>

        <div className="flex flex-wrap justify-center gap-8 pt-8">
          <div className="text-center">
            <p className="text-3xl font-bold">500+</p>
            <p className="text-sm text-muted-foreground">Happy Clients</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold">1000+</p>
            <p className="text-sm text-muted-foreground">Projects Done</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold">24/7</p>
            <p className="text-sm text-muted-foreground">Support</p>
          </div>
        </div>
      </div>
    </section>
  )
}

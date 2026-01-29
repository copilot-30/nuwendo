import { Header } from './Header'
import { Hero } from './Hero'
import { AboutUs } from './AboutUs'
import { Services } from './Services'
import { AddOn } from './AddOn'
import { Footer } from './Footer'

export function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <AboutUs />
        <Services />
        <AddOn />
      </main>
      <Footer />
    </div>
  )
}

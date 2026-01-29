import { Code, Palette, Smartphone, Database, Cloud, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'

const services = [
  {
    icon: Code,
    title: 'Web Development',
    description: 'Build modern, responsive websites that engage your audience and drive conversions.',
  },
  {
    icon: Smartphone,
    title: 'Mobile Apps',
    description: 'Create powerful mobile applications for iOS and Android platforms.',
  },
  {
    icon: Palette,
    title: 'UI/UX Design',
    description: 'Design beautiful, intuitive interfaces that users love to interact with.',
  },
  {
    icon: Database,
    title: 'Database Solutions',
    description: 'Implement robust database systems to manage your data efficiently.',
  },
  {
    icon: Cloud,
    title: 'Cloud Services',
    description: 'Deploy and manage your applications on secure cloud infrastructure.',
  },
  {
    icon: Shield,
    title: 'Security',
    description: 'Protect your business with comprehensive security solutions.',
  },
]

export function Services() {
  return (
    <section id="services" className="container py-20 bg-muted/50">
      <div className="flex flex-col items-center text-center space-y-4 mb-12">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
          Our Services
        </h2>
        <p className="max-w-[700px] text-muted-foreground md:text-lg">
          Comprehensive solutions tailored to meet your business needs
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service, index) => {
          const Icon = service.icon
          return (
            <div
              key={index}
              className="group relative overflow-hidden rounded-lg border bg-card p-6 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex flex-col space-y-4">
                <div className="p-3 rounded-full bg-primary/10 w-fit group-hover:bg-primary/20 transition-colors">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">{service.title}</h3>
                <p className="text-muted-foreground">{service.description}</p>
                <Button variant="link" className="w-fit p-0 h-auto">
                  Learn more →
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

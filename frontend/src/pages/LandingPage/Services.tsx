import { ArrowRight, Monitor, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const services = [
  {
    number: '01',
    title: 'Initial Medical Consultation',
    description: 'Full medical intake, risk screening, baseline goals, and a personalized starter plan.',
    image: '/9.png',
  },
  {
    number: '02',
    title: 'Nuwendo Starter',
    description: 'Structured follow-ups, habit coaching, and adjustments based on your response.',
    image: '/8.png',
  },
  {
    number: '03',
    title: 'Tirzepatide Vial',
    description: 'Prescription guidance with education, monitoring, and scheduled follow-ups.',
    image: '/7.png',
  },
  {
    number: '04',
    title: 'Tirzepatide Clinic',
    description: 'In-clinic tirzepatide administration with physician supervision.',
    image: '/6.png',
  },
]

export function Services() {
  return (
    <section id="services" className="py-20 bg-gray-50">
      <div className="container">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-brand font-medium mb-2">ONLINE & CLINIC CONSULTS</p>
          <h2 className="text-3xl md:text-4xl font-bold text-brand-800 mb-4">
            Our Services & Programs
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Looking for trusted medical weight management? Discover our full range of doctor-led in-clinic and online care services.
          </p>

          {/* Appointment Type Badges */}
          <div className="flex justify-center gap-4 mt-6">
            <div className="inline-flex items-center gap-2 bg-brand-100 text-brand px-4 py-2 rounded-full text-sm font-medium">
              <Monitor className="h-4 w-4" />
              Online Consults
            </div>
            <div className="inline-flex items-center gap-2 bg-brand/10 text-brand px-4 py-2 rounded-full text-sm font-medium">
              <Building2 className="h-4 w-4" />
              Clinic Visits
            </div>
          </div>
        </motion.div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              {/* Image */}
              <div className="relative h-48 bg-gradient-to-br from-brand-700 to-brand-800 overflow-hidden">
                <img 
                  src={service.image} 
                  alt={service.title}
                  className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 bg-brand text-white text-lg font-bold px-3 py-1 rounded-lg">
                  {service.number}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-lg font-bold text-brand-800 mb-2 group-hover:text-brand transition-colors">
                  {service.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {service.description}
                </p>
                <Link to="/signup" className="inline-flex items-center gap-2 text-brand text-sm font-medium hover:gap-3 transition-all">
                  Book Now
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link to="/signup">
            <Button size="lg" className="bg-brand hover:bg-brand-600 text-white gap-2">
              View All Services
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

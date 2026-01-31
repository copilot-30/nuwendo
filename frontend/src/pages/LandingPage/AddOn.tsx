import { Button } from '@/components/ui/button'
import { Stethoscope, Package, Heart, Quote, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const features = [
  {
    icon: Stethoscope,
    title: 'Doctor-Led Care For Everyone',
    description: 'Whether you\'re managing obesity, PCOS, thyroid issues, or just seeking safe weight loss, our programs are guided by licensed doctors.',
  },
  {
    icon: Package,
    title: 'Structured Programs & Packages',
    description: 'Choose from our Initial Consultation or Starter Package, designed for different needs and goals, with bundled savings.',
  },
  {
    icon: Heart,
    title: 'Focus on Long-Term Health',
    description: 'No quick fixes, just science-backed care to improve your metabolism, balance your hormones, and support long-term wellness.',
  },
]

export function AddOn() {
  return (
    <section id="why-nuwendo" className="py-20 bg-white">
      <div className="container">
        {/* Testimonial Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-brand-700 to-brand-800 rounded-3xl p-8 lg:p-16 text-white mb-20 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-400/10 rounded-full blur-3xl" />
          
          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <Quote className="h-12 w-12 text-brand-200 mx-auto mb-6" />
            <h2 className="text-2xl lg:text-3xl font-light italic leading-relaxed mb-8">
              "I struggled for years, but with Nuwendo's doctor-led plan I finally found what works for my body. I'm losing weight safely, my energy is up, and I feel supported every step."
            </h2>
            <div className="w-16 h-1 bg-brand-200 mx-auto mb-8" />
            <p className="text-gray-300 uppercase tracking-wider text-sm">Why Patients Choose Nuwendo</p>
          </div>
        </motion.div>

        {/* What Makes Nuwendo Different */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-brand font-medium mb-2">DOCTOR-LED RESULTS</p>
            <h2 className="text-3xl md:text-4xl font-bold text-brand-800 mb-4">
              What Makes Nuwendo Different?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              While there are many ways to lose weight, Nuwendo focuses on what matters most — your biology, your health, and your long-term success.
            </p>
          </motion.div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="group text-center p-8 rounded-2xl border border-gray-100 hover:border-brand-200 hover:shadow-lg transition-all bg-white"
              >
                <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-brand-100 transition-colors">
                  <Icon className="h-8 w-8 text-brand" />
                </div>
                <h3 className="text-xl font-bold text-brand-800 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            )
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-gray-600 mb-4">Book Your First Consultation Today.</p>
          <Link to="/signup">
            <Button size="lg" className="bg-brand hover:bg-brand-600 text-white gap-2">
              Get Started Now!
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

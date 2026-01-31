import { Users, Stethoscope, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

export function AboutUs() {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="container">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Who We Are Card */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="group relative bg-gradient-to-br from-brand-700 to-brand-800 rounded-3xl p-8 lg:p-12 text-white overflow-hidden hover:shadow-2xl transition-shadow cursor-pointer"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-brand/20 rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                <Users className="h-8 w-8 text-brand-300" />
              </div>
              <h3 className="text-2xl font-bold mb-4">WHO WE ARE</h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Nuwendo is a metabolic and lifestyle clinic focused on medical weight management, hormone balance, and sustainable habit coaching. Care is delivered by licensed physicians and nutrition professionals.
              </p>
              <a href="#why-nuwendo" className="inline-flex items-center gap-2 text-brand-300 font-medium group-hover:gap-3 transition-all">
                Discover Why Choose Nuwendo
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </motion.div>

          {/* What We Do Card */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="group relative bg-gradient-to-br from-brand to-brand-600 rounded-3xl p-8 lg:p-12 text-white overflow-hidden hover:shadow-2xl transition-shadow cursor-pointer"
          >
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                <Stethoscope className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">WHAT WE DO</h3>
              <p className="text-brand-50 mb-6 leading-relaxed">
                We offer doctor-led weight loss programs, initial consultations, tirzepatide guidance, and personalized nutrition plans. Both online teleconsults and in-clinic visits available.
              </p>
              <a href="#services" className="inline-flex items-center gap-2 text-white font-medium group-hover:gap-3 transition-all">
                Explore Our Programs
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

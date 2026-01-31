import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Search } from 'lucide-react'

const faqs = [
  {
    question: 'What is Nuwendo and who leads the clinic?',
    answer: 'Nuwendo is a metabolic and lifestyle clinic focused on medical weight management, hormone balance, and sustainable habit coaching. Care is delivered by licensed physicians and nutrition professionals, with structured follow-ups and individualized plans.',
    category: 'Programs',
  },
  {
    question: 'What programs do you offer, Initial and Starter?',
    answer: 'Initial Consultation covers a full medical intake, risk screening, baseline goals, and a starter plan. Starter Program adds structured follow-ups, habit coaching, and adjustments based on your response. Ask our team for the current inclusions and pricing.',
    category: 'Programs',
  },
  {
    question: 'How do I book a consultation?',
    answer: 'Choose your preferred slot on our booking page, submit your details, then complete payment to confirm the reservation. Unpaid bookings auto-cancel, so complete checkout right after selecting a time.',
    category: 'Booking',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept cards, GCash, and selected bank payments through a secure gateway. If you need manual assistance, message us right after placing your booking.',
    category: 'Payments',
  },
  {
    question: 'Do you prescribe semaglutide or tirzepatide?',
    answer: 'Prescription depends on your medical history, risk profile, and physician assessment. If indicated, the plan includes education on use, monitoring, side effect checks, and scheduled follow-ups.',
    category: 'Treatments',
  },
  {
    question: 'Do I need lab tests before my first visit?',
    answer: 'Not always. Your doctor may request baseline labs after your intake if needed. If you already have recent results, bring clear copies so the team can review them.',
    category: 'Booking',
  },
  {
    question: 'How soon can I see results?',
    answer: 'Timelines vary based on your starting point, adherence, and medical plan. Most clients notice early improvements in energy and appetite regulation within weeks, with steady progress over months.',
    category: 'Results',
  },
  {
    question: 'Do you offer teleconsult?',
    answer: 'Yes, selected visits can be done online. Your doctor will advise if an in-person assessment or measurements are required at certain milestones.',
    category: 'Booking',
  },
]

const categories = ['All', 'Booking', 'Payments', 'Treatments', 'Programs', 'Results']

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <section id="faq" className="py-20 bg-gray-50">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-brand-800 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Quick answers about booking, payments, treatments, and results.
          </p>
        </motion.div>

        {/* Search and Filter */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
            />
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-brand text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto space-y-3">
          {filteredFaqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl border border-gray-100 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-brand-800 pr-4">{faq.question}</span>
                <ChevronDown 
                  className={`h-5 w-5 text-gray-400 shrink-0 transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`} 
                />
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="px-5 pb-5 text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {filteredFaqs.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No questions found matching your search.
          </div>
        )}
      </div>
    </section>
  )
}

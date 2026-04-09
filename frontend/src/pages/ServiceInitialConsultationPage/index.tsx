import { Link } from 'react-router-dom'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { PublicPageLayout } from '@/pages/LandingPage/PublicPageLayout'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

const journeySets = [
  {
    id: 'set-1',
    before: '/before1.jpg',
    after: '/after1.jpg',
  },
  {
    id: 'set-2',
    before: '/before2.jpg',
    after: '/after2.jpg',
  },
]

const rotatingProgramHighlights = [
  'Doctor-Led & Science-Backed Programs',
  'Personalized Nutrition & Lifestyle Plans',
  'Ethical & Responsible Medication Guidance',
]

type BeforeAfterSliderProps = {
  beforeSrc: string
  afterSrc: string
  alt: string
}

function BeforeAfterSlider({ beforeSrc, afterSrc, alt }: BeforeAfterSliderProps) {
  const [position, setPosition] = useState(50)

  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-slate-200 shadow-xl">
      <img src={afterSrc} alt={`${alt} after`} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />

      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
        <img src={beforeSrc} alt={`${alt} before`} className="h-full w-full object-cover" loading="lazy" />
      </div>

      <div
        className="absolute inset-y-0 w-1 bg-white/95 shadow-[0_0_0_1px_rgba(15,40,61,0.12)]"
        style={{ left: `calc(${position}% - 2px)` }}
      />

      <div
        className="absolute top-1/2 h-11 w-11 -translate-y-1/2 rounded-full bg-white border-2 border-brand-800 shadow-lg grid place-items-center text-brand-800 text-sm font-black"
        style={{ left: `calc(${position}% - 22px)` }}
      >
        ↔
      </div>

      <div className="absolute left-4 top-4 rounded-md bg-brand-800 px-4 py-2 text-white text-lg font-semibold">Before</div>
      <div className="absolute right-4 top-4 rounded-md bg-brand px-4 py-2 text-white text-lg font-semibold">After</div>

      <input
        type="range"
        min={0}
        max={100}
        value={position}
        onChange={(e) => setPosition(Number(e.target.value))}
        aria-label="Adjust before and after comparison"
        className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
      />
    </div>
  )
}

export default function ServiceInitialConsultationPage() {
  return (
    <PublicPageLayout>
      <section className="bg-gradient-to-b from-slate-100 via-white to-slate-50 py-16 md:py-20 overflow-hidden">
        <div className="container">
          <div className="max-w-6xl mx-auto space-y-14">
            <div className="text-center">
              <p className="text-brand font-semibold uppercase tracking-[0.2em]">Nuwendo Initial Consultation</p>
              <h1 className="mt-3 text-4xl md:text-6xl font-black uppercase italic text-brand-800 leading-[0.95]">
                Doctor-Led Weight & Metabolic Health Assessment in the Philippines
              </h1>
              <p className="mt-6 text-xl md:text-2xl text-slate-600">Get Started Today!</p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link to="/signup">
                  <Button className="bg-brand hover:bg-brand-600 px-8 text-white h-12">Book Consultation</Button>
                </Link>
                <Link to="/services">
                  <Button variant="outline" className="h-12 px-8">Back to Services</Button>
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -top-24 -left-16 h-56 w-56 rounded-full bg-brand-100 blur-3xl" />
              <div className="absolute -bottom-12 -right-12 h-52 w-52 rounded-full bg-brand-200/60 blur-3xl" />
              <h2 className="text-3xl md:text-4xl font-black uppercase italic text-brand-800 text-center">
                Begin Your Journey with Nuwendo
              </h2>
              <p className="mt-4 text-center text-lg text-slate-600 max-w-4xl mx-auto">
                At Nuwendo, every successful transformation starts with your Initial Consultation. This first step helps us
                understand your weight history, hormones, nutrition, and lifestyle so we can design a personalized plan that
                works with your biology. Guided by our doctors, you’ll receive safe, effective, and sustainable care—backed by
                expertise and compassion.
              </p>

              <div className="mt-10 grid md:grid-cols-2 gap-8 relative z-10">
                {journeySets.map((set, index) => (
                  <article key={set.id}>
                    <p className="text-sm uppercase tracking-[0.2em] text-brand font-bold mb-4">Journey {index + 1}</p>
                    <BeforeAfterSlider
                      beforeSrc={set.before}
                      afterSrc={set.after}
                      alt={`Patient journey ${index + 1}`}
                    />
                    <p className="mt-3 text-sm text-slate-500 text-center">Drag left or right to reveal transformation</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="space-y-12">
              <div className="grid lg:grid-cols-[1.1fr_1.4fr] gap-10 items-center">
                <div className="relative">
                  <img
                    src="/asian-man-and-woman-working-out-one-is-a-trainer-2025-03-16-07-02-26-utc-scaled.jpg"
                    alt="Initial consultation overview"
                    className="w-full rounded-3xl object-cover shadow-xl"
                    loading="lazy"
                  />
                </div>
                <div className="relative pl-8 border-l-4 border-brand-200">
                  <p className="text-brand text-2xl font-black">01.</p>
                  <h3 className="mt-3 text-3xl font-black uppercase italic text-brand-800">
                    What is Nuwendo Initial Consultation?
                  </h3>
                  <p className="mt-5 text-lg text-slate-700 leading-relaxed">
                    The Nuwendo Initial Consultation is your first step toward safe, effective, and personalized weight and
                    metabolic care. In this session, our doctors take a comprehensive look at your weight history, hormone profile,
                    nutrition, and lifestyle. From there, we create a tailored plan that aligns with your goals and medical needs.
                  </p>
                  <p className="mt-4 text-lg text-slate-700 leading-relaxed">
                    This consultation ensures you receive science-based recommendations, whether you’re starting a weight loss
                    program, managing a hormonal condition, or exploring options like GLP-1 medications. It’s the foundation of
                    your journey with Nuwendo—focused on understanding your biology and guiding you with expert, compassionate care.
                  </p>
                </div>
              </div>

              <div className="grid lg:grid-cols-[1.4fr_1.1fr] gap-10 items-center">
                <div className="relative pl-8 border-l-4 border-brand-200">
                  <p className="text-brand text-2xl font-black">02.</p>
                  <h3 className="mt-3 text-3xl font-black uppercase italic text-brand-800">
                    Why choose Nuwendo Initial Consultation?
                  </h3>
                  <p className="mt-5 text-lg text-slate-700 leading-relaxed">
                    Choosing Nuwendo Initial Consultation means starting your health journey with clarity and confidence. Instead
                    of guessing or relying on generic programs, you’ll receive a complete assessment of your weight history, hormone
                    profile, nutrition, and lifestyle. Our doctors use this information to design a personalized plan that works
                    with your biology, not against it.
                  </p>
                  <p className="mt-4 text-lg text-slate-700 leading-relaxed">
                    This first step gives you a clear direction, expert medical guidance, and the assurance that your care is
                    grounded in science, compassion, and long-term sustainability.
                  </p>
                </div>
                <div className="relative">
                  <img
                    src="/multicultural-group-of-friends-at-gym-flexing-mus-2024-12-05-16-05-06-utc-scaled.jpg"
                    alt="Initial consultation guidance"
                    className="w-full rounded-3xl object-cover shadow-xl"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 border-y border-slate-300 py-8">
              <div className="md:pr-8 md:border-r md:border-slate-300">
                <p className="text-7xl md:text-8xl font-black text-brand">1,000</p>
                <p className="mt-2 text-2xl text-brand-800 leading-snug">
                  More Than 1000 Lives Have Been Changed After Practicing With us.
                </p>
              </div>

              <div className="md:pl-8">
                <p className="text-7xl md:text-8xl font-black text-brand">99.9%</p>
                <p className="mt-2 text-2xl text-brand-800 leading-snug">
                  Individuals and Groups are Satisfied When Working With us.
                </p>
              </div>
            </div>

            <div
              className="relative overflow-hidden rounded-3xl py-20 px-6 text-center bg-cover bg-center"
              style={{
                backgroundImage: "linear-gradient(rgba(15,40,61,0.78),rgba(15,40,61,0.78)), url('/bg-ab-top.jpg')",
              }}
            >
              <p className="inline-block bg-brand text-white text-sm md:text-base uppercase tracking-[0.14em] px-4 py-1 font-semibold">
                Trusted by Patients Nationwide
              </p>
              <h3 className="mt-5 text-5xl md:text-7xl font-black uppercase italic leading-[0.9] text-white">
                Doctor-Led &
                <br />
                Science-Backed
              </h3>
              <p className="mt-4 text-2xl md:text-3xl text-white font-semibold uppercase">Board-Certified Specialists</p>
            </div>

            <div className="bg-brand-900 py-7 rounded-2xl border border-brand-700 overflow-hidden">
              <motion.div
                className="flex w-max items-center gap-14 whitespace-nowrap px-6"
                animate={{ x: ['0%', '-50%'] }}
                transition={{ duration: 18, ease: 'linear', repeat: Infinity }}
              >
                {[...rotatingProgramHighlights, ...rotatingProgramHighlights, ...rotatingProgramHighlights].map((line, idx) => (
                  <div key={`${line}-${idx}`} className="inline-flex items-center gap-3 text-brand-100 text-2xl md:text-3xl font-medium">
                    <span>{line}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-7 md:p-10 text-center">
              <p className="inline-block bg-brand text-white text-sm md:text-base uppercase tracking-[0.14em] px-4 py-1 font-semibold">
                Over 1000+ Lives Changed
              </p>
              <blockquote className="mt-6 text-3xl md:text-5xl font-medium italic uppercase leading-tight text-brand-800">
                "My husband lost 30 pounds and I’ve lost 14 pounds. We feel so good and we have continued the program on our own because we know what to do."
              </blockquote>
            </div>

            <div className="text-center">
              <Link to="/signup" className="inline-flex items-center gap-2 text-2xl font-semibold text-brand hover:underline">
                Start your Nuwendo journey now
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PublicPageLayout>
  )
}

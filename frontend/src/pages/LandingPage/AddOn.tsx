import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'

const addons = [
  {
    name: 'Premium Support',
    price: '$99/mo',
    features: [
      '24/7 Priority Support',
      'Dedicated Account Manager',
      'Monthly Strategy Calls',
      'Advanced Analytics',
    ],
  },
  {
    name: 'SEO Optimization',
    price: '$149/mo',
    features: [
      'Keyword Research',
      'On-Page Optimization',
      'Content Strategy',
      'Monthly Reports',
    ],
    popular: true,
  },
  {
    name: 'Maintenance Package',
    price: '$79/mo',
    features: [
      'Regular Updates',
      'Security Monitoring',
      'Performance Optimization',
      'Backup Services',
    ],
  },
]

export function AddOn() {
  return (
    <section id="addon" className="container py-20">
      <div className="flex flex-col items-center text-center space-y-4 mb-12">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
          Add-On Services
        </h2>
        <p className="max-w-[700px] text-muted-foreground md:text-lg">
          Enhance your package with our premium add-on services
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {addons.map((addon, index) => (
          <div
            key={index}
            className={`relative flex flex-col rounded-lg border p-8 ${
              addon.popular
                ? 'border-primary shadow-lg scale-105'
                : 'border-border'
            }`}
          >
            {addon.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                  MOST POPULAR
                </span>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">{addon.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">{addon.price}</span>
              </div>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {addon.features.map((feature, featureIndex) => (
                <li key={featureIndex} className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              className="w-full"
              variant={addon.popular ? 'default' : 'outline'}
            >
              Add to Package
            </Button>
          </div>
        ))}
      </div>
    </section>
  )
}

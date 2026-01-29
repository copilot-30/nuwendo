import { Users, Target, Award } from 'lucide-react'

export function AboutUs() {
  return (
    <section id="about" className="container py-20">
      <div className="flex flex-col items-center text-center space-y-4 mb-12">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
          About Us
        </h2>
        <p className="max-w-[700px] text-muted-foreground md:text-lg">
          We are a team of passionate professionals dedicated to delivering excellence in everything we do.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-lg border bg-card">
          <div className="p-3 rounded-full bg-primary/10">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold">Expert Team</h3>
          <p className="text-muted-foreground">
            Our experienced team brings years of expertise to help you succeed in your business ventures.
          </p>
        </div>

        <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-lg border bg-card">
          <div className="p-3 rounded-full bg-primary/10">
            <Target className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold">Our Mission</h3>
          <p className="text-muted-foreground">
            To empower businesses with innovative solutions that drive growth and create lasting value.
          </p>
        </div>

        <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-lg border bg-card">
          <div className="p-3 rounded-full bg-primary/10">
            <Award className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold">Quality First</h3>
          <p className="text-muted-foreground">
            We maintain the highest standards of quality in every project we undertake.
          </p>
        </div>
      </div>
    </section>
  )
}

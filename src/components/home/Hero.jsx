import { ArrowRight, Building2 } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Hero() {
  return (
    <section className="bg-gradient-to-br from-brand-blue-600 to-brand-blue-800 text-white">
      <div className="mx-auto max-w-7xl px-4 py-24">
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              Connect with high-potential franchises and serious investors
            </h1>
            <p className="mt-4 text-white/90">
              Rodar Franchise World is the platform where brands scale and investors discover vetted franchise opportunities.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/franchises" className="btn-primary">
                Browse Franchises
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link to="/admin" className="btn-secondary">
                List Your Brand
              </Link>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="rounded-xl bg-white/10 p-8 shadow-xl ring-1 ring-white/20">
              <div className="flex items-center gap-3">
                <Building2 className="h-8 w-8" />
                <div>
                  <p className="text-sm text-white/80">Trusted by growing brands</p>
                  <p className="text-lg font-semibold">Scale with confidence</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}



import { Link } from 'react-router-dom'

export default function CTA() {
  return (
    <section className="bg-brand-red-600 text-white">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Ready to grow your franchise network?</h2>
            <p className="text-white/90">Create a listing and reach qualified investors today.</p>
          </div>
          <Link to="/admin" className="btn-primary bg-white text-brand-red-700 hover:bg-white/90 focus:ring-white">
            Get Started
          </Link>
        </div>
      </div>
    </section>
  )
}



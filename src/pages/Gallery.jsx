import SimpleNavbar from '../components/common/SimpleNavbar'
import Footer from '../components/common/Footer'
import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'

export default function Gallery() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true
    const fetchGallery = async () => {
      try {
        const { data, error } = await supabase
          .from('gallery')
          .select('image, title, description')
          .order('created_at', { ascending: false })

        if (error) throw error
        if (isMounted) setItems(data ?? [])
      } catch (e) {
        if (isMounted) setError('Failed to load gallery.')
        // Optional: console.error(e)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    fetchGallery()
    return () => { isMounted = false }
  }, [])

  return (
    <div className="min-h-screen bg-black text-white">
  <SimpleNavbar />
      
      <main className="pt-24">
        <section className="bg-gradient-to-br from-red-50 to-red-100 py-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center">
              <h1 className="text-5xl font-bold text-slate-800 mb-6 font-sans">
                Our Gallery
              </h1>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto font-sans">
                Explore our journey, events, successful partnerships, and franchise opportunities
              </p>
            </div>
          </div>
        </section>

        {/* Gallery Grid */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4">
            {loading && (
              <div className="text-center text-slate-600 font-sans">Loading…</div>
            )}
            {error && (
              <div className="text-center text-red-600 font-sans">{error}</div>
            )}
            {!loading && !error && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
                  >
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                        <h3 className="text-xl font-bold mb-2 font-sans">{item.title}</h3>
                        <p className="text-sm text-gray-200 font-sans">{item.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && !error && items.length === 0 && (
              <div className="text-center py-20">
                <h3 className="text-2xl font-bold text-slate-600 mb-4 font-sans">No items found</h3>
                <p className="text-slate-500 font-sans">Add rows to the ‘gallery’ table in Supabase with columns: image (text URL), title (text), description (text).</p>
              </div>
            )}
          </div>
        </section>

        <section className="py-20 bg-gradient-to-br from-red-100 to-red-200">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold text-slate-800 mb-6 font-sans">
              Want to Be Part of Our Story?
            </h2>
            <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto font-sans">
              Join our network of successful franchise partners and be featured in our gallery.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/contact" className="bg-red-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-red-700 transition-colors font-sans">
                Become a Partner
              </a>
              <a href="/contact" className="bg-white text-red-600 px-8 py-4 rounded-lg font-semibold hover:bg-red-50 transition-colors font-sans">
                Contact Us
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
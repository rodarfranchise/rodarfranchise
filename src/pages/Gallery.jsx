import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { fetchTeamActionImages } from '../services/teamActionService'
import SketchUnderline from '../components/home/SketchUnderline'

export default function Gallery() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const fromTeam = params.get('from') === 'team' || params.get('type') === 'team'
  const [showModal, setShowModal] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const prevItem = () => setActiveIndex((i) => (i - 1 + items.length) % items.length)
  const nextItem = () => setActiveIndex((i) => (i + 1) % items.length)

  useEffect(() => {
    let isMounted = true
    const fetchGallery = async () => {
      try {
        if (fromTeam) {
          const data = await fetchTeamActionImages()
          const mapped = (data || []).map((it) => ({
            image: it.image_data || it.image_url,
            title: it.heading || '',
            description: it.description || '',
          }))
          if (isMounted) setItems(mapped)
        } else {
          const { data, error } = await supabase
            .from('gallery')
            .select('image, title, description')
            .order('created_at', { ascending: false })

          if (error) throw error
          if (isMounted) setItems(data ?? [])
        }
      } catch (e) {
        if (isMounted) setError('Failed to load gallery.')
        // Optional: console.error(e)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    fetchGallery()
    return () => { isMounted = false }
  }, [fromTeam])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Navbar />

      <main className="pt-0">
        <section className="py-16 border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold mb-2 font-sans">
              {fromTeam ? 'Our Team in Action' : 'Our Gallery'}
            </h1>
            <div className="flex justify-center">
              <SketchUnderline width={fromTeam ? 310 : 240} height={18} strokeWidth={5} tilt={-1} className="mb-6" color="#e3ae00" />
            </div>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto font-sans">
              {fromTeam
                ? 'A glimpse of our crew collaborating, presenting, and building together.'
                : 'Explore our journey, events, successful partnerships, and franchise opportunities'}
            </p>
          </div>
        </section>

        {/* Gallery Grid */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4">
            {loading && (
              <div className="text-center text-slate-600 font-sans">Loading…</div>
            )}
            {error && (
              <div className="text-center text-red-600 font-sans">{error}</div>
            )}
            {!loading && !error && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="group relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300"
                    onClick={() => { setActiveIndex(idx); setShowModal(true); }}
                  >
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    
                    {/* Overlay */}
                    {(item.title || item.description) && (
                      <div className="absolute inset-0 pointer-events-none bg-black/0 group-hover:bg-black/55 transition-colors">
                        <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity text-white">
                          {item.title && <h3 className="text-lg font-semibold mb-1">{item.title}</h3>}
                          {item.description && <p className="text-xs leading-relaxed">{item.description}</p>}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {!loading && !error && items.length === 0 && (
              <div className="text-center py-20">
                <h3 className="text-2xl font-bold text-slate-600 mb-4 font-sans">No items found</h3>
                {fromTeam ? (
                  <p className="text-slate-500 font-sans">Add images via Admin → Our Team in Action.</p>
                ) : (
                  <p className="text-slate-500 font-sans">Add rows to the ‘gallery’ table in Supabase with columns: image (text URL), title (text), description (text).</p>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Modal for full view */}
        {showModal && items[activeIndex] && (
          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/70" onClick={() => setShowModal(false)} />
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div
                className="relative bg-black rounded-xl shadow-2xl max-w-6xl w-full"
                onKeyDown={(e) => {
                  if (e.key === 'ArrowLeft') prevItem();
                  else if (e.key === 'ArrowRight') nextItem();
                  else if (e.key === 'Escape') setShowModal(false);
                }}
                tabIndex={0}
              >
                <button
                  type="button"
                  className="absolute top-3 right-3 bg-white/90 text-slate-800 rounded-full h-9 w-9 flex items-center justify-center shadow focus:outline-none"
                  onClick={() => setShowModal(false)}
                  aria-label="Close"
                >
                  <svg viewBox="0 0 20 20" width="18" height="18" fill="currentColor"><path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/></svg>
                </button>
                {items.length > 1 && (
                  <>
                    <button
                      type="button"
                      aria-label="Previous image"
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-800 rounded-full h-10 w-10 flex items-center justify-center shadow focus:outline-none"
                      onClick={(e) => { e.stopPropagation(); prevItem(); }}
                    >
                      <svg viewBox="0 0 20 20" width="18" height="18" fill="currentColor"><path d="M12.7 5.3a1 1 0 010 1.4L9.41 10l3.3 3.3a1 1 0 01-1.42 1.4l-4-4a1 1 0 010-1.4l4-4a1 1 0 011.41 0z"/></svg>
                    </button>
                    <button
                      type="button"
                      aria-label="Next image"
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-800 rounded-full h-10 w-10 flex items-center justify-center shadow focus:outline-none"
                      onClick={(e) => { e.stopPropagation(); nextItem(); }}
                    >
                      <svg viewBox="0 0 20 20" width="18" height="18" fill="currentColor"><path d="M7.3 5.3a1 1 0 000 1.4L10.59 10l-3.3 3.3a1 1 0 001.42 1.4l4-4a1 1 0 000-1.4l-4-4a1 1 0 00-1.41 0z"/></svg>
                    </button>
                  </>
                )}
                <img
                  src={items[activeIndex].image}
                  alt={items[activeIndex].title || 'Gallery item'}
                  className="w-full h-auto max-h-[85vh] object-contain rounded-xl"
                />
                {(items[activeIndex].title || items[activeIndex].description) && (
                  <div className="px-4 py-3 text-white">
                    {items[activeIndex].title && <h3 className="text-lg font-semibold">{items[activeIndex].title}</h3>}
                    {items[activeIndex].description && <p className="text-sm mt-1 leading-relaxed text-slate-200">{items[activeIndex].description}</p>}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
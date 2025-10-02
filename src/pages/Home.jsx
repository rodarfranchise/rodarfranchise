import HeroSection from '../components/home/HeroSection';
import { useState, useEffect } from 'react'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import DarkVeil from "../components/DarkVeil";
import CTA from '../components/home/CTA'
import FranchiseGrid from '../components/home/FranchiseGrid'
import InfiniteBrandCarousel from '../components/home/InfiniteBrandCarousel'
import SketchUnderline from '../components/home/SketchUnderline'
import { getAllFranchises } from '../services/franchiseService'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function Home() {
  const [featuredFranchises, setFeaturedFranchises] = useState([])
  const [loading, setLoading] = useState(true)
  const [navbarDark, setNavbarDark] = useState(false)

  useEffect(() => {
    const loadFeaturedFranchises = async () => {
      setLoading(true)
      try {
        // Load the first 8 franchises to show as featured
        const franchises = await getAllFranchises()
        setFeaturedFranchises(franchises.slice(0, 8))
      } catch (error) {
        console.error('Failed to load featured franchises:', error)
      } finally {
        setLoading(false)
      }
    }
    loadFeaturedFranchises()

    // Prefer IntersectionObserver for robust visibility detection
    const target = document.getElementById('featured-franchises');

    // Fallback scroll handler (in case IO not supported)
    const onScroll = () => {
      const el = document.getElementById('featured-franchises');
      if (!el) return setNavbarDark(false);
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const visible = rect.bottom > 0 && rect.top < vh;
      const inBottom70 = rect.top < vh * 0.7; // top has entered bottom 70% of viewport
      setNavbarDark(visible && inBottom70);
    };

    if ('IntersectionObserver' in window && target) {
      const observer = new IntersectionObserver(
        (entries) => {
          // Toggle dark when the top of the section is within the bottom 70% of the viewport and any part is visible
          const entry = entries[0];
          const vh = window.innerHeight;
          const r = entry.boundingClientRect;
          const visible = r.bottom > 0 && r.top < vh;
          const inBottom70 = r.top < vh * 0.5;
          setNavbarDark(visible && inBottom70);
        },
        {
          root: null,
          rootMargin: '0px',
          threshold: [0, 0.01, 0.1, 0.25, 0.5, 0.75, 1],
        }
      );
      observer.observe(target);

      // Initial evaluation
      onScroll();

      return () => {
        observer.disconnect();
        window.removeEventListener('scroll', onScroll);
      };
    } else {
      // Fallback to scroll listener
      window.addEventListener('scroll', onScroll);
      // Initial evaluation
      onScroll();
      return () => window.removeEventListener('scroll', onScroll);
    }
  }, [])

  return (
    <div className="flex min-h-full flex-col bg-black">
      <div className="relative w-screen h-screen flex items-center justify-center overflow-hidden">
        <DarkVeil hueShift={210} noiseIntensity={0} scanlineIntensity={0} speed={0.9} scanlineFrequency={2.5} warpAmount={0.08} resolutionScale={1} />
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          <h1 className="text-5xl md:text-6xl font-bold text-white drop-shadow-lg mb-2 text-center px-4">Discover Franchise Opportunities</h1>
          <p className="text-lg md:text-xl text-white/80 mb-8 text-center max-w-2xl px-4">Find, compare, and connect with top franchises with Rodar Franchise World. Start your business journey today.</p>
          <button
            onClick={() => {
              const el = document.getElementById('search-franchises');
              if (!el) return;
              // Use scroll-margin-top on the target section for consistent offset
              el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className="mt-2 px-8 py-3 rounded-full bg-white/10 backdrop-blur-lg text-white font-light text-lg shadow-lg border border-white/20 hover:bg-white/20 transition-all duration-200"
            style={{ boxShadow: '0 4px 24px 0 rgba(31,38,135,0.25)' }}
          >
            Explore options
          </button>
        </div>
      </div>
      <Navbar dark={navbarDark} />
  <main id="main-content" className="flex-1 px-4">
        {/* Franchise Search Section below DarkVeil */}
           <section id="search-franchises" className="relative z-20 mt-10 mb-6 scroll-mt-44">
          <div className="mx-auto max-w-7xl px-4">
            <div
              className="rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl bg-white/10 border border-white/20"
              style={{ boxShadow: '0 8px 32px 0 rgba(31,38,135,0.25)' }}
            >
              <HeroSection />
            </div>
          </div>
        </section>
    <section className="mx-auto max-w-5xl md:max-w-6xl lg:max-w-7xl px-4 pb-6 pt-2">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight font-sans text-white text-center px-4" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
            Why Rodar?
            <SketchUnderline width={160} height={18} strokeWidth={6} tilt={2} className="mt-0" />
          </h2>
          <p className="mt-4 text-lg md:text-xl font-sans text-white text-center max-w-4xl mx-auto px-4" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
            We connect ambitious brands with investors via a trusted, data-driven marketplace.<br />
            Our platform is designed to make franchise discovery simple, transparent, and rewarding. Whether you’re a first-time entrepreneur or a seasoned investor, Rodar provides expert guidance, curated opportunities, and ongoing support to help you succeed.<br />
            Join a growing network of successful partners and experience the difference of working with a team that truly cares about your business journey.
          </p>
        </section>
        {/* Infinite Brand Carousel */}
        <InfiniteBrandCarousel />
  <section id="featured-franchises" className="bg-slate-50 py-16">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mb-8 flex items-center justify-between">
              <div className="w-full flex flex-col items-center justify-center">
                <h2 className="text-2xl font-semibold tracking-tight font-sans text-center px-4" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                  Featured Franchises
                  <SketchUnderline width={240} height={18} strokeWidth={6} tilt={-2} className="mt-0" />
                </h2>
                <p className="mt-2 text-slate-600 font-sans text-center max-w-2xl px-4" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                  Explore our curated selection of top franchise opportunities
                </p>
              </div>
              <Link
                to="/search"
                className="inline-flex items-center gap-1 text-brand-blue-600 hover:text-brand-blue-700 font-sans whitespace-nowrap"
                style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
              >
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm font-sans" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
              <FranchiseGrid
                items={featuredFranchises}
                loading={loading}
                emptyMessage="No featured franchises available at the moment"
              />
            </div>
          </div>
        </section>
        <CTA />
      </main>
      <Footer />
    </div>
  )
}



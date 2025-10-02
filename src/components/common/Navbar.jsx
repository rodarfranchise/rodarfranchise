


import { Link, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import iconWhite from '../../assets/icon_white.png';
import { useState } from 'react';




export default function Navbar({ dark }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const isHome = location?.pathname === '/';
  // If dark prop is provided, respect it; otherwise default to dark on all pages except home
  const isDark = typeof dark === 'boolean' ? dark : !isHome;
  // Fixed only on Home, non-sticky elsewhere, with a small top offset for both
  return (
    <nav className={`w-full flex items-center justify-center py-3 px-4 z-[9999] 
      ${isHome ? 'fixed md:fixed left-0 top-4 md:top-6' : 'static mt-4 md:mt-6'}`}>
      <div
        className={`w-full max-w-4xl flex items-center justify-between rounded-full px-4 md:px-12 py-5 shadow-2xl backdrop-blur-2xl ring-2 ring-white/30 border ${isDark ? 'bg-black/60 border-black/60' : 'bg-white/10 border-white/20'}`}
        style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)' }}
      >
        <div className="flex items-center gap-3">
          <img src={iconWhite} alt="Logo" className="h-14 w-14 rounded-full object-cover" />
          <span className="font-light text-white text-lg tracking-tight">Rodar Franchise World</span>
        </div>
        {/* Hamburger for mobile */}
        <button
          className="md:hidden ml-auto text-white p-2 rounded focus:outline-none"
          aria-label="Toggle menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <Menu className="h-7 w-7" />
        </button>
        {/* Desktop links: transparent row */}
        <div className="hidden md:flex items-center gap-10">
          <Link to="/" className="font-light text-white text-base hover:text-[#e0e0e0] transition-colors py-0">Home</Link>
          <Link to="/search" className="font-light text-white text-base hover:text-[#e0e0e0] transition-colors py-0">Franchises</Link>
          <Link to="/about" className="font-light text-white text-base hover:text-[#e0e0e0] transition-colors py-0">About</Link>
          <Link to="/contact" className="font-light text-white text-base hover:text-[#e0e0e0] transition-colors py-0">Contact Us</Link>
        </div>
        {/* Mobile dropdown links: glass panel */}
        <div className={`${menuOpen ? 'flex' : 'hidden'} md:hidden flex-col items-center gap-2 w-full text-center absolute left-0 right-0 top-full z-50 
          ${isDark ? 'bg-black/60 border-black/60' : 'bg-white/10 border-white/20'} border backdrop-blur-2xl ring-2 ring-white/30 rounded-b-2xl rounded-t-2xl transition-all duration-300`}>
          <Link to="/" className="font-light text-white text-base hover:text-[#e0e0e0] transition-colors py-3">Home</Link>
          <Link to="/search" className="font-light text-white text-base hover:text-[#e0e0e0] transition-colors py-3">Franchises</Link>
          <Link to="/about" className="font-light text-white text-base hover:text-[#e0e0e0] transition-colors py-3">About</Link>
          <Link to="/contact" className="font-light text-white text-base hover:text-[#e0e0e0] transition-colors py-3">Contact Us</Link>
        </div>
      </div>
    </nav>
  )
}



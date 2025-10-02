import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, Building2, Users, TrendingUp } from 'lucide-react'
import icon from '../../assets/icon.png'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-black text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div>
                <img src={icon} alt="Rodar Icon" className="h-20 w-20 object-contain" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Rodar Franchise World</h3>
                <p className="text-sm text-slate-400">Franchising Platform</p>
              </div>
            </div>
            <p className="text-slate-400 text-sm">
              Connecting ambitious brands with serious investors through our trusted franchising marketplace.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-slate-400 hover:text-white transition-colors duration-200">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/search" className="text-slate-400 hover:text-white transition-colors duration-200">
                  Browse Franchises
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-slate-400 hover:text-white transition-colors duration-200">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-slate-400 hover:text-white transition-colors duration-200">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Our Services</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-slate-400">
                <Building2 className="h-4 w-4 text-yellow-400" />
                <span>Franchise Consulting</span>
              </li>
              <li className="flex items-center gap-2 text-slate-400">
                <Users className="h-4 w-4 text-yellow-400" />
                <span>Investor Matching</span>
              </li>
              <li className="flex items-center gap-2 text-slate-400">
                <TrendingUp className="h-4 w-4 text-yellow-400" />
                <span>Business Growth</span>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Contact Info</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-400">
                <Mail className="h-4 w-4 text-yellow-400" />
                <span className="text-sm">info@rodar.com</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Phone className="h-4 w-4 text-yellow-400" />
                <span className="text-sm">+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <MapPin className="h w text-yellow-400" />
                <span className="text-sm">10, Kamarajar Nagar, Dr.Subbarao Nagar, NGO Colony, Choolaimedu, Chennai, Tamil Nadu, India</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 border-t border-slate-800 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-slate-400">
              Made by BLURB
            </p>
            <p className="text-sm text-slate-400">
              © {currentYear} Rodar Franchise World. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-slate-400">
              <Link to="/privacy" className="hover:text-white transition-colors duration-200">
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-white transition-colors duration-200">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}



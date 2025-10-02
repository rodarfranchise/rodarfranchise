
import icon from '../../assets/icon.png';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function SimpleNavbar({ showBackButton = false, backButtonText = "Back" }) {
  const navigate = useNavigate();

  return (
    <nav className="w-full flex items-center pt-8 pb-3 px-4 bg-black">
      <div className="w-full flex items-center relative px-4 md:px-12">
        {showBackButton && (
          <button
            onClick={() => navigate(-1)}
            className="absolute left-4 md:left-8 inline-flex items-center gap-2 text-sm text-white hover:text-gray-300 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {backButtonText}
          </button>
        )}
        
        <Link to="/" className="flex items-center gap-3 mx-auto">
          <img src={icon} alt="Logo" className="h-20 w-20 rounded-full object-cover" />
          <span className="font-bold text-white text-2xl tracking-tight">Rodar Franchise World</span>
        </Link>
      </div>
    </nav>
  );
}

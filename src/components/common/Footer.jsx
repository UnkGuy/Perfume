import React from 'react'; 
import { Instagram, Facebook } from 'lucide-react'; 
import { useNavigate } from 'react-router-dom'; 
import { useUI } from '../../contexts/UIContext'; 
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';

const Footer = () => { 
  const { setCurrentPage } = useUI(); 
  const { userRole } = useAuth(); 
  const { settings } = useSettings();
  const navigate = useNavigate();

  const isAdmin = userRole === 'admin';
  const storeInfo = settings?.storeInfo || {};

  const handleLogoClick = () => { 
    if (isAdmin) { 
      navigate('/admin'); 
    } else { 
      setCurrentPage('welcome'); 
      window.scrollTo({ top: 0, behavior: 'smooth' }); 
    } 
  };

  return (
    <footer className="w-full bg-rich-black border-t border-white/10 py-12 relative z-10 overflow-hidden">
      <div className="container mx-auto px-6 max-w-7xl flex flex-col items-center text-center">
        <div
          className="flex items-center gap-4 mb-6 group cursor-pointer"
          onClick={handleLogoClick}
        >
          <img
            src="https://zmewzupojoufgryrskrs.supabase.co/storage/v1/object/public/assets-images/kl%20scents%20logo.jpg"
            alt={storeInfo.name || "KL Scents"}
            className="w-12 h-12 rounded-full object-cover border border-white/10 group-hover:border-gold-400/50 transition-colors shadow-lg"
          />
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold tracking-[0.2em] text-white group-hover:text-gold-400 transition-colors uppercase">{storeInfo.name || 'KL SCENTS'}</span>
            <span className="text-xs tracking-[0.5em] text-gold-400/80">PHILIPPINES</span>
          </div>
        </div>

        <p className="text-gold-200/80 font-serif italic text-lg mb-8 max-w-md">
          "{storeInfo.tagline || 'Experience luxury in every drop.'}"
        </p>

        <div className="flex gap-6 mb-10">
          {storeInfo.instagramUrl && <SocialIcon href={storeInfo.instagramUrl} icon={<Instagram size={20} />} />}
          {storeInfo.facebookUrl && <SocialIcon href={storeInfo.facebookUrl} icon={<Facebook size={20} />} />}
        </div>

        <div className="w-full max-w-xs h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />

        <p className="text-gray-500 text-sm tracking-wide">
          © {new Date().getFullYear()} {storeInfo.name || 'KL Scents'} PH. All rights reserved.
        </p>
      </div>
    </footer>
  ); 
};

const SocialIcon = ({ icon, href }) => ( 
  <a href={href} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-gold-400 hover:scale-110 transition-all duration-300">
    {icon}
  </a>
);

export default Footer;
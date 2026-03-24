import React from 'react';
import { Gem, Instagram, Facebook, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-rich-black border-t border-gold-400/20 pt-16 pb-8 relative overflow-hidden">
      {/* Decorative background blur */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-1 bg-gold-400/30 blur-[50px] pointer-events-none" />

      <div className="container mx-auto px-6 max-w-7xl flex flex-col items-center text-center">
        
        {/* Logo Section */}
        <div className="flex items-center gap-3 mb-6 group cursor-default">
          <div className="p-2 rounded-full bg-white/5 border border-white/10 group-hover:border-gold-400/50 transition-colors">
            <Gem size={24} className="text-gold-400" />
          </div>
          <span className="text-2xl font-bold tracking-[0.2em] text-white group-hover:text-gold-100 transition-colors">
            KL SCENTS PH
          </span>
        </div>

        {/* Tagline */}
        <p className="text-gold-200/80 font-serif italic text-lg mb-8 max-w-md">
          "Experience luxury in every drop."
        </p>

        {/* Optional: Social Icons (Common in footers) */}
        <div className="flex gap-6 mb-10">
          <SocialIcon href="https://www.instagram.com/klscentsph" icon={<Instagram size={20} />} />
          <SocialIcon href="https://www.facebook.com/profile.php?id=61568097239499" icon={<Facebook size={20} />} />
        </div>

        {/* Divider */}
        <div className="w-full max-w-xs h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />

        {/* Copyright */}
        <p className="text-gray-500 text-sm tracking-wide">
          © {new Date().getFullYear()} KL Scents PH. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

// Helper component for social icons to keep code clean
const SocialIcon = ({ icon }) => (
  <a 
    href="#" 
    className="text-gray-400 hover:text-gold-400 hover:scale-110 transition-all duration-300"
  >
    {icon}
  </a>
);

export default Footer;
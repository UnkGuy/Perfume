import React from 'react';
import { Instagram, Facebook, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-rich-black border-t border-gold-400/20 pt-16 pb-8 relative overflow-hidden">
      {/* Decorative background blur */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-1 bg-gold-400/30 blur-[50px] pointer-events-none" />

      <div className="container mx-auto px-6 max-w-7xl flex flex-col items-center text-center">
        
        {/* ✨ NEW LOGO SECTION ✨ */}
        <div className="flex items-center gap-4 mb-6 group cursor-default">
          <img 
            src="https://zmewzupojoufgryrskrs.supabase.co/storage/v1/object/public/assets-images/kl%20scents%20logo.jpg" 
            alt="KL Scents" 
            className="w-12 h-12 rounded-full object-cover border border-white/10 group-hover:border-gold-400/50 transition-colors shadow-lg"
          />
          {/* Footer Logo Option */}
<div className="flex flex-col items-center">
  <span className="text-2xl font-bold tracking-[0.2em] text-white">KL SCENTS</span>
  <span className="text-xs tracking-[0.5em] text-gold-400/80">PHILIPPINES</span>
</div>
        </div>

        {/* Tagline */}
        <p className="text-gold-200/80 font-serif italic text-lg mb-8 max-w-md">
          "Experience luxury in every drop."
        </p>

        {/* Social Icons */}
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
const SocialIcon = ({ icon, href }) => (
  <a 
    href={href} 
    target="_blank" 
    rel="noreferrer"
    className="text-gray-400 hover:text-gold-400 hover:scale-110 transition-all duration-300"
  >
    {icon}
  </a>
);

export default Footer;
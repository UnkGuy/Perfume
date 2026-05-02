import React from 'react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { useSettings } from '../contexts/SettingsContext';

const TermsPage = () => {
  const { settings } = useSettings();
  
  return (
    <div className="min-h-screen bg-rich-black text-white font-sans flex flex-col">
      <Header />
      <div className="flex-1 container mx-auto px-6 pt-32 pb-24 max-w-4xl">
        <h1 className="text-3xl md:text-5xl font-bold mb-8 text-gold-400">Terms & Conditions</h1>
        
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 md:p-10 shadow-xl">
          {settings.legal?.termsAndConditions ? (
            <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
              {settings.legal.termsAndConditions}
            </div>
          ) : (
            <p className="text-gray-500 italic">Our Terms and Conditions are currently being updated. Please check back later.</p>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TermsPage;
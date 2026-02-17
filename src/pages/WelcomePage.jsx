import React, { useRef } from 'react';
import { Crown, Star, Sparkles, ShieldCheck, Truck, ChevronDown } from 'lucide-react';

import Header from '../components/Header';
import Footer from '../components/Footer';

import perfumeHero from '../assets/images/perfume.jpg'; 

const WelcomePage = ({ setCurrentPage, cartItems }) => {
  const learnMoreRef = useRef(null);

  const scrollToLearnMore = () => {
    learnMoreRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-rich-black text-white selection:bg-gold-400 selection:text-black font-sans">
      
      {/* Header Wrapper */}
      <div className="relative z-50">
        <Header setCurrentPage={setCurrentPage} cartItems={cartItems} />
      </div>

      {/* --- HERO SECTION --- */}
      <div className="relative pt-24 pb-12 lg:pt-32 lg:pb-24 overflow-hidden">
        
        {/* Ambient Background Effects (The "Blobs") */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-gold-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Content */}
            <div className="space-y-8 z-10">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-gold-400/20 backdrop-blur-sm animate-fade-in">
                <Crown size={16} className="text-gold-400" />
                <span className="text-sm font-medium text-gold-100 tracking-wide uppercase">New Collection 2024</span>
              </div>

              {/* Title with Gradient Text */}
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                Discover Your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-100 to-gold-400">
                  Signature Scent
                </span>
              </h1>

              <p className="text-lg text-gray-400 max-w-lg leading-relaxed">
                Curated collection of luxury perfumes from around the world. 
                Experience elegance, sophistication, and timeless beauty in every bottle.
              </p>

              {/* Buttons */}
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => setCurrentPage('products')}
                  className="px-8 py-4 bg-gold-400 hover:bg-gold-300 text-rich-black font-bold rounded-sm transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(212,175,55,0.3)]"
                >
                  Explore Collection
                </button>
                <button 
                  onClick={scrollToLearnMore}
                  className="px-8 py-4 bg-transparent border border-gray-700 hover:border-gold-400 text-gray-300 hover:text-gold-400 rounded-sm transition-all flex items-center gap-2 group"
                >
                  Learn More
                  <ChevronDown size={16} className="group-hover:translate-y-1 transition-transform" />
                </button>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/10">
                <div>
                  <p className="text-2xl font-bold text-white">500+</p>
                  <p className="text-xs text-gold-400 uppercase tracking-wider mt-1">Premium Scents</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">50K+</p>
                  <p className="text-xs text-gold-400 uppercase tracking-wider mt-1">Happy Customers</p>
                </div>
                <div>
                  <div className="flex gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} className="fill-gold-400 text-gold-400" />
                    ))}
                  </div>
                  <p className="text-xs text-gold-400 uppercase tracking-wider">5.0 Rating</p>
                </div>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative flex justify-center lg:justify-end">
               {/* Decorative Circle behind image */}
              <div className="absolute inset-0 bg-gradient-to-b from-gold-500/20 to-transparent rounded-full blur-2xl transform scale-75" />
              
              <div className="relative z-10 transform hover:-translate-y-2 transition-transform duration-500">
                {/* USING THE IMPORTED IMAGE VARIABLE HERE */}
                <img 
                  src={perfumeHero} 
                  alt="Luxury Perfume Bottle" 
                  className="rounded-xl shadow-2xl drop-shadow-[0_20px_50px_rgba(212,175,55,0.15)] max-h-[500px] object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- FEATURES SECTION --- */}
      <div 
        ref={learnMoreRef} 
        className="py-24 bg-dark-gray relative"
      >
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Why Choose <span className="text-gold-400">KL Scents?</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              We believe luxury shouldn't be complicated. We bring the world's finest fragrances directly to your doorstep with white-glove service.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature Card 1 */}
            <FeatureCard 
              icon={<ShieldCheck size={32} />}
              title="100% Authentic"
              desc="Every bottle is guaranteed authentic. We source directly from authorized distributors to ensure quality."
            />
            {/* Feature Card 2 */}
            <FeatureCard 
              icon={<Sparkles size={32} />}
              title="Long-Lasting Scents"
              desc="Our curated selection focuses on perfumes with high oil concentration for a scent that lasts all day."
            />
            {/* Feature Card 3 */}
            <FeatureCard 
              icon={<Truck size={32} />}
              title="Fast & Secure Shipping"
              desc="Same-day delivery available for Metro Manila. Secure packaging ensures your bottle arrives safely."
            />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

// Sub-component for cleaner code
const FeatureCard = ({ icon, title, desc }) => (
  <div className="p-8 rounded-2xl bg-rich-black border border-white/5 hover:border-gold-400/30 transition-colors group">
    <div className="w-14 h-14 bg-gold-400/10 rounded-lg flex items-center justify-center text-gold-400 mb-6 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
    <p className="text-gray-400 leading-relaxed text-sm">
      {desc}
    </p>
  </div>
);

export default WelcomePage;
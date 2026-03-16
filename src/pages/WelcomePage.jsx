import React from 'react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { ArrowRight, Sparkles, Droplets, Wind } from 'lucide-react';

// Use your dynamic cloud fallback here!
const HERO_IMAGE = 'https://zmewzupojoufgryrskrs.supabase.co/storage/v1/object/public/product-images/test.jpg';

const WelcomePage = ({ 
  setCurrentPage, cartItems, wishlistItems, 
  onCartClick, onWishlistClick, searchQuery, setSearchQuery, 
  user, handleLogout 
}) => {
  
  return (
    <div className="min-h-screen bg-rich-black text-white font-sans flex flex-col selection:bg-gold-400 selection:text-black">
      
      <div className="relative z-50">
        <Header 
          setCurrentPage={setCurrentPage} cartItems={cartItems} wishlistItems={wishlistItems}
          onCartClick={onCartClick} onWishlistClick={onWishlistClick}
          searchQuery={searchQuery} setSearchQuery={setSearchQuery}
          user={user} handleLogout={handleLogout}
        />
      </div>

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative h-[85vh] flex items-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              src={HERO_IMAGE} 
              alt="Luxury Perfume" 
              className="w-full h-full object-cover opacity-40 scale-105 animate-slow-pan"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-rich-black via-rich-black/80 to-transparent"></div>
          </div>

          <div className="container mx-auto px-6 relative z-10 max-w-7xl">
            <div className="max-w-2xl animate-fade-in-up">
              <span className="text-gold-400 font-bold tracking-widest uppercase text-sm mb-4 block">
                Discover Your Signature
              </span>
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                The Essence of <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 to-gold-600">Pure Luxury</span>
              </h1>
              <p className="text-gray-300 text-lg md:text-xl mb-10 max-w-lg leading-relaxed">
                Handcrafted fragrances designed to leave an unforgettable impression. Explore our curated collection of premium scents.
              </p>
              <button 
                onClick={() => setCurrentPage('products')}
                className="group px-8 py-4 bg-gold-400 text-rich-black font-bold uppercase tracking-widest rounded-sm hover:bg-gold-300 transition-all flex items-center gap-3"
              >
                Shop Collection
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section className="py-24 bg-white/5 border-y border-white/5">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-gold-400/10 flex items-center justify-center text-gold-400 mb-6">
                  <Sparkles size={28} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Premium Ingredients</h3>
                <p className="text-gray-400 leading-relaxed">Sourced globally from the finest botanicals to ensure a rich, long-lasting scent profile.</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-gold-400/10 flex items-center justify-center text-gold-400 mb-6">
                  <Droplets size={28} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Extrait de Parfum</h3>
                <p className="text-gray-400 leading-relaxed">Highly concentrated formulations guaranteeing projection and longevity throughout your day.</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-gold-400/10 flex items-center justify-center text-gold-400 mb-6">
                  <Wind size={28} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Artisan Crafted</h3>
                <p className="text-gray-400 leading-relaxed">Blended and aged perfectly by master perfumers to achieve ultimate olfactory balance.</p>
              </div>
            </div>
          </div>
        </section>

        {/* STORY SECTION */}
        <section className="py-24">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="flex flex-col md:flex-row items-center gap-16">
              <div className="w-full md:w-1/2 relative aspect-square md:aspect-[4/5] rounded-2xl overflow-hidden">
                <img 
                  src={HERO_IMAGE} 
                  alt="Crafting Perfume" 
                  className="w-full h-full object-cover grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-700"
                />
              </div>
              <div className="w-full md:w-1/2">
                <h2 className="text-4xl font-bold text-white mb-6">A Symphony of Scents</h2>
                <p className="text-gray-400 text-lg leading-relaxed mb-6">
                  We believe that a fragrance is more than just a scent—it is an invisible accessory, a memory trigger, and a profound expression of your personal identity.
                </p>
                <p className="text-gray-400 text-lg leading-relaxed mb-8">
                  Every bottle in our collection represents countless hours of balancing top notes of bright citrus and fresh florals, with deep, resonant base notes of oud, amber, and rich woods. 
                </p>
                <button 
                  onClick={() => setCurrentPage('products')}
                  className="px-6 py-3 border border-gold-400 text-gold-400 hover:bg-gold-400 hover:text-black font-bold uppercase tracking-widest transition-colors rounded-sm"
                >
                  Find Your Match
                </button>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default WelcomePage;
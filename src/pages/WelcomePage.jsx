import React, { useEffect, useRef } from 'react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { ArrowRight, Sparkles, Droplets, Wind } from 'lucide-react';
import { useUI } from '../contexts/UIContext'; // <-- NEW IMPORT

const HERO_IMAGE = 'https://zmewzupojoufgryrskrs.supabase.co/storage/v1/object/public/product-images/test.jpg';

const useScrollReveal = (options = {}) => {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.classList.add('is-visible');
        else el.classList.remove('is-visible');
      },
      { threshold: 0.12, ...options }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
};

const FeatureCard = ({ icon, title, description, delay }) => {
  const ref = useScrollReveal();
  return (
    <div ref={ref} className="reveal-up flex flex-col items-center" style={{ '--delay': delay }}>
      <div className="w-16 h-16 rounded-full bg-gold-400/10 flex items-center justify-center text-gold-400 mb-6 icon-ring">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3 feature-title">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
};

// ✨ Removed ALL props! ✨
const WelcomePage = () => {
  const { setCurrentPage } = useUI(); // Pull routing from Context

  const storyImageRef = useScrollReveal();
  const storyHeadingRef = useScrollReveal();
  const storyP1Ref = useScrollReveal();
  const storyP2Ref = useScrollReveal();
  const storyBtnRef = useScrollReveal();

  return (
    <div className="min-h-screen bg-rich-black text-white font-sans flex flex-col selection:bg-gold-400 selection:text-black">
      <style>{`
        .reveal-up, .reveal-left, .reveal-right, .reveal-fade { opacity: 0; transition: opacity 0.7s ease calc(var(--delay, 0s)), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1) calc(var(--delay, 0s)); }
        .reveal-up { transform: translateY(40px); } .reveal-left { transform: translateX(-48px); } .reveal-right { transform: translateX(48px); } .reveal-fade { transform: translateY(16px); }
        .reveal-up.is-visible, .reveal-left.is-visible, .reveal-right.is-visible, .reveal-fade.is-visible { opacity: 1; transform: translate(0); }
        .icon-ring { transition: transform 0.4s ease, background-color 0.4s ease, box-shadow 0.4s ease; }
        .reveal-up:hover .icon-ring { transform: scale(1.15); background-color: rgba(212, 175, 55, 0.2); box-shadow: 0 0 24px rgba(212, 175, 55, 0.25); }
        .feature-title { transition: color 0.3s ease; }
        .reveal-up:hover .feature-title { color: #d4af37; }
        .story-image-wrap { opacity: 0; transform: translateX(-48px) scale(0.97); transition: opacity 0.8s ease, transform 0.8s cubic-bezier(0.22, 1, 0.36, 1); }
        .story-image-wrap.is-visible { opacity: 1; transform: translateX(0) scale(1); }
        .story-divider { display: block; width: 0; height: 2px; background: linear-gradient(90deg, #d4af37, transparent); margin-bottom: 1.5rem; transition: width 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.2s; }
        .reveal-fade.is-visible .story-divider { width: 64px; }
      `}</style>

      <div className="relative z-50">
        {/* ✨ Header takes NO PROPS now! ✨ */}
        <Header />
      </div>

      <main className="flex-1">
        <section className="relative h-[85vh] flex items-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img src={HERO_IMAGE} alt="Luxury Perfume" className="w-full h-full object-cover opacity-40 scale-105 animate-slow-pan" />
            <div className="absolute inset-0 bg-gradient-to-r from-rich-black via-rich-black/80 to-transparent"></div>
          </div>
          <div className="container mx-auto px-6 relative z-10 max-w-7xl">
            <div className="max-w-2xl animate-fade-in-up">
              <span className="text-gold-400 font-bold tracking-widest uppercase text-sm mb-4 block">Discover Your Signature</span>
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
                Shop Collection <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </section>

        <section className="py-24 bg-white/5 border-y border-white/5">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
              <FeatureCard icon={<Sparkles size={28} />} title="Premium Ingredients" description="Sourced globally from the finest botanicals to ensure a rich, long-lasting scent profile." delay="0s" />
              <FeatureCard icon={<Droplets size={28} />} title="Extrait de Parfum" description="Highly concentrated formulations guaranteeing projection and longevity throughout your day." delay="0.15s" />
              <FeatureCard icon={<Wind size={28} />} title="Artisan Crafted" description="Blended and aged perfectly by master perfumers to achieve ultimate olfactory balance." delay="0.3s" />
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="flex flex-col md:flex-row items-center gap-16">
              <div ref={storyImageRef} className="story-image-wrap w-full md:w-1/2 relative aspect-square md:aspect-[4/5] rounded-2xl overflow-hidden">
                <img src={HERO_IMAGE} alt="Crafting Perfume" className="w-full h-full object-cover grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-700" />
              </div>
              <div className="w-full md:w-1/2 flex flex-col">
                <div ref={storyHeadingRef} className="reveal-fade" style={{ '--delay': '0.1s' }}>
                  <span className="story-divider" />
                  <h2 className="text-4xl font-bold text-white mb-6">A Symphony of Scents</h2>
                </div>
                <p ref={storyP1Ref} className="reveal-right text-gray-400 text-lg leading-relaxed mb-6" style={{ '--delay': '0.2s' }}>
                  We believe that a fragrance is more than just a scent—it is an invisible accessory, a memory trigger, and a profound expression of your personal identity.
                </p>
                <p ref={storyP2Ref} className="reveal-right text-gray-400 text-lg leading-relaxed mb-8" style={{ '--delay': '0.32s' }}>
                  Every bottle in our collection represents countless hours of balancing top notes of bright citrus and fresh florals, with deep, resonant base notes of oud, amber, and rich woods.
                </p>
                <div ref={storyBtnRef} className="reveal-up" style={{ '--delay': '0.44s' }}>
                  <button onClick={() => setCurrentPage('products')} className="px-6 py-3 border border-gold-400 text-gold-400 hover:bg-gold-400 hover:text-black font-bold uppercase tracking-widest transition-colors rounded-sm">
                    Find Your Match
                  </button>
                </div>
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
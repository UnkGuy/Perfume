import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useUI } from '../contexts/UIContext';
import { useStoreProducts } from '../hooks/useStoreProducts';
import { useSettings } from '../contexts/SettingsContext';

const HERO_IMAGE = 'https://zmewzupojoufgryrskrs.supabase.co/storage/v1/object/public/product-images/test.jpg';

const useScrollReveal = (options = {}) => {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.classList.add('is-visible');
      },
      { threshold: 0.1, ...options }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
};

const WelcomePage = () => {
  const { setCurrentPage } = useUI(); 
  const { products } = useStoreProducts();
  const { settings } = useSettings();
  const [heroImgIdx, setHeroImgIdx] = useState(0);
  const [storyImgIdx, setStoryImgIdx] = useState(0);
  const navigate = useNavigate();
  const carouselRef = useRef(null);

  const heroImages = useMemo(() => {
    const adminHeroes = settings?.welcomeImages?.hero;
    if (adminHeroes && adminHeroes.length > 0) return adminHeroes;
    const imgs = (products || []).filter(p => p.available && p.image_urls?.length > 0).map(p => p.image_urls[0]);
    return imgs.length > 0 ? imgs : [HERO_IMAGE];
  }, [products, settings?.welcomeImages?.hero]);

  const storyImages = useMemo(() => {
    const adminSecondary = settings?.welcomeImages?.secondary;
    return adminSecondary && adminSecondary.length > 0 ? adminSecondary : [HERO_IMAGE];
  }, [settings?.welcomeImages?.secondary]);

  const nextStoryImage = () => setStoryImgIdx((prev) => (prev + 1) % storyImages.length);
  const prevStoryImage = () => setStoryImgIdx((prev) => (prev - 1 + storyImages.length) % storyImages.length);

  useEffect(() => {
    if (heroImages.length <= 1) return;
    const timer = setInterval(() => setHeroImgIdx(prev => (prev + 1) % heroImages.length), 6000);
    return () => clearInterval(timer);
  }, [heroImages]);

  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = carouselRef.current.offsetWidth * 0.8;
      carouselRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  const featuredProducts = (products || []).filter(p => p.available).slice(0, 8);

  return (
    <div className="min-h-[100dvh] bg-[#050505] text-white font-sans flex flex-col selection:bg-gold-400 selection:text-black">
      <style>{`
        .reveal-up { opacity: 0; transform: translateY(50px); transition: all 1s cubic-bezier(0.16, 1, 0.3, 1) calc(var(--delay, 0s)); }
        .reveal-up.is-visible { opacity: 1; transform: translateY(0); }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        .massive-text-outline {
          -webkit-text-stroke: 1px rgba(255, 255, 255, 0.05);
          color: transparent;
        }
      `}</style>

      <div className="relative z-50">
        <Header />
      </div>

      <main className="flex-1">
        
        {/* HERO SECTION: MASSIVE TYPOGRAPHY OVERLAY */}
        <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden">
          {/* Background Images */}
          <div className="absolute inset-0 z-0">
            {heroImages.map((src, idx) => (
              <img
                key={src}
                src={src}
                alt="Luxury Perfume"
                className="absolute inset-0 w-full h-full object-cover scale-105"
                style={{
                  opacity: idx === heroImgIdx ? 0.4 : 0,
                  transition: 'opacity 2s ease-in-out, transform 10s linear',
                  transform: idx === heroImgIdx ? 'scale(1)' : 'scale(1.05)'
                }}
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/40 via-transparent to-[#050505]"></div>
          </div>

          {/* Massive Background Text */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 w-full text-center pointer-events-none select-none">
            <h1 className="text-[20vw] font-black uppercase tracking-tighter leading-none massive-text-outline">
              AURA
            </h1>
          </div>
          
          {/* Foreground Content */}
          <div className="container relative z-10 px-6 max-w-[100rem] flex flex-col items-center text-center mt-24">
            <span className="text-gold-400 font-bold tracking-[0.4em] uppercase text-xs md:text-sm mb-6 block animate-fade-in-up">
              The Art of Perfumery
            </span>
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-8 leading-[1.1] tracking-tight max-w-4xl animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              Leave an <span className="font-serif italic font-light text-gold-400">unforgettable</span> trace.
            </h2>
            <div className="animate-fade-in-up" style={{animationDelay: '0.4s'}}>
              <button 
                onClick={() => setCurrentPage('products')}
                className="px-10 py-4 bg-gold-400 text-black font-bold uppercase tracking-widest text-sm hover:bg-white hover:text-black transition-colors rounded-sm"
              >
                Enter Collection
              </button>
            </div>
          </div>
        </section>

        {/* TYPOGRAPHIC BENTO BOX FEATURE GRID */}
        <section className="py-24 relative z-10">
          <div className="container mx-auto px-6 max-w-[100rem]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[24rem]">
              
              {/* Large Feature Block */}
              <div className="md:col-span-2 bg-[#0a0a0a] rounded-3xl p-10 border border-white/5 relative overflow-hidden group flex flex-col justify-end">
                <div className="absolute -top-10 -right-4 text-[12rem] font-black text-white/5 select-none transition-transform duration-700 group-hover:scale-105">
                  01
                </div>
                <div className="relative z-10 max-w-lg">
                  <h3 className="text-3xl font-bold text-white mb-4">Masterfully Blended</h3>
                  <p className="text-gray-400 leading-relaxed">
                    We bypass mass production to focus on the art of fine fragrance. Every bottle is carefully aged and blended to achieve the ultimate olfactory balance.
                  </p>
                </div>
              </div>

              {/* Small Feature Block 1 */}
              <div className="bg-[#0a0a0a] rounded-3xl p-10 border border-white/5 flex flex-col justify-between group hover:border-gold-400/30 transition-colors relative overflow-hidden">
                <span className="text-gold-400 font-serif italic text-3xl">02.</span>
                <div className="relative z-10 mt-12">
                  <h3 className="text-xl font-bold text-white mb-2">Premium Sourcing</h3>
                  <p className="text-gray-400 text-sm">Finest botanicals sourced globally for a rich profile.</p>
                </div>
              </div>

              {/* Small Feature Block 2 */}
              <div className="bg-gold-400 rounded-3xl p-10 flex flex-col justify-between text-black relative overflow-hidden">
                <span className="text-black/30 font-serif italic text-3xl">03.</span>
                <div className="relative z-10 mt-12">
                  <h3 className="text-xl font-bold mb-2">Extrait de Parfum</h3>
                  <p className="text-black/70 text-sm font-medium">Highly concentrated formulas for massive projection and longevity.</p>
                </div>
              </div>

              {/* Wide Feature Block */}
              <div className="md:col-span-2 bg-gradient-to-r from-[#0a0a0a] to-[#111] rounded-3xl p-10 border border-white/5 flex items-end justify-between group relative overflow-hidden">
                <div className="absolute -bottom-16 right-0 text-[14rem] font-black text-white/5 select-none transition-transform duration-700 group-hover:-translate-x-4">
                  04
                </div>
                <div className="relative z-10 max-w-md">
                  <span className="text-gold-400 text-xs uppercase tracking-[0.2em] font-bold mb-2 block">Cruelty-Free</span>
                  <h3 className="text-3xl font-bold text-white mb-4">Ethically Crafted</h3>
                  <p className="text-gray-400">Luxury doesn't have to compromise ethics. Our entire line is 100% cruelty-free and vegan.</p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* OVERSIZED CAROUSEL */}
        {featuredProducts.length > 0 && (
          <section className="py-24 relative overflow-hidden bg-[#050505] border-y border-white/5">
            <div className="container mx-auto px-6 max-w-[100rem] mb-16 flex flex-col md:flex-row md:justify-between md:items-end gap-6">
              <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight">
                Curated <span className="font-serif italic text-gray-500 font-light">Works</span>
              </h2>
              <div className="flex gap-4">
                <button onClick={() => scrollCarousel('left')} className="w-14 h-14 flex items-center justify-center border border-white/10 rounded-full hover:bg-white hover:text-black transition-all">
                  <ChevronLeft size={24} />
                </button>
                <button onClick={() => scrollCarousel('right')} className="w-14 h-14 flex items-center justify-center border border-white/10 rounded-full hover:bg-white hover:text-black transition-all">
                  <ChevronRight size={24} />
                </button>
              </div>
            </div>

            <div ref={carouselRef} className="flex overflow-x-auto gap-8 px-6 md:px-12 pb-12 custom-scrollbar snap-x snap-mandatory hide-scrollbar">
              {featuredProducts.map((product) => {
                const imgSource = product.image_urls?.[0] || HERO_IMAGE;
                const displayPrice = product.product_variants?.length > 0 
                  ? Math.min(...product.product_variants.map(v => v.price)) 
                  : product.price;

                return (
                  <div key={product.id} onClick={() => navigate(`/products/${product.id}`)} className="w-[18rem] md:w-[24rem] snap-center shrink-0 group cursor-pointer">
                    <div className="relative aspect-[3/4] overflow-hidden mb-6 rounded-sm bg-[#0a0a0a]">
                      <img src={imgSource} alt={product.name} className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100" />
                      <div className="absolute top-4 left-4">
                        <span className="bg-gold-400 text-black px-3 py-1 text-[10px] font-bold uppercase tracking-widest shadow-lg">Featured</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-2xl font-bold text-white group-hover:text-gold-400 transition-colors">{product.name}</h3>
                        <p className="text-gray-500 text-sm uppercase tracking-widest mt-2">{product.brand}</p>
                      </div>
                      <p className="text-white text-xl">₱{displayPrice.toLocaleString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* MODERN SPLIT STORY LAYOUT */}
        <section className="py-32 relative">
          <div className="container mx-auto px-6 max-w-[100rem]">
            <div className="flex flex-col lg:flex-row gap-0">
              
              {/* Image Side (Massive, Full Height) */}
              <div className="w-full lg:w-1/2 relative h-[50vh] lg:h-[80vh] overflow-hidden rounded-t-3xl lg:rounded-l-3xl lg:rounded-tr-none group">
                <img src={storyImages[storyImgIdx]} alt="Philosophy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                
                {storyImages.length > 1 && (
                  <div className="absolute bottom-8 left-8 flex gap-3 z-20">
                    <button onClick={prevStoryImage} className="w-12 h-12 flex items-center justify-center bg-black/50 backdrop-blur-md text-white rounded-full hover:bg-gold-400 hover:text-black transition-all">
                      <ChevronLeft size={20} />
                    </button>
                    <button onClick={nextStoryImage} className="w-12 h-12 flex items-center justify-center bg-black/50 backdrop-blur-md text-white rounded-full hover:bg-gold-400 hover:text-black transition-all">
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}
              </div>

              {/* Text Side (Card overlapping) */}
              <div className="w-full lg:w-1/2 bg-[#0a0a0a] border border-white/5 p-12 md:p-20 flex flex-col justify-center rounded-b-3xl lg:rounded-r-3xl lg:rounded-bl-none -mt-10 lg:mt-0 lg:-ml-10 z-10 shadow-2xl">
                <span className="text-gold-400 font-bold tracking-[0.3em] uppercase text-xs mb-8 block">Our Philosophy</span>
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 leading-tight tracking-tight">
                  More than a scent. <br/>
                  <span className="font-serif italic text-gray-500 font-light">An identity.</span>
                </h2>
                <p className="text-gray-400 text-lg leading-relaxed mb-6 font-light">
                  A fragrance is an invisible accessory, a memory trigger, and a profound expression of who you are. We don't just mix ingredients; we bottle memories.
                </p>
                <p className="text-gray-400 text-lg leading-relaxed mb-12 font-light">
                  Every formulation represents countless hours of balancing bright top notes with deep, resonant bases to ensure your presence lingers long after you leave the room.
                </p>
                
                <div>
                  <button onClick={() => setCurrentPage('products')} className="group flex items-center gap-4 text-white font-bold uppercase tracking-widest text-sm hover:text-gold-400 transition-colors">
                    Explore The Collection
                    <span className="w-10 h-[1px] bg-gold-400 block group-hover:w-16 transition-all duration-300"></span>
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
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { ArrowRight, Sparkles, Droplets, Wind, ChevronLeft, ChevronRight } from 'lucide-react';
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

const WelcomePage = () => {
  const { setCurrentPage } = useUI(); 
  const { products } = useStoreProducts();
  const { settings } = useSettings();
  const [heroImgIdx, setHeroImgIdx] = useState(0);

  const heroImages = useMemo(() => {
    const adminHeroes = settings?.welcomeImages?.hero;
    if (adminHeroes && adminHeroes.length > 0) {
      return adminHeroes;
    }

    const imgs = (products || [])
      .filter(p => p.available && p.image_urls?.length > 0)
      .map(p => p.image_urls[0]);
    return imgs.length > 0 ? imgs : [HERO_IMAGE];
  }, [products, settings?.welcomeImages?.hero]);

  const storyImages = useMemo(() => {
    const adminSecondary = settings?.welcomeImages?.secondary;
    if (adminSecondary && adminSecondary.length > 0) {
      return adminSecondary;
    }
    return [HERO_IMAGE];
  }, [settings?.welcomeImages?.secondary]);

  const [storyImgIdx, setStoryImgIdx] = useState(0);

  const nextStoryImage = () => {
    setStoryImgIdx((prev) => (prev + 1) % storyImages.length);
  };

  const prevStoryImage = () => {
    setStoryImgIdx((prev) => (prev - 1 + storyImages.length) % storyImages.length);
  };

  useEffect(() => {
    if (heroImages.length <= 1) return;
    const timer = setInterval(() => setHeroImgIdx(prev => (prev + 1) % heroImages.length), 5000);
    return () => clearInterval(timer);
  }, [heroImages]);

  const navigate = useNavigate();

  const storyImageRef = useScrollReveal();
  const storyHeadingRef = useScrollReveal();
  const storyP1Ref = useScrollReveal();
  const storyP2Ref = useScrollReveal();
  const storyBtnRef = useScrollReveal();

  const carouselRef = useRef(null);
  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = carouselRef.current.offsetWidth * 0.8;
      carouselRef.current.scrollBy({ 
        left: direction === 'left' ? -scrollAmount : scrollAmount, 
        behavior: 'smooth' 
      });
    }
  };

  const featuredProducts = (products || []).filter(p => p.available).slice(0, 8);

  const marqueeText = [
    "Free Shipping Nationwide", "•",
    "Artisan Crafted", "•",
    "Extrait de Parfum", "•",
    "Cruelty-Free", "•",
    "Luxury Fragrances", "•"
  ];
  const repeatedMarquee = [...marqueeText, ...marqueeText, ...marqueeText, ...marqueeText];

  return (
    <div className="min-h-[100dvh] bg-rich-black text-white font-sans flex flex-col selection:bg-gold-400 selection:text-black">
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
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        @keyframes scroll-x {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: scroll-x 20s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="relative z-50">
        <Header />
      </div>

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative min-h-[100dvh] lg:min-h-[85vh] flex flex-col justify-center overflow-hidden pt-32 landscape:pt-24 lg:landscape:pt-0 lg:pt-0 pb-16 lg:pb-0">
          <div className="absolute inset-0 z-0 bg-rich-black">
            {heroImages.map((src, idx) => (
              <img
                key={src}
                src={src}
                alt="Luxury Perfume"
                className="absolute inset-0 w-full h-full object-cover scale-105 animate-slow-pan"
                style={{
                  opacity: idx === heroImgIdx ? 0.4 : 0,
                  transition: 'opacity 1.2s ease-in-out',
                }}
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-r from-rich-black via-rich-black/80 to-transparent"></div>
          </div>
          
          <div className="container mx-auto px-6 relative z-10 max-w-[100rem]">
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
                className="group px-8 py-4 bg-gold-400 text-rich-black font-bold uppercase tracking-widest rounded-sm hover:bg-gold-300 transition-all flex items-center gap-3 shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)]"
              >
                Shop Collection <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </section>

        {/* SCROLLING MARQUEE BANNER */}
        {/* <div className="bg-gold-400 py-3 overflow-hidden border-y border-gold-500 shadow-lg">
          <div className="animate-marquee flex gap-8 md:gap-12 items-center">
            {repeatedMarquee.map((text, idx) => (
              <span 
                key={idx} 
                className={`text-black font-bold uppercase tracking-widest whitespace-nowrap ${text === '•' ? 'text-[10px] opacity-60' : 'text-xs md:text-sm'}`}
              >
                {text}
              </span>
            ))}
          </div>
        </div> */}

        {/* FEATURES SECTION */}
        <section className="py-24 bg-white/5">
          <div className="container mx-auto px-6 max-w-[100rem]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
              <FeatureCard icon={<Sparkles size={28} />} title="Premium Ingredients" description="Sourced globally from the finest botanicals to ensure a rich, long-lasting scent profile." delay="0s" />
              <FeatureCard icon={<Droplets size={28} />} title="Extrait de Parfum" description="Highly concentrated formulations guaranteeing projection and longevity throughout your day." delay="0.15s" />
              <FeatureCard icon={<Wind size={28} />} title="Artisan Crafted" description="Blended and aged perfectly by master perfumers to achieve ultimate olfactory balance." delay="0.3s" />
            </div>
          </div>
        </section>

        {/* INTERACTIVE CAROUSEL SECTION */}
        {featuredProducts.length > 0 && (
          <section className="py-24 relative overflow-hidden border-t border-white/5">
            <div className="container mx-auto px-6 max-w-[100rem] mb-10 flex justify-between items-end">
              <div>
                <span className="text-gold-400 font-bold tracking-widest uppercase text-sm mb-2 block">Trending</span>
                <h2 className="text-3xl md:text-4xl font-bold text-white">Featured Collection</h2>
              </div>
              <div className="hidden md:flex gap-3">
                <button 
                  onClick={() => scrollCarousel('left')}
                  className="p-3 border border-white/20 rounded-full hover:border-gold-400 hover:text-gold-400 transition-colors"
                >
                  <ChevronLeft size={24} />
                </button>
                <button 
                  onClick={() => scrollCarousel('right')}
                  className="p-3 border border-white/20 rounded-full hover:border-gold-400 hover:text-gold-400 transition-colors"
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            </div>

            <div 
              ref={carouselRef}
              className="flex overflow-x-auto gap-6 px-6 md:px-12 pb-8 custom-scrollbar snap-x snap-mandatory hide-scrollbar"
            >
              {featuredProducts.map((product) => {
                const imgSource = product.image_urls?.[0] || HERO_IMAGE;
                
                const displayPrice = product.product_variants?.length > 0 
                  ? Math.min(...product.product_variants.map(v => v.price)) 
                  : product.price;

                return (
                  <div 
                    key={product.id} 
                    onClick={() => navigate(`/products/${product.id}`)}
                    className="w-[10rem] min-w-[10rem] md:w-[12.5rem] md:min-w-[12.5rem] snap-center shrink-0 group cursor-pointer"
                  >
                    <div className="relative aspect-[4/5] rounded-xl overflow-hidden mb-3 border border-white/10 group-hover:border-gold-400/50 transition-colors">
                      <img 
                        src={imgSource} 
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-5">
                        <span className="bg-gold-400 text-black px-4 py-2 font-bold uppercase tracking-widest text-[10px] md:text-xs rounded shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
                          View Details
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-start gap-3">
                      <div className="min-w-0">
                        <h3 className="text-base md:text-lg font-bold text-white group-hover:text-gold-400 transition-colors truncate">{product.name}</h3>
                        <p className="text-gray-400 text-xs uppercase tracking-wider mt-1 truncate">{product.brand}</p>
                      </div>
                      <p className="text-white font-medium whitespace-nowrap text-sm md:text-base">
                        {product.product_variants?.length > 1 && <span className="text-[10px] text-gray-400 mr-1 block sm:inline text-right">From</span>}
                        ₱{displayPrice}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* STORY SECTION */}
        <section className="py-24 bg-white/5 border-t border-white/5">
          <div className="container mx-auto px-6 max-w-[100rem]">
            <div className="flex flex-col md:flex-row items-center gap-16">
              <div ref={storyImageRef} className="story-image-wrap w-full md:w-1/2 relative aspect-square md:aspect-[4/5] rounded-2xl overflow-hidden group">
                <img 
                  src={storyImages[storyImgIdx]} 
                  alt="Crafting Perfume" 
                  className="w-full h-full object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" 
                />
                {storyImages.length > 1 && (
                  <>
                    <button 
                      onClick={prevStoryImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gold-400 hover:text-black z-10"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button 
                      onClick={nextStoryImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gold-400 hover:text-black z-10"
                    >
                      <ChevronRight size={24} />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                      {storyImages.map((_, idx) => (
                        <div 
                          key={idx} 
                          className={`w-2 h-2 rounded-full transition-colors ${idx === storyImgIdx ? 'bg-gold-400' : 'bg-white/30'}`}
                        />
                      ))}
                    </div>
                  </>
                )}
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
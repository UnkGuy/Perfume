import React, { useState, useEffect } from 'react';
import { ShoppingBag, User, Search, Menu, X, Heart } from 'lucide-react';

const Header = ({ setCurrentPage, cartItems, wishlistItems, onCartClick }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'welcome', label: 'Home' },
    { id: 'products', label: 'Collection' },
  ];

  return (
    <>
      <header 
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-rich-black/95 backdrop-blur-md border-b border-white/5 py-4 shadow-lg' 
            : 'bg-transparent py-6'
        }`}
      >
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex justify-between items-center">
            
            {/* Logo */}
            <div 
              className="cursor-pointer group" 
              onClick={() => setCurrentPage('welcome')}
            >
              <h1 className="text-2xl font-bold tracking-widest text-white group-hover:text-gold-400 transition-colors">
                KL<span className="text-gold-400">SCENTS</span>
              </h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => setCurrentPage(link.id)}
                  className="text-sm font-medium text-gray-300 hover:text-gold-400 tracking-wide transition-colors uppercase relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gold-400 transition-all group-hover:w-full"></span>
                </button>
              ))}
            </nav>

            {/* Icons */}
            <div className="flex items-center space-x-6">
              <button className="hidden md:block text-gray-300 hover:text-white transition-colors">
                <Search size={20} />
              </button>

              {/* NEW: Wishlist Icon */}
              <button 
                className="relative text-gray-300 hover:text-gold-400 transition-colors group"
                onClick={() => setCurrentPage('products')} // Or a dedicated wishlist page if you make one
              >
                <Heart size={20} />
                {wishlistItems && wishlistItems.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full">
                    {wishlistItems.length}
                  </span>
                )}
              </button>

              <button 
                onClick={() => setCurrentPage('login')}
                className="text-gray-300 hover:text-gold-400 transition-colors"
              >
                <User size={20} />
              </button>

              {/* Cart Icon - Uses onCartClick to open drawer */}
              <button 
                onClick={(e) => {
                   e.preventDefault();
                   if (onCartClick) onCartClick();
                   else setCurrentPage('cart');
                }}
                className="relative text-gray-300 hover:text-gold-400 transition-colors group"
              >
                <ShoppingBag size={20} />
                {cartItems && cartItems.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gold-400 text-rich-black text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full animate-bounce">
                    {cartItems.length}
                  </span>
                )}
              </button>

              <button 
                className="md:hidden text-gray-300"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-rich-black/98 backdrop-blur-xl md:hidden flex flex-col items-center justify-center space-y-8 animate-fade-in">
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute top-6 right-6 text-gray-400 hover:text-white"
          >
            <X size={32} />
          </button>
          
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                setCurrentPage(link.id);
                setIsMobileMenuOpen(false);
              }}
              className="text-2xl font-light text-white hover:text-gold-400 tracking-widest uppercase"
            >
              {link.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
};

export default Header;
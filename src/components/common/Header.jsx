import React, { useState, useEffect } from 'react';
import { ShoppingBag, User, Search, Menu, X, Heart, Sun, Moon, LayoutDashboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../../contexts/ShopContext';
import { useAuth } from '../../contexts/AuthContext';
import { useUI } from '../../contexts/UIContext';

const Header = () => {
  const { user, userRole, handleLogout } = useAuth();
  const { cartItems, wishlistItems, showToast } = useShop();
  const { setCurrentPage, setIsCartOpen, setIsWishlistOpen, searchQuery, setSearchQuery, theme, toggleTheme } = useUI();
  const navigate = useNavigate();

  const isAdmin = userRole === 'admin';

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery || '');

  useEffect(() => { setLocalSearch(searchQuery || ''); }, [searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (setSearchQuery) setSearchQuery(localSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, setSearchQuery]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Customer nav links only — admin never sees these
  const customerNavLinks = [
    { id: 'welcome',  label: 'Home' },
    { id: 'products', label: 'Collection' },
  ];

  const handleLogoClick = () => {
    if (isAdmin) {
      navigate('/admin');
    } else {
      setCurrentPage('welcome');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSearchClick = () => {
    navigate('/products');
    setTimeout(() => {
      document.querySelector('input[placeholder="Search for your perfect scent..."]')?.focus();
    }, 100);
  };

  const handleSignOut = async () => {
    await handleLogout();
    showToast('Logged Out', 'You have been successfully logged out.');
    setCurrentPage('welcome');
  };

  const handleNavClick = (linkId) => {
    if (linkId === 'products') {
      navigate('/products');
    } else {
      setCurrentPage(linkId);
    }
    setIsMobileMenuOpen(false);
  };

  const isDark = theme === 'dark';

  return (
    <>
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-rich-black/95 backdrop-blur-md border-b border-white/5 py-4 shadow-lg' : 'bg-transparent py-6'}`}>
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex justify-between items-center">

            {/* Logo */}
            <div className="cursor-pointer group flex items-center gap-3" onClick={handleLogoClick}>
              <img
                src="https://zmewzupojoufgryrskrs.supabase.co/storage/v1/object/public/assets-images/kl%20scents%20logo.jpg"
                alt="KL Scents"
                className="w-10 h-10 rounded-full object-cover border border-white/10 group-hover:border-gold-400/50 transition-colors shadow-lg"
              />
              <div className="hidden sm:flex flex-col leading-tight">
                <h1 className="text-xl font-bold tracking-widest text-white group-hover:text-gold-400 transition-colors">
                  KL<span className="text-gold-400">SCENTS</span>
                </h1>
                <span className="text-[10px] uppercase tracking-[0.4em] text-gray-400 font-medium -mt-1 group-hover:text-white transition-colors">
                  {isAdmin ? 'Admin Portal' : 'Philippines'}
                </span>
              </div>
            </div>

            {/* Nav: customer links only — hidden for admin */}
            {!isAdmin && (
              <nav className="hidden md:flex items-center space-x-8">
                {customerNavLinks.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => handleNavClick(link.id)}
                    className="text-sm font-medium text-gray-300 hover:text-gold-400 tracking-wide transition-colors uppercase relative group"
                  >
                    {link.label}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gold-400 transition-all group-hover:w-full"></span>
                  </button>
                ))}
              </nav>
            )}

            {/* Admin nav pill */}
            {isAdmin && (
              <nav className="hidden md:flex items-center">
                <button
                  onClick={() => navigate('/admin')}
                  className="flex items-center gap-2 px-4 py-2 bg-gold-400/10 text-gold-400 border border-gold-400/20 rounded-lg text-sm font-bold tracking-widest uppercase hover:bg-gold-400/20 transition-colors"
                >
                  <LayoutDashboard size={16} /> Dashboard
                </button>
              </nav>
            )}

            <div className="flex items-center space-x-4 md:space-x-6">

              {/* Search — customer only */}
              {!isAdmin && (
                <button
                  onClick={handleSearchClick}
                  className="text-gray-300 hover:text-gold-400 transition-colors z-10 p-1"
                >
                  <Search size={20} />
                </button>
              )}

              {/* Wishlist — customer only */}
              {!isAdmin && (
                <button className="relative text-gray-300 hover:text-gold-400 transition-colors" onClick={() => setIsWishlistOpen(true)}>
                  <Heart size={20} />
                  {wishlistItems && wishlistItems.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full">
                      {wishlistItems.length}
                    </span>
                  )}
                </button>
              )}

              {/* User */}
              {user ? (
                <div className="relative group flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(isAdmin ? 'admin' : 'profile')}
                    className="text-gray-300 hover:text-gold-400 transition-colors py-2"
                  >
                    <User size={20} />
                  </button>
                  <div className="absolute top-full right-0 mt-2 w-36 bg-rich-black border border-white/10 rounded shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                    {isAdmin && (
                      <button onClick={() => navigate('/admin')} className="w-full text-left px-4 py-2 text-sm text-gold-400 font-bold hover:bg-white/5 transition-colors border-b border-white/5">
                        Dashboard
                      </button>
                    )}
                    {!isAdmin && (
                      <button onClick={() => setCurrentPage('profile')} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-gold-400 hover:bg-white/5 transition-colors border-b border-white/5">
                        My Account
                      </button>
                    )}
                    <button onClick={handleSignOut} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5 transition-colors">
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setCurrentPage('login')} className="text-gray-300 hover:text-gold-400 transition-colors">
                  <User size={20} />
                </button>
              )}

              {/* Cart — customer only */}
              {!isAdmin && (
                <button
                  className="relative"
                  onClick={(e) => {
                    e.preventDefault();
                    if (!user) {
                      setCurrentPage('login');
                      if (showToast) showToast('Login Required', 'Please sign in to view your cart.');
                      return;
                    }
                    setIsCartOpen(true);
                  }}
                >
                  <ShoppingBag size={20} className="text-gray-300 hover:text-gold-400 transition-colors" />
                  {cartItems && cartItems.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-gold-400 text-rich-black text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full">
                      {cartItems.length}
                    </span>
                  )}
                </button>
              )}

              {/* Mobile menu toggle — customer only */}
              {!isAdmin && (
                <button className="md:hidden text-gray-300" onClick={() => setIsMobileMenuOpen(true)}>
                  <Menu size={24} />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu — customer only */}
      {!isAdmin && isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-rich-black/98 backdrop-blur-xl md:hidden flex flex-col items-center justify-center space-y-8 animate-fade-in">
          <button onClick={() => setIsMobileMenuOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-white">
            <X size={32} />
          </button>
          {customerNavLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
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
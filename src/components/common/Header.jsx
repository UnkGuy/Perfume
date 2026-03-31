import React, { useState, useEffect } from 'react';
import { ShoppingBag, User, Search, Menu, X, Heart } from 'lucide-react';
import { useShop } from '../../contexts/ShopContext'; // <-- ADD THIS LINE

const Header = ({ 
  setCurrentPage, 
  cartItems, 
  wishlistItems, 
  onCartClick, 
  onWishlistClick,
  searchQuery,
  setSearchQuery,
  user,           
  userRole,       // <--- ADD THIS
  handleLogout    
}) => {
  const { showToast } = useShop();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false); 
  
  // --- DEBOUNCE LOGIC ---
  const [localSearch, setLocalSearch] = useState(searchQuery || '');

  // Keep local search in sync if global search changes externally
  useEffect(() => {
    setLocalSearch(searchQuery || '');
  }, [searchQuery]);

  // The actual debounce timer
  // The actual debounce timer
  useEffect(() => {
    const timer = setTimeout(() => {
      if (setSearchQuery) {
        setSearchQuery(localSearch);
      }
    }, 300); 

    return () => clearTimeout(timer);
  }, [localSearch, setSearchQuery]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'welcome', label: 'Home' },
    { id: 'products', label: 'Collection' },
  ];

  const handleSearchChange = (e) => {
    setLocalSearch(e.target.value);
    // Auto-jump to products page immediately so they see the results load
    if (e.target.value.length > 0 && setCurrentPage) {
      setCurrentPage('products'); 
    }
  };

  return (
    <>
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-rich-black/95 backdrop-blur-md border-b border-white/5 py-4 shadow-lg' : 'bg-transparent py-6'}`}>
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex justify-between items-center">
            
            {/* Logo */}
            <div className="cursor-pointer group" onClick={() => setCurrentPage('welcome')}>
              <h1 className="text-2xl font-bold tracking-widest text-white group-hover:text-gold-400 transition-colors">
                KL<span className="text-gold-400">SCENTS</span>
              </h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <button key={link.id} onClick={() => setCurrentPage(link.id)} className="text-sm font-medium text-gray-300 hover:text-gold-400 tracking-wide transition-colors uppercase relative group">
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gold-400 transition-all group-hover:w-full"></span>
                </button>
              ))}
            </nav>

            {/* Icons */}
            <div className="flex items-center space-x-4 md:space-x-6">
              
              {/* --- SEARCH BAR TOGGLE --- */}
              <div className="relative flex items-center">
                {isSearchOpen && (
                  <input 
                    type="text"
                    value={localSearch}
                    onChange={handleSearchChange} 
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setCurrentPage('products');
                      }
                    }}
                    autoFocus
                    placeholder="Search scents..."
                    className="absolute right-8 w-48 bg-black/50 border border-gold-400/50 rounded-full py-1.5 px-4 text-sm text-white focus:outline-none animate-slide-in"
                  />
                )}
                <button 
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="text-gray-300 hover:text-gold-400 transition-colors z-10 p-1"
                >
                  {isSearchOpen ? <X size={20} /> : <Search size={20} />}
                </button>
              </div>

              {/* Wishlist Icon */}
              <button 
                className="relative text-gray-300 hover:text-gold-400 transition-colors group"
                onClick={onWishlistClick} 
              >
                <Heart size={20} />
                {wishlistItems && wishlistItems.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full">
                    {wishlistItems.length}
                  </span>
                )}
              </button>

              {/* SMART USER ICON */}
{user ? (
  <div className="relative group flex items-center gap-2">
    {/* Logged in icon */}
    <button 
      onClick={() => setCurrentPage(userRole === 'admin' ? 'admin' : 'profile')} 
      className="text-gray-300 hover:text-gold-400 transition-colors py-2"
    >
      <User size={20} />
    </button>
    
    <div className="absolute top-full right-0 mt-2 w-32 bg-rich-black border border-white/10 rounded shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
      
      {/* --- SECRET ADMIN BUTTON --- */}
      {userRole === 'admin' && (
        <button 
          onClick={() => setCurrentPage('admin')}
          className="w-full text-left px-4 py-2 text-sm text-gold-400 font-bold hover:bg-white/5 transition-colors border-b border-white/5"
        >
          Dashboard
        </button>
      )}

      <button 
        onClick={() => setCurrentPage('profile')}
        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-gold-400 hover:bg-white/5 transition-colors border-b border-white/5"
      >
        My Account
      </button>
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setCurrentPage('login')} className="text-gray-300 hover:text-gold-400 transition-colors">
                  <User size={20} />
                </button>
              )}

              {/* Cart Icon */}
<button 
  onClick={(e) => { 
    e.preventDefault(); 
    if (!user) {
       setCurrentPage('login'); // Send guests to login!
       if (showToast) showToast('Login Required', 'Please sign in to view your cart.');
       return;
    }
    if (onCartClick) onCartClick(); 
    else setCurrentPage('cart'); 
  }}
>
  <ShoppingBag size={20} />
  {cartItems && cartItems.length > 0 && (
    <span className="absolute -top-2 -right-2 bg-gold-400 text-rich-black text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full animate-bounce">
      {cartItems.length}
    </span>
                )}
              </button>

              <button className="md:hidden text-gray-300" onClick={() => setIsMobileMenuOpen(true)}>
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
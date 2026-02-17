import React, { useState } from 'react';
import WelcomePage from './WelcomePage';
import LoginPage from './LoginPage';
import ProductPage from './ProductPage';
import CartPage from './CartPage';
import MessagesPage from './MessagesPage';
import AdminPage from './AdminPage';
// You don't need App.css anymore if you are using Tailwind classes globally

function App() {
  const [currentPage, setCurrentPage] = useState('welcome');
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (product) => {
    setCartItems([...cartItems, product]);
  };

  const removeFromCart = (index) => {
    setCartItems(cartItems.filter((_, i) => i !== index));
  };

  const renderCurrentPage = () => {
    // We pass setCurrentPage to every component so the Header inside them can work
    const commonProps = { setCurrentPage, cartItems };
    
    switch (currentPage) {
      case 'welcome': return <WelcomePage {...commonProps} />;
      case 'login': return <LoginPage setCurrentPage={setCurrentPage} />;
      case 'products': return <ProductPage {...commonProps} addToCart={addToCart} />;
      case 'cart': return <CartPage {...commonProps} removeFromCart={removeFromCart} />;
      case 'messages': return <MessagesPage {...commonProps} />;
      case 'admin': return <AdminPage />;
      default: return <WelcomePage {...commonProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-rich-black text-white font-sans selection:bg-gold-400 selection:text-black">
      {/* The Page Content */}
      {renderCurrentPage()}

      {/* Dev Debugger - Kept it but made it stylized for the theme */}
      <div className="fixed bottom-4 right-4 z-50 pointer-events-none opacity-50 hover:opacity-100 transition-opacity">
        <div className="bg-black/80 border border-gold-400/30 text-gold-400 font-mono text-xs p-3 rounded backdrop-blur-sm">
          <p>Page: <span className="text-white">{currentPage}</span></p>
          <p>Cart: <span className="text-white">{cartItems.length}</span></p>
        </div>
      </div>
    </div>
  );
}

export default App;
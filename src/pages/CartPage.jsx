import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';

// Cart Components
import EmptyCart from '../components/cart/EmptyCart';
import CartItem from '../components/cart/CartItem';
import CartSummary from '../components/cart/CartSummary';
import SuggestedProducts from '../components/common/SuggestedProducts';

// Hooks & Contexts
import { useShop } from '../contexts/ShopContext';
import { useUI } from '../contexts/UIContext';

const CartPage = () => {
  const { cartItems, removeFromCart, clearCart, updateQuantity } = useShop();
  const { setCurrentPage } = useUI(); 

  const safeCartItems = cartItems || [];
  const [localItems, setLocalItems] = useState([]);
  
  // ✨ Added dedicated success state
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  useEffect(() => {
    const processedItems = safeCartItems.map(item => ({
      ...item,
      quantity: item.quantity, 
      isRemoving: false
    }));
    setLocalItems(processedItems);
  }, [cartItems]);

  const handleQuantity = (index, delta) => {
    const newItems = [...localItems];
    if (newItems[index].quantity + delta >= 1) {
      newItems[index].quantity += delta;
      setLocalItems(newItems); 
      updateQuantity(index, delta); 
    }
  };

  const handleRemove = (index) => {
    const newItems = [...localItems];
    newItems[index].isRemoving = true;
    setLocalItems(newItems);

    setTimeout(() => {
      const filtered = localItems.filter((_, i) => i !== index);
      setLocalItems(filtered);
      removeFromCart(index); 
    }, 500);
  };

  const calculateTotal = () => {
    return localItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const hasUnavailableItems = localItems.some(item => !item.available);
  const cartNotes = localItems.flatMap(item => item.notes || []);
  const cartGender = localItems.length > 0 ? localItems[0].gender : 'Unisex';
  
  // ✨ Show Success UI if checkout went through
  if (checkoutSuccess) {
    return (
      <div className="min-h-[100dvh] bg-rich-black text-white font-sans flex flex-col">
        <Header />
        <div className="flex-1 container mx-auto px-6 pt-32 pb-24 flex flex-col items-center justify-center text-center animate-fade-in">
          <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mb-6 border border-green-500/20">
            <CheckCircle size={48} className="text-green-500" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Inquiry Received!</h1>
          <p className="text-gray-400 max-w-lg mb-8 leading-relaxed">
            Your order request has been sent successfully. Our team will review the details. 
            <br/><br/>
            <strong className="text-white">Please check the chat widget</strong> on your screen to coordinate payment and delivery.
          </p>
          <button 
            onClick={() => { setCheckoutSuccess(false); setCurrentPage('products'); }} 
            className="px-8 py-4 bg-gold-400 hover:bg-gold-300 text-black font-bold uppercase tracking-widest rounded transition-all shadow-lg"
          >
            Continue Shopping
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  if (localItems.length === 0) {
    return <EmptyCart />; 
  }

  return (
    <div className="min-h-[100dvh] bg-rich-black text-white font-sans selection:bg-gold-400 selection:text-black flex flex-col">
      <div className="relative z-50">
        <Header /> 
      </div>
      
      <div className="flex-1 container mx-auto px-6 pt-32 landscape:pt-24 lg:landscape:pt-40 lg:pt-40 pb-24 max-w-[1600px]">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Your Selected Items</h1>
          <p className="text-gray-400">Review your items before messaging the seller</p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-12 mb-16">
          <div className="flex-1 space-y-6">
            {localItems.map((item, index) => (
              <CartItem 
                key={index} 
                item={item} 
                index={index} 
                handleQuantity={handleQuantity} 
                handleRemove={handleRemove} 
              />
            ))}

            <button onClick={() => setCurrentPage('products')} className="flex items-center gap-2 text-gray-400 hover:text-white mt-8 transition-colors">
              <ArrowLeft size={16} /> Continue Shopping
            </button>
          </div>

          <CartSummary 
            localItems={localItems}
            calculateTotal={calculateTotal}
            hasUnavailableItems={hasUnavailableItems}
            onCheckoutSuccess={() => {
              // ✨ Trigger the success UI instead of just quietly emptying the cart
              setCheckoutSuccess(true);
              setLocalItems([]);
              if (clearCart) clearCart(); 
            }}
          />
        </div>

        <SuggestedProducts 
          currentProductId={null} 
          referenceNotes={cartNotes}
          referenceGender={cartGender}
          onSelect={() => setCurrentPage('products')} 
        />
      </div>
      <Footer />
    </div>
  );
};

export default CartPage;
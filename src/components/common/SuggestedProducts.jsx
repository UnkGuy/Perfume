import React from 'react';
import { useStoreProducts } from '../../hooks/useStoreProducts';
import ProductCard from '../products/ProductCard';

const SuggestedProducts = ({ 
  currentProductId, 
  referenceNotes = [], 
  referenceGender, 
  onSelect, onAddToCart, onQuickView, onToggleWishlist, wishlistItems, user, setCurrentPage, showToast 
}) => {
  const { products, isLoading } = useStoreProducts();

  if (isLoading || !products || products.length === 0) return null;

  let availableProducts = products.filter(p => p.id !== currentProductId && p.available);

  availableProducts.forEach(p => {
    p.matchScore = 0;
    if (p.gender === referenceGender) p.matchScore += 2;
    if (p.notes && referenceNotes) {
      const commonNotes = p.notes.filter(note => referenceNotes.includes(note));
      p.matchScore += commonNotes.length;
    }
  });

  // ✨ TAKING 4 SUGGESTIONS FOR THE NEW GRID ✨
  const suggestions = availableProducts
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 4); 

  if (suggestions.length === 0) return null;

  return (
    <div className="mt-16 border-t border-white/10 pt-12 animate-fade-in">
      <h3 className="text-2xl font-bold text-white mb-8">You Might Also Like</h3>
      {/* ✨ SET TO MATCH THE 4-COLUMN GAP-8 LAYOUT ✨ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {suggestions.map(product => (
          <ProductCard 
            key={product.id} product={product} onSelect={onSelect} onAddToCart={onAddToCart}
            onQuickView={onQuickView} onToggleWishlist={onToggleWishlist}
            isInWishlist={wishlistItems?.some(item => item.id === product.id)}
            user={user} setCurrentPage={setCurrentPage} showToast={showToast}
          />
        ))}
      </div>
    </div>
  );
};

export default SuggestedProducts;
import React from 'react';
import { useStoreProducts } from '../../hooks/useStoreProducts';
import ProductCard from '../products/ProductCard';

const SuggestedProducts = ({ 
  currentProductId, 
  referenceNotes = [], 
  referenceGender, 
  // Pass down the standard props so the cards work
  onSelect, onAddToCart, onQuickView, onToggleWishlist, wishlistItems, user, setCurrentPage, showToast 
}) => {
  const { products, isLoading } = useStoreProducts();

  if (isLoading || !products || products.length === 0) return null;

  // 1. Filter out the item we are currently looking at, and out-of-stock items
  let availableProducts = products.filter(p => p.id !== currentProductId && p.available);

  // 2. The Recommendation Algorithm (Scoring)
  availableProducts.forEach(p => {
    p.matchScore = 0;
    // Give points for same gender
    if (p.gender === referenceGender) p.matchScore += 2;
    
    // Give points for overlapping fragrance notes
    if (p.notes && referenceNotes) {
      const commonNotes = p.notes.filter(note => referenceNotes.includes(note));
      p.matchScore += commonNotes.length;
    }
  });

  // 3. Sort by highest score and take the top 3
  const suggestions = availableProducts
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 3);

  if (suggestions.length === 0) return null;

  return (
    <div className="mt-16 border-t border-white/10 pt-12 animate-fade-in">
      <h3 className="text-2xl font-bold text-white mb-8">You Might Also Like</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
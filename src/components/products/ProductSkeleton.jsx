import React from 'react';

// We accept isCompact so the skeletons match whatever view the user selected!
const ProductSkeleton = ({ isCompact }) => {
  return (
    // 'animate-pulse' is the Tailwind magic that makes it shimmer
    <div className="bg-white/5 border border-white/5 rounded-xl overflow-hidden animate-pulse flex flex-col">
      
      {/* The Image Area */}
      <div className={`bg-white/10 w-full ${isCompact ? 'aspect-square' : 'aspect-[4/5]'}`}></div>
      
      {/* The Text Info Area */}
      <div className={`flex-1 flex flex-col ${isCompact ? 'p-3' : 'p-5'}`}>
        {/* Title Bar */}
        <div className="flex justify-between items-start mb-3">
          <div className={`bg-white/10 rounded ${isCompact ? 'h-3 w-1/2' : 'h-4 w-2/3'}`}></div>
          {!isCompact && <div className="bg-white/10 rounded h-3 w-8"></div>}
        </div>
        
        {/* Subtitle (Brand/Size) */}
        <div className={`bg-white/10 rounded mb-4 ${isCompact ? 'h-2 w-1/3' : 'h-3 w-1/2'}`}></div>
        
        {/* Notes (Only in large view) */}
        {!isCompact && <div className="bg-white/10 rounded h-3 w-full mb-4"></div>}
        
        {/* Bottom Area (Price & Button) */}
        <div className={`mt-auto flex items-center justify-between ${isCompact ? 'pt-3' : 'pt-4 border-t border-white/5'}`}>
          <div className={`bg-white/10 rounded ${isCompact ? 'h-4 w-16' : 'h-6 w-20'}`}></div>
          <div className={`bg-white/10 rounded-full ${isCompact ? 'h-7 w-7' : 'h-9 w-9'}`}></div>
        </div>
      </div>
      
    </div>
  );
};

export default ProductSkeleton;
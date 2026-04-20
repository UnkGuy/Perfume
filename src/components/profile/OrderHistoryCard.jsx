import React from 'react';
import { FileText } from 'lucide-react';

const FALLBACK_IMAGE = 'https://zmewzupojoufgryrskrs.supabase.co/storage/v1/object/public/product-images/test.jpg';

const OrderHistoryCard = ({ order, onViewInvoice, navigate }) => {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-colors">
      <div className="bg-black/40 p-5 flex flex-wrap justify-between items-center gap-4 border-b border-white/10">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Inquiry #{order.id}</p>
          <p className="text-sm font-medium text-white">
            {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-6">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Status</p>
            <p className={`text-sm font-bold ${order.status === 'pending' ? 'text-orange-400' : 'text-green-400'}`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Total</p>
            <p className="text-sm font-bold text-gold-400">₱{Number(order.total_amount).toLocaleString()}</p>
          </div>
        </div>
      </div>
      <div className="p-5">
        <div className="space-y-4 mb-6">
          {order.order_items.map((item, index) => {
            const prod = item.products;
            const variant = Array.isArray(item.product_variants) ? item.product_variants[0] : item.product_variants;
            
            if (!prod) return null;

            const imageSource = variant?.image_url || prod.image_urls?.[0] || FALLBACK_IMAGE;
            const displaySize = variant?.size || prod.size || 'Standard';

            return (
              <div key={index} className="flex items-center gap-4">
                <div 
                  className="w-16 h-16 bg-white/10 rounded overflow-hidden flex-shrink-0 cursor-pointer"
                  onClick={() => navigate(`/products/${prod.id}`)}
                >
                  <img src={imageSource} alt={prod.name} className="w-full h-full object-cover transition-transform hover:scale-110" />
                </div>
                <div className="flex-1">
                  <p 
                    className="font-bold text-sm text-white cursor-pointer hover:text-gold-400 transition-colors"
                    onClick={() => navigate(`/products/${prod.id}`)}
                  >
                    {prod.name}
                  </p>
                  <p className="text-xs text-gray-500">{prod.brand} • {displaySize}</p>
                </div>
                <div className="text-right text-sm text-gray-400">
                  {item.quantity}x @ ₱{item.price_at_time}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-white/10">
          {order.status === 'completed' && (
            <button 
              onClick={() => onViewInvoice()} 
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white border border-blue-500/30 rounded transition-all text-sm font-bold uppercase tracking-wider"
            >
              <FileText size={16} /> View Invoice
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderHistoryCard;
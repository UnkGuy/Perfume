import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

const Toast = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-24 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div 
          key={toast.id}
          className={`
            pointer-events-auto flex items-center gap-3 min-w-[300px] p-4 rounded shadow-2xl border-l-4 transition-all duration-500 animate-slide-in
            ${toast.type === 'success' 
              ? 'bg-rich-black border-gold-400 text-white shadow-gold-400/10' 
              : 'bg-rich-black border-red-500 text-white shadow-red-500/10'}
          `}
        >
          {toast.type === 'success' ? <CheckCircle size={20} className="text-gold-400" /> : <AlertCircle size={20} className="text-red-500" />}
          
          <div className="flex-1">
            <h4 className="font-bold text-sm">{toast.title}</h4>
            <p className="text-xs text-gray-400">{toast.message}</p>
          </div>

          <button onClick={() => removeToast(toast.id)} className="text-gray-500 hover:text-white">
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toast;
import React from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const Toast = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-24 right-4 z-[9999] flex flex-col gap-2 pointer-events-none w-full max-w-[calc(100vw-2rem)] sm:w-auto items-end">
      {toasts.map((toast) => (
        <div 
          key={toast.id}
          className={`
            pointer-events-auto flex items-start gap-3 w-full sm:w-auto sm:min-w-[300px] max-w-sm p-4 rounded shadow-2xl border-l-4 transition-all duration-500 animate-slide-in
            ${toast.type === 'success' 
              ? 'bg-rich-black border-gold-400 text-white shadow-gold-400/10' 
              : toast.type === 'info'
              ? 'bg-rich-black border-blue-400 text-white shadow-blue-400/10'
              : 'bg-rich-black border-red-500 text-white shadow-red-500/10'}
          `}
        >
          {toast.type === 'success' ? (
            <CheckCircle size={20} className="text-gold-400 flex-shrink-0 mt-0.5" />
          ) : toast.type === 'info' ? (
            <Info size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
          )}
          
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-sm truncate">{toast.title}</h4>
            <p className="text-xs text-gray-400 break-words mt-0.5">{toast.message}</p>
          </div>

          <button onClick={() => removeToast(toast.id)} className="text-gray-500 hover:text-white flex-shrink-0">
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toast;
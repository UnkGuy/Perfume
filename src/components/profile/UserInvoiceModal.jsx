import React from 'react';
import { Printer } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';

const UserInvoiceModal = ({ order, onClose, userEmail }) => {
  const { settings } = useSettings();
  const storeInfo = settings?.storeInfo || {};

  const handlePrint = () => {
    const printContent = document.getElementById('printable-user-invoice').innerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt #${order.id} - ${storeInfo.name || 'KL Scents'}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @page { size: auto; margin: 15mm; }
            body { font-family: sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white; color: black; }
          </style>
        </head>
        <body class="bg-white">
          <div class="max-w-3xl mx-auto py-8">
            ${printContent}
          </div>
          <script>
            setTimeout(() => { window.print(); window.close(); }, 750);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const baseTotal = order.order_items.reduce((sum, item) => sum + (item.price_at_time * item.quantity), 0);
  const customFees = order.metadata?.custom_fees || [];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="absolute top-6 right-6 flex gap-3">
        <button onClick={handlePrint} className="flex items-center gap-2 bg-gold-400 text-black px-4 py-2 rounded font-bold shadow-lg hover:bg-gold-300">
          <Printer size={16} /> Print PDF
        </button>
        <button onClick={onClose} className="bg-white/10 text-white px-4 py-2 rounded hover:bg-white/20 border border-white/20">Close</button>
      </div>

      <div className="bg-white text-black w-full max-w-2xl p-10 md:p-12 rounded-xl shadow-2xl overflow-y-auto max-h-[90vh]" id="printable-user-invoice">
        <div className="flex justify-between items-start border-b-2 border-gray-200 pb-6 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-widest text-gray-900 uppercase">{storeInfo.name || 'KL SCENTS'}</h1>
            <p className="text-sm text-gray-500 mt-1">{storeInfo.tagline || 'Premium Fragrance Collection'}</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold text-gray-800">RECEIPT</h2>
            <p className="text-sm text-gray-500 font-mono mt-1">#{order.id}</p>
            <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
            <span className={`inline-block mt-2 px-2 py-1 text-[10px] font-bold uppercase rounded ${order.status === 'pending' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'}`}>
              {order.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Billed To</h3>
            <p className="text-sm font-bold text-gray-800">{userEmail}</p>
            <p className="text-sm text-gray-600 mt-1 max-w-[200px] leading-relaxed">{order.metadata?.address || order.metadata?.location || 'No Address'}</p>
            <p className="text-sm text-gray-600 mt-1">{order.metadata?.contact || 'No Contact'}</p>
          </div>
          <div className="text-right">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Order Specifics</h3>
            {order.metadata?.promo_code && <p className="text-sm text-gray-600 mt-1">Promo: <span className="font-bold text-yellow-600">{order.metadata.promo_code}</span></p>}
            <p className="text-sm text-gray-600 mt-1">Fulfillment: <span className="font-bold capitalize">{order.metadata?.fulfillment_method || 'N/A'}</span></p>
            <p className="text-sm text-gray-600 mt-1">Payment: <span className="font-bold capitalize">{order.metadata?.payment_preference || 'N/A'}</span></p>
          </div>
        </div>

        <table className="w-full text-left border-collapse mb-6">
          <thead>
            <tr className="border-b-2 border-gray-200 text-xs uppercase tracking-wider text-gray-500">
              <th className="py-3 font-bold">Item Description</th>
              <th className="py-3 font-bold text-center">Qty</th>
              <th className="py-3 font-bold text-right">Price</th>
              <th className="py-3 font-bold text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm text-gray-800">
            {order.order_items.map((item, idx) => {
              const variant = Array.isArray(item.product_variants) ? item.product_variants[0] : item.product_variants;
              return (
                <tr key={idx}>
                  <td className="py-4">
                    <p className="font-bold">{item.products?.name}</p>
                    <p className="text-xs text-gray-500">{variant?.size || 'Standard'}</p>
                  </td>
                  <td className="py-4 text-center">{item.quantity}</td>
                  <td className="py-4 text-right">₱{Number(item.price_at_time).toLocaleString()}</td>
                  <td className="py-4 text-right font-medium">₱{(item.price_at_time * item.quantity).toLocaleString()}</td>
                </tr>
              )
            })}
          </tbody>
        </table>

        <div className="w-full flex justify-end">
          <div className="w-full sm:w-1/2 space-y-3">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>₱{baseTotal.toLocaleString()}</span>
            </div>
            
            {customFees.map((fee, idx) => (
              <div key={idx} className="flex justify-between text-sm text-gray-600">
                <span>{fee.name}</span>
                <span>{fee.amount < 0 ? '-' : ''}₱{Math.abs(fee.amount).toLocaleString()}</span>
              </div>
            ))}

            <div className="flex justify-between text-lg font-bold text-gray-900 border-t-2 border-gray-200 pt-3 mt-3">
              <span>Total</span>
              <span>₱{Number(order.total_amount).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-6 border-t border-gray-100 text-center text-xs text-gray-400">
          <p>Thank you for shopping with {storeInfo.name || 'KL Scents'}.</p>
          <p className="mt-1">If you have any questions concerning this invoice, please message us via the support widget.</p>
        </div>
      </div>
    </div>
  );
};

export default UserInvoiceModal;
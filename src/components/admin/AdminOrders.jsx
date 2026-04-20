import React, { useState } from 'react';
import { Loader2, Eye, EyeOff, MessageCircle, Search, Hash, Mail, FileText, Printer, Edit2, Plus, Trash2 } from 'lucide-react';
import { useOrders } from '../../hooks/useOrders';
import { useShop } from '../../contexts/ShopContext';

const statusClass = (status) =>
  status === 'pending'   ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30' :
  status === 'shipped'   ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30' :
  status === 'canceled'  ? 'bg-red-500/10 text-red-400 border border-red-500/30' :
                           'bg-green-500/10 text-green-400 border border-green-500/30';

const AdminOrders = ({ onNavigateToMessages }) => {
  const { showToast } = useShop();
  const { orders, isLoading, changeOrderStatus, modifyOrder } = useOrders(showToast);
  
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [idSearch, setIdSearch] = useState('');
  const [emailSearch, setEmailSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [invoiceOrder, setInvoiceOrder] = useState(null);

  const filteredOrders = orders.filter(order => {
    const matchesId = !idSearch.trim() || order.id.toString().includes(idSearch.trim());
    const matchesEmail = !emailSearch.trim() ||
      (order.profiles?.email || '').toLowerCase().includes(emailSearch.trim().toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesId && matchesEmail && matchesStatus;
  });

  if (isLoading) return <div className="flex justify-center items-center h-64 text-gold-400"><Loader2 className="animate-spin" size={32} /></div>;

  return (
    <>
      <div className="animate-fade-in bg-white/5 border border-white/10 rounded-xl overflow-hidden w-full">
        <div className="p-4 border-b border-white/10 flex flex-col gap-3 bg-black/20 w-full">
          <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
            <div className="relative w-full sm:w-36">
              <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                inputMode="numeric"
                placeholder="Order ID…"
                value={idSearch}
                onChange={e => setIdSearch(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-black/50 border border-white/10 rounded-lg py-2 pl-9 pr-3 text-sm text-white focus:outline-none focus:border-gold-400 transition-colors"
              />
            </div>

            <div className="relative flex-1 min-w-[180px]">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search by email…"
                value={emailSearch}
                onChange={e => setEmailSearch(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-lg py-2 pl-9 pr-3 text-sm text-white focus:outline-none focus:border-gold-400 transition-colors"
              />
            </div>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto bg-black/50 border border-white/10 rounded-lg py-2 px-4 text-sm text-white focus:outline-none focus:border-gold-400 transition-colors"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="shipped">Shipped</option>
              <option value="completed">Completed</option>
              <option value="canceled">Canceled</option>
            </select>

            <button
              onClick={() => onNavigateToMessages?.()}
              className="w-full sm:w-auto flex justify-center items-center gap-2 px-4 py-2 bg-gold-400/10 hover:bg-gold-400/20 text-gold-400 rounded transition-colors text-sm font-bold"
            >
              <MessageCircle size={16} /> Open Messages
            </button>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto w-full">
          <table className="w-full text-left border-collapse whitespace-nowrap min-w-[600px]">
            <thead>
              <tr className="bg-black/40 border-b border-white/10 text-xs uppercase tracking-widest text-gray-500">
                {['Order ID','Date','Customer','Total','Status','Actions'].map(h => (
                  <th key={h} className={`p-4 font-medium ${h === 'Actions' ? 'text-right' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm text-gray-300">
              {filteredOrders.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500">No orders found matching your filters.</td></tr>
              ) : filteredOrders.map(order => (
                <React.Fragment key={order.id}>
                  <tr className={`hover:bg-white/5 transition-colors ${expandedOrderId === order.id ? 'bg-white/5' : ''}`}>
                    <td className="p-4 font-mono text-gold-400">#{order.id}</td>
                    <td className="p-4">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="p-4 truncate max-w-[150px]" title={order.profiles?.email}>{order.profiles?.email || 'Unknown User'}</td>
                    <td className="p-4 font-bold text-white">₱{Number(order.total_amount).toLocaleString()}</td>
                    <td className="p-4">
                      <select
                        value={order.status}
                        onChange={e => changeOrderStatus(order.id, e.target.value, order.user_id, order.order_items)}
                        className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider outline-none cursor-pointer appearance-none text-center w-full max-w-[100px] ${statusClass(order.status)}`}
                      >
                        <option value="pending"   className="bg-rich-black text-white">Pending</option>
                        <option value="shipped"   className="bg-rich-black text-white">Shipped</option>
                        <option value="completed" className="bg-rich-black text-white">Completed</option>
                        <option value="canceled"  className="bg-rich-black text-white">Canceled</option>
                      </select>
                    </td>
                    <td className="p-4 flex justify-end gap-2">
                      <button onClick={() => setInvoiceOrder(order)} className="p-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded transition-colors" title="View Invoice">
                        <FileText size={16} />
                      </button>
                      <button onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)} className={`p-2 rounded transition-colors ${expandedOrderId === order.id ? 'bg-white/20 text-white' : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white'}`}>
                        {expandedOrderId === order.id ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </td>
                  </tr>
                  {expandedOrderId === order.id && (
                    <tr className="bg-black/40 border-b border-white/10">
                      <td colSpan="6" className="p-6">
                        <div className="bg-white/5 border border-white/10 rounded-lg p-4 w-full">
                          <h4 className="text-xs uppercase tracking-widest text-gray-500 mb-3 font-bold">Order Items</h4>
                          {order.order_items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm mb-1 gap-2 min-w-0">
                              <div className="min-w-0 truncate">
                                <span className="text-gold-400 font-bold mr-2">{item.quantity}x</span>
                                <span className="text-white truncate">
                                  {item.products?.name || 'Unknown'} 
                                  {item.product_variants?.size ? ` (${item.product_variants.size})` : ''}
                                </span>
                              </div>
                              <span className="text-gray-400 font-mono flex-shrink-0">₱{(item.price_at_time * item.quantity).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Table */}
        <div className="md:hidden flex flex-col divide-y divide-white/10 w-full overflow-hidden">
          {filteredOrders.map(order => (
            <div key={order.id} className="p-4 flex flex-col gap-4 hover:bg-white/5 transition-colors min-w-0">
              <div className="flex justify-between items-start gap-2 min-w-0">
                <div className="min-w-0">
                  <span className="font-mono text-gold-400 font-bold text-base sm:text-lg truncate max-w-[120px] inline-block">#{order.id}</span>
                  <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 truncate">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <p className="font-bold text-white text-base sm:text-lg flex-shrink-0">₱{Number(order.total_amount).toLocaleString()}</p>
              </div>
              <div className="bg-black/40 rounded p-2 border border-white/5 min-w-0">
                <p className="text-xs sm:text-sm text-gray-300 truncate" title={order.profiles?.email}>{order.profiles?.email || 'Unknown User'}</p>
              </div>
              <div className="flex justify-between items-center gap-2 sm:gap-3 w-full">
                <select
                  value={order.status}
                  onChange={e => changeOrderStatus(order.id, e.target.value, order.user_id, order.order_items)}
                  className={`flex-1 px-2 sm:px-3 py-2 rounded-md text-[10px] sm:text-xs font-bold uppercase tracking-wider outline-none cursor-pointer appearance-none text-center min-w-0 ${statusClass(order.status)}`}
                >
                  <option value="pending"   className="bg-rich-black text-white">Pending</option>
                  <option value="shipped"   className="bg-rich-black text-white">Shipped</option>
                  <option value="completed" className="bg-rich-black text-white">Completed</option>
                  <option value="canceled"  className="bg-rich-black text-white">Canceled</option>
                </select>
                <div className="flex gap-1.5 sm:gap-2 flex-shrink-0">
                  <button onClick={() => setInvoiceOrder(order)} className="p-1.5 sm:p-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded transition-colors" title="View Invoice">
                    <FileText size={16} />
                  </button>
                  <button onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)} className="p-1.5 sm:p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded transition-colors">
                    {expandedOrderId === order.id ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button onClick={() => onNavigateToMessages?.(order.user_id)} className="p-1.5 sm:p-2 bg-gold-400/10 hover:bg-gold-400/20 text-gold-400 rounded transition-colors">
                    <MessageCircle size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {invoiceOrder && <InvoiceModal order={invoiceOrder} onClose={() => setInvoiceOrder(null)} modifyOrder={modifyOrder} />}
    </>
  );
};

/* Rest of the InvoiceModal code remains the same... */
const InvoiceModal = ({ order, onClose, modifyOrder }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    address: order.metadata?.address || order.metadata?.location || '',
    contact: order.metadata?.contact || '',
    promo_code: order.metadata?.promo_code || '',
    fulfillment_method: order.metadata?.fulfillment_method || '',
    payment_preference: order.metadata?.payment_preference || '',
    custom_fees: order.metadata?.custom_fees || []
  });

  const [newFeeName, setNewFeeName] = useState('');
  const [newFeeAmount, setNewFeeAmount] = useState('');

  const handlePrint = () => {
    const printContent = document.getElementById('printable-invoice-area').innerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice #${order.id}</title>
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
  const feesTotal = editData.custom_fees.reduce((sum, fee) => sum + Number(fee.amount), 0);
  const grandTotal = baseTotal + feesTotal;

  const handleFieldChange = (field, value) => setEditData({ ...editData, [field]: value });

  const handleAddFee = () => {
    if (!newFeeName || !newFeeAmount) return;
    setEditData({
      ...editData,
      custom_fees: [...editData.custom_fees, { name: newFeeName, amount: Number(newFeeAmount) }]
    });
    setNewFeeName('');
    setNewFeeAmount('');
  };

  const handleRemoveFee = (index) => {
    setEditData({
      ...editData,
      custom_fees: editData.custom_fees.filter((_, i) => i !== index)
    });
  };

  const handleSave = () => {
    modifyOrder(order.id, grandTotal, editData);
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm w-full">
      <div className="absolute top-6 right-6 flex gap-3">
        {order.status === 'pending' && (
          <button 
            onClick={() => setIsEditing(!isEditing)} 
            className={`flex items-center gap-2 px-4 py-2 rounded font-bold shadow-lg transition-colors ${isEditing ? 'bg-red-500 text-white' : 'bg-blue-500 text-white hover:bg-blue-400'}`}
          >
            <Edit2 size={16} /> {isEditing ? 'Cancel Edit' : 'Edit Invoice'}
          </button>
        )}
        <button onClick={handlePrint} className="flex items-center gap-2 bg-gold-400 text-black px-4 py-2 rounded font-bold shadow-lg hover:bg-gold-300">
          <Printer size={16} /> Print PDF
        </button>
        <button onClick={onClose} className="bg-white/10 text-white px-4 py-2 rounded hover:bg-white/20 border border-white/20">Close</button>
      </div>

      <div className="bg-gray-100 w-full max-w-4xl rounded-xl shadow-2xl overflow-y-auto max-h-[90vh] flex flex-col md:flex-row">
        
        <div className="flex-1 bg-white p-10 text-black min-w-0" id="printable-invoice-area">
          <div className="flex justify-between items-start border-b-2 border-gray-200 pb-6 mb-6">
            <div>
              <h1 className="text-3xl font-extrabold tracking-widest text-gray-900">KL SCENTS</h1>
              <p className="text-sm text-gray-500 mt-1">Premium Fragrance Collection</p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold text-gray-800">INVOICE</h2>
              <p className="text-sm text-gray-500 font-mono mt-1">#{order.id}</p>
              <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
              <span className={`inline-block mt-2 px-2 py-1 text-[10px] font-bold uppercase rounded ${order.status === 'pending' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'}`}>
                {order.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="min-w-0">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Billed & Shipped To</h3>
              <p className="text-sm font-bold text-gray-800 truncate" title={order.profiles?.email}>{order.profiles?.email}</p>
              <p className="text-sm text-gray-600 mt-1 max-w-[200px] leading-relaxed break-words">{editData.address || 'No Address Provided'}</p>
              <p className="text-sm text-gray-600 mt-1 truncate">{editData.contact || 'No Contact Provided'}</p>
            </div>
            <div className="text-right min-w-0">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Order Specifics</h3>
              {editData.promo_code && <p className="text-sm text-gray-600 mt-1 truncate">Promo: <span className="font-bold text-yellow-600">{editData.promo_code}</span></p>}
              <p className="text-sm text-gray-600 mt-1 truncate">Fulfillment: <span className="font-bold capitalize">{editData.fulfillment_method || 'N/A'}</span></p>
              <p className="text-sm text-gray-600 mt-1 truncate">Payment: <span className="font-bold capitalize">{editData.payment_preference || 'N/A'}</span></p>
            </div>
          </div>

          <table className="w-full text-left border-collapse mb-6 table-fixed">
            <thead>
              <tr className="border-b-2 border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                <th className="py-3 font-bold w-1/2">Item Description</th>
                <th className="py-3 font-bold text-center w-1/6">Qty</th>
                <th className="py-3 font-bold text-right w-1/6">Price</th>
                <th className="py-3 font-bold text-right w-1/6">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-800">
              {order.order_items.map((item, idx) => {
                const variant = Array.isArray(item.product_variants) ? item.product_variants[0] : item.product_variants;
                return (
                  <tr key={idx}>
                    <td className="py-4 min-w-0">
                      <p className="font-bold truncate">{item.products?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{variant?.size || 'Standard'}</p>
                    </td>
                    <td className="py-4 text-center">{item.quantity}</td>
                    <td className="py-4 text-right truncate">₱{item.price_at_time.toLocaleString()}</td>
                    <td className="py-4 text-right font-medium truncate">₱{(item.price_at_time * item.quantity).toLocaleString()}</td>
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
              {editData.custom_fees.map((fee, idx) => (
                <div key={idx} className="flex justify-between text-sm text-gray-600 group">
                  <span className="flex items-center min-w-0">
                    <span className="truncate">{fee.name}</span>
                    {isEditing && <button onClick={() => handleRemoveFee(idx)} className="text-[10px] text-red-500 ml-2 px-1 border border-red-500 rounded hover:bg-red-50 hidden group-hover:block flex-shrink-0" title="Remove from print view completely">Remove</button>}
                  </span>
                  <span className="flex-shrink-0">{fee.amount < 0 ? '-' : ''}₱{Math.abs(fee.amount).toLocaleString()}</span>
                </div>
              ))}
              <div className="flex justify-between text-lg font-bold text-gray-900 border-t-2 border-gray-200 pt-3 mt-3">
                <span>Total</span>
                <span>₱{grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="mt-16 pt-6 border-t border-gray-100 text-center text-xs text-gray-400">
            <p>Thank you for shopping with KL Scents.</p>
            <p className="mt-1">If you have any questions concerning this invoice, please message us.</p>
          </div>
        </div>

        {isEditing && (
          <div className="w-full md:w-80 bg-gray-50 p-6 border-l border-gray-200 animate-fade-in flex flex-col gap-4 text-sm text-gray-800 flex-shrink-0">
            <h3 className="font-bold text-lg border-b border-gray-200 pb-2 flex items-center gap-2"><Edit2 size={18}/> Edit Details</h3>
            
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Address</label>
              <textarea value={editData.address} onChange={e => handleFieldChange('address', e.target.value)} className="p-2 border rounded bg-white focus:outline-blue-500 h-20 resize-none" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Contact</label>
              <input value={editData.contact} onChange={e => handleFieldChange('contact', e.target.value)} className="p-2 border rounded bg-white focus:outline-blue-500" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Fulfillment</label>
                <input value={editData.fulfillment_method} onChange={e => handleFieldChange('fulfillment_method', e.target.value)} className="p-2 border rounded bg-white focus:outline-blue-500" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Payment</label>
                <input value={editData.payment_preference} onChange={e => handleFieldChange('payment_preference', e.target.value)} className="p-2 border rounded bg-white focus:outline-blue-500" />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Promo Code</label>
              <input value={editData.promo_code} onChange={e => handleFieldChange('promo_code', e.target.value)} className="p-2 border rounded bg-white focus:outline-blue-500 font-mono text-yellow-600 font-bold" />
            </div>

            <div className="border-t border-gray-200 pt-4 mt-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Custom Fees/Discounts</label>
              <div className="flex gap-2">
                <input placeholder="Name" value={newFeeName} onChange={e => setNewFeeName(e.target.value)} className="p-2 border rounded bg-white focus:outline-blue-500 w-1/2 min-w-0" />
                <input placeholder="Amt (- for discount)" type="number" value={newFeeAmount} onChange={e => setNewFeeAmount(e.target.value)} className="p-2 border rounded bg-white focus:outline-blue-500 w-1/3 min-w-0" />
                <button onClick={handleAddFee} className="bg-gray-800 text-white rounded p-2 flex-1 hover:bg-gray-700 flex justify-center flex-shrink-0"><Plus size={16}/></button>
              </div>
            </div>

            <button onClick={handleSave} className="mt-auto bg-green-600 text-white font-bold py-3 rounded shadow hover:bg-green-700 transition-colors uppercase tracking-widest text-sm">
              Save Changes
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminOrders;
import React, { useState } from 'react';
import { Loader2, Eye, EyeOff, MessageCircle, Search, Hash, Mail, FileText, Printer } from 'lucide-react';
import { useOrders } from '../../hooks/useOrders';
import { useShop } from '../../contexts/ShopContext';

const statusClass = (status) =>
  status === 'pending'   ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30' :
  status === 'shipped'   ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30' :
  status === 'canceled'  ? 'bg-red-500/10 text-red-400 border border-red-500/30' :
                           'bg-green-500/10 text-green-400 border border-green-500/30';

const AdminOrders = ({ onNavigateToMessages }) => {
  const { showToast } = useShop();
  const { orders, isLoading, changeOrderStatus } = useOrders(showToast);
  
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
      {/* ✨ Notice: We only hide the dashboard when an invoice is open! ✨ */}
      <div className={`animate-fade-in bg-white/5 border border-white/10 rounded-xl overflow-hidden ${invoiceOrder ? 'print:hidden' : ''}`}>
        <div className="p-4 border-b border-white/10 flex flex-col gap-3 bg-black/20">
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
              <MessageCircle size={16} /> Open Messages Console
            </button>
          </div>

          {(idSearch || emailSearch) && (
            <p className="text-xs text-gray-500">
              Showing {filteredOrders.length} of {orders.length} orders
              {idSearch && <span> · ID contains "<span className="text-gold-400">{idSearch}</span>"</span>}
              {emailSearch && <span> · Email contains "<span className="text-gold-400">{emailSearch}</span>"</span>}
            </p>
          )}
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
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
                    <td className="p-4">{order.profiles?.email || 'Unknown User'}</td>
                    <td className="p-4 font-bold text-white">₱{Number(order.total_amount).toLocaleString()}</td>
                    <td className="p-4">
                      <select
                        value={order.status}
                        onChange={e => changeOrderStatus(order.id, e.target.value, order.user_id, order.order_items)}
                        className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider outline-none cursor-pointer appearance-none text-center ${statusClass(order.status)}`}
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
                        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                          <h4 className="text-xs uppercase tracking-widest text-gray-500 mb-3 font-bold">Order Items</h4>
                          {order.order_items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm mb-1">
                              <div>
                                <span className="text-gold-400 font-bold mr-2">{item.quantity}x</span>
                                <span className="text-white">
                                  {item.products?.name || 'Unknown'} 
                                  {item.product_variants?.size ? ` (${item.product_variants.size})` : ''}
                                </span>
                              </div>
                              <span className="text-gray-400 font-mono">₱{(item.price_at_time * item.quantity).toLocaleString()}</span>
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
        <div className="md:hidden flex flex-col divide-y divide-white/10">
          {filteredOrders.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No orders found.</div>
          ) : filteredOrders.map(order => (
            <div key={order.id} className="p-4 flex flex-col gap-4 hover:bg-white/5 transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-mono text-gold-400 font-bold text-lg">#{order.id}</span>
                  <p className="text-xs text-gray-400 mt-0.5">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <p className="font-bold text-white text-lg">₱{Number(order.total_amount).toLocaleString()}</p>
              </div>
              <div className="bg-black/40 rounded p-2 border border-white/5">
                <p className="text-sm text-gray-300 truncate">{order.profiles?.email || 'Unknown User'}</p>
              </div>
              <div className="flex justify-between items-center gap-3">
                <select
                  value={order.status}
                  onChange={e => changeOrderStatus(order.id, e.target.value, order.user_id, order.order_items)}
                  className={`flex-1 px-3 py-2 rounded-md text-xs font-bold uppercase tracking-wider outline-none cursor-pointer appearance-none text-center ${statusClass(order.status)}`}
                >
                  <option value="pending"   className="bg-rich-black text-white">Pending</option>
                  <option value="shipped"   className="bg-rich-black text-white">Shipped</option>
                  <option value="completed" className="bg-rich-black text-white">Completed</option>
                  <option value="canceled"  className="bg-rich-black text-white">Canceled</option>
                </select>
                <div className="flex gap-2">
                  <button onClick={() => setInvoiceOrder(order)} className="p-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded transition-colors" title="View Invoice">
                    <FileText size={18} />
                  </button>
                  <button
                    onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                    className={`p-2 rounded transition-colors ${expandedOrderId === order.id ? 'bg-white/20 text-white' : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white'}`}
                  >{expandedOrderId === order.id ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                  <button
                    onClick={() => onNavigateToMessages?.(order.user_id)}
                    className="p-2 bg-gold-400/10 hover:bg-gold-400/20 text-gold-400 rounded transition-colors"
                  >
                    <MessageCircle size={18} />
                  </button>
                </div>
              </div>
              {expandedOrderId === order.id && (
                <div className="bg-black/40 border border-white/10 rounded-lg p-3 animate-fade-in">
                  <h4 className="text-[10px] uppercase tracking-widest text-gray-500 mb-2 font-bold border-b border-white/10 pb-2">Order Items</h4>
                  {order.order_items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs gap-3 mb-1.5">
                      <span className="flex-1 truncate">
                        <span className="text-gold-400 font-bold mr-1.5">{item.quantity}x</span>
                        {item.products?.name || 'Unknown'} 
                        {item.product_variants?.size ? ` (${item.product_variants.size})` : ''}
                      </span>
                      <span className="text-gray-400 font-mono flex-shrink-0">₱{(item.price_at_time * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ✨ The Modal renders OUTSIDE the hidden parent container ✨ */}
      {invoiceOrder && <InvoiceModal order={invoiceOrder} onClose={() => setInvoiceOrder(null)} />}
    </>
  );
};

// ─── ✨ INVOICE MODAL ✨ ──────────────────────────────────────────────
const InvoiceModal = ({ order, onClose }) => {
  const handlePrint = () => window.print();
  const baseTotal = order.order_items.reduce((sum, item) => sum + (item.price_at_time * item.quantity), 0);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm print:static print:bg-white print:p-0 print:block [print-color-adjust:exact]">
      
      {/* ✨ The Magic CSS Fix to force a white background over the app when printing ✨ */}
      <style type="text/css" media="print">
        {`
          @page { size: auto; margin: 0mm; }
          body, html { background-color: white !important; }
        `}
      </style>

      {/* Non-printable overlay buttons */}
      <div className="absolute top-6 right-6 flex gap-3 print:hidden">
        <button onClick={handlePrint} className="flex items-center gap-2 bg-gold-400 text-black px-4 py-2 rounded font-bold shadow-lg hover:bg-gold-300">
          <Printer size={16} /> Print PDF
        </button>
        <button onClick={onClose} className="bg-white/10 text-white px-4 py-2 rounded hover:bg-white/20 border border-white/20">Close</button>
      </div>

      {/* The Printable Document */}
      <div className="bg-white text-black w-full max-w-2xl p-10 md:p-12 rounded-xl shadow-2xl overflow-y-auto max-h-[90vh] print:max-h-none print:shadow-none print:rounded-none print:w-full print:m-0 print:p-8">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-gray-200 pb-6 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-widest text-gray-900">KL SCENTS</h1>
            <p className="text-sm text-gray-500 mt-1">Premium Fragrance Collection</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold text-gray-800">INVOICE</h2>
            <p className="text-sm text-gray-500 font-mono mt-1">#{order.id}</p>
            <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Customer Info */}
        <div className="mb-8">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Billed To</h3>
          <p className="text-sm font-medium text-gray-800">{order.profiles?.email}</p>
          {order.metadata?.location && <p className="text-sm text-gray-600 mt-1 max-w-xs">{order.metadata.location}</p>}
          {order.metadata?.contact && <p className="text-sm text-gray-600 mt-1">{order.metadata.contact}</p>}
        </div>

        {/* Items Table */}
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
                  <td className="py-4 text-right">₱{item.price_at_time.toLocaleString()}</td>
                  <td className="py-4 text-right font-medium">₱{(item.price_at_time * item.quantity).toLocaleString()}</td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* Totals Section */}
        <div className="w-full flex justify-end">
          <div className="w-full sm:w-1/2 space-y-3">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>₱{baseTotal.toLocaleString()}</span>
            </div>

            <div className="flex justify-between text-lg font-bold text-gray-900 border-t-2 border-gray-200 pt-3 mt-3">
              <span>Total</span>
              <span>₱{Number(order.total_amount).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-6 border-t border-gray-100 text-center text-xs text-gray-400">
          <p>Thank you for shopping with KL Scents.</p>
          <p className="mt-1">If you have any questions concerning this invoice, please message us via the support widget.</p>
        </div>

      </div>
    </div>
  );
};

export default AdminOrders;
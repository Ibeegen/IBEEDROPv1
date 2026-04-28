import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../store/useCart';
import { ChevronLeft, Trash2, Plus, Minus, ShoppingCart, Package, ArrowRight, TrendingUp, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Cart() {
  const navigate = useNavigate();
  const { items, loading, fetchCart, updateQuantity, removeItem } = useCart();

  useEffect(() => {
    fetchCart();
  }, []);

  const totalAmount = items.reduce((sum, item) => sum + (item.productId?.retailPrice || 0) * item.quantity, 0);
  const totalCommission = items.reduce((sum, item) => sum + (item.productId?.agentCommission || 0) * item.quantity, 0);
  const totalPoints = items.reduce((sum, item) => sum + (item.productId?.point || 0) * item.quantity, 0);

  if (loading && items.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-8">
         <div className="w-12 h-12 border-4 border-[#FFD400] border-t-transparent rounded-full animate-spin"></div>
         <p className="mt-4 text-slate-500 font-bold uppercase tracking-widest text-xs">Đang tải giỏ hàng...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-40">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white shadow-sm border-b border-gray-100 p-4 flex items-center justify-between">
         <button onClick={() => navigate(-1)} className="p-2 bg-gray-50 rounded-xl">
            <ChevronLeft className="w-6 h-6 text-slate-700" />
         </button>
         <h1 className="text-sm font-black text-slate-900 uppercase tracking-widest">Giỏ hàng của tôi</h1>
         <div className="w-10"></div>
      </div>

      <div className="p-4 space-y-4">
         {items.length === 0 ? (
           <div className="py-20 flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 bg-white rounded-[40px] flex items-center justify-center shadow-xl mb-6 border border-gray-100">
                 <ShoppingCart className="w-10 h-10 text-slate-200" />
              </div>
              <h3 className="text-lg font-black text-slate-800 mb-2">Giỏ hàng trống</h3>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wide px-12 leading-relaxed">
                 Bạn chưa thêm sản phẩm nào vào giỏ. Hãy quay lại trang sản phẩm nhé!
              </p>
              <button 
                onClick={() => navigate('/agent/products')}
                className="mt-8 bg-[#FFD400] px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-[#FFD400]/20 active:scale-95 transition-all"
              >
                 Tiếp tục mua sắm
              </button>
           </div>
         ) : (
           <>
             <div className="space-y-3">
               {items.map((item) => (
                 <motion.div 
                   key={item.productId?._id}
                   layout
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm flex gap-4 relative overflow-hidden"
                 >
                    <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-50 shrink-0 border border-gray-100">
                       <img src={item.productId?.images?.[0]} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                       <div className="space-y-1 pr-8">
                          <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-relaxed">{item.productId?.name}</h4>
                          <div className="flex items-center gap-2">
                             <span className="text-sm font-black text-red-500">{item.productId?.retailPrice.toLocaleString()}đ</span>
                          </div>
                       </div>

                       <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center bg-slate-50 rounded-xl p-1 border border-slate-100">
                             <button 
                               onClick={() => updateQuantity(item.productId?._id, Math.max(1, item.quantity - 1))}
                               className="w-8 h-8 flex items-center justify-center text-slate-500 active:scale-75 transition-all"
                             >
                                <Minus className="w-4 h-4" />
                             </button>
                             <span className="w-8 text-center text-xs font-black text-slate-800">{item.quantity}</span>
                             <button 
                               onClick={() => updateQuantity(item.productId?._id, item.quantity + 1)}
                               className="w-8 h-8 flex items-center justify-center text-slate-900 active:scale-75 transition-all"
                             >
                                <Plus className="w-4 h-4" />
                             </button>
                          </div>
                          <div className="space-y-1 text-right">
                             <div className="flex items-center gap-1.5 justify-end">
                                <span className="text-[9px] font-bold text-slate-400 uppercase">Hồng:</span>
                                <span className="text-[10px] font-black text-green-600">+{(item.productId?.agentCommission * item.quantity).toLocaleString()}đ</span>
                             </div>
                             <div className="flex items-center gap-1.5 justify-end">
                                <span className="text-[9px] font-bold text-slate-400 uppercase">Điểm:</span>
                                <span className="text-[10px] font-black text-blue-500">+{(item.productId?.point * item.quantity).toLocaleString()} P</span>
                             </div>
                          </div>
                       </div>
                    </div>

                    <button 
                      onClick={() => removeItem(item.productId?._id)}
                      className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 transition-colors"
                    >
                       <Trash2 className="w-5 h-5" />
                    </button>
                 </motion.div>
               ))}
             </div>

             {/* Summary Section */}
             <div className="bg-white rounded-[32px] p-6 shadow-xl shadow-slate-200/50 border border-slate-100 space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-dashed border-slate-100">
                   <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tóm tắt đơn hàng</h3>
                   <span className="text-[10px] font-black text-slate-900">{items.reduce((sum, i) => sum + i.quantity, 0)} sản phẩm</span>
                </div>
                
                <div className="space-y-3">
                   <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                         <div className="w-6 h-6 bg-green-50 rounded-lg flex items-center justify-center text-green-600">
                            <TrendingUp className="w-3.5 h-3.5" />
                         </div>
                         <span className="text-xs font-bold text-slate-600">Tổng hoa hồng dự kiến</span>
                      </div>
                      <span className="text-xs font-black text-green-600">+{totalCommission.toLocaleString()}đ</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                         <div className="w-6 h-6 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                            <Sparkles className="w-3.5 h-3.5" />
                         </div>
                         <span className="text-xs font-bold text-slate-600">Tổng IbeePoint nhận được</span>
                      </div>
                      <span className="text-xs font-black text-blue-600">+{totalPoints.toLocaleString()} P</span>
                   </div>
                </div>
             </div>
           </>
         )}
      </div>

      {/* Floating Bottom Action */}
      {items.length > 0 && (
         <div className="fixed bottom-20 left-0 right-0 p-4 z-40">
            <div className="max-w-md mx-auto bg-slate-900 rounded-[32px] p-5 shadow-2xl flex items-center justify-between gap-4">
               <div className="flex-1">
                  <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Tổng tiền thanh toán</p>
                  <p className="text-xl font-black text-[#FFD400]">{totalAmount.toLocaleString()}đ</p>
               </div>
               <button 
                 onClick={() => navigate('/agent/create-order?fromCart=true')}
                 className="bg-[#FFD400] h-14 px-8 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 active:scale-95 transition-all shadow-xl shadow-[#FFD400]/20"
               >
                  Tiếp tục
                  <ArrowRight className="w-4 h-4" />
               </button>
            </div>
         </div>
      )}
    </div>
  );
}

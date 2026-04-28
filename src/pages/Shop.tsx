import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { 
  ShoppingBag, 
  Search, 
  ChevronRight, 
  Star, 
  ArrowRight,
  User,
  Phone,
  Package,
  CheckCircle2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Product {
  _id: string;
  name: string;
  price: number;
  commission: number;
  images: string[];
  description: string;
  stock: number;
}

interface Agent {
  _id: string;
  name: string;
  phone: string;
}

export default function Shop() {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Order Form State
  const [orderForm, setOrderForm] = useState({
    customerName: '',
    phone: '',
    address: ''
  });
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, agentRes] = await Promise.all([
          api.get('/products'),
          api.get(`/auth/agent/${agentId}`)
        ]);
        setProducts(prodRes.data);
        setAgent(agentRes.data);
      } catch (err) {
        console.error('Error fetching shop data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [agentId]);

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      setOrderSubmitting(true);
      await api.post('/orders', {
        ...orderForm,
        agentId: agentId,
        items: [
          {
            productId: selectedProduct._id,
            quantity: 1
          }
        ],
        totalAmount: selectedProduct.price,
        commission: selectedProduct.commission
      });
      setOrderSuccess(true);
      setTimeout(() => {
        setOrderSuccess(false);
        setSelectedProduct(null);
        setOrderForm({ customerName: '', phone: '', address: '' });
      }, 3000);
    } catch (err) {
      alert('Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.');
    } finally {
      setOrderSubmitting(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
       <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!agent) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8 text-center uppercase tracking-widest text-slate-500 font-black">
       Cửa hàng không tồn tại hoặc đã bị khóa
    </div>
  );

  return (
    <div className="bg-slate-950 min-h-screen pb-24 font-sans selection:bg-blue-500/30">
      {/* Header / Brand */}
      <div className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-xl mx-auto px-6 py-4 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center font-black text-white shadow-xl shadow-blue-900/20">
                 IB
              </div>
              <div className="space-y-0.5">
                 <h1 className="text-sm font-black text-white uppercase tracking-tighter">Cửa hàng Ibeedrop</h1>
                 <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Đại lý: {agent.name}</span>
                 </div>
              </div>
           </div>
           <div className="p-2 bg-white/5 rounded-full">
              <ShoppingBag className="w-5 h-5 text-slate-400" />
           </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-6 pt-8 space-y-8">
        {/* Search */}
        <div className="relative">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
           <input 
              type="text" 
              placeholder="Tìm kiếm sản phẩm giá tốt..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm text-white outline-none focus:border-blue-500 focus:bg-white/10 transition-all placeholder:text-slate-600"
           />
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 gap-6">
           {filteredProducts.map((product) => (
             <motion.div 
               layout
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               key={product._id}
               className="group bg-slate-900/40 border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-blue-500/30 transition-all duration-500"
             >
                <div className="aspect-[4/3] relative overflow-hidden">
                   <img src={product.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                   <div className="absolute top-4 right-4 px-4 py-2 bg-slate-950/80 backdrop-blur-md rounded-full border border-white/10">
                      <p className="text-sm font-black text-blue-400">{product.price.toLocaleString()}đ</p>
                   </div>
                </div>
                <div className="p-6 space-y-4">
                   <div className="space-y-1">
                      <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{product.name}</h3>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{product.description}</p>
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-amber-500">
                         <Star className="w-3.5 h-3.5 fill-current" />
                         <span className="text-[11px] font-black uppercase">4.8 (253)</span>
                      </div>
                      <div className="w-1 h-1 bg-slate-800 rounded-full"></div>
                      <div className="flex items-center gap-1 text-slate-500">
                         <Package className="w-3.5 h-3.5" />
                         <span className="text-[11px] font-black uppercase">{product.stock}+ có sẵn</span>
                      </div>
                   </div>
                   <button 
                     onClick={() => setSelectedProduct(product)}
                     className="w-full bg-white text-slate-950 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all transform active:scale-95 flex items-center justify-center gap-2"
                   >
                     Mua ngay
                     <ArrowRight className="w-4 h-4" />
                   </button>
                </div>
             </motion.div>
           ))}
        </div>
      </div>

      {/* Checkout Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => !orderSubmitting && setSelectedProduct(null)}
               className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm" 
             />
             <motion.div 
               initial={{ y: "100%" }}
               animate={{ y: 0 }}
               exit={{ y: "100%" }}
               transition={{ type: 'spring', damping: 25, stiffness: 200 }}
               className="relative w-full max-w-lg bg-slate-900 border-t sm:border border-white/10 rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl"
             >
                {orderSuccess ? (
                  <div className="p-12 text-center space-y-6">
                     <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-500">
                        <CheckCircle2 className="w-10 h-10" />
                     </div>
                     <div className="space-y-2">
                        <h2 className="text-xl font-black text-white uppercase tracking-tight">Đặt hàng thành công!</h2>
                        <p className="text-slate-400 text-sm">Cảm ơn bạn đã mua sắm tại cửa hàng của chúng tôi. Đại lý sẽ liên hệ với bạn sớm nhất.</p>
                     </div>
                  </div>
                ) : (
                  <div className="p-8 space-y-8">
                     <div className="flex items-center justify-between">
                        <h2 className="text-lg font-black text-white uppercase tracking-widest">Thông tin giao hàng</h2>
                        <button onClick={() => setSelectedProduct(null)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                           <X className="w-6 h-6 text-slate-500" />
                        </button>
                     </div>

                     <div className="flex gap-4 p-4 bg-white/5 rounded-3xl border border-white/5">
                        <img src={selectedProduct.images[0]} className="w-16 h-16 rounded-xl object-cover" alt="" />
                        <div className="flex-1 py-1 flex flex-col justify-between">
                           <p className="text-sm font-bold text-white line-clamp-1">{selectedProduct.name}</p>
                           <p className="text-xs font-black text-blue-400">{selectedProduct.price.toLocaleString()}đ</p>
                        </div>
                     </div>

                     <form onSubmit={handleOrder} className="space-y-4">
                        <div className="space-y-1.5">
                           <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest px-2">Họ tên khách hàng</label>
                           <div className="relative">
                              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                              <input 
                                required
                                type="text" 
                                value={orderForm.customerName}
                                onChange={e => setOrderForm({...orderForm, customerName: e.target.value})}
                                className="w-full bg-slate-950 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm text-white outline-none focus:border-blue-500 transition-all"
                                placeholder="..."
                              />
                           </div>
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest px-2">Số điện thoại</label>
                           <div className="relative">
                              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                              <input 
                                required
                                type="tel" 
                                value={orderForm.phone}
                                onChange={e => setOrderForm({...orderForm, phone: e.target.value})}
                                className="w-full bg-slate-950 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm text-white outline-none focus:border-blue-500 transition-all font-mono"
                                placeholder="090..."
                              />
                           </div>
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest px-2">Địa nhận hàng</label>
                           <textarea 
                              required
                              rows={3}
                              value={orderForm.address}
                              onChange={e => setOrderForm({...orderForm, address: e.target.value})}
                              className="w-full bg-slate-950 border border-white/5 rounded-2xl p-4 text-sm text-white outline-none focus:border-blue-500 transition-all resize-none"
                              placeholder="Số nhà, tên đường, phường..."
                           />
                        </div>

                        <button 
                          disabled={orderSubmitting}
                          type="submit"
                          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all transform active:scale-95 shadow-xl shadow-blue-900/40 mt-4"
                        >
                          {orderSubmitting ? 'Đang xử lý đơn hàng...' : 'Xác nhận đặt hàng'}
                        </button>
                     </form>
                  </div>
                )}
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

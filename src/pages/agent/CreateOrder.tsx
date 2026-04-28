import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { ChevronLeft, Package, User, Phone, MapPin, CheckCircle2, AlertCircle, ShoppingCart } from 'lucide-react';
import { motion } from 'motion/react';
import { useCart } from '../../store/useCart';
import { toast } from 'react-hot-toast';

interface Product {
  _id: string;
  name: string;
  images: string[];
  retailPrice: number;
  agentCommission: number;
  point: number;
}

export default function CreateOrder() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { items: cartItems, clearCart } = useCart();
  const productId = searchParams.get('productId');
  const fromCart = searchParams.get('fromCart') === 'true';

  const [product, setProduct] = useState<Product | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (fromCart) {
      if (cartItems.length === 0) {
        navigate('/agent/products');
        return;
      }
      setItems(cartItems.map(item => ({
        productId: item.productId?._id || item.productId,
        product: item.productId,
        quantity: item.quantity
      })));
      setLoading(false);
      return;
    }

    if (!productId) {
      navigate('/agent/products');
      return;
    }

    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${productId}`);
        setProduct(res.data);
      } catch (err) {
        console.error(err);
        toast.error('Không tìm thấy sản phẩm');
        navigate('/agent/products');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, fromCart, cartItems, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromCart && !product) return;
    if (fromCart && items.length === 0) return;
    
    setSubmitting(true);
    try {
      const orderItems = fromCart 
        ? items.map(item => ({ productId: item.productId, quantity: item.quantity }))
        : [{ productId: product?._id, quantity }];

      await api.post('/orders', {
        customerName,
        phone,
        address,
        items: orderItems
      });

      if (fromCart) {
        await clearCart();
      }

      toast.success('Tạo đơn hàng thành công!');
      navigate('/agent/orders');
    } catch (err) {
      toast.error('Có lỗi xảy ra khi tạo đơn hàng');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500 font-medium">Đang tải thông tin đơn hàng...</div>;

  const totalCommission = fromCart 
    ? items.reduce((sum, i) => sum + (i.product?.agentCommission || 0) * i.quantity, 0)
    : (product?.agentCommission || 0) * quantity;
  
  const totalPrice = fromCart
    ? items.reduce((sum, i) => sum + (i.product?.retailPrice || 0) * i.quantity, 0)
    : (product?.retailPrice || 0) * quantity;

  const totalPoint = fromCart
    ? items.reduce((sum, i) => sum + (i.product?.point || 0) * i.quantity, 0)
    : (product?.point || 0) * quantity;

  return (
    <div className="bg-[#F5F6F8] min-h-screen pb-12 font-sans">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-100 p-4 flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-slate-700" />
        </button>
        <h1 className="text-lg font-black text-slate-800 tracking-tight uppercase">Tạo đơn hàng mới</h1>
      </div>

      <div className="max-w-xl mx-auto p-4 space-y-6">
        {/* Product Card */}
        {fromCart ? (
          <div className="space-y-3">
             <div className="flex items-center gap-2 px-1">
                <ShoppingCart className="w-4 h-4 text-slate-400" />
                <h3 className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Sản phẩm trong đơn ({items.length})</h3>
             </div>
             {items.map(item => (
               <motion.div 
                 key={item.productId}
                 initial={{ opacity: 0, x: -10 }}
                 animate={{ opacity: 1, x: 0 }}
                 className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex gap-3"
               >
                  <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0">
                    <img src={item.product?.images?.[0]} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div className="flex-1 min-w-0 py-1 flex flex-col justify-between">
                     <h4 className="text-[11px] font-bold text-slate-800 line-clamp-1">{item.product?.name}</h4>
                     <div className="flex justify-between items-end">
                        <div className="flex flex-col">
                           <span className="text-red-500 font-black text-xs">{item.product?.retailPrice.toLocaleString()}đ</span>
                           <span className="text-[9px] text-slate-400 font-bold">x {item.quantity}</span>
                        </div>
                        <div className="text-right">
                           <p className="text-[9px] font-black text-green-600">+{((item.product?.agentCommission || 0) * item.quantity).toLocaleString()}đ</p>
                        </div>
                     </div>
                  </div>
               </motion.div>
             ))}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[24px] p-4 shadow-sm border border-gray-100 flex gap-4"
          >
            <div className="w-24 h-24 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0">
              <img src={product?.images?.[0]} className="w-full h-full object-cover" alt="" />
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
              <h2 className="text-sm font-bold text-slate-800 line-clamp-2 leading-snug">{product?.name}</h2>
              <div className="flex flex-col gap-0.5">
                 <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Giá bán lẻ:</span>
                    <span className="text-red-500 font-black text-sm">{product?.retailPrice.toLocaleString()}đ</span>
                 </div>
                 <div className="flex items-center gap-1.5">
                    <Package className="w-3 h-3 text-[#FFD400]" />
                    <span className="text-[10px] font-bold text-slate-500">+{product?.point} IbeePoint / SP</span>
                 </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Order Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 space-y-5">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Thông tin khách hàng</h3>
            
            <div className="space-y-4">
               <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-wider ml-1">
                  <User className="w-3 h-3" /> Tên khách hàng
                </label>
                <input 
                  type="text" 
                  value={customerName} 
                  onChange={e => setCustomerName(e.target.value)}
                  className="w-full bg-[#F8FAFC] border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 focus:border-[#FFD400] transition-all outline-none"
                  placeholder="Nhập tên người nhận..."
                  required 
                />
              </div>

              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-wider ml-1">
                  <Phone className="w-3 h-3" /> Số điện thoại
                </label>
                <input 
                  type="tel" 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)}
                  className="w-full bg-[#F8FAFC] border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 focus:border-[#FFD400] transition-all outline-none"
                  placeholder="09xx xxx xxx"
                  required 
                />
              </div>

              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-wider ml-1">
                  <MapPin className="w-3 h-3" /> Địa chỉ giao hàng
                </label>
                <textarea 
                  value={address} 
                  onChange={e => setAddress(e.target.value)}
                  className="w-full bg-[#F8FAFC] border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 focus:border-[#FFD400] transition-all outline-none min-h-[100px] resize-none"
                  placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố..."
                  required 
                />
              </div>

              {!fromCart && (
                <div className="space-y-1.5 pt-2">
                  <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-wider ml-1">
                    <Package className="w-3 h-3" /> Số lượng đặt mua
                  </label>
                  <div className="flex items-center gap-4 bg-[#F8FAFC] p-2 rounded-2xl w-fit">
                    <button 
                      type="button"
                      onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                      className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-bold text-slate-600 shadow-sm active:scale-90 transition-transform"
                    >-</button>
                    <span className="text-lg font-black text-slate-800 w-8 text-center">{quantity}</span>
                    <button 
                      type="button"
                      onClick={() => setQuantity(prev => prev + 1)}
                      className="w-10 h-10 bg-[#FFD400] rounded-xl flex items-center justify-center font-bold text-black shadow-sm active:scale-90 transition-transform"
                    >+</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Earnings Summary */}
          <div className="bg-black rounded-[32px] p-6 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD400]/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Thu nhập dự kiến</p>
                <p className="text-3xl font-black text-[#FFD400]">+{totalCommission.toLocaleString()}đ</p>
              </div>
              <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md">
                 <CheckCircle2 className="w-6 h-6 text-[#FFD400]" />
              </div>
            </div>

            <div className="space-y-3 pt-6 border-t border-white/10 text-xs">
               <div className="flex justify-between items-center text-gray-400">
                  <span>Giá trị đơn {fromCart ? `(${items.reduce((s, i) => s + i.quantity, 0)} SP)` : `x ${quantity}`}</span>
                  <span className="font-bold text-white">{totalPrice.toLocaleString()}đ</span>
               </div>
               <div className="flex justify-between items-center text-gray-400">
                  <span>Hoa hồng dự tính</span>
                  <span className="font-bold text-white">+{totalCommission.toLocaleString()}đ</span>
               </div>
               <div className="flex justify-between items-center text-gray-400">
                  <span>IbeePoint nhận được</span>
                  <span className="font-bold text-[#FFD400]">+{totalPoint.toLocaleString()} P</span>
               </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={submitting}
            className="w-full bg-[#FFD400] hover:bg-[#FFE033] disabled:opacity-50 text-black h-16 rounded-[20px] font-black uppercase tracking-widest text-sm shadow-[0_10px_30px_rgba(255,212,0,0.3)] transition-all transform active:scale-[0.98] flex items-center justify-center gap-3"
          >
            {submitting ? (
              <>
                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                ĐANG XỬ LÝ...
              </>
            ) : (
              'XÁC NHẬN CHỐT ĐƠN'
            )}
          </button>
        </form>

        <div className="flex items-center gap-2 justify-center py-4 opacity-40">
           <AlertCircle className="w-4 h-4" />
           <p className="text-[10px] font-bold uppercase tracking-widest">Đơn hàng sẽ được gửi đến đối tác xử lý ngay</p>
        </div>
      </div>
    </div>
  );
}

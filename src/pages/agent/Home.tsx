import React, { useEffect, useState } from 'react';
import { useAuth } from '../../store/useAuth';
import { Package, TrendingUp, Star, Flame, Gift, Search, ShoppingBag, ShoppingCart, Building2, Plus } from 'lucide-react';
import { api } from '../../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../../store/useCart';
import { toast } from 'react-hot-toast';

export default function AgentHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { items: cartItems, fetchCart, addToCart } = useCart();
  const [banners, setBanners] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [topSellingProducts, setTopSellingProducts] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(20);
  const [activeBanner, setActiveBanner] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bannersRes, promotionsRes, featuredRes, topSellingRes, suppliersRes, productsRes] = await Promise.all([
          api.get('/banners'),
          api.get('/promotions'),
          api.get('/products?featured=true'),
          api.get('/products/top-selling'),
          api.get('/suppliers'),
          api.get('/products')
        ]);
        setBanners(bannersRes.data);
        setPromotions(promotionsRes.data);
        setFeaturedProducts(featuredRes.data);
        setTopSellingProducts(topSellingRes.data);
        setSuppliers(suppliersRes.data);
        setAllProducts(productsRes.data);
        fetchCart();
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLoadMore = () => {
    setLoadingMore(true);
    setTimeout(() => {
      setDisplayLimit(prev => prev + 20);
      setLoadingMore(false);
    }, 500);
  };

  useEffect(() => {
    if (banners.length > 1) {
      const timer = setInterval(() => {
        setActiveBanner((prev) => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [banners.length]);

  if (loading) return <div className="p-8 text-center text-[--color-text-secondary]">Đang tải...</div>;

  return (
    <div className="pb-24 md:pb-8 bg-[--color-bg-base] min-h-screen">
      {/* Header / Search Bar */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md p-4 flex gap-3 items-center card-shadow">
         <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              readOnly
              onClick={() => navigate('/agent/products')}
              type="text" 
              placeholder="Bạn muốn bán gì hôm nay?" 
              className="w-full bg-gray-100 border-none rounded-full py-2.5 pl-10 pr-4 text-xs text-gray-800 outline-none focus:ring-2 focus:ring-[--color-primary] transition-shadow cursor-pointer"
            />
         </div>
         <button onClick={() => navigate('/agent/cart')} className="relative p-2.5 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
            <ShoppingCart className="w-5 h-5 text-gray-700" />
            {cartItems.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
         </button>
         <Link to="/agent/orders" className="relative p-2.5 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
            <ShoppingBag className="w-5 h-5 text-gray-700" />
         </Link>
      </div>

      <div className="space-y-6 pt-4 pb-6">
        {/* Banner Section - E-commerce Carousel */}
        {banners.length > 0 && (
          <div className="relative px-4 group">
            <div className="relative aspect-[21/9] rounded-2xl overflow-hidden shadow-sm active:scale-[0.98] transition-transform bg-gray-200">
              <AnimatePresence mode="wait">
                <motion.img 
                  key={activeBanner}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  src={banners[activeBanner].image || undefined} 
                  className="w-full h-full object-cover" 
                  alt="" 
                />
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-4">
                 <h3 className="text-white font-bold text-sm md:text-base line-clamp-1">{banners[activeBanner].title}</h3>
              </div>
            </div>
            {/* Indicators */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {banners.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${activeBanner === i ? 'w-6 bg-white' : 'w-1.5 bg-white/40'}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Featured Suppliers Horizontal Scroll */}
        {suppliers.length > 0 && (
          <div className="space-y-3 bg-white py-4 card-shadow">
            <div className="flex justify-between items-center px-4">
               <h2 className="text-sm font-bold text-[--color-text-main]">Thương hiệu nổi bật</h2>
               <Link to="/agent/products" className="text-xs text-[--color-text-secondary] font-medium">Xem tất cả</Link>
            </div>
            <div className="overflow-x-auto flex gap-4 px-4 no-scrollbar snap-x">
               {suppliers.map((s: any) => (
                 <Link 
                   key={s._id} 
                   to={`/agent/products?supplierId=${s._id}`} 
                   className="flex flex-col items-center gap-2 snap-start shrink-0"
                 >
                    <div className="w-14 h-14 rounded-full bg-gray-50 border border-gray-100 p-2 flex items-center justify-center overflow-hidden hover:border-[--color-primary] hover:shadow-md transition-all">
                       {s.logo ? (
                         <img src={s.logo || undefined} className="w-full h-full object-cover rounded-full" alt="" />
                       ) : (
                         <Package className="w-6 h-6 text-gray-400" />
                       )}
                    </div>
                    <span className="text-[10px] font-medium text-gray-600 text-center truncate w-16">{s.name}</span>
                 </Link>
               ))}
            </div>
          </div>
        )}

        {/* Promotions Section */}
        {promotions.length > 0 && (
          <div className="px-4">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-4 relative overflow-hidden shadow-md">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 blur-2xl rounded-full -mr-16 -mt-16"></div>
               <div className="relative flex justify-between items-center">
                  <div className="space-y-1">
                     <h2 className="text-white font-bold text-base flex items-center gap-2">
                        🔥 SIÊU ƯU ĐÃI
                     </h2>
                     <p className="text-red-100 text-[10px] leading-tight">Chiến dịch thưởng thêm</p>
                  </div>
                  <button onClick={() => navigate('/agent/products')} className="bg-white text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold active:scale-95 transition-all shadow-sm">
                     MỞ NGAY
                  </button>
               </div>
               <div className="mt-4 flex gap-3 overflow-x-auto no-scrollbar pb-1">
                  {promotions.map((p: any) => (
                    <div key={p._id} className="min-w-[160px] bg-white rounded-xl p-3 shadow-sm shrink-0">
                       <h4 className="text-gray-900 text-xs font-bold truncate">{p.title}</h4>
                       <div className="mt-2 flex items-center justify-between">
                          <span className="text-[10px] font-medium text-gray-500">Thưởng</span>
                          <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded text-[10px] font-bold">
                             {p.type === 'commission_boost' ? `+${p.value}%` : `+${p.value}P`}
                          </span>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        )}

        {/* Featured Products Grid */}
        <div className="bg-white py-4 card-shadow space-y-4">
          <div className="flex justify-between items-center px-4">
            <h2 className="text-base font-bold text-[--color-text-main] flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              Sản phẩm nổi bật
            </h2>
            <Link to="/agent/products?filter=featured" className="text-xs text-[--color-text-secondary] font-medium">Gợi ý cho bạn</Link>
          </div>
          <div className="grid grid-cols-2 gap-3 px-4">
             {featuredProducts.slice(0, 4).map((p: any) => (
               <Link key={p._id} to={`/agent/products?id=${p._id}`} className="bg-white border border-gray-100 rounded-2xl overflow-hidden flex flex-col active:scale-95 transition-all shadow-sm">
                  <div className="aspect-square bg-gray-50 relative overflow-hidden">
                     <img src={p.images?.[0] || undefined} className="w-full h-full object-cover" alt="" />
                     <div className="absolute bottom-2 left-2 flex gap-1">
                        <div className="bg-[--color-primary] text-black text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">+{p.point}P</div>
                     </div>
                  </div>
                  <div className="p-3 flex flex-col flex-1 space-y-2 border-t border-gray-50">
                    <h4 className="text-xs font-medium text-gray-800 line-clamp-2 leading-snug">{p.name}</h4>
                    <div className="flex-1"></div>
                    <div className="flex flex-col">
                       <span className="text-red-500 font-bold text-sm">{p.retailPrice.toLocaleString()}đ</span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2 text-center border border-gray-100">
                       <p className="text-[10px] text-gray-500 font-medium">Hoa hồng</p>
                       <p className="text-xs font-bold text-[--color-text-main]">{p.agentCommission.toLocaleString()}đ</p>
                    </div>
                  </div>
               </Link>
             ))}
          </div>
        </div>

        {/* Best Sellers Grid */}
        <div className="bg-white py-4 card-shadow space-y-4">
          <div className="flex justify-between items-center px-4">
            <h2 className="text-base font-bold text-[--color-text-main] flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
              Bán chạy nhất
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3 px-4">
             {topSellingProducts.slice(0, 4).map((p: any) => (
               <Link key={p._id} to={`/agent/products?id=${p._id}`} className="bg-white border border-gray-100 rounded-2xl overflow-hidden flex flex-col active:scale-95 transition-all shadow-sm">
                  <div className="aspect-square bg-gray-50 relative overflow-hidden">
                     <img src={p.images?.[0] || undefined} className="w-full h-full object-cover" alt="" />
                     <div className="absolute top-2 right-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">HOT</div>
                  </div>
                  <div className="p-3 flex flex-col flex-1 space-y-2 border-t border-gray-50">
                    <h4 className="text-xs font-medium text-gray-800 line-clamp-2 leading-snug">{p.name}</h4>
                    <div className="flex-1"></div>
                    <div className="flex flex-col">
                       <span className="text-red-500 font-bold text-sm">{p.retailPrice.toLocaleString()}đ</span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2 text-center border border-gray-100">
                       <p className="text-[10px] text-gray-500 font-medium">Hoa hồng</p>
                       <p className="text-xs font-bold text-[--color-text-main]">{p.agentCommission.toLocaleString()}đ</p>
                    </div>
                  </div>
               </Link>
             ))}
          </div>
        </div>

        {/* All Products Section */}
        <div className="space-y-4 px-4 pb-12">
           <div className="flex justify-between items-center">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wider">
                Tất cả sản phẩm
              </h2>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{allProducts.length} MẶT HÀNG</span>
           </div>

           {allProducts.length === 0 ? (
             <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-200">
                <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Chưa có sản phẩm nào</p>
             </div>
           ) : (
             <>
               <div className="grid grid-cols-2 gap-4">
                  {allProducts.slice(0, displayLimit).map((p: any) => (
                    <motion.div 
                      key={p._id}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      onClick={() => navigate(`/agent/products?id=${p._id}`)}
                      className="bg-white rounded-[14px] border border-gray-100 overflow-hidden shadow-sm flex flex-col active:scale-[0.98] transition-all"
                    >
                       <div className="aspect-square relative group">
                          <img src={p.images?.[0] || undefined} className="w-full h-full object-cover" alt="" />
                          <div className="absolute top-2 right-2 flex flex-col gap-1">
                             <div className="bg-black/40 backdrop-blur-md text-white text-[10px] font-black px-2 py-1 rounded-lg">+{p.point}P</div>
                          </div>
                       </div>
                       <div className="p-3 flex flex-col flex-1 space-y-2">
                          <h4 className="text-[11px] font-bold text-slate-800 line-clamp-2 leading-relaxed h-[32px]">{p.name}</h4>
                          
                          {p.supplierId && (
                            <div className="flex items-center gap-1.5 opacity-60">
                               <Building2 className="w-3 h-3 text-slate-400" />
                               <span className="text-[9px] font-bold text-slate-500 uppercase truncate">{(typeof p.supplierId === 'object' ? p.supplierId.name : 'Đối tác')}</span>
                            </div>
                          )}

                          <div className="pt-1">
                             <span className="text-red-500 font-black text-sm">{p.retailPrice.toLocaleString()}đ</span>
                          </div>

                          <div className="bg-[#F8FAFC] rounded-xl p-2 border border-slate-100">
                             <div className="flex justify-between items-center">
                                <span className="text-[8px] font-black text-slate-400 uppercase">Hoa hồng:</span>
                                <span className="text-[10px] font-black text-green-600">+{p.agentCommission.toLocaleString()}đ</span>
                             </div>
                          </div>

                          <div className="grid grid-cols-5 gap-2 mt-1">
                             <button 
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  try {
                                    await addToCart(p._id);
                                    toast.success('Đã thêm vào giỏ');
                                  } catch (err) {
                                    toast.error('Lỗi khi thêm vào giỏ');
                                  }
                                }}
                                className="col-span-1 bg-slate-100 text-slate-600 h-10 rounded-xl flex items-center justify-center active:scale-95 transition-all"
                             >
                                <Plus className="w-4 h-4" />
                             </button>
                             <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/agent/create-order?productId=${p._id}`);
                                }}
                                className="col-span-4 bg-[#FFD400] hover:bg-[#FFE033] text-black h-10 rounded-xl font-black uppercase tracking-tighter text-[10px] shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-95"
                             >
                                <ShoppingCart className="w-3.5 h-3.5" />
                                Tạo đơn
                             </button>
                          </div>
                       </div>
                    </motion.div>
                  ))}
               </div>

               {displayLimit < allProducts.length && (
                 <div className="pt-8 flex justify-center">
                    <button 
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="px-8 py-3 bg-white border border-gray-200 rounded-full text-xs font-black text-slate-600 uppercase tracking-widest shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-50"
                    >
                       {loadingMore ? 'ĐANG TẢI...' : 'XEM THÊM SẢN PHẨM'}
                    </button>
                 </div>
               )}
             </>
           )}
        </div>
      </div>
    </div>
  );
}

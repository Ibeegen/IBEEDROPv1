import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { ChevronLeft, ShoppingCart, Package, Building2, Store, Search, Filter, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Product {
  _id: string;
  name: string;
  images: string[];
  retailPrice: number;
  agentCommission: number;
  point: number;
}

interface Supplier {
  _id: string;
  name: string;
  logo: string;
  note?: string;
  address?: string;
}

export default function SupplierStore() {
  const { supplierId } = useParams();
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supplierId) return;

    const fetchData = async () => {
      try {
        const [supplierRes, productsRes] = await Promise.all([
          api.get(`/suppliers/${supplierId}`),
          api.get(`/products?supplierId=${supplierId}`)
        ]);
        setSupplier(supplierRes.data);
        setProducts(productsRes.data);
      } catch (err) {
        console.error('Error fetching supplier data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [supplierId]);

  if (loading) {
    return (
      <div className="bg-white min-h-screen">
         <div className="p-4 flex items-center gap-4 border-b border-gray-100">
            <div className="w-8 h-8 bg-gray-100 rounded-full animate-pulse"></div>
            <div className="h-4 w-32 bg-gray-100 rounded animate-pulse"></div>
         </div>
         <div className="p-4 space-y-6">
            <div className="h-40 bg-gray-50 rounded-3xl animate-pulse"></div>
            <div className="grid grid-cols-2 gap-4">
               {[1, 2, 3, 4].map(i => (
                  <div key={i} className="aspect-[3/4] bg-gray-50 rounded-2xl animate-pulse"></div>
               ))}
            </div>
         </div>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="p-8 text-center bg-white min-h-screen">
        <p className="text-slate-500 mb-4">Không tìm thấy gian hàng này.</p>
        <button onClick={() => navigate(-1)} className="text-[#FFD400] font-bold underline">Quay lại</button>
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans pb-20">
      {/* Header & Hero */}
      <div className="bg-white relative">
         <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-[#FFD400]/20 to-transparent"></div>
         
         <div className="relative z-10 px-4 pt-6 pb-4">
            <div className="flex items-center justify-between mb-8">
               <button 
                 onClick={() => navigate(-1)} 
                 className="p-2.5 bg-white shadow-sm rounded-2xl hover:bg-gray-50 transition-colors"
               >
                 <ChevronLeft className="w-6 h-6 text-slate-800" />
               </button>
               <h1 className="text-sm font-black text-slate-900 uppercase tracking-widest">Gian hàng đối tác</h1>
               <div className="w-11"></div>
            </div>

            <div className="flex items-center gap-5 mb-6">
               <div className="w-20 h-20 bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden shrink-0 flex items-center justify-center p-2">
                  {supplier.logo ? (
                    <img src={supplier.logo} className="w-full h-full object-contain" alt="" />
                  ) : (
                    <Store className="w-10 h-10 text-slate-200" />
                  )}
               </div>
               <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-black text-slate-900 leading-tight mb-1">{supplier.name}</h2>
                  <div className="flex items-center gap-2">
                     <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-green-50 text-[10px] font-bold text-green-600 border border-green-100">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                        Đang hoạt động
                     </span>
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{products.length} Sản phẩm</span>
                  </div>
               </div>
            </div>

            {supplier.note && (
              <p className="text-xs text-slate-500 font-medium leading-relaxed px-1 mb-4 line-clamp-2">
                 {supplier.note}
              </p>
            )}

            <div className="flex gap-2">
               <div className="flex-1 bg-slate-50 rounded-2xl px-4 py-3 flex items-center gap-3 border border-slate-100">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input type="text" placeholder="Tìm trong gian hàng..." className="bg-transparent border-none outline-none text-xs font-bold text-slate-700 w-full placeholder:text-slate-300" />
               </div>
               <button className="p-3 bg-white border border-slate-100 rounded-2xl shadow-sm">
                  <Filter className="w-5 h-5 text-slate-400" />
               </button>
            </div>
         </div>
      </div>

      {/* Product List */}
      <div className="px-4 py-6">
         {products.length === 0 ? (
           <div className="py-20 flex flex-col items-center justify-center opacity-50">
              <Package className="w-16 h-16 text-slate-300 mb-4" />
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Chưa có sản phẩm nào</p>
           </div>
         ) : (
           <div className="grid grid-cols-2 gap-4">
              {products.map(product => (
                 <motion.div 
                   key={product._id}
                   whileTap={{ scale: 0.98 }}
                   onClick={() => navigate(`/agent/products?id=${product._id}`)}
                   className="bg-white rounded-[24px] border border-gray-100 overflow-hidden shadow-sm flex flex-col"
                 >
                    <div className="aspect-square relative group">
                       <img src={product.images?.[0]} className="w-full h-full object-cover" alt="" />
                       <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-bold text-white">
                          +{product.point}P
                       </div>
                    </div>
                    <div className="p-3 flex-1 flex flex-col">
                       <h3 className="text-xs font-bold text-slate-900 line-clamp-2 mb-2 leading-relaxed h-[36px]">
                          {product.name}
                       </h3>
                       <div className="mt-auto space-y-2">
                          <p className="text-sm font-black text-red-500">{product.retailPrice.toLocaleString()}đ</p>
                          <div className="bg-green-50 px-2 py-1.5 rounded-lg border border-green-100 flex items-center justify-between">
                             <span className="text-[9px] font-bold text-green-700 uppercase">Hồng:</span>
                             <span className="text-[10px] font-black text-green-700">+{product.agentCommission.toLocaleString()}đ</span>
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/agent/create-order?productId=${product._id}`);
                            }}
                            className="w-full bg-[#FFD400] h-10 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-[0_4px_10px_rgba(255,212,0,0.2)] active:scale-95 transition-transform"
                          >
                             <ShoppingCart className="w-3.5 h-3.5" />
                             Tạo đơn
                          </button>
                       </div>
                    </div>
                 </motion.div>
              ))}
           </div>
         )}
      </div>

      {/* Floating Info */}
      {supplier.address && (
         <div className="mx-4 bg-slate-900 rounded-[28px] p-5 text-white relative overflow-hidden group shadow-2xl shadow-slate-200">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD400]/10 rounded-full -mr-16 -mt-16 blur-3xl transition-all group-hover:bg-[#FFD400]/20"></div>
            <div className="flex items-start gap-4">
               <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-[#FFD400]" />
               </div>
               <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Địa chỉ kho hàng</p>
                  <p className="text-xs font-medium text-slate-200 leading-relaxed line-clamp-2">
                     {supplier.address}
                  </p>
               </div>
               <div className="ml-auto">
                  <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center">
                     <ArrowUpRight className="w-4 h-4 text-[#FFD400]" />
                  </div>
               </div>
            </div>
         </div>
      )}
    </div>
  );
}

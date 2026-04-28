import React, { useEffect, useState } from 'react';
import { Package, Search, ChevronLeft, Building2, Star, Flame, ShoppingCart, Filter, ArrowLeft, X, Download, Copy, Check, ChevronDown, ChevronUp, Store, Plus } from 'lucide-react';
import { api } from '../../services/api';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../../store/useCart';
import { toast } from 'react-hot-toast';

interface Product {
  _id: string;
  name: string;
  description: string;
  images: string[];
  retailPrice: number;
  agentCommission: number;
  point: number;
  supplierId?: {
    _id: string;
    name: string;
    logo: string;
  };
}

interface Supplier {
  _id: string;
  name: string;
  logo: string;
  phone?: string;
  address?: string;
  contactPerson?: string;
}

export default function AgentProducts() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { items: cartItems, fetchCart, addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupplierId, setSelectedSupplierId] = useState(searchParams.get('supplierId') || '');
  const [activeFilter, setActiveFilter] = useState(searchParams.get('filter') || 'all');
  
  // Order & Detail state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  const [copied, setCopied] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const [descCopied, setDescCopied] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const copyDescription = (text: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setDescCopied(true);
      setTimeout(() => setDescCopied(false), 2000);
    });
  };

  const downloadImageAsWebp = async (imageUrl: string, filename: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = URL.createObjectURL(blob);
      await new Promise((resolve) => (img.onload = resolve));
      
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      
      const webpDataUrl = canvas.toDataURL("image/webp");
      const link = document.createElement("a");
      link.href = webpDataUrl;
      link.download = `${filename.replace(/\s+/g, '_')}.webp`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed", error);
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const copyProductInfo = (p: Product, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const info = `
Tên sản phẩm: ${p.name}
Mã SP: #${p._id.slice(-6).toUpperCase()}
Giá bán lẻ: ${p.retailPrice.toLocaleString()}đ
Điểm: ${p.point} IbeePoint
Mô tả: ${p.description || 'Chưa có mô tả'}
    `.trim();
    
    navigator.clipboard.writeText(info).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, suppliersRes] = await Promise.all([
          api.get('/products'),
          api.get('/suppliers')
        ]);
        setProducts(productsRes.data);
        setSuppliers(suppliersRes.data);
        fetchCart();
        
        // Handle direct link to product
        const prodId = searchParams.get('id');
        if (prodId) {
          const prod = productsRes.data.find((p: any) => p._id === prodId);
          if (prod) {
            setSelectedProduct(prod);
            setIsDetailOpen(true);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const openOrderModal = (p: Product, e?: React.MouseEvent) => {
    e?.stopPropagation();
    navigate(`/agent/create-order?productId=${p._id}`);
  };

  const openDetail = (p: Product) => {
    setSelectedProduct(p);
    setIsDetailOpen(true);
    setActiveImageIndex(0);
    setSearchParams({ id: p._id });
  };

  const closeDetail = () => {
    setIsDetailOpen(false);
    setSearchParams({});
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSupplier = selectedSupplierId ? (typeof p.supplierId === 'object' ? p.supplierId?._id === selectedSupplierId : p.supplierId === selectedSupplierId) : true;
    const matchesFilter = activeFilter === 'all' ? true :
                         activeFilter === 'featured' ? (p as any).featured :
                         true; // Add more filter logic if needed
    return matchesSearch && matchesSupplier && matchesFilter;
  });

  if (loading) return <div className="p-8 text-center text-[--color-text-secondary]">Đang tải sản phẩm...</div>;

  return (
    <div className="bg-[--color-bg-base] min-h-screen pb-24 relative overflow-x-hidden">
      {/* Sticky Header with Search */}
      <div className="sticky top-0 z-40 bg-white shadow-sm p-4 space-y-4 border-b border-gray-100">
        <div className="flex gap-3 items-center">
            <button onClick={() => navigate(-1)} className="p-2 bg-gray-100 rounded-full border border-transparent shadow-sm">
               <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div className="flex-1 relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
               <input 
                 type="text" 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 placeholder="Tìm sản phẩm, thương hiệu..." 
                 className="w-full bg-gray-100 border-none rounded-full py-2.5 pl-10 pr-4 text-xs text-gray-800 outline-none focus:ring-2 focus:ring-[--color-primary] transition-shadow shadow-inner"
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
        </div>

        {/* Quick Filter Chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
           {[
             { id: 'all', label: 'Tất cả', icon: Package },
             { id: 'featured', label: 'Nổi bật', icon: Star },
             { id: 'hot', label: 'Bán chạy', icon: Flame },
           ].map(f => (
             <button 
               key={f.id}
               onClick={() => setActiveFilter(f.id)}
               className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all shadow-sm ${
                 activeFilter === f.id 
                  ? 'bg-black text-[--color-primary]' 
                  : 'bg-white border border-gray-200 text-gray-600'
               }`}
             >
               <f.icon className="w-3 h-3" />
               {f.label}
             </button>
           ))}
        </div>

        {/* Supplier Horizontal Scroll */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
           <button 
             onClick={() => setSelectedSupplierId('')}
             className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
               selectedSupplierId === '' ? 'bg-[--color-primary-light] text-orange-600 border border-[--color-primary]' : 'bg-gray-50 border-gray-200 text-gray-500'
             }`}
           >
              <Building2 className="w-5 h-5" />
           </button>
           {suppliers.map(s => (
              <button 
                key={s._id}
                onClick={() => setSelectedSupplierId(s._id)}
                className={`shrink-0 w-12 h-12 rounded-xl overflow-hidden transition-all bg-white shadow-sm border ${
                  selectedSupplierId === s._id ? 'border-[--color-primary] ring-2 ring-[--color-primary]/20' : 'border-gray-100 opacity-80'
                }`}
              >
                {s.logo ? <img src={s.logo || undefined} className="w-full h-full object-cover" alt="" /> : <Building2 className="w-5 h-5 m-auto text-gray-300" />}
              </button>
           ))}
        </div>
      </div>

      {/* Product List Grid 2-column */}
      <div className="p-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
         {filteredProducts.map(p => (
           <motion.div 
             layout
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             key={p._id} 
             onClick={() => openDetail(p)}
             className="bg-white border border-gray-100 rounded-2xl overflow-hidden flex flex-col active:scale-95 transition-all shadow-sm"
           >
              <div className="aspect-square bg-gray-50 relative group overflow-hidden">
                 <img src={p.images?.[0] || undefined} className="w-full h-full object-cover" alt="" />
                 <button 
                  onClick={(e) => downloadImageAsWebp(p.images?.[0], p.name, e)}
                  className="absolute bottom-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-lg text-gray-700 hover:text-[--color-primary] shadow-sm transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all active:scale-90"
                  title="Tải ảnh WebP"
                 >
                    <Download className="w-4 h-4" />
                 </button>
              </div>
              <div className="p-3 md:p-4 flex flex-col flex-1 gap-2 border-t border-gray-50">
                 <h4 className="text-[11px] md:text-sm font-medium text-gray-800 line-clamp-2 min-h-[32px] leading-snug">{p.name}</h4>
                 <div className="mt-auto space-y-2">
                    <div className="flex flex-col">
                       <span className="text-[10px] text-gray-400 line-through">{(p.retailPrice * 1.2).toLocaleString()}đ</span>
                       <span className="text-red-500 font-bold text-sm md:text-base">{p.retailPrice.toLocaleString()}đ</span>
                       <div className="flex items-center gap-1 text-[9px] font-bold text-[--color-primary-dark] mt-0.5">
                          <Package className="w-2.5 h-2.5" />
                          <span>{p.point} IbeePoint</span>
                       </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2 text-center border border-gray-100">
                       <p className="text-[9px] text-gray-500 font-medium uppercase tracking-tighter">Hoa hồng</p>
                       <p className="text-xs font-bold text-[--color-text-main]">+{p.agentCommission.toLocaleString()}đ</p>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
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
                         className="col-span-1 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center active:scale-95 transition-all"
                       >
                          <Plus className="w-4 h-4" />
                       </button>
                       <button 
                         onClick={(e) => openOrderModal(p, e)}
                         className="col-span-4 bg-[--color-primary] hover:bg-[--color-primary-hover] text-black py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm active:scale-[0.98]"
                       >
                          Tạo đơn
                       </button>
                    </div>
                 </div>
              </div>
           </motion.div>
         ))}
         {filteredProducts.length === 0 && (
           <div className="col-span-full py-20 text-center space-y-4">
              <Package className="w-12 h-12 text-gray-300 mx-auto" />
              <p className="text-gray-500 text-sm italic">Không tìm thấy sản phẩm nào khớp với bộ lọc</p>
           </div>
         )}
      </div>

      {/* Bottom Sheet / Side Detail View */}
      <AnimatePresence>
        {isDetailOpen && selectedProduct && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[60] bg-white flex flex-col"
          >
             <div className="p-4 flex items-center justify-between border-b border-gray-100 bg-white shadow-sm z-10">
                <button onClick={closeDetail} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
                   <ChevronLeft className="w-6 h-6 text-gray-700" />
                </button>
                <h3 className="font-bold text-[--color-text-main] uppercase tracking-[0.2em] text-[10px]">Chi tiết sản phẩm</h3>
                <div className="w-10"></div>
             </div>
             
             <div className="flex-1 overflow-y-auto no-scrollbar bg-[--color-bg-base] pb-24">
                {/* Image Section */}
                <div className="bg-white relative">
                   <div className="aspect-square bg-gray-50 relative group">
                      <AnimatePresence mode="wait">
                        <motion.img 
                          key={activeImageIndex}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          src={selectedProduct.images?.[activeImageIndex] || undefined} 
                          className="w-full h-full object-contain" 
                          alt="" 
                        />
                      </AnimatePresence>
                      <button 
                        onClick={(e) => downloadImageAsWebp(selectedProduct.images?.[activeImageIndex], selectedProduct.name, e)}
                        className="absolute bottom-4 right-4 p-3 bg-white/90 backdrop-blur-sm rounded-2xl text-gray-700 hover:text-[--color-primary] shadow-lg flex items-center gap-2 active:scale-95 transition-all z-20"
                      >
                         <Download className="w-5 h-5" />
                         <span className="text-xs font-bold uppercase tracking-widest hidden sm:inline">Tải ảnh</span>
                      </button>
                   </div>
                   
                   {/* Image Thumbnails */}
                   {selectedProduct.images && selectedProduct.images.length > 1 && (
                     <div className="flex gap-2 p-4 overflow-x-auto no-scrollbar">
                        {selectedProduct.images.map((img, idx) => (
                           <button 
                             key={idx}
                             onClick={() => setActiveImageIndex(idx)}
                             className={`w-16 h-16 rounded-xl border-2 transition-all shrink-0 overflow-hidden ${activeImageIndex === idx ? 'border-[#FFD400] shadow-md' : 'border-gray-100'}`}
                           >
                              <img src={img} className="w-full h-full object-cover" alt="" />
                           </button>
                        ))}
                     </div>
                   )}
                </div>

                <div className="p-4 space-y-4 bg-white mb-4 shadow-sm">
                   <div className="space-y-1">
                      <div className="flex justify-between items-start gap-4">
                        <h1 className="text-lg font-bold text-[--color-text-main] leading-tight flex-1">{selectedProduct.name}</h1>
                        <button 
                          onClick={(e) => copyProductInfo(selectedProduct, e)}
                          className={`shrink-0 p-2.5 rounded-xl border transition-all flex items-center gap-2 ${copied ? 'bg-green-50 border-green-200 text-green-600' : 'bg-gray-50 border-gray-200 text-gray-500 hover:text-[#FFD400]'}`}
                        >
                           {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                           <span className="text-[10px] font-black uppercase tracking-tighter">{copied ? 'Đã copy' : 'Copy'}</span>
                        </button>
                      </div>
                       <div className="flex flex-col pt-2">
                          <div className="flex items-end gap-3">
                             <span className="text-2xl font-bold text-red-500">{selectedProduct.retailPrice.toLocaleString()}đ</span>
                             <span className="text-gray-400 line-through text-sm mb-1">{(selectedProduct.retailPrice * 1.2).toLocaleString()}đ</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[--color-primary-dark] mt-1 bg-[--color-primary-light] w-fit px-2 py-0.5 rounded-md">
                             <Package className="w-3 h-3" />
                             <span>+{selectedProduct.point} Ibeepoint</span>
                          </div>
                       </div>
                   </div>
                </div>
                
                <div className="p-4 bg-white mb-4 shadow-sm">
                   <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 border border-gray-100 p-3 rounded-xl flex flex-col items-center justify-center">
                         <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest mb-1">Hoa hồng nhận</p>
                         <p className="text-base font-bold text-[--color-text-main]">{selectedProduct.agentCommission.toLocaleString()}đ</p>
                      </div>
                      <div className="bg-gray-50 border border-gray-100 p-3 rounded-xl flex flex-col items-center justify-center">
                         <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest mb-1">Mã sản phẩm</p>
                         <p className="text-base font-bold text-[--color-text-main]">#{selectedProduct._id.slice(-6).toUpperCase()}</p>
                      </div>
                   </div>
                   
                   {selectedProduct.supplierId && (
                     <div className="mt-4 bg-[#F8FAFC] p-4 rounded-2xl border border-gray-100 flex flex-col gap-4">
                        <div className="flex items-center gap-4">
                           <div className="w-14 h-14 rounded-2xl bg-white border border-gray-100 overflow-hidden shrink-0 shadow-sm flex items-center justify-center">
                              {selectedProduct.supplierId.logo ? 
                                <img src={selectedProduct.supplierId.logo || undefined} className="w-full h-full object-cover" alt="" /> :
                                <Building2 className="w-6 h-6 text-gray-300" />
                              }
                           </div>
                           <div className="flex-1 min-w-0">
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Đối tác cung cấp</p>
                              <p className="text-slate-900 font-black text-[15px] truncate">{selectedProduct.supplierId.name}</p>
                              <div className="flex items-center gap-1.5 mt-1">
                                 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                                 <span className="text-[10px] font-bold text-slate-500 uppercase">Đang cung ứng</span>
                              </div>
                           </div>
                        </div>

                        <button 
                          onClick={() => navigate(`/agent/supplier/${selectedProduct.supplierId._id}`)}
                          className="w-full bg-[#FFD400] h-11 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-all text-black"
                        >
                           <Store className="w-4 h-4" />
                           Gian hàng nhà cung cấp
                        </button>

                        {(selectedProduct.supplierId as any).address && (
                          <div className="flex items-start gap-2.5 pt-3 border-t border-gray-200/50">
                             <div className="w-7 h-7 rounded-lg bg-white border border-gray-100 flex items-center justify-center shrink-0">
                                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                             </div>
                             <div>
                                <p className="text-[9px] text-gray-400 font-bold uppercase mb-0.5">Kho hàng / Cửa hàng</p>
                                <p className="text-xs text-slate-600 font-medium leading-relaxed">{(selectedProduct.supplierId as any).address}</p>
                             </div>
                          </div>
                        )}
                     </div>
                   )}
                </div>

                <div className="p-4 bg-white shadow-sm mb-4">
                   <div className="flex justify-between items-center mb-3 px-1">
                      <h3 className="text-sm font-bold text-[--color-text-main] uppercase">Mô tả sản phẩm</h3>
                      {selectedProduct.description && (
                        <button 
                          onClick={(e) => copyDescription(selectedProduct.description, e)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all border ${
                            descCopied 
                              ? 'bg-green-50 border-green-200 text-green-600' 
                              : 'bg-gray-50 border-gray-100 text-gray-500 hover:text-[--color-primary] hover:border-[--color-primary]/30'
                          }`}
                        >
                           {descCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                           {descCopied ? 'Đã copy mô tả' : 'Copy mô tả'}
                        </button>
                      )}
                   </div>
                   <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 relative">
                      <div className={`text-gray-600 text-sm leading-relaxed whitespace-pre-wrap transition-all overflow-hidden ${!descExpanded ? 'max-h-[120px]' : 'max-h-full'}`}>
                         {selectedProduct.description || 'Chưa có mô tả chi tiết cho sản phẩm này.'}
                      </div>
                      
                      {selectedProduct.description && selectedProduct.description.length > 200 && (
                        <button 
                          onClick={() => setDescExpanded(!descExpanded)}
                          className="mt-3 w-full py-2 bg-white border border-gray-100 rounded-xl text-gray-500 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 hover:text-[--color-primary] transition-colors"
                        >
                           {descExpanded ? (
                             <>Thu gọn <ChevronUp className="w-3 h-3" /></>
                           ) : (
                             <>Xem thêm <ChevronDown className="w-3 h-3" /></>
                           )}
                        </button>
                      )}
                   </div>
                </div>
             </div>

             <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 z-20 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] flex gap-3">
                <button 
                  onClick={async () => {
                     try {
                        await addToCart(selectedProduct._id);
                        toast.success('Đã thêm vào giỏ');
                     } catch (err) {
                        toast.error('Lỗi khi thêm vào giỏ');
                     }
                  }}
                  className="flex-1 bg-slate-100 text-slate-700 h-14 rounded-xl font-bold uppercase tracking-widest text-xs active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                   <Plus className="w-5 h-5" />
                   Thêm giỏ
                </button>
                <button 
                  onClick={() => navigate(`/agent/create-order?productId=${selectedProduct._id}`)}
                  className="flex-[2] bg-[#FFD400] hover:bg-[#FFE033] text-black h-14 rounded-xl font-bold uppercase tracking-widest text-xs shadow-[0_4px_15px_rgba(255,212,0,0.3)] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                   <Package className="w-5 h-5" />
                   Tạo đơn ngay
                </button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { 
  Package, 
  ChevronLeft, 
  Search, 
  Clock, 
  CheckCircle2, 
  Truck, 
  XCircle, 
  AlertCircle,
  ChevronRight,
  ShoppingBag
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

interface Order {
  _id: string;
  customerName: string;
  phone: string;
  address: string;
  totalAmount: number;
  commission: number;
  point: number;
  status: 'pending' | 'approved' | 'shipping' | 'completed' | 'cancelled';
  items: {
    productId: {
      _id: string;
      name: string;
      images: string[];
    };
    quantity: number;
  }[];
  createdAt: string;
}

const statusConfig = {
  pending: { label: 'Chờ xác nhận', color: 'text-amber-500', bg: 'bg-amber-500/10', icon: Clock },
  approved: { label: 'Đang xử lý', color: 'text-blue-500', bg: 'bg-blue-500/10', icon: AlertCircle },
  shipping: { label: 'Đang giao', color: 'text-indigo-500', bg: 'bg-indigo-500/10', icon: Truck },
  completed: { label: 'Hoàn thành', color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: CheckCircle2 },
  cancelled: { label: 'Đã hủy', color: 'text-red-500', bg: 'bg-red-500/10', icon: XCircle },
};

export default function AgentOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const tabs = [
    { id: 'all', label: 'Tất cả' },
    { id: 'pending', label: 'Chờ xác nhận' },
    { id: 'approved', label: 'Đang xử lý' },
    { id: 'shipping', label: 'Đang giao' },
    { id: 'completed', label: 'Hoàn thành' },
    { id: 'cancelled', label: 'Đã hủy' },
  ];

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders');
        setOrders(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(order => {
    const matchesTab = activeTab === 'all' || order.status === activeTab;
    const matchesSearch = order._id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  if (loading) return <div className="p-8 text-center text-slate-400">Đang tải đơn hàng...</div>;

  return (
    <div className="bg-slate-950 min-h-screen pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-900">
        <div className="p-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 bg-slate-900 rounded-full border border-slate-800">
            <ChevronLeft className="w-5 h-5 text-slate-300" />
          </button>
          <h1 className="text-sm font-black text-slate-100 uppercase tracking-widest">Đơn hàng của tôi</h1>
        </div>

        {/* Tab Scroller */}
        <div className="flex overflow-x-auto no-scrollbar px-4 pb-2 border-b border-slate-900/50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-colors relative ${
                activeTab === tab.id ? 'text-blue-500' : 'text-slate-500'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div layoutId="tab-underline" className="absolute bottom-0 left-4 right-4 h-0.5 bg-blue-500 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Tìm theo mã đơn hoặc tên khách..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-300 outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="p-4 space-y-4">
        {filteredOrders.map((order) => {
          const config = statusConfig[order.status];
          const StatusIcon = config.icon;
          
          return (
            <motion.div
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={order._id}
              className="bg-slate-900/50 border border-slate-800/80 rounded-3xl overflow-hidden shadow-xl"
            >
              {/* Card Header: Order ID & Status */}
              <div className="p-4 flex items-center justify-between border-b border-slate-800/50">
                <div className="flex items-center gap-2">
                   <ShoppingBag className="w-4 h-4 text-slate-500" />
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">#{order._id.slice(-8).toUpperCase()}</span>
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${config.bg} ${config.color}`}>
                   <StatusIcon className="w-3 h-3" />
                   <span className="text-[10px] font-black uppercase">{config.label}</span>
                </div>
              </div>

              {/* Items List (compact) */}
              <div className="p-4 space-y-4 pb-0">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 overflow-hidden shrink-0">
                      <img src={(item.productId as any)?.images?.[0] || ''} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                       <p className="text-xs font-bold text-slate-200 truncate">{(item.productId as any)?.name || 'Sản phẩm đã xóa'}</p>
                       <div className="flex justify-between items-end">
                          <p className="text-[10px] text-slate-500 font-bold uppercase">Số lượng: {item.quantity}</p>
                          <p className="text-xs font-black text-blue-400">{(order.totalAmount / order.items.length).toLocaleString()}đ</p>
                       </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals Section */}
              <div className="p-4 pt-6 space-y-4">
                <div className="flex items-center justify-between border-t border-slate-800/50 pt-4">
                   <div className="space-y-1">
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Khách hàng</p>
                      <p className="text-xs font-bold text-slate-200">{order.customerName}</p>
                   </div>
                   <div className="text-right space-y-1">
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Tổng thanh toán</p>
                      <p className="text-sm font-black text-blue-400">{order.totalAmount.toLocaleString()}đ</p>
                   </div>
                </div>

                <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4 flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                         <Package className="w-3.5 h-3.5" />
                      </div>
                      <p className="text-[10px] text-emerald-500/80 font-black uppercase tracking-widest">Hoa hồng nhận được</p>
                   </div>
                   <p className="text-base font-black text-emerald-400">+{order.commission.toLocaleString()}đ</p>
                </div>
              </div>

              {/* Action Button */}
              <div className="px-4 pb-4">
                 <button className="w-full py-3 rounded-2xl bg-slate-800 text-slate-300 text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-colors flex items-center justify-center gap-2">
                    Xem chi tiết
                    <ChevronRight className="w-3 h-3" />
                 </button>
              </div>
            </motion.div>
          );
        })}

        {filteredOrders.length === 0 && (
          <div className="py-20 text-center space-y-4">
            <Package className="w-16 h-16 text-slate-800 mx-auto" />
            <div className="space-y-1">
              <p className="text-slate-200 font-bold">Không có đơn hàng nào</p>
              <p className="text-slate-500 text-xs italic">Bạn chưa có đơn hàng nào trong mục này</p>
            </div>
            <button 
              onClick={() => navigate('/agent/products')}
              className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-900/20"
            >
              ĐI BÁN HÀNG NGAY
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { 
  Users, 
  ChevronLeft, 
  Search, 
  User, 
  Phone, 
  ShoppingBag, 
  DollarSign,
  ChevronRight,
  TrendingUp,
  Briefcase,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

interface Customer {
  _id: string; // phone
  name: string;
  totalOrders: number;
  totalRevenue: number;
  lastOrderDate: string;
}

export default function AgentCustomers() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await api.get('/stats/agent-customers');
        setCustomers(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c._id.includes(searchTerm)
  );

  if (loading) return <div className="p-8 text-center text-slate-400">Đang tải danh sách khách hàng...</div>;

  return (
    <div className="bg-slate-950 min-h-screen pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-900 shadow-xl">
        <div className="p-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 bg-slate-900 rounded-full border border-slate-800">
            <ChevronLeft className="w-5 h-5 text-slate-300" />
          </button>
          <h1 className="text-sm font-black text-slate-100 uppercase tracking-widest">Khách hàng của tôi</h1>
        </div>

        {/* Search */}
        <div className="p-4 pt-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Tìm theo tên hoặc số điện thoại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-3 pl-10 pr-4 text-xs text-slate-200 outline-none focus:border-blue-500 transition-all shadow-inner"
            />
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="px-4 py-6 grid grid-cols-2 gap-4">
         <div className="bg-blue-600/10 border border-blue-500/20 p-4 rounded-3xl">
            <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mb-1">Tổng khách hàng</p>
            <p className="text-xl font-black text-blue-200">{customers.length}</p>
         </div>
         <div className="bg-emerald-600/10 border border-emerald-500/20 p-4 rounded-3xl">
            <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mb-1">Bình quân/Khách</p>
            <p className="text-xl font-black text-emerald-200">
               {customers.length > 0 
                ? (customers.reduce((acc, c) => acc + c.totalRevenue, 0) / customers.length).toLocaleString() 
                : 0}đ
            </p>
         </div>
      </div>

      {/* Customer List */}
      <div className="px-4 space-y-4">
         {filteredCustomers.map((c, idx) => (
           <motion.div
             initial={{ opacity: 0, x: -10 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: idx * 0.05 }}
             key={c._id}
             className="bg-slate-900 border border-slate-800 rounded-3xl p-5 relative overflow-hidden group active:scale-[0.98] transition-all"
           >
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/5 blur-3xl rounded-full -mr-12 -mt-12"></div>
              
              <div className="flex items-center gap-4 relative z-10">
                 <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center shadow-lg group-hover:border-blue-500 transition-colors">
                    <User className="w-6 h-6 text-slate-400" />
                 </div>
                 <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-slate-200 truncate">{c.name}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                       <Phone className="w-3 h-3 text-slate-500" />
                       <span className="text-[11px] text-slate-500 font-mono tracking-tighter">{c._id}</span>
                    </div>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-tighter">Doanh thu</p>
                    <p className="text-sm font-black text-emerald-400">{c.totalRevenue.toLocaleString()}đ</p>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-6 pt-5 border-t border-slate-800/50 relative z-10">
                 <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                       <ShoppingBag className="w-3.5 h-3.5" />
                    </div>
                    <div>
                       <p className="text-[9px] text-slate-600 font-bold uppercase">Tổng đơn</p>
                       <p className="text-xs font-black text-slate-300">{c.totalOrders} đơn hàng</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
                       <Clock className="w-3.5 h-3.5" />
                    </div>
                    <div>
                       <p className="text-[9px] text-slate-600 font-bold uppercase">Gần nhất</p>
                       <p className="text-xs font-black text-slate-300">{new Date(c.lastOrderDate).toLocaleDateString()}</p>
                    </div>
                 </div>
              </div>
           </motion.div>
         ))}

         {filteredCustomers.length === 0 && (
           <div className="py-20 text-center space-y-4">
              <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto border border-slate-800">
                 <Users className="w-10 h-10 text-slate-700" />
              </div>
              <div className="space-y-1">
                 <p className="text-slate-300 font-bold">Không tìm thấy khách hàng nào</p>
                 <p className="text-slate-600 text-xs italic">Hãy tích cực giới thiệu sản phẩm để có đơn hàng đầu tiên!</p>
              </div>
           </div>
         )}
      </div>
    </div>
  );
}

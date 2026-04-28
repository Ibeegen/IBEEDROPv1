import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { 
  ChevronLeft, 
  Coins, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar,
  ShoppingBag,
  TrendingUp,
  History
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

interface PointHistoryItem {
  _id: string;
  orderId?: {
    _id: string;
    totalAmount: number;
    createdAt: string;
  };
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  balanceAfter: number;
  createdAt: string;
}

export default function PointHistory() {
  const navigate = useNavigate();
  const [history, setHistory] = useState<PointHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/stats/point-history')
      .then(res => setHistory(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalPoints = history.length > 0 ? history[0].balanceAfter : 0;

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
       <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="bg-slate-950 min-h-screen pb-24 font-sans selection:bg-amber-500/30">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-xl mx-auto px-6 py-4 flex items-center gap-4">
           <button 
             onClick={() => navigate(-1)}
             className="p-2 bg-white/5 rounded-full border border-white/10 text-slate-400 hover:text-white transition-colors"
           >
              <ChevronLeft className="w-5 h-5" />
           </button>
           <div>
              <h1 className="text-sm font-black text-white uppercase tracking-tighter">Lịch sử IbeePoint</h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Chi tiết biến động điểm thưởng</p>
           </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-6 pt-8 space-y-8">
        {/* Point Card */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-8 rounded-[2.5rem] relative overflow-hidden shadow-2xl shadow-amber-900/20">
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 blur-3xl rounded-full -mr-16 -mt-16"></div>
           <div className="relative z-10 flex items-center justify-between">
              <div className="space-y-1">
                 <p className="text-[10px] text-amber-100 font-black uppercase tracking-widest">Tổng điểm hiện có</p>
                 <div className="flex items-baseline gap-2">
                    <h2 className="text-4xl font-black text-white tabular-nums">{totalPoints.toLocaleString()}</h2>
                    <span className="text-xs font-black text-white/80 uppercase">Point</span>
                 </div>
              </div>
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white border border-white/20">
                 <Coins className="w-8 h-8" />
              </div>
           </div>
        </div>

        {/* History List */}
        <div className="space-y-4">
           <div className="flex items-center gap-2 px-2">
              <History className="w-4 h-4 text-slate-500" />
              <h3 className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Giao dịch gần đây</h3>
           </div>
           
           <div className="space-y-3">
              {history.map((item) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={item._id}
                  className="bg-slate-900/40 border border-white/5 p-5 rounded-3xl flex items-center justify-between group hover:border-amber-500/30 transition-all duration-300"
                >
                   <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                        item.type === 'credit' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                      }`}>
                         {item.type === 'credit' ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
                      </div>
                      <div className="space-y-1">
                         <p className="text-[11px] text-white font-bold leading-tight">{item.description}</p>
                         <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
                            <Calendar className="w-3 h-3" />
                            {new Date(item.createdAt).toLocaleDateString()}
                            {item.orderId && (
                               <>
                                 <span className="w-1 h-1 bg-slate-800 rounded-full"></span>
                                 <ShoppingBag className="w-3 h-3" />
                                 Đơn: {item.orderId._id.slice(-6).toUpperCase()}
                               </>
                            )}
                         </div>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className={`text-sm font-black tabular-nums ${
                        item.type === 'credit' ? 'text-emerald-500' : 'text-red-500'
                      }`}>
                         {item.type === 'credit' ? '+' : '-'}{item.amount.toLocaleString()}
                      </p>
                      <p className="text-[9px] text-slate-600 font-bold uppercase">Sau GD: {item.balanceAfter.toLocaleString()}</p>
                   </div>
                </motion.div>
              ))}

              {history.length === 0 && (
                <div className="text-center py-20 bg-slate-900/20 rounded-[2.5rem] border border-dashed border-white/5">
                   <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center text-slate-600 mx-auto mb-4">
                      <TrendingUp className="w-8 h-8" />
                   </div>
                   <p className="text-[11px] text-slate-500 font-black uppercase tracking-widest">Chưa có biến động điểm</p>
                   <p className="text-[10px] text-slate-600 mt-1 uppercase font-bold">Thực hiện đơn hàng để nhận IbeePoint</p>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}

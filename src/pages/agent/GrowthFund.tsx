import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { 
  ChevronLeft, 
  TrendingUp, 
  Target, 
  Users, 
  Info,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Dna,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

interface GrowthFundStats {
  personalPoints: number;
  collaboratorPoints: number;
  totalEffectivePoints: number;
  estimatedFund: number;
  totalSystemPoints: number;
  totalGrowthFund: number;
  activeCollaboratorsCount: number;
  isEligible: boolean;
  requirements: {
    personalPoints: number;
    activeCollaborators: number;
  };
}

interface DailyHistoryItem {
  date: string;
  estimatedFundDaily: number;
}

export default function GrowthFund() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<GrowthFundStats | null>(null);
  const [history, setHistory] = useState<DailyHistoryItem[]>([]);
  const [days, setDays] = useState(7);
  const [totalPeriodFund, setTotalPeriodFund] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/stats/growth-fund');
        setStats(res.data);
      } catch (err) {
        console.error('Error fetching growth fund stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoadingHistory(true);
      try {
        const res = await api.get(`/stats/growth-fund-daily?days=${days}`);
        setHistory(res.data.history);
        setTotalPeriodFund(res.data.totalEstimatedFund);
      } catch (err) {
        console.error('Error fetching history:', err);
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchHistory();
  }, [days]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
       <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!stats) return null;

  return (
    <div className="bg-slate-950 min-h-screen pb-24 font-sans selection:bg-blue-500/30">
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
              <h1 className="text-sm font-black text-white uppercase tracking-tighter">Quỹ Tăng Trưởng</h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Đồng hành phát triển cùng hệ thống</p>
           </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-6 pt-8 space-y-8">
        {/* Estimated Fund Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2.5rem] relative overflow-hidden shadow-2xl shadow-blue-900/40"
        >
           <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 blur-3xl rounded-full -mr-20 -mt-20"></div>
           <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between">
                 <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10">
                    <p className="text-[10px] text-white font-black uppercase tracking-widest">Quỹ ước tính tháng này</p>
                 </div>
                 <BarChart3 className="w-6 h-6 text-white/60" />
              </div>

              <div className="space-y-1">
                 <div className="flex items-baseline gap-2">
                    <h2 className="text-4xl font-black text-white tracking-tighter">
                       {Math.round(stats.estimatedFund || 0).toLocaleString()}
                    </h2>
                    <span className="text-lg font-black text-white/70">đ</span>
                 </div>
                 <p className="text-[10px] text-blue-100/60 font-bold uppercase tracking-widest italic">
                    Cập nhật thời gian thực - {new Date().toLocaleDateString('vi-VN')}
                 </p>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10">
                 <div className="space-y-1">
                    <p className="text-[8px] text-blue-100/50 font-black uppercase tracking-widest">Point cá nhân</p>
                    <p className="text-sm font-black text-white">{stats.personalPoints.toLocaleString()}</p>
                 </div>
                 <div className="space-y-1">
                    <p className="text-[8px] text-blue-100/50 font-black uppercase tracking-widest">Point CTV (50%)</p>
                    <p className="text-sm font-black text-white">{(stats.collaboratorPoints * 0.5).toLocaleString()}</p>
                 </div>
                 <div className="space-y-1">
                    <p className="text-[8px] text-blue-100/50 font-black uppercase tracking-widest">Tổng Point</p>
                    <p className="text-sm font-black text-white">{stats.totalEffectivePoints.toLocaleString()}</p>
                 </div>
              </div>
           </div>
        </motion.div>

        {/* Daily History Section - NEW UI */}
        <div className="space-y-6">
           <div className="flex justify-between items-center px-1">
              <div className="flex items-center gap-2">
                 <Calendar className="w-4 h-4 text-blue-400" />
                 <h3 className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Lịch sử chia quỹ hằng ngày</h3>
              </div>
              <div className="flex bg-slate-900/50 p-1 rounded-xl border border-white/5">
                 <button 
                   onClick={() => setDays(7)}
                   className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${days === 7 ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                 >
                   7 ngày
                 </button>
                 <button 
                   onClick={() => setDays(15)}
                   className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${days === 15 ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                 >
                   15 ngày
                 </button>
              </div>
           </div>

           {/* Period Summary Card */}
           <div className="bg-slate-900 border border-white/5 p-6 rounded-[2rem] flex items-center justify-between shadow-xl">
              <div>
                 <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Thu nhập tăng trưởng ước tính</p>
                 <div className="flex items-baseline gap-1.5 text-emerald-400">
                    <span className="text-2xl font-black">+{totalPeriodFund.toLocaleString()}đ</span>
                    <span className="text-[10px] font-bold text-slate-600">/ {days} ngày</span>
                 </div>
              </div>
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
                 <TrendingUp className="w-6 h-6" />
              </div>
           </div>

           {/* Daily List */}
           <div className="space-y-3">
              {loadingHistory ? (
                <div className="py-12 flex justify-center">
                   <div className="w-6 h-6 border-2 border-slate-700 border-t-white/30 rounded-full animate-spin"></div>
                </div>
              ) : history.length === 0 ? (
                <div className="bg-slate-900/40 border border-white/5 p-12 rounded-[2rem] text-center">
                   <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-slate-600 mx-auto mb-4">
                      <BarChart3 className="w-6 h-6" />
                   </div>
                   <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Chưa có thu nhập tăng trưởng</p>
                   <p className="text-[10px] text-slate-600 font-bold mt-1">Khi có đơn hàng hoàn thành, dữ liệu sẽ được cập nhật tại đây.</p>
                </div>
              ) : (
                <div className="space-y-3">
                   {history.map((item, idx) => (
                     <motion.div 
                       key={item.date}
                       initial={{ opacity: 0, x: -10 }}
                       animate={{ opacity: 1, x: 0 }}
                       transition={{ delay: idx * 0.05 }}
                       className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group"
                     >
                        <div className="space-y-0.5">
                           <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black text-slate-900">{formatDate(item.date)}</span>
                           </div>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Thu nhập tăng trưởng</p>
                        </div>
                        <div className="text-right">
                           <p className="text-sm font-black text-emerald-600">+{item.estimatedFundDaily.toLocaleString()}đ</p>
                        </div>
                     </motion.div>
                   ))}
                </div>
              )}
           </div>

           <p className="text-[9px] text-slate-600 font-bold italic text-center px-4 leading-relaxed">
             Số liệu là ước tính theo kết quả kinh doanh thực tế. <br/>
             Quỹ chính thức được chốt cuối tháng khi đủ điều kiện.
           </p>
        </div>

        {/* Eligibility Status */}
        <div className="space-y-4 pt-4 border-t border-white/5">
           <div className="flex items-center gap-2 px-1">
              <Target className="w-4 h-4 text-slate-500" />
              <h3 className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Điều kiện nhận quỹ tháng</h3>
           </div>

           {stats.isEligible ? (
             <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-3xl flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                   <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                   <p className="text-sm font-black text-emerald-400 uppercase tracking-tight">Tuyệt vời!</p>
                   <p className="text-xs text-emerald-500/80 font-bold">Bạn đã đủ điều kiện nhận Quỹ Tăng Trưởng tháng này</p>
                </div>
             </div>
           ) : (
             <div className="bg-slate-900 border border-white/5 p-8 rounded-[2rem] space-y-6">
                <div className="space-y-5">
                   {/* Personal Points Requirement */}
                   <div className="space-y-3">
                      <div className="flex justify-between items-end">
                         <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Point cá nhân</p>
                         <p className="text-xs font-black text-white">{stats.personalPoints} <span className="text-slate-600">/ {stats.requirements.personalPoints} P</span></p>
                      </div>
                      <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                         <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: `${Math.min((stats.personalPoints / stats.requirements.personalPoints) * 100, 100)}%` }}
                           className={`h-full rounded-full ${stats.personalPoints >= stats.requirements.personalPoints ? 'bg-emerald-500' : 'bg-blue-500'}`}
                         ></motion.div>
                      </div>
                   </div>

                   {/* Collaborators Requirement */}
                   <div className="space-y-3">
                      <div className="flex justify-between items-end">
                         <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">CTV có đơn hàng</p>
                         <p className="text-xs font-black text-white">{stats.activeCollaboratorsCount} <span className="text-slate-600">/ {stats.requirements.activeCollaborators} CTV</span></p>
                      </div>
                      <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                         <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: `${Math.min((stats.activeCollaboratorsCount / stats.requirements.activeCollaborators) * 100, 100)}%` }}
                           className={`h-full rounded-full ${stats.activeCollaboratorsCount >= stats.requirements.activeCollaborators ? 'bg-emerald-500' : 'bg-amber-500'}`}
                         ></motion.div>
                      </div>
                   </div>
                </div>

                <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-2xl flex items-start gap-3">
                   <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                   <div className="space-y-1">
                      <p className="text-[10px] text-amber-500 font-black uppercase tracking-widest">Lưu ý chốt quỹ</p>
                      <p className="text-[10px] text-amber-600/80 font-bold leading-relaxed">
                        Bạn cần duy trì các điều kiện trên cho đến khi hệ thống chốt lịch sử vào cuối tháng.
                      </p>
                   </div>
                </div>
             </div>
           )}
        </div>

        {/* Info Section */}
        <div className="space-y-4">
           <div className="flex items-center gap-2 px-2">
              <Info className="w-4 h-4 text-slate-500" />
              <h3 className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Cơ chế vận hành</h3>
           </div>
           
           <div className="grid grid-cols-1 gap-4">
              <div className="bg-slate-900/50 border border-white/5 p-6 rounded-3xl space-y-4">
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-400">
                       <Dna className="w-4 h-4" />
                    </div>
                    <p className="text-[10px] text-white font-black uppercase tracking-widest">Cổ phần điểm thưởng</p>
                 </div>
                 <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    Giá trị quỹ hằng ngày phụ thuộc vào tỷ lệ Point của bạn so với tổng Point toàn hệ thống trong ngày đó.
                 </p>
              </div>

              <div className="bg-slate-900/50 border border-white/5 p-6 rounded-3xl space-y-4">
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-400">
                       <Users className="w-4 h-4" />
                    </div>
                    <p className="text-[10px] text-white font-black uppercase tracking-widest">Phát triển CTV</p>
                 </div>
                 <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    Point tính quỹ mỗi ngày = Point cá nhân + 50% Point từ các CTV trực tiếp của bạn trong ngày đó.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

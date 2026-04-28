import React from 'react';
import { ChevronLeft, Rocket, Target, Users, ShieldCheck, Zap, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

export default function AgentAbout() {
  const navigate = useNavigate();

  const highlights = [
    {
      icon: Target,
      title: 'Tầm nhìn',
      description: 'Trở thành nền tảng thương mại điện tử cộng tác hàng đầu, kết nối hàng nghìn nhà cung cấp với mạng lưới đại lý năng động.',
      color: 'text-blue-400',
      bg: 'bg-blue-400/10'
    },
    {
      icon: Users,
      title: 'Cộng đồng',
      description: 'Nơi đại lý có thể tự do kinh doanh mà không cần vốn, không cần kho bãi, tập trung hoàn toàn vào việc bán hàng.',
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10'
    },
    {
      icon: Zap,
      title: 'Công nghệ',
      description: 'Hệ thống tự động hóa từ khâu lên đơn, vận chuyển đến tính toán hoa hồng, minh bạch và tức thì.',
      color: 'text-amber-400',
      bg: 'bg-amber-400/10'
    }
  ];

  return (
    <div className="bg-slate-950 min-h-screen pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-900 shadow-xl">
        <div className="p-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 bg-slate-900 rounded-full border border-slate-800">
            <ChevronLeft className="w-5 h-5 text-slate-300" />
          </button>
          <h1 className="text-sm font-black text-slate-100 uppercase tracking-widest">Giới thiệu IbeeDrop</h1>
        </div>
      </div>

      <div className="p-6 space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-6 relative py-8">
           <div className="absolute inset-0 bg-blue-600/5 blur-[100px] rounded-full pointer-events-none"></div>
           <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-blue-900/40 mb-6 rotate-3">
                 <Rocket className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-black text-white tracking-tighter">IBEEDROP</h2>
              <p className="text-slate-400 text-sm max-w-xs mx-auto mt-2 leading-relaxed">
                Nền tảng thương mại điện tử dành cho đại lý và cộng tác viên 4.0
              </p>
           </div>
        </div>

        {/* Feature Cards */}
        <div className="space-y-4">
           {highlights.map((item, idx) => (
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: idx * 0.1 }}
               key={idx} 
               className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex gap-5 items-start"
             >
                <div className={`p-3 rounded-2xl ${item.bg} ${item.color} shrink-0`}>
                   <item.icon className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                   <h3 className="text-slate-100 font-bold">{item.title}</h3>
                   <p className="text-xs text-slate-500 leading-relaxed">{item.description}</p>
                </div>
             </motion.div>
           ))}
        </div>

        {/* Detailed Info */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-8 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/5 blur-3xl rounded-full"></div>
           
           <div className="space-y-4">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                 <Heart className="w-4 h-4 text-rose-500" />
                 Tại sao chọn IbeeDrop?
              </h3>
              <ul className="space-y-4">
                 {[
                   'Không cần bỏ vốn nhập hàng, rủi ro bằng 0.',
                   'Hoa hồng hấp dẫn, chi trả nhanh chóng minh bạch.',
                   'Nguồn hàng đa dạng từ các nhà cung cấp uy tín.',
                   'Công cụ quản lý đơn hàng & khách hàng thông minh.',
                   'Hệ thống giới thiệu bạn bè, gia tăng thu nhập thụ động.'
                 ].map((text, i) => (
                   <li key={i} className="flex gap-3 items-center text-sm text-slate-300">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                      {text}
                   </li>
                 ))}
              </ul>
           </div>

           <div className="pt-6 border-t border-slate-800">
              <p className="text-[10px] text-slate-600 font-bold text-center italic">
                Cùng nhau bứt phá doanh thu với IbeeDrop!
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { 
  ChevronLeft, 
  User, 
  Phone, 
  Calendar, 
  CreditCard, 
  Building2, 
  UserCircle, 
  Save,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AgentSettings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    gender: '',
    dob: '',
    idNumber: '',
    bankInfo: {
      bankName: '',
      accountNumber: '',
      accountHolder: ''
    }
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/auth/me');
        const data = res.data;
        setFormData({
          name: data.name || '',
          phone: data.phone || '',
          gender: data.gender || '',
          dob: data.dob ? new Date(data.dob).toISOString().split('T')[0] : '',
          idNumber: data.idNumber || '',
          bankInfo: {
            bankName: data.bankInfo?.bankName || '',
            accountNumber: data.bankInfo?.accountNumber || '',
            accountHolder: data.bankInfo?.accountHolder || ''
          }
        });
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Không thể tải thông tin cá nhân');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');
      await api.put('/auth/update-profile', formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Cập nhật thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
       <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="bg-slate-950 min-h-screen pb-24 font-sans">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
        <div className="p-4 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate(-1)} 
                className="p-2 bg-slate-900 rounded-full border border-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                 <ChevronLeft className="w-5 h-5" />
              </button>
              <h1 className="text-sm font-black text-slate-100 uppercase tracking-widest">Thông tin cá nhân</h1>
           </div>
           
           <button 
             onClick={handleSubmit}
             disabled={submitting}
             className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-900/20"
           >
              {submitting ? (
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              Lưu thay đổi
           </button>
        </div>
      </div>

      <div className="p-6 space-y-8 max-w-xl mx-auto">
        {/* Alerts */}
        <AnimatePresence>
           {success && (
             <motion.div 
               initial={{ opacity: 0, y: -20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex items-center gap-3"
             >
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <p className="text-sm font-bold text-emerald-500">Cập nhật thông tin thành công!</p>
             </motion.div>
           )}
           {error && (
             <motion.div 
               initial={{ opacity: 0, y: -20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3"
             >
                <AlertCircle className="w-5 h-5 text-red-500" />
                <p className="text-sm font-bold text-red-500">{error}</p>
             </motion.div>
           )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-10">
           {/* Personal Info */}
           <div className="space-y-6">
              <div className="flex items-center gap-2 px-2 text-slate-500">
                 <UserCircle className="w-4 h-4" />
                 <h2 className="text-[10px] font-black uppercase tracking-widest">Hồ sơ đại lý</h2>
              </div>
              
              <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-6 space-y-6">
                 {/* Name */}
                 <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-2">Họ và tên</label>
                    <div className="relative">
                       <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                       <input 
                         type="text" 
                         value={formData.name}
                         onChange={e => setFormData({...formData, name: e.target.value})}
                         className="w-full bg-slate-950 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm text-white outline-none focus:border-blue-500 transition-all font-medium"
                       />
                    </div>
                 </div>

                 {/* Phone */}
                 <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-2">Số điện thoại</label>
                    <div className="relative">
                       <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                       <input 
                         type="tel" 
                         value={formData.phone}
                         onChange={e => setFormData({...formData, phone: e.target.value})}
                         className="w-full bg-slate-950 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm text-white outline-none focus:border-blue-500 transition-all font-mono"
                       />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    {/* Gender */}
                    <div className="space-y-1.5">
                       <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-2">Giới tính</label>
                       <select 
                         value={formData.gender}
                         onChange={e => setFormData({...formData, gender: e.target.value})}
                         className="w-full bg-slate-950 border border-white/5 rounded-2xl py-4 px-4 text-sm text-white outline-none focus:border-blue-500 transition-all font-medium"
                       >
                          <option value="">Chọn...</option>
                          <option value="male">Nam</option>
                          <option value="female">Nữ</option>
                          <option value="other">Khác</option>
                       </select>
                    </div>

                    {/* DOB */}
                    <div className="space-y-1.5">
                       <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-2">Ngày sinh</label>
                       <div className="relative">
                          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
                          <input 
                            type="date" 
                            value={formData.dob}
                            onChange={e => setFormData({...formData, dob: e.target.value})}
                            className="w-full bg-slate-950 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-white outline-none focus:border-blue-500 transition-all font-mono appearance-none"
                          />
                       </div>
                    </div>
                 </div>

                 {/* ID Number */}
                 <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-2">CCCD / Hộ chiếu</label>
                    <div className="relative">
                       <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                       <input 
                         type="text" 
                         value={formData.idNumber}
                         onChange={e => setFormData({...formData, idNumber: e.target.value})}
                         className="w-full bg-slate-950 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm text-white outline-none focus:border-blue-500 transition-all font-mono"
                         placeholder="Nhập số CCCD..."
                       />
                    </div>
                 </div>
              </div>
           </div>

           {/* Bank Info */}
           <div className="space-y-6">
              <div className="flex items-center gap-2 px-2 text-slate-500">
                 <Building2 className="w-4 h-4" />
                 <h2 className="text-[10px] font-black uppercase tracking-widest">Tài khoản ngân hàng</h2>
              </div>
              
              <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-6 space-y-6">
                 {/* Bank Name */}
                 <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-2">Tên ngân hàng</label>
                    <input 
                      type="text" 
                      value={formData.bankInfo.bankName}
                      onChange={e => setFormData({...formData, bankInfo: {...formData.bankInfo, bankName: e.target.value}})}
                      className="w-full bg-slate-950 border border-white/5 rounded-2xl py-4 px-6 text-sm text-white outline-none focus:border-blue-500 transition-all font-medium"
                      placeholder="VD: Vietcombank, Techcombank..."
                    />
                 </div>

                 {/* Account Number */}
                 <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-2">Số tài khoản</label>
                    <input 
                      type="text" 
                      value={formData.bankInfo.accountNumber}
                      onChange={e => setFormData({...formData, bankInfo: {...formData.bankInfo, accountNumber: e.target.value}})}
                      className="w-full bg-slate-950 border border-white/5 rounded-2xl py-4 px-6 text-sm text-white outline-none focus:border-blue-500 transition-all font-mono"
                      placeholder="0123456789..."
                    />
                 </div>

                 {/* Account Holder */}
                 <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-2">Chủ tài khoản</label>
                    <input 
                      type="text" 
                      value={formData.bankInfo.accountHolder}
                      onChange={e => setFormData({...formData, bankInfo: {...formData.bankInfo, accountHolder: e.target.value}})}
                      className="w-full bg-slate-950 border border-white/5 rounded-2xl py-4 px-6 text-sm text-white outline-none focus:border-blue-500 transition-all font-black uppercase tracking-widest placeholder:normal-case placeholder:font-medium placeholder:tracking-normal"
                      placeholder="Nhập tên viết hoa không dấu..."
                    />
                 </div>
              </div>
              <p className="text-[10px] text-slate-600 italic px-2">Thông tin này được sử dụng để đối soát và chi trả hoa hồng định kỳ. Vui lòng kiểm tra kỹ trước khi lưu.</p>
           </div>
        </form>
      </div>
    </div>
  );
}

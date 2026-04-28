import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { User, Mail, Phone, Lock, UserPlus, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Register() {
  const [searchParams] = useSearchParams();
  const referrerIdRaw = searchParams.get('ref');
  const referrerId = referrerIdRaw && /^[a-f\d]{24}$/i.test(referrerIdRaw) ? referrerIdRaw : null;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return setError('Mật khẩu không khớp');
    }

    setLoading(true);
    setError('');

    try {
      const { confirmPassword, ...payload } = formData;
      await api.post('/auth/register', {
        ...payload,
        referrerId: referrerId ?? undefined
      });
      navigate('/agent/login?registered=true');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F6F8] flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="text-center">
           <Link to="/agent/login" className="inline-flex items-center gap-2 text-[#6B7280] hover:text-[#111827] transition-colors mb-6">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Quay lại đăng nhập</span>
           </Link>
           <h1 className="text-3xl font-black text-[#111827] uppercase tracking-tight">Đăng ký Đại lý</h1>
           <p className="text-[#6B7280] mt-2 text-sm">Bắt đầu kinh doanh cùng IbeeDrop</p>
           {referrerId && (
             <div className="mt-4 inline-block px-3 py-1 bg-[#FFF4B5] rounded-full">
                <p className="text-[10px] text-[#111827] font-black uppercase tracking-widest">Được giới thiệu bởi đối tác</p>
             </div>
           )}

           {!referrerId && referrerIdRaw && (
             <div className="mt-4 inline-block px-3 py-1 bg-amber-50 border border-amber-100 rounded-full">
                <p className="text-[10px] text-amber-700 font-black uppercase tracking-widest">Mã giới thiệu không hợp lệ, tiếp tục đăng ký thường</p>
             </div>
           )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm font-bold text-center">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
              <input
                type="text"
                placeholder="Họ và tên"
                className="w-full bg-[#F5F6F8] border border-[#E5E7EB] p-4 pl-12 rounded-xl text-sm text-[#111827] outline-none focus:border-[#FFD400] transition-all font-medium"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
              <input
                type="email"
                placeholder="Email"
                className="w-full bg-[#F5F6F8] border border-[#E5E7EB] p-4 pl-12 rounded-xl text-sm text-[#111827] outline-none focus:border-[#FFD400] transition-all font-medium"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
              <input
                type="tel"
                placeholder="Số điện thoại"
                className="w-full bg-[#F5F6F8] border border-[#E5E7EB] p-4 pl-12 rounded-xl text-sm text-[#111827] outline-none focus:border-[#FFD400] transition-all font-medium"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
              <input
                type="password"
                placeholder="Mật khẩu"
                className="w-full bg-[#F5F6F8] border border-[#E5E7EB] p-4 pl-12 rounded-xl text-sm text-[#111827] outline-none focus:border-[#FFD400] transition-all font-medium"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
              <input
                type="password"
                placeholder="Xác nhận mật khẩu"
                className="w-full bg-[#F5F6F8] border border-[#E5E7EB] p-4 pl-12 rounded-xl text-sm text-[#111827] outline-none focus:border-[#FFD400] transition-all font-medium"
                value={formData.confirmPassword}
                onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FFD400] hover:bg-[#FFC400] disabled:opacity-50 text-[#111827] font-black uppercase py-4 rounded-xl text-xs tracking-widest transition-all shadow-sm flex items-center justify-center gap-2"
          >
            {loading ? (
               <div className="w-4 h-4 border-2 border-[#111827]/30 border-t-[#111827] rounded-full animate-spin"></div>
            ) : (
               <UserPlus className="w-4 h-4" />
            )}
            Đăng ký tham gia
          </button>
        </form>

        <p className="text-center text-[#6B7280] text-xs">
          Bạn đã có tài khoản?{' '}
          <Link to="/agent/login" className="text-[#111827] hover:underline font-bold">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}

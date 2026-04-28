import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { User, Mail, Phone, Lock, UserPlus, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Register() {
  const [searchParams] = useSearchParams();
  const referrerId = searchParams.get('ref');
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
      await api.post('/auth/register', {
        ...formData,
        referrerId
      });
      navigate('/login?registered=true');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
           <Link to="/login" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-300 transition-colors mb-6">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Quay lại đăng nhập</span>
           </Link>
           <h1 className="text-3xl font-black text-white uppercase tracking-tight">Đăng ký Đại lý</h1>
           <p className="text-slate-500 mt-2 text-sm">Bắt đầu kinh doanh cùng iBee Agency</p>
           {referrerId && (
             <div className="mt-4 inline-block px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
                <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest">Được giới thiệu bởi đối tác</p>
             </div>
           )}
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 p-8 rounded-3xl space-y-5 shadow-2xl">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm font-bold text-center">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Họ và tên"
                className="w-full bg-slate-950 border border-slate-800 p-4 pl-12 rounded-xl text-sm text-slate-100 outline-none focus:border-blue-500 transition-all"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                placeholder="Email"
                className="w-full bg-slate-950 border border-slate-800 p-4 pl-12 rounded-xl text-sm text-slate-100 outline-none focus:border-blue-500 transition-all font-mono"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="tel"
                placeholder="Số điện thoại"
                className="w-full bg-slate-950 border border-slate-800 p-4 pl-12 rounded-xl text-sm text-slate-100 outline-none focus:border-blue-500 transition-all font-mono"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                placeholder="Mật khẩu"
                className="w-full bg-slate-950 border border-slate-800 p-4 pl-12 rounded-xl text-sm text-slate-100 outline-none focus:border-blue-500 transition-all"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                placeholder="Xác nhận mật khẩu"
                className="w-full bg-slate-950 border border-slate-800 p-4 pl-12 rounded-xl text-sm text-slate-100 outline-none focus:border-blue-500 transition-all"
                value={formData.confirmPassword}
                onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black uppercase py-4 rounded-xl text-xs tracking-widest transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
          >
            {loading ? (
               <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
               <UserPlus className="w-4 h-4" />
            )}
            Đăng ký tham gia
          </button>
        </form>

        <p className="text-center text-slate-600 text-xs">
          Bạn đã có tài khoản?{' '}
          <Link to="/login" className="text-blue-500 hover:text-blue-400 font-bold">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}

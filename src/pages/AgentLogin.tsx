import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../store/useAuth';
import { api } from '../services/api';

export default function AgentLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuth((state) => state.login);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setLoading(true);
    try {
      setError('');
      // Force portal to agent
      const res = await api.post('/auth/login', { email, password, portal: 'agent' });
      login(res.data.token, res.data.user);
      navigate('/agent');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F6F8] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:p-10">
        
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center w-14 h-14 bg-[#FFD400] text-[#111827] rounded-2xl mb-5 font-black text-2xl shadow-sm hover:scale-105 transition-transform">
            ID
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-[#111827] tracking-tight">Chào mừng trở lại</h1>
          <p className="text-sm text-[#6B7280] mt-2">Đăng nhập vào tài khoản đại lý IbeeDrop</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm text-center font-medium">
              {error}
            </div>
          )}
          
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-[#111827]">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-[#F5F6F8] border border-[#E5E7EB] rounded-xl px-4 py-3 text-[#111827] focus:outline-none focus:border-[#FFD400] focus:ring-2 focus:ring-[#FFD400]/20 transition-all font-medium"
              placeholder="Nhập email của bạn"
              required
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-[#111827]">Mật khẩu</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-[#F5F6F8] border border-[#E5E7EB] rounded-xl px-4 py-3 text-[#111827] focus:outline-none focus:border-[#FFD400] focus:ring-2 focus:ring-[#FFD400]/20 transition-all font-medium"
              placeholder="••••••••"
              required
            />
          </div>
          
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#FFD400] hover:bg-[#FFC400] text-[#111827] font-bold py-3.5 rounded-xl transition-all shadow-sm mt-8 disabled:opacity-70 flex items-center justify-center gap-2 text-lg"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-[#111827]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang xử lý...
              </>
            ) : 'Đăng nhập'}
          </button>
        </form>

        <div className="mt-8 text-center bg-[#F5F6F8] p-4 rounded-xl">
          <p className="text-[#6B7280] text-sm">
            Chưa có tài khoản đại lý?{' '}
            <Link to="/dang-ky-dai-ly" className="text-[#111827] font-bold hover:underline">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

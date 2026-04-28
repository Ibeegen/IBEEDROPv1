import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/useAuth';
import { api } from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAgentLogin, setIsAgentLogin] = useState(true);
  const [error, setError] = useState('');
  const login = useAuth((state) => state.login);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      const res = await api.post('/auth/login', { email, password });
      login(res.data.token, res.data.user);
      
      if (res.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/agent');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl font-bold text-white mb-4">
            AS
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Portal Đăng Nhập</h1>
          <p className="text-sm text-slate-400 mt-2">Hệ thống phân phối đa cấp độ</p>
        </div>

        <div className="flex bg-slate-800 rounded-lg p-1 mb-6">
          <button 
            type="button"
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${!isAgentLogin ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            onClick={() => setIsAgentLogin(false)}
          >
            Admin
          </button>
          <button 
            type="button"
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${isAgentLogin ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            onClick={() => setIsAgentLogin(true)}
          >
            Đại lý
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm text-center">{error}</div>}
          
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="Nhập email..."
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Mật khẩu</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="••••••••"
              required
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg transition-colors mt-6"
          >
            Đăng nhập
          </button>
        </form>
      </div>
    </div>
  );
}

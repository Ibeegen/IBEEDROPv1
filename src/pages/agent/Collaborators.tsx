import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Users, Search, Mail, Phone, Calendar, ArrowUpRight } from 'lucide-react';

interface Collaborator {
  _id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  createdAt: string;
}

export default function AgentCollaborators() {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    api.get('/auth/collaborators')
      .then(res => setCollaborators(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = collaborators.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-8 text-center text-slate-400">Đang tải...</div>;

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-4xl mx-auto pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-black text-slate-100 uppercase tracking-tight">Cộng tác viên</h1>
           <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Quản lý mạng lưới bán hàng của bạn</p>
        </div>
        <div className="relative">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
           <input 
             type="text" 
             placeholder="Tìm kiếm theo tên hoặc email..."
             value={searchTerm}
             onChange={e => setSearchTerm(e.target.value)}
             className="bg-slate-900 border border-slate-800 text-sm text-slate-200 pl-10 pr-4 py-2 rounded-xl outline-none focus:border-blue-500 transition-all w-full md:w-64"
           />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         {filtered.map(c => (
           <div key={c._id} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl group hover:border-blue-500/30 transition-all relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-600/5 rounded-full blur-2xl group-hover:bg-blue-600/10 transition-colors"></div>
              
              <div className="flex items-start justify-between mb-4 relative z-10">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400">
                       <Users className="w-5 h-5" />
                    </div>
                    <div>
                       <h3 className="text-sm font-black text-slate-100 uppercase tracking-tight">{c.name}</h3>
                       <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                         c.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                       }`}>
                          {c.status}
                       </span>
                    </div>
                 </div>
                 <button className="p-2 text-slate-600 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all">
                    <ArrowUpRight className="w-4 h-4" />
                 </button>
              </div>

              <div className="space-y-3 relative z-10">
                 <div className="flex items-center gap-3 text-slate-400">
                    <Mail className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium font-mono">{c.email}</span>
                 </div>
                 <div className="flex items-center gap-3 text-slate-400">
                    <Phone className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium font-mono">{c.phone}</span>
                 </div>
                 <div className="flex items-center gap-3 text-slate-500 pt-2 border-t border-slate-800/50">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-tight">Tham gia: {new Date(c.createdAt).toLocaleDateString()}</span>
                 </div>
              </div>
           </div>
         ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 bg-slate-900/50 border border-dashed border-slate-800 rounded-3xl">
           <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center text-slate-600 mx-auto mb-4">
              <Users className="w-8 h-8" />
           </div>
           <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">Chưa tìm thấy cộng tác viên nào</p>
           <p className="text-xs text-slate-600 mt-2">Hãy chia sẻ link giới thiệu để mở rộng mạng lưới của bạn!</p>
        </div>
      )}
    </div>
  );
}

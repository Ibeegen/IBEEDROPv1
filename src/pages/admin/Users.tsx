import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Eye, X, User as UserIcon, CreditCard, Building2, Calendar } from 'lucide-react';

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  totalRevenue: number;
  totalPoint: number;
  status: string;
  gender?: string;
  dob?: string;
  idNumber?: string;
  bankInfo?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [systemStats, setSystemStats] = useState({ totalSystemPoints: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, statsRes] = await Promise.all([
          api.get('/users'),
          api.get('/stats/system-points')
        ]);
        setUsers(usersRes.data);
        setSystemStats(statsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-8 text-center text-[--color-text-secondary]">Đang tải...</div>;

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-2xl font-black text-[--color-text-main] tracking-tight uppercase">Quản lý Đại lý</h1>
           <div className="text-xs text-[--color-text-secondary] font-medium mt-1">Tổng: {users.length} đại lý</div>
        </div>
        <div className="bg-[--color-primary-light] border border-[--color-primary]/20 px-6 py-3 rounded-2xl shadow-sm">
           <p className="text-[10px] text-orange-700 font-bold uppercase tracking-widest text-right">Tổng điểm IbeePoint hệ thống</p>
           <p className="text-xl font-black text-[--color-text-main] text-right">{systemStats.totalSystemPoints.toLocaleString()} P</p>
        </div>
      </div>

      <div className="bg-white border border-[--color-border] rounded-[--radius-2xl] overflow-hidden card-shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-[--color-text-secondary] border-b border-gray-100">
              <tr>
                <th className="px-5 py-4 font-bold uppercase tracking-widest text-[10px]">Tên đại lý</th>
                <th className="px-5 py-4 font-bold uppercase tracking-widest text-[10px]">Email & SĐT</th>
                <th className="px-5 py-4 font-bold uppercase tracking-widest text-[10px]">Tổng HH</th>
                <th className="px-5 py-4 font-bold uppercase tracking-widest text-[10px]">Điểm</th>
                <th className="px-5 py-4 font-bold uppercase tracking-widest text-[10px]">Trạng thái</th>
                <th className="px-5 py-4 font-bold uppercase tracking-widest text-[10px] text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(u => (
                <tr key={u._id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 bg-[--color-primary-light] rounded-lg flex items-center justify-center text-orange-700 font-black text-xs uppercase shadow-sm">
                          {u.name.charAt(0)}
                       </div>
                       <span className="font-bold text-[--color-text-main]">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-gray-700 font-medium">{u.email}</div>
                    <div className="text-xs text-[--color-text-secondary] font-normal mt-0.5">{u.phone}</div>
                  </td>
                  <td className="px-5 py-4 font-bold text-emerald-600">
                    {u.totalRevenue.toLocaleString()}đ
                  </td>
                  <td className="px-5 py-4 font-bold text-blue-600">
                    {u.totalPoint.toLocaleString()} P
                  </td>
                  <td className="px-5 py-4">
                     <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                       u.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'
                     }`}>
                       {u.status}
                     </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                     <button 
                       onClick={() => setSelectedUser(u)}
                       className="p-2 bg-gray-100 text-gray-500 rounded-lg hover:bg-[--color-primary] hover:text-black transition-colors shadow-sm"
                     >
                        <Eye className="w-4 h-4" />
                     </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-[--color-text-secondary]">Chưa có đại lý nào tham gia hệ thống.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
           <div className="bg-white border border-[--color-border] w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[--color-primary] rounded-xl flex items-center justify-center text-black shadow-sm">
                       <UserIcon className="w-5 h-5" />
                    </div>
                    <div>
                       <h2 className="text-lg font-black text-[--color-text-main] uppercase tracking-tight">{selectedUser.name}</h2>
                       <p className="text-[10px] text-[--color-text-secondary] font-bold uppercase tracking-widest">Chi tiết hồ sơ đại lý</p>
                    </div>
                 </div>
                 <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                    <X className="w-6 h-6" />
                 </button>
              </div>

              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                 {/* Personal Info */}
                 <div className="space-y-4">
                    <div className="flex items-center gap-2 text-orange-600">
                       <UserIcon className="w-4 h-4" />
                       <h3 className="text-xs font-black uppercase tracking-widest">Thông tin cá nhân</h3>
                    </div>
                    <div className="space-y-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                       <div className="space-y-1">
                          <p className="text-[10px] text-[--color-text-secondary] font-bold uppercase tracking-widest">Giới tính</p>
                          <p className="text-sm text-[--color-text-main] font-medium">{selectedUser.gender === 'male' ? 'Nam' : selectedUser.gender === 'female' ? 'Nữ' : selectedUser.gender === 'other' ? 'Khác' : 'Chưa cập nhật'}</p>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[10px] text-[--color-text-secondary] font-bold uppercase tracking-widest">Ngày sinh</p>
                          <div className="flex items-center gap-2 text-[--color-text-main]">
                             <Calendar className="w-4 h-4 text-gray-400" />
                             <p className="text-sm font-medium">{selectedUser.dob ? new Date(selectedUser.dob).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</p>
                          </div>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[10px] text-[--color-text-secondary] font-bold uppercase tracking-widest">CCCD / Hộ chiếu</p>
                          <div className="flex items-center gap-2 text-[--color-text-main]">
                             <CreditCard className="w-4 h-4 text-gray-400" />
                             <p className="text-sm font-bold tracking-wider">{selectedUser.idNumber || 'Chưa cập nhật'}</p>
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Bank Info */}
                 <div className="space-y-4">
                    <div className="flex items-center gap-2 text-emerald-600">
                       <Building2 className="w-4 h-4" />
                       <h3 className="text-xs font-black uppercase tracking-widest">Tài khoản ngân hàng</h3>
                    </div>
                    <div className="space-y-4 bg-emerald-50 p-6 rounded-2xl border border-emerald-100 text-emerald-900">
                       <div className="space-y-1">
                          <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Ngân hàng</p>
                          <p className="text-sm font-bold uppercase">{selectedUser.bankInfo?.bankName || 'Chưa cập nhật'}</p>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Số tài khoản</p>
                          <p className="text-lg font-black tracking-widest">{selectedUser.bankInfo?.accountNumber || 'Chưa cập nhật'}</p>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Chủ tài khoản</p>
                          <p className="text-xs font-bold uppercase tracking-widest">{selectedUser.bankInfo?.accountHolder || 'Chưa cập nhật'}</p>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
                 <p className="text-[10px] text-[--color-text-secondary] font-bold uppercase tracking-widest">Dữ liệu được bảo mật & Chỉ hiển thị cho Quản trị viên</p>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

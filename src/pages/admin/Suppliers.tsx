import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { 
  Building2, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  MoreVertical,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  XCircle,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Supplier {
  _id: string;
  name: string;
  logo: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  note: string;
  status: 'active' | 'locked';
}

export default function AdminSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    note: '',
    status: 'active'
  });

  const fetchSuppliers = async () => {
    try {
      const res = await api.get('/suppliers');
      setSuppliers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleOpenModal = (supplier: Supplier | null = null) => {
    if (supplier) {
      setEditingSupplier(supplier);
      setFormData({
        name: supplier.name,
        logo: supplier.logo || '',
        contactPerson: supplier.contactPerson || '',
        phone: supplier.phone || '',
        email: supplier.email || '',
        address: supplier.address || '',
        note: supplier.note || '',
        status: supplier.status
      });
    } else {
      setEditingSupplier(null);
      setFormData({
        name: '',
        logo: '',
        contactPerson: '',
        phone: '',
        email: '',
        address: '',
        note: '',
        status: 'active'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSupplier) {
        await api.put(`/suppliers/${editingSupplier._id}`, formData);
      } else {
        await api.post('/suppliers', formData);
      }
      setIsModalOpen(false);
      fetchSuppliers();
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra!');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa nhà cung cấp này?')) return;
    try {
      await api.delete(`/suppliers/${id}`);
      fetchSuppliers();
    } catch (err) {
      console.error(err);
      alert('Không thể xóa nhà cung cấp này!');
    }
  };

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-8 text-center text-[--color-text-secondary]">Đang tải...</div>;

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[--color-text-main] flex items-center gap-3 uppercase tracking-tight">
            <Building2 className="w-8 h-8 text-[--color-primary]" />
            Nhà cung cấp
          </h1>
          <p className="text-[--color-text-secondary] text-sm mt-1">Quản lý nguồn hàng và thông tin đối tác</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-[--color-primary] hover:bg-[--color-primary-hover] text-black px-6 py-2.5 rounded-xl font-bold transition-colors flex items-center gap-2 shadow-sm uppercase tracking-widest text-sm"
        >
          <Plus className="w-5 h-5" />
          Thêm nhà cung cấp
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input 
          type="text"
          placeholder="Tìm kiếm theo tên nhà cung cấp hoặc người liên hệ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-[--color-border] rounded-2xl py-4 pl-12 pr-4 text-[--color-text-main] outline-none focus:border-[--color-primary] focus:ring-4 focus:ring-[--color-primary]/10 transition-all card-shadow"
        />
      </div>

      <div className="bg-white border border-[--color-border] rounded-[--radius-2xl] overflow-hidden card-shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-[10px] uppercase tracking-widest text-[--color-text-secondary] font-bold border-b border-gray-100">
                <th className="px-5 py-4">Logo & Tên</th>
                <th className="px-5 py-4">Liên hệ</th>
                <th className="px-5 py-4">Trạng thái</th>
                <th className="px-5 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredSuppliers.map((supplier) => (
                <tr key={supplier._id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                        {supplier.logo ? (
                          <img src={supplier.logo || undefined} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <Building2 className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-[--color-text-main]">{supplier.name}</p>
                        <p className="text-[10px] text-[--color-text-secondary] uppercase font-bold truncate max-w-[200px] mt-0.5">{supplier.address}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                        <span className="w-5 h-5 rounded bg-[--color-primary-light] text-orange-700 flex items-center justify-center">
                          <Building2 className="w-3 h-3" />
                        </span>
                        {supplier.contactPerson || 'N/A'}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-[--color-text-secondary] font-medium">
                        <Phone className="w-3.5 h-3.5 text-gray-400" /> {supplier.phone || 'N/A'}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-[--color-text-secondary] font-medium">
                        <Mail className="w-3.5 h-3.5 text-gray-400" /> {supplier.email || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 border ${
                      supplier.status === 'active' 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                        : 'bg-red-50 text-red-600 border-red-100'
                    }`}>
                      {supplier.status === 'active' ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          Hoạt động
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" />
                          Tạm khóa
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleOpenModal(supplier)}
                        className="p-2 hover:bg-[--color-primary] hover:text-black rounded-lg text-gray-400 transition-colors shadow-sm"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(supplier._id)}
                        className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg text-gray-400 transition-colors shadow-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredSuppliers.length === 0 && !loading && (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-[--color-text-secondary] italic">
                    Chưa có nhà cung cấp nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Supplier Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-xl bg-white border border-[--color-border] rounded-[--radius-2xl] shadow-2xl p-6 md:p-8"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black text-[--color-text-main] uppercase tracking-tight flex items-center gap-3">
                  <div className="w-10 h-10 bg-[--color-primary-light] rounded-xl flex items-center justify-center text-orange-700">
                     <Building2 className="w-5 h-5" />
                  </div>
                  {editingSupplier ? 'Sửa nhà cung cấp' : 'Thêm nhà cung cấp'}
                </h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[--color-text-secondary] uppercase tracking-widest px-1">Tên nhà cung cấp</label>
                    <input 
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-white border border-[--color-border] rounded-xl px-4 py-3 text-[--color-text-main] font-medium focus:border-[--color-primary] focus:ring-4 focus:ring-[--color-primary]/10 outline-none transition-shadow"
                      placeholder="Nhập tên NCC..."
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[--color-text-secondary] uppercase tracking-widest px-1">Người liên hệ</label>
                    <input 
                      type="text"
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                      className="w-full bg-white border border-[--color-border] rounded-xl px-4 py-3 text-[--color-text-main] font-medium focus:border-[--color-primary] focus:ring-4 focus:ring-[--color-primary]/10 outline-none transition-shadow"
                      placeholder="Người đại diện..."
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[--color-text-secondary] uppercase tracking-widest px-1">Điện thoại</label>
                    <input 
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-white border border-[--color-border] rounded-xl px-4 py-3 text-[--color-text-main] font-medium focus:border-[--color-primary] focus:ring-4 focus:ring-[--color-primary]/10 outline-none transition-shadow"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[--color-text-secondary] uppercase tracking-widest px-1">Email</label>
                    <input 
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-white border border-[--color-border] rounded-xl px-4 py-3 text-[--color-text-main] font-medium focus:border-[--color-primary] focus:ring-4 focus:ring-[--color-primary]/10 outline-none transition-shadow"
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-bold text-[--color-text-secondary] uppercase tracking-widest px-1">Đường dẫn Logo</label>
                    <input 
                      type="text"
                      value={formData.logo}
                      onChange={(e) => setFormData({...formData, logo: e.target.value})}
                      className="w-full bg-white border border-[--color-border] rounded-xl px-4 py-3 text-[--color-text-main] font-medium focus:border-[--color-primary] focus:ring-4 focus:ring-[--color-primary]/10 outline-none transition-shadow"
                      placeholder="URL ảnh logo..."
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-bold text-[--color-text-secondary] uppercase tracking-widest px-1">Địa chỉ</label>
                    <input 
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="w-full bg-white border border-[--color-border] rounded-xl px-4 py-3 text-[--color-text-main] font-medium focus:border-[--color-primary] focus:ring-4 focus:ring-[--color-primary]/10 outline-none transition-shadow"
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-bold text-[--color-text-secondary] uppercase tracking-widest px-1">Ghi chú</label>
                    <textarea 
                      value={formData.note}
                      onChange={(e) => setFormData({...formData, note: e.target.value})}
                      className="w-full bg-white border border-[--color-border] rounded-xl px-4 py-3 text-[--color-text-main] focus:border-[--color-primary] focus:ring-4 focus:ring-[--color-primary]/10 outline-none transition-shadow resize-none"
                      rows={2}
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-bold text-[--color-text-secondary] uppercase tracking-widest px-1">Trạng thái</label>
                    <select 
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                      className="w-full bg-white border border-[--color-border] rounded-xl px-4 py-3 text-[--color-text-main] font-bold focus:border-[--color-primary] focus:ring-4 focus:ring-[--color-primary]/10 outline-none transition-shadow appearance-none"
                    >
                      <option value="active">Hoạt động</option>
                      <option value="locked">Tạm khóa</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 pt-6 border-t border-[--color-border]">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-3.5 rounded-xl font-bold bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors uppercase tracking-widest text-sm"
                  >
                    Hủy
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-6 py-3.5 rounded-xl font-black bg-[--color-primary] text-black hover:bg-[--color-primary-hover] transition-colors shadow-sm uppercase tracking-widest text-sm"
                  >
                    {editingSupplier ? 'Cập nhật' : 'Thêm mới'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

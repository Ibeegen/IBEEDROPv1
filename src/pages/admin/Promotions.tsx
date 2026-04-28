import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Plus, Calendar, Tag } from 'lucide-react';

interface Promotion {
  _id: string;
  title: string;
  description: string;
  banner: string;
  startDate: string;
  endDate: string;
  type: 'bonus_point' | 'commission_boost';
  value: number;
}

export default function AdminPromotions() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [banner, setBanner] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [type, setType] = useState<'bonus_point' | 'commission_boost'>('bonus_point');
  const [value, setValue] = useState('');

  const fetchPromotions = async () => {
    try {
      const res = await api.get('/promotions');
      setPromotions(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('images', file);

    try {
      setSubmitting(true);
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setBanner(res.data.urls[0]);
    } catch (err) {
      console.error(err);
      alert('Lỗi tải ảnh');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/promotions', {
        title, description, banner, startDate, endDate, type, value: Number(value)
      });
      setIsModalOpen(false);
      setTitle('');
      setDescription('');
      setBanner('');
      setStartDate('');
      setEndDate('');
      setValue('');
      fetchPromotions();
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-[--color-text-secondary]">Đang tải...</div>;

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black text-[--color-text-main] tracking-tight uppercase">Quản lý Khuyến mãi</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[--color-primary] hover:bg-[--color-primary-hover] text-black px-6 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Tạo Khuyến mãi
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {promotions.map(p => (
          <div key={p._id} className="bg-white border border-[--color-border] rounded-[--radius-2xl] overflow-hidden flex flex-col md:flex-row card-shadow">
            <div className="w-full md:w-1/3 aspect-video md:aspect-square relative flex-shrink-0">
              <img src={p.banner} alt="" className="w-full h-full object-cover" />
              <div className="absolute top-3 right-3 bg-[--color-primary] text-black px-3 py-1.5 rounded-full text-xs font-black shadow-sm">
                {p.type === 'bonus_point' ? `+${p.value}P` : `+${p.value}% HH`}
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${p.type === 'bonus_point' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                    {p.type === 'bonus_point' ? 'Tặng Điểm' : 'Tăng Hoa Hồng'}
                  </span>
                </div>
                <h3 className="font-bold text-lg text-[--color-text-main] leading-tight">{p.title}</h3>
                <p className="text-sm text-[--color-text-secondary] line-clamp-2">{p.description}</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-medium text-[--color-text-secondary] pt-4 border-t border-gray-100">
                <div className="flex items-center gap-1.5">
                   <Calendar className="w-4 h-4 text-gray-400" />
                   <span>{new Date(p.startDate).toLocaleDateString('vi-VN')} - {new Date(p.endDate).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        {promotions.length === 0 && (
          <div className="col-span-full py-16 text-center text-[--color-text-secondary] border-2 border-dashed border-gray-200 rounded-2xl font-medium">
            Chưa có chương trình khuyến mãi nào
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white border border-[--color-border] rounded-[--radius-2xl] w-full max-w-xl p-6 md:p-8 my-8 card-shadow">
            <h2 className="text-xl font-black text-[--color-text-main] mb-6 uppercase tracking-tight">Tạo Khuyến mãi Mới</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-[--color-text-secondary] uppercase tracking-widest mb-1.5 px-1">Tiêu đề</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-white border border-[--color-border] rounded-xl px-4 py-3 text-[--color-text-main] font-medium outline-none focus:border-[--color-primary] focus:ring-4 focus:ring-[--color-primary]/10 transition-shadow" required />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[--color-text-secondary] uppercase tracking-widest mb-1.5 px-1">Mô tả</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-white border border-[--color-border] rounded-xl px-4 py-3 text-[--color-text-main] font-medium outline-none focus:border-[--color-primary] focus:ring-4 focus:ring-[--color-primary]/10 transition-shadow resize-none" rows={3} required />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[--color-text-secondary] uppercase tracking-widest mb-1.5 px-1">Banner Khuyến mãi</label>
                <input type="file" onChange={handleImageUpload} className="w-full text-sm text-[--color-text-secondary] file:mr-4 file:py-2.5 file:px-6 file:rounded-xl file:border-0 file:bg-[--color-primary-light] file:text-orange-700 file:font-bold hover:file:bg-[--color-primary] hover:file:text-black cursor-pointer transition-colors" />
                {banner && <img src={banner} className="mt-3 rounded-xl aspect-video object-cover border border-gray-100 shadow-sm" alt="" />}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 pt-5">
                <div>
                  <label className="block text-[10px] font-bold text-[--color-text-secondary] uppercase tracking-widest mb-1.5 px-1">Ngày bắt đầu</label>
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-white border border-[--color-border] rounded-xl px-4 py-3 text-[--color-text-main] font-medium outline-none focus:border-[--color-primary] focus:ring-4 focus:ring-[--color-primary]/10 transition-shadow" required />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[--color-text-secondary] uppercase tracking-widest mb-1.5 px-1">Ngày kết thúc</label>
                  <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-white border border-[--color-border] rounded-xl px-4 py-3 text-[--color-text-main] font-medium outline-none focus:border-[--color-primary] focus:ring-4 focus:ring-[--color-primary]/10 transition-shadow" required />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-[--color-text-secondary] uppercase tracking-widest mb-1.5 px-1">Loại khuyến mãi</label>
                  <select value={type} onChange={e => setType(e.target.value as any)} className="w-full bg-white border border-[--color-border] rounded-xl px-4 py-3 text-[--color-text-main] font-bold outline-none focus:border-[--color-primary] focus:ring-4 focus:ring-[--color-primary]/10 transition-shadow appearance-none">
                    <option value="bonus_point">Tặng Điểm</option>
                    <option value="commission_boost">Tăng Hoa Hồng</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[--color-text-secondary] uppercase tracking-widest mb-1.5 px-1">Giá trị ({type === 'bonus_point' ? 'Point' : '% HH'})</label>
                  <input type="number" value={value} onChange={e => setValue(e.target.value)} className="w-full bg-white border border-[--color-border] rounded-xl px-4 py-3 text-[--color-text-main] font-bold outline-none focus:border-[--color-primary] focus:ring-4 focus:ring-[--color-primary]/10 transition-shadow" required />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-6 border-t border-[--color-border]">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors uppercase tracking-widest text-sm">Hủy</button>
                <button type="submit" disabled={submitting} className="bg-[--color-primary] hover:bg-[--color-primary-hover] text-black px-8 py-3 rounded-xl font-black transition-colors shadow-sm uppercase tracking-widest text-sm">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

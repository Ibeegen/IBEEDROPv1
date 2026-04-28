import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Plus, Trash2, Image as ImageIcon, Link as LinkIcon, Hash } from 'lucide-react';

interface Banner {
  _id: string;
  title: string;
  image: string;
  link: string;
  order: number;
}

export default function AdminBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [image, setImage] = useState('');
  const [link, setLink] = useState('');
  const [order, setOrder] = useState('0');

  const fetchBanners = async () => {
    try {
      const res = await api.get('/banners');
      setBanners(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
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
      setImage(res.data.urls[0]);
    } catch (err) {
      console.error(err);
      alert('Lỗi khi tải ảnh');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/banners', {
        title, image, link, order: Number(order)
      });
      setIsModalOpen(false);
      setTitle('');
      setImage('');
      setLink('');
      setOrder('0');
      fetchBanners();
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc xoá banner này?')) return;
    try {
      await api.delete(`/banners/${id}`);
      fetchBanners();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 text-center text-[--color-text-secondary]">Đang tải...</div>;

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black text-[--color-text-main] uppercase tracking-tight">Quản lý Banner</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[--color-primary] hover:bg-[--color-primary-hover] text-black px-6 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold transition-colors shadow-sm uppercase tracking-widest"
        >
          <Plus className="w-4 h-4" />
          Thêm Banner
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map(b => (
          <div key={b._id} className="bg-white border border-[--color-border] rounded-2xl overflow-hidden group card-shadow">
            <div className="aspect-[21/9] relative">
              <img src={b.image} alt={b.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                 <button onClick={() => handleDelete(b._id)} className="bg-red-50 hover:bg-red-100 text-red-600 p-3 rounded-full transition-colors">
                   <Trash2 className="w-5 h-5" />
                 </button>
              </div>
            </div>
            <div className="p-4 space-y-2">
              <h3 className="font-bold text-[--color-text-main] truncate">{b.title}</h3>
              <div className="flex items-center gap-2 text-[--color-text-secondary] text-xs font-medium">
                <LinkIcon className="w-3.5 h-3.5 text-gray-400" />
                <span className="truncate">{b.link || 'Không có link'}</span>
              </div>
              <div className="flex items-center gap-2 text-[--color-text-secondary] text-xs font-medium">
                <Hash className="w-3.5 h-3.5 text-gray-400" />
                <span>Thứ tự: <strong className="text-[--color-text-main]">{b.order}</strong></span>
              </div>
            </div>
          </div>
        ))}
        {banners.length === 0 && (
          <div className="col-span-full py-16 text-center text-[--color-text-secondary] border-2 border-dashed border-gray-200 rounded-2xl font-medium">
             Chưa có banner nào
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-[--color-border] rounded-[--radius-2xl] w-full max-w-md p-6 card-shadow">
            <h2 className="text-xl font-black text-[--color-text-main] mb-6 uppercase tracking-tight">Thêm Banner Mới</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-[--color-text-secondary] uppercase tracking-widest mb-1.5 px-1">Tiêu đề</label>
                <input 
                  type="text" value={title} onChange={e => setTitle(e.target.value)}
                  className="w-full bg-white border border-[--color-border] rounded-xl px-4 py-3 text-[--color-text-main] font-medium outline-none focus:border-[--color-primary] focus:ring-4 focus:ring-[--color-primary]/10 transition-shadow" required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[--color-text-secondary] uppercase tracking-widest mb-1.5 px-1">Ảnh Banner</label>
                <input 
                  type="file" onChange={handleImageUpload}
                  className="w-full text-sm text-[--color-text-secondary] file:mr-4 file:py-2.5 file:px-6 file:rounded-xl file:border-0 file:bg-[--color-primary-light] file:text-orange-700 file:font-bold hover:file:bg-[--color-primary] hover:file:text-black cursor-pointer transition-colors"
                />
                {image && <img src={image} className="mt-3 rounded-xl aspect-[21/9] object-cover border border-gray-100 shadow-sm" alt="" />}
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[--color-text-secondary] uppercase tracking-widest mb-1.5 px-1">Đường dẫn khi click</label>
                <input 
                  type="text" value={link} onChange={e => setLink(e.target.value)} placeholder="/products/..."
                  className="w-full bg-white border border-[--color-border] rounded-xl px-4 py-3 text-[--color-text-main] font-medium outline-none focus:border-[--color-primary] focus:ring-4 focus:ring-[--color-primary]/10 transition-shadow"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[--color-text-secondary] uppercase tracking-widest mb-1.5 px-1">Thứ tự hiển thị</label>
                <input 
                  type="number" value={order} onChange={e => setOrder(e.target.value)}
                  className="w-full bg-white border border-[--color-border] rounded-xl px-4 py-3 text-[--color-text-main] font-bold outline-none focus:border-[--color-primary] focus:ring-4 focus:ring-[--color-primary]/10 transition-shadow"
                />
              </div>
              <div className="flex justify-end gap-3 pt-6 border-t border-[--color-border]">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors uppercase tracking-widest text-sm">Hủy</button>
                <button type="submit" disabled={submitting} className="bg-[--color-primary] hover:bg-[--color-primary-hover] text-black px-8 py-3 rounded-xl font-black transition-colors shadow-sm uppercase tracking-widest text-sm">
                  {submitting ? 'Đang lưu...' : 'Lưu Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

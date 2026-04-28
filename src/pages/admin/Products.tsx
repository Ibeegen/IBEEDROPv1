import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Plus, Edit2, Trash2, Package } from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  description: string;
  images: string[];
  retailPrice: number;
  costPrice: number;
  agentCommission: number;
  featured: boolean;
  companyProfit: number;
  point: number;
  supplierId?: any;
}

interface Supplier {
  _id: string;
  name: string;
  logo: string;
  status: string;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [retailPrice, setRetailPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [agentCommission, setAgentCommission] = useState('');
  const [featured, setFeatured] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [supplierId, setSupplierId] = useState('');

  const fetchProducts = async () => {
    try {
      const [productsRes, suppliersRes] = await Promise.all([
        api.get('/products'),
        api.get('/suppliers')
      ]);
      setProducts(productsRes.data);
      setSuppliers(suppliersRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setImages([]);
    setRetailPrice('');
    setCostPrice('');
    setAgentCommission('');
    setFeatured(false);
    setSupplierId('');
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingId(p._id);
    setName(p.name);
    setDescription(p.description || '');
    setImages(p.images || []);
    setRetailPrice(p.retailPrice.toString());
    setCostPrice(p.costPrice.toString());
    setAgentCommission(p.agentCommission.toString());
    setFeatured(p.featured || false);
    setSupplierId(typeof p.supplierId === 'object' ? p.supplierId?._id : p.supplierId || '');
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const formData = new FormData();
    files.forEach((file: any) => {
      formData.append('images', file);
    });

    try {
      setSubmitting(true);
      const res = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setImages(prev => [...prev, ...res.data.urls]);
    } catch (err) {
      console.error(err);
      alert('Lỗi khi tải ảnh lên');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name,
        description,
        images,
        retailPrice: Number(retailPrice),
        costPrice: Number(costPrice),
        agentCommission: Number(agentCommission),
        featured,
        supplierId
      };

      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
      } else {
        await api.post('/products', payload);
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xoá?')) return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra');
    }
  };

  const toggleFeatured = async (p: Product) => {
    try {
      await api.put(`/products/${p._id}`, { featured: !p.featured });
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 text-center text-[--color-text-secondary]">Đang tải...</div>;

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[--color-text-main] uppercase">Quản lý Sản phẩm</h1>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-[--color-primary] hover:bg-[--color-primary-hover] text-black px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold uppercase tracking-widest shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Thêm mới
        </button>
      </div>

      <div className="bg-white border border-[--color-border] rounded-[--radius-2xl] overflow-hidden card-shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-[--color-text-secondary]">
              <tr>
                <th className="px-5 py-4 font-bold uppercase tracking-widest text-[10px]">Sản phẩm</th>
                <th className="px-5 py-4 font-bold uppercase tracking-widest text-[10px]">Nhà cung cấp</th>
                <th className="px-5 py-4 font-bold uppercase tracking-widest text-[10px]">Giá bán lẻ</th>
                <th className="px-5 py-4 font-bold uppercase tracking-widest text-[10px]">Giá vốn</th>
                <th className="px-5 py-4 font-bold uppercase tracking-widest text-[10px]">HH Đại lý</th>
                <th className="px-5 py-4 font-bold uppercase tracking-widest text-[10px]">Nổi bật</th>
                <th className="px-5 py-4 font-bold uppercase tracking-widest text-[10px]">LN Công ty</th>
                <th className="px-5 py-4 font-bold uppercase tracking-widest text-[10px] text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map(p => (
                <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 font-bold text-[--color-text-main]">
                    <div className="flex items-center gap-4">
                       {p.images && p.images.length > 0 ? (
                         <img src={p.images[0]} alt="" className="w-12 h-12 rounded-xl object-cover border border-gray-100 shadow-sm" />
                       ) : (
                         <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center">
                           <Package className="w-5 h-5 text-gray-400" />
                         </div>
                       )}
                       <div>
                         <p>{p.name}</p>
                         <p className="text-xs text-[--color-text-secondary] font-normal truncate max-w-[200px] mt-0.5">{p.description || 'Không có mô tả'}</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                       {p.supplierId?.logo && (
                         <img src={p.supplierId.logo} className="w-6 h-6 rounded-full object-cover border border-gray-100 shadow-sm" alt="" />
                       )}
                       <span className="text-xs font-medium text-gray-700">{p.supplierId?.name || 'Chưa gán'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-red-600 font-bold">{p.retailPrice.toLocaleString()}đ</td>
                  <td className="px-5 py-4 text-gray-600 font-medium">{p.costPrice.toLocaleString()}đ</td>
                  <td className="px-5 py-4 text-emerald-600 font-bold">{p.agentCommission.toLocaleString()}đ</td>
                  <td className="px-5 py-4">
                    <button 
                      onClick={() => toggleFeatured(p)}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase transition-colors ${p.featured ? 'bg-[--color-primary-light] text-orange-700 border border-[--color-primary]' : 'bg-gray-100 text-gray-500'}`}
                    >
                      {p.featured ? 'Nổi bật' : 'Thường'}
                    </button>
                  </td>
                  <td className="px-5 py-4 text-blue-600 font-bold">{p.companyProfit.toLocaleString()}đ</td>
                  <td className="px-5 py-4 text-right">
                    <button onClick={() => openEditModal(p)} className="text-gray-400 hover:text-[--color-primary-hover] p-2 transition-colors">
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDelete(p._id)} className="text-gray-400 hover:text-red-500 p-2 ml-1 transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-[--color-text-secondary]">Chưa có sản phẩm nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white border border-[--color-border] rounded-3xl w-full max-w-2xl p-6 md:p-8 my-8 shadow-2xl">
            <h2 className="text-xl font-black text-[--color-text-main] uppercase tracking-tight mb-6">{editingId ? 'Sửa Sản phẩm' : 'Thêm Sản phẩm'}</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-[--color-text-secondary] uppercase tracking-widest mb-1.5">Tên sản phẩm</label>
                  <input 
                    type="text" 
                    value={name} onChange={e => setName(e.target.value)}
                    className="w-full bg-white border border-[--color-border] rounded-xl px-4 py-3 text-[--color-text-main] font-medium focus:border-[--color-primary] focus:ring-2 focus:ring-[--color-primary]/20 outline-none transition-all"
                    required 
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-[--color-text-secondary] uppercase tracking-widest mb-1.5">Mô tả chi tiết</label>
                  <textarea 
                    value={description} onChange={e => setDescription(e.target.value)} rows={3}
                    className="w-full bg-white border border-[--color-border] rounded-xl px-4 py-3 text-[--color-text-main] focus:border-[--color-primary] focus:ring-2 focus:ring-[--color-primary]/20 outline-none transition-all resize-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-[--color-text-secondary] uppercase tracking-widest mb-1.5">Ảnh sản phẩm</label>
                  <input 
                    type="file" multiple accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full text-sm text-[--color-text-secondary] file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-xs file:font-bold file:uppercase file:tracking-widest file:bg-[--color-primary-light] file:text-orange-700 hover:file:bg-[--color-primary] cursor-pointer transition-colors"
                  />
                  {images.length > 0 && (
                    <div className="flex gap-3 mt-4 flex-wrap">
                      {images.map((img, i) => (
                        <div key={i} className="relative group rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                           <img src={img} className="w-24 h-24 object-cover" alt="" />
                           <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                             <button type="button" onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="text-white hover:text-red-400 p-2 bg-black/50 rounded-full transition-colors">
                                <Trash2 className="w-5 h-5" />
                             </button>
                           </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-[--color-text-secondary] uppercase tracking-widest mb-1.5">Nhà cung cấp</label>
                  <select 
                    value={supplierId}
                    onChange={e => setSupplierId(e.target.value)}
                    className="w-full bg-white border border-[--color-border] rounded-xl px-4 py-3 text-[--color-text-main] font-medium focus:border-[--color-primary] focus:ring-2 focus:ring-[--color-primary]/20 outline-none transition-all appearance-none"
                    required
                  >
                    <option value="">Chọn nhà cung cấp</option>
                    {suppliers.filter(s => s.status === 'active').map(s => (
                      <option key={s._id} value={s._id}>{s.name}</option>
                    ))}
                    {/* Handle locked supplier if still assigned to product */}
                    {editingId && typeof products.find(p => p._id === editingId)?.supplierId === 'object' && 
                     (products.find(p => p._id === editingId)?.supplierId as any)?.status === 'locked' && (
                       <option key={(products.find(p => p._id === editingId)?.supplierId as any)._id} value={(products.find(p => p._id === editingId)?.supplierId as any)._id}>
                         {(products.find(p => p._id === editingId)?.supplierId as any).name} (Khóa)
                       </option>
                     )}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[--color-text-secondary] uppercase tracking-widest mb-1.5">Giá bán lẻ (VNĐ)</label>
                  <input 
                    type="number" min="0"
                    value={retailPrice} onChange={e => setRetailPrice(e.target.value)}
                    className="w-full bg-white border border-[--color-border] rounded-xl px-4 py-3 text-[--color-text-main] font-bold focus:border-[--color-primary] focus:ring-2 focus:ring-[--color-primary]/20 outline-none transition-all"
                    required 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[--color-text-secondary] uppercase tracking-widest mb-1.5">Giá vốn (VNĐ)</label>
                  <input 
                    type="number" min="0"
                    value={costPrice} onChange={e => setCostPrice(e.target.value)}
                    className="w-full bg-white border border-[--color-border] rounded-xl px-4 py-3 text-[--color-text-main] font-bold focus:border-[--color-primary] focus:ring-2 focus:ring-[--color-primary]/20 outline-none transition-all"
                    required 
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-[--color-text-secondary] uppercase tracking-widest mb-1.5">Hoa hồng đại lý (VNĐ)</label>
                  <input 
                    type="number" min="0"
                    value={agentCommission} onChange={e => setAgentCommission(e.target.value)}
                    className="w-full bg-white border border-[--color-border] rounded-xl px-4 py-3 text-[--color-text-main] font-bold focus:border-[--color-primary] focus:ring-2 focus:ring-[--color-primary]/20 outline-none transition-all"
                    required 
                  />
                </div>
                <div className="md:col-span-2 flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <input 
                    type="checkbox" 
                    id="featured"
                    checked={featured} onChange={e => setFeatured(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 bg-white text-[--color-primary] focus:ring-[--color-primary]"
                  />
                  <label htmlFor="featured" className="text-sm font-bold text-[--color-text-main] cursor-pointer select-none">Đánh dấu là Sản phẩm Nổi bật</label>
                </div>
                {Number(retailPrice) > 0 && (
                  <div className="md:col-span-2 p-4 bg-blue-50 border border-blue-100 text-blue-700 rounded-xl text-sm flex justify-between items-center">
                    <span className="font-medium text-blue-600">Lợi nhuận Công ty dự kiến:</span>
                    <span className="font-black text-lg">
                      {Math.max(0, Number(retailPrice) - Number(costPrice) - Number(agentCommission)).toLocaleString()}đ
                    </span>
                  </div>
                )}
              </div>
              <div className="pt-6 flex justify-end gap-3 border-t border-[--color-border] mt-6">
                <button 
                  type="button" 
                  disabled={submitting}
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-gray-500 hover:bg-gray-100 disabled:opacity-50 transition-colors"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="bg-[--color-primary] hover:bg-[--color-primary-hover] disabled:opacity-50 text-black px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors shadow-sm"
                >
                  {submitting ? 'Đang lưu...' : 'Lưu sản phẩm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

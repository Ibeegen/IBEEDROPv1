import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';

interface OrderItem {
  productId: { _id: string; name: string; };
  quantity: number;
}

interface Order {
  _id: string;
  agentId: { _id: string; name: string; email: string; };
  customerName: string;
  phone: string;
  address: string;
  items: OrderItem[];
  totalAmount: number;
  commission: number;
  point: number;
  status: string;
  createdAt: string;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await api.put(`/orders/${id}/status`, { status });
      fetchOrders();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi cập nhật trạng thái');
      console.error(err);
    }
  };

  const statusColors: any = {
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    approved: 'bg-blue-100 text-blue-700 border-blue-200',
    shipping: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    cancelled: 'bg-red-100 text-red-700 border-red-200',
  };

  if (loading) return <div className="p-8 text-center text-[--color-text-secondary]">Đang tải...</div>;

  return (
    <div className="p-4 md:p-8 space-y-6">
      <h1 className="text-2xl font-black text-[--color-text-main] tracking-tight uppercase">Quản lý Đơn hàng</h1>

      <div className="bg-white border border-[--color-border] rounded-[--radius-2xl] overflow-hidden card-shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-[--color-text-secondary]">
              <tr>
                <th className="px-5 py-4 font-bold uppercase tracking-widest text-[10px]">Mã đơn</th>
                <th className="px-5 py-4 font-bold uppercase tracking-widest text-[10px]">Đại lý</th>
                <th className="px-5 py-4 font-bold uppercase tracking-widest text-[10px]">Khách hàng</th>
                <th className="px-5 py-4 font-bold uppercase tracking-widest text-[10px]">Tổng tiền</th>
                <th className="px-5 py-4 font-bold uppercase tracking-widest text-[10px]">Trạng thái</th>
                <th className="px-5 py-4 font-bold uppercase tracking-widest text-[10px]">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map(o => (
                <tr key={o._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 font-bold text-[--color-text-main]">
                    #{o._id.substring(o._id.length - 6).toUpperCase()}
                    <div className="text-xs text-[--color-text-secondary] font-normal mt-0.5">{new Date(o.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td className="px-5 py-4 text-gray-700 font-medium">
                    {o.agentId?.name || 'N/A'}
                    <div className="text-xs text-[--color-text-secondary] font-normal mt-0.5">{o.agentId?.email}</div>
                  </td>
                  <td className="px-5 py-4 text-gray-700 font-medium">
                    {o.customerName}
                    <div className="text-xs text-[--color-text-secondary] font-normal mt-0.5">{o.phone}</div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-bold text-[--color-text-main]">{o.totalAmount.toLocaleString()}đ</span>
                    <div className="text-[10px] font-bold text-emerald-600 bg-emerald-50 inline-block px-1.5 py-0.5 rounded mt-1">HH: {o.commission.toLocaleString()}đ</div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase border ${statusColors[o.status]}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <select
                      value={o.status}
                      disabled={['completed', 'cancelled'].includes(o.status)}
                      onChange={(e) => handleUpdateStatus(o._id, e.target.value)}
                      className="bg-white border border-[--color-border] text-[--color-text-main] font-medium rounded-lg px-2 py-1.5 outline-none focus:border-[--color-primary] focus:ring-2 focus:ring-[--color-primary]/20 text-xs disabled:opacity-50 transition-all shadow-sm"
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="shipping">Shipping</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-[--color-text-secondary]">Chưa có đơn hàng nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

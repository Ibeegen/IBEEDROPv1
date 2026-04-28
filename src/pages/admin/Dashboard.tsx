import React, { useEffect, useState } from 'react';
import { Package, ShoppingCart, DollarSign, Users, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [data, setData] = useState({
    products: 0,
    orders: 0,
    users: 0,
    pendingOrders: [] as any[]
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, ordersRes, usersRes] = await Promise.all([
          api.get('/products'),
          api.get('/orders'),
          api.get('/users')
        ]);
        
        setData({
          products: productsRes.data.length,
          orders: ordersRes.data.length,
          users: usersRes.data.length,
          pendingOrders: ordersRes.data.filter((o: any) => o.status === 'pending')
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const stats = [
    { label: 'Đơn hàng mới / Tổng', value: `${data.pendingOrders.length} / ${data.orders}`, icon: ShoppingCart, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Số lượng Sản phẩm', value: data.products, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Tổng số Đại lý', value: data.users, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[--color-text-main] tracking-tight uppercase">Dashboard</h1>
        <p className="text-sm text-[--color-text-secondary] mt-1">Tổng quan hoạt động hệ thống phân phối.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white border border-[--color-border] p-5 rounded-[--radius-2xl] card-shadow">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <p className="text-[10px] font-bold text-[--color-text-secondary] uppercase tracking-widest">{stat.label}</p>
            <p className="text-3xl font-black text-[--color-text-main] mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-[--color-border] rounded-[--radius-2xl] p-5 md:p-6 min-h-[300px] card-shadow">
        <div className="flex items-center justify-between mb-4">
           <h2 className="text-sm font-black uppercase tracking-widest text-[--color-text-main]">Đơn hàng cần xử lý <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs ml-2">{data.pendingOrders.length}</span></h2>
        </div>
        {data.pendingOrders.length > 0 ? (
          <div className="space-y-3">
            {data.pendingOrders.map(o => (
              <div key={o._id} className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors">
                 <div>
                   <p className="font-bold text-[--color-text-main]">{o.customerName}</p>
                   <p className="text-xs text-[--color-text-secondary] mt-0.5">Đại lý: <span className="font-medium text-gray-700">{o.agentId?.name}</span></p>
                 </div>
                 <Link to="/admin/orders" className="flex items-center gap-1 text-sm font-bold text-[--color-primary-hover]">
                    Xử lý <ArrowRight className="w-4 h-4" />
                 </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-[--color-text-secondary] text-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 flex flex-col items-center justify-center">
            <ShoppingCart className="w-8 h-8 text-gray-300 mb-2" />
            Không có đơn hàng nào chờ xử lý.
          </div>
        )}
      </div>
    </div>
  );
}

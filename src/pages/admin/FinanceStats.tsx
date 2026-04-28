import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { 
  TrendingUp, 
  DollarSign, 
  Activity, 
  CheckCircle, 
  PieChart as PieChartIcon, 
  BarChart, 
  Calendar,
  Filter
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart as ReBarChart,
  Bar,
  Legend
} from 'recharts';

interface FinanceData {
  totalRevenue: number;
  totalProfit: number;
  totalGrowthFund: number;
  totalOrdersCompleted: number;
  profitByDay: Array<{ _id: string; profit: number; growthFund: number }>;
  recentOrders: Array<{
    _id: string;
    orderDate: string;
    orderRevenue: number;
    orderCommission: number;
    orderCost: number;
    orderProfit: number;
    orderGrowthFund: number;
  }>;
}

export default function FinanceStats() {
  const [data, setData] = useState<FinanceData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Filtering state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchData = async (start = startDate, end = endDate) => {
    try {
      setLoading(true);
      const res = await api.get('/stats/finance', {
        params: { startDate: start, endDate: end }
      });
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleQuickFilter = (type: string) => {
    const now = new Date();
    let start = '';
    let end = now.toISOString().split('T')[0];

    switch (type) {
      case 'today':
        start = now.toISOString().split('T')[0];
        break;
      case '7days':
        const last7 = new Date();
        last7.setDate(now.getDate() - 7);
        start = last7.toISOString().split('T')[0];
        break;
      case '30days':
        const last30 = new Date();
        last30.setDate(now.getDate() - 30);
        start = last30.toISOString().split('T')[0];
        break;
      case 'thisMonth':
        start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
        break;
      case 'lastMonth':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
        end = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
        break;
      case 'thisQuarter':
        const quarter = Math.floor((now.getMonth() / 3));
        start = new Date(now.getFullYear(), quarter * 3, 1).toISOString().split('T')[0];
        end = new Date(now.getFullYear(), (quarter + 1) * 3, 0).toISOString().split('T')[0];
        break;
      case 'thisYear':
        start = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
        end = new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0];
        break;
      default:
        start = '';
        end = '';
    }

    setStartDate(start);
    setEndDate(end);
    fetchData(start, end);
  };

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  const setMonthFilter = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    setStartDate(firstDay);
    setEndDate(lastDay);
    // fetchData will be called by useEffect if we add dependency or manually call
    // Manually calling is clearer here
  };

  // Auto fetch when quick filters are set via setMonthFilter logic above if we wanted, 
  // but let's just add a dedicated effect for clarity or just call fetchData after setting states.

  if (loading && !data) return <div className="p-8 text-center text-slate-400">Đang tải thống kê tài chính...</div>;

  const stats = data ? [
    { label: 'Tổng Doanh thu', value: data.totalRevenue, icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
    { label: 'Lợi nhuận Công ty', value: data.totalProfit, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
    { label: 'Quỹ Tăng Trưởng (20%)', value: data.totalGrowthFund, icon: Activity, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
    { label: 'Đơn hàng hoàn thành', value: data.totalOrdersCompleted, icon: CheckCircle, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-100', isCurrency: false },
  ] : [];

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap gap-2">
           <button onClick={() => handleQuickFilter('today')} className="px-3 py-1.5 rounded-lg bg-white border border-[--color-border] text-[10px] font-bold text-[--color-text-secondary] uppercase tracking-widest hover:border-[--color-primary] hover:text-black hover:bg-[--color-primary-light] transition-all card-shadow shadow-sm">Hôm nay</button>
           <button onClick={() => handleQuickFilter('7days')} className="px-3 py-1.5 rounded-lg bg-white border border-[--color-border] text-[10px] font-bold text-[--color-text-secondary] uppercase tracking-widest hover:border-[--color-primary] hover:text-black hover:bg-[--color-primary-light] transition-all card-shadow shadow-sm">7 ngày</button>
           <button onClick={() => handleQuickFilter('30days')} className="px-3 py-1.5 rounded-lg bg-white border border-[--color-border] text-[10px] font-bold text-[--color-text-secondary] uppercase tracking-widest hover:border-[--color-primary] hover:text-black hover:bg-[--color-primary-light] transition-all card-shadow shadow-sm">30 ngày</button>
           <button onClick={() => handleQuickFilter('thisMonth')} className="px-3 py-1.5 rounded-lg bg-white border border-[--color-border] text-[10px] font-bold text-[--color-text-secondary] uppercase tracking-widest hover:border-[--color-primary] hover:text-black hover:bg-[--color-primary-light] transition-all card-shadow shadow-sm">Tháng này</button>
           <button onClick={() => handleQuickFilter('lastMonth')} className="px-3 py-1.5 rounded-lg bg-white border border-[--color-border] text-[10px] font-bold text-[--color-text-secondary] uppercase tracking-widest hover:border-[--color-primary] hover:text-black hover:bg-[--color-primary-light] transition-all card-shadow shadow-sm">Tháng trước</button>
           <button onClick={() => handleQuickFilter('thisQuarter')} className="px-3 py-1.5 rounded-lg bg-white border border-[--color-border] text-[10px] font-bold text-[--color-text-secondary] uppercase tracking-widest hover:border-[--color-primary] hover:text-black hover:bg-[--color-primary-light] transition-all card-shadow shadow-sm">Quý này</button>
           <button onClick={() => handleQuickFilter('thisYear')} className="px-3 py-1.5 rounded-lg bg-white border border-[--color-border] text-[10px] font-bold text-[--color-text-secondary] uppercase tracking-widest hover:border-[--color-primary] hover:text-black hover:bg-[--color-primary-light] transition-all card-shadow shadow-sm">Năm nay</button>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-black text-[--color-text-main] tracking-tight uppercase">Thống kê Tài chính</h1>
            <p className="text-[--color-text-secondary] text-sm mt-1">Dữ liệu lợi nhuận và quỹ tăng trưởng dựa trên đơn hàng đã hoàn thành</p>
          </div>
          <form onSubmit={handleFilter} className="flex flex-wrap items-end gap-3 bg-white p-4 rounded-2xl border border-[--color-border] card-shadow">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[--color-text-secondary] uppercase px-1 tracking-widest">Từ ngày</label>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-medium text-[--color-text-main] focus:ring-2 focus:ring-[--color-primary]/20 focus:border-[--color-primary] outline-none transition-all shadow-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[--color-text-secondary] uppercase px-1 tracking-widest">Đến ngày</label>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-medium text-[--color-text-main] focus:ring-2 focus:ring-[--color-primary]/20 focus:border-[--color-primary] outline-none transition-all shadow-sm"
            />
          </div>
          <button 
            type="submit"
            className="bg-[--color-primary] hover:bg-[--color-primary-hover] text-black px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors shadow-sm"
          >
            Lọc dữ liệu
          </button>
          <button 
            type="button"
            onClick={() => {
              setStartDate('');
              setEndDate('');
              setTimeout(fetchData, 10);
            }}
            className="text-gray-500 hover:text-black px-2 py-2 text-xs font-bold uppercase tracking-widest transition-colors"
          >
            Xoá lọc
          </button>
        </form>
      </div>
    </div>

      {loading && (
        <div className="fixed top-4 right-4 bg-[--color-primary] text-black px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest animate-pulse z-50 shadow-sm border border-orange-200">
          Đang cập nhật...
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className={`bg-white border p-6 rounded-3xl relative overflow-hidden group card-shadow ${stat.bg}`}>
            <div className="relative z-10">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-white shadow-sm border border-white/50 ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-[10px] font-bold text-[--color-text-secondary] uppercase tracking-widest">{stat.label}</p>
              <div className="mt-2 flex items-end gap-2">
                <span className="text-2xl font-black text-[--color-text-main] tracking-tight">
                  {stat.isCurrency === false ? stat.value : stat.value.toLocaleString()}
                </span>
                {stat.isCurrency !== false && <span className="text-xs text-[--color-text-secondary] font-bold mb-1">VNĐ</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Profit Chart */}
        <div className="bg-white border border-[--color-border] p-6 rounded-3xl space-y-6 card-shadow">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-[--color-text-main] flex items-center gap-2 uppercase tracking-tight">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              Lợi nhuận theo ngày
            </h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.profitByDay}>
                <defs>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="_id" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v/1000000).toFixed(1)}M`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="profit" name="Lợi nhuận" stroke="#10b981" fillOpacity={1} fill="url(#colorProfit)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Growth Fund Chart */}
        <div className="bg-white border border-[--color-border] p-6 rounded-3xl space-y-6 card-shadow">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-[--color-text-main] flex items-center gap-2 uppercase tracking-tight">
              <Activity className="w-5 h-5 text-amber-500" />
              Quỹ Tăng Trưởng Trích lũy
            </h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ReBarChart data={data.profitByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="_id" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{fill: '#f3f4f6', opacity: 0.4}}
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#f59e0b', fontWeight: 'bold' }}
                />
                <Bar dataKey="growthFund" name="Quỹ trích" fill="#fbbf24" radius={[4, 4, 0, 0]} barSize={20} />
              </ReBarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-[--color-border] rounded-3xl overflow-hidden card-shadow">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
           <h3 className="font-black text-[--color-text-main] uppercase tracking-tight">Chi tiết lợi nhuận gần đây</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] text-[--color-text-secondary] uppercase tracking-widest bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-bold">Ngày</th>
                <th className="px-6 py-4 font-bold">Doanh thu</th>
                <th className="px-6 py-4 font-bold">Hoa hồng (ĐL)</th>
                <th className="px-6 py-4 font-bold">Lợi nhuận (CTY)</th>
                <th className="px-6 py-4 font-bold">Quỹ trích (20%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.recentOrders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-600 font-medium tracking-wide">
                    {new Date(order.orderDate).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 text-[--color-text-main] font-bold">
                    {order.orderRevenue.toLocaleString()}đ
                  </td>
                  <td className="px-6 py-4 text-red-500 font-bold">
                    -{order.orderCommission.toLocaleString()}đ
                  </td>
                  <td className="px-6 py-4 text-emerald-600 font-black tracking-tight">
                    {order.orderProfit.toLocaleString()}đ
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-amber-50 text-amber-600 border border-amber-100 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                      {order.orderGrowthFund.toLocaleString()}đ
                    </span>
                  </td>
                </tr>
              ))}
              {data.recentOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[--color-text-secondary] italic">
                    Không có dữ liệu trong khoảng thời gian này
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

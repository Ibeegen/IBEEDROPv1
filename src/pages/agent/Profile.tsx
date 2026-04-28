import React, { useEffect, useState } from 'react';
import { useAuth } from '../../store/useAuth';
import { 
  LogOut, 
  User, 
  Shield, 
  ChevronRight, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Activity, 
  ShoppingBag, 
  Info, 
  Copy, 
  Check, 
  Share2, 
  ExternalLink,
  Facebook,
  MessageCircle,
  MessageSquare,
  BarChart3
} from 'lucide-react';
import { api } from '../../services/api';
import { Link } from 'react-router-dom';

export default function AgentProfile() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.get('/stats/agent-stats')
      .then(res => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const referralLink = `${window.location.origin}/dang-ky-dai-ly?ref=${user?.id}`;
  const shopLink = `${window.location.origin}/shop/${user?.id}`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async (link: string, title: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: 'Tham gia mạng lưới IbeeDrop ngay hôm nay!',
          url: link,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      handleCopy(link);
    }
  };

  if (loading) return <div className="p-8 text-center text-[--color-text-secondary]">Đang tải...</div>;

  const quickStats = [
    { 
      label: 'Hoa hồng', 
      value: stats?.totalEarned || 0, 
      subLabel: 'Chờ duyệt', 
      subValue: stats?.totalPending || 0,
      icon: DollarSign, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50',
      isCurrency: true,
      path: '/agent/orders'
    },
    { 
      label: 'Quỹ ước tính', 
      value: stats?.estimatedFund || 0, 
      subLabel: 'Quỹ Tăng Trưởng', 
      subValue: '',
      icon: TrendingUp, 
      color: 'text-orange-600', 
      bg: 'bg-orange-50',
      isCurrency: true,
      path: '/agent/growth-fund'
    },
    { 
      label: 'IbeePoint', 
      value: stats?.totalPoints || 0, 
      subLabel: '', 
      subValue: '',
      icon: Activity, 
      color: 'text-orange-500', 
      bg: 'bg-orange-50',
      isCurrency: false,
      path: '/agent/points'
    },
  ];

  return (
    <div className="p-4 space-y-6 max-w-2xl mx-auto pb-24 bg-[--color-bg-base]">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-[--color-text-main] tracking-tight uppercase">Cá nhân</h1>
        <div className="bg-[--color-primary] text-black px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
          Agent Partner
        </div>
      </div>

      {/* User Header */}
      <div className="relative overflow-hidden bg-white border border-[--color-border] p-6 rounded-[--radius-2xl] card-shadow group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[--color-primary]/10 blur-[80px] rounded-full -mr-16 -mt-16"></div>
        <div className="relative flex items-center gap-5">
          <div className="w-16 h-16 bg-[--color-primary] rounded-2xl flex items-center justify-center text-black shadow-md">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-lg font-black text-[--color-text-main] uppercase tracking-tight">{user?.name || 'Đại lý'}</h2>
            <p className="text-xs text-[--color-text-secondary] mt-0.5">Mã đại lý: <span className="text-gray-800 font-bold font-mono">#{user?.id.slice(-6).toUpperCase()}</span></p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {quickStats.map((stat, idx) => (
          <Link 
            key={idx}
            to={stat.path}
            className="bg-white border border-[--color-border] p-3 sm:p-5 rounded-xl sm:rounded-2xl relative overflow-hidden text-left hover:bg-gray-50 transition-colors group block card-shadow"
          >
            <div className={`absolute -right-2 -top-2 w-12 h-12 sm:w-16 sm:h-16 ${stat.bg} rounded-full blur-2xl opacity-50`}></div>
            <div className="flex items-center justify-between mb-2 sm:mb-3 relative z-10">
               <div className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl ${stat.bg} ${stat.color}`}>
                  <stat.icon className="w-4 h-4 sm:w-5 sm:h-5" />
               </div>
            </div>
            
            <p className="text-[8px] sm:text-[10px] text-[--color-text-secondary] font-bold uppercase tracking-widest relative z-10 truncate">{stat.label}</p>
            <h3 className="text-xs sm:text-xl font-black text-[--color-text-main] mt-1 relative z-10 flex flex-wrap items-baseline gap-0.5 tracking-tight">
              {stat.isCurrency ? Math.round(stat.value).toLocaleString() : (stat.label === 'IbeePoint' ? stat.value.toLocaleString() : stat.value.toFixed(1))}
              {stat.isCurrency && <span className="text-[8px] sm:text-xs font-normal opacity-60">đ</span>}
            </h3>

            <div className="mt-2 sm:mt-4 flex flex-col relative z-10 opacity-80">
               <p className="text-[8px] sm:text-[10px] text-gray-500 font-bold uppercase tracking-tight line-clamp-1 truncate">{stat.subLabel}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Referral & Shop Section */}
      <div className="space-y-4">
        {/* Referral Link Card */}
        <div className="bg-white border border-[--color-border] p-6 rounded-[--radius-2xl] relative overflow-hidden group card-shadow">
           <div className="absolute top-0 right-0 w-32 h-32 bg-[--color-primary]/10 blur-[80px] rounded-full -mr-16 -mt-16"></div>
           <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-lg bg-[--color-primary-light] text-orange-600">
                 <Users className="w-4 h-4" />
              </div>
              <p className="text-[10px] text-[--color-text-secondary] font-bold uppercase tracking-widest">Giới thiệu tham gia</p>
           </div>
           
           <div className="space-y-4 relative z-10">
              <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl flex items-center justify-between gap-4 shadow-sm">
                 <p className="text-xs text-gray-600 truncate overflow-hidden flex-1 font-mono">{referralLink}</p>
                 <button 
                    onClick={() => handleCopy(referralLink)}
                    className={`p-2 rounded-lg transition-all ${copied ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                 >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                 </button>
              </div>

              <div className="grid grid-cols-4 gap-2">
                 <button 
                   onClick={() => handleCopy(referralLink)}
                   className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group border border-gray-100"
                 >
                    <Copy className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                    <span className="text-[8px] font-bold uppercase text-gray-500">Copy</span>
                 </button>
                 <a 
                   href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`}
                   target="_blank"
                   rel="noreferrer"
                   className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors group border border-blue-50"
                 >
                    <Facebook className="w-4 h-4 text-blue-600" />
                    <span className="text-[8px] font-bold uppercase text-blue-600/60">FB</span>
                 </a>
                 <a 
                   href={`https://social-plugins.zalo.me/share?url=${encodeURIComponent(referralLink)}`}
                   target="_blank"
                   rel="noreferrer"
                   className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-sky-50 hover:bg-sky-100 transition-colors group border border-sky-50"
                 >
                    <MessageCircle className="w-4 h-4 text-sky-500" />
                    <span className="text-[8px] font-bold uppercase text-sky-500/60">Zalo</span>
                 </a>
                 <a 
                   href={`fb-messenger://share/?link=${encodeURIComponent(referralLink)}`}
                   className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 transition-colors group border border-indigo-50"
                 >
                    <MessageSquare className="w-4 h-4 text-indigo-600" />
                    <span className="text-[8px] font-bold uppercase text-indigo-600/60">Msgr</span>
                 </a>
              </div>

              <button 
                 onClick={() => handleShare(referralLink, 'Trở thành đối tác IbeeDrop')}
                 className="w-full bg-[--color-primary] hover:bg-[--color-primary-hover] text-black py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                 <Share2 className="w-4 h-4" />
                 Lựa chọn khác
              </button>
           </div>
        </div>

        {/* Shop Link Card */}
        <div className="bg-white border border-[--color-border] p-6 rounded-[--radius-2xl] relative overflow-hidden group card-shadow">
           <div className="absolute top-0 right-0 w-32 h-32 bg-[--color-primary]/10 blur-[80px] rounded-full -mr-16 -mt-16"></div>
           <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-lg bg-[--color-primary-light] text-orange-600">
                 <ShoppingBag className="w-4 h-4" />
              </div>
              <p className="text-[10px] text-[--color-text-secondary] font-bold uppercase tracking-widest">Cửa hàng cá nhân</p>
           </div>
           
           <div className="space-y-4 relative z-10">
              <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl flex items-center justify-between gap-4 shadow-sm">
                 <p className="text-xs text-gray-600 truncate overflow-hidden flex-1 font-mono">{shopLink}</p>
                 <button 
                    onClick={() => handleCopy(shopLink)}
                    className={`p-2 rounded-lg transition-all ${copied ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                 >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                 </button>
              </div>

              <div className="grid grid-cols-4 gap-2">
                 <button 
                   onClick={() => handleCopy(shopLink)}
                   className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group border border-gray-100"
                 >
                    <Copy className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                    <span className="text-[8px] font-bold uppercase text-gray-500">Copy</span>
                 </button>
                 <a 
                   href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shopLink)}`}
                   target="_blank"
                   rel="noreferrer"
                   className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors group border border-blue-50"
                 >
                    <Facebook className="w-4 h-4 text-blue-600" />
                    <span className="text-[8px] font-bold uppercase text-blue-600/60">FB</span>
                 </a>
                 <a 
                   href={`https://social-plugins.zalo.me/share?url=${encodeURIComponent(shopLink)}`}
                   target="_blank"
                   rel="noreferrer"
                   className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-sky-50 hover:bg-sky-100 transition-colors group border border-sky-50"
                 >
                    <MessageCircle className="w-4 h-4 text-sky-500" />
                    <span className="text-[8px] font-bold uppercase text-sky-500/60">Zalo</span>
                 </a>
                 <a 
                   href={`fb-messenger://share/?link=${encodeURIComponent(shopLink)}`}
                   className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 transition-colors group border border-indigo-50"
                 >
                    <MessageSquare className="w-4 h-4 text-indigo-600" />
                    <span className="text-[8px] font-bold uppercase text-indigo-600/60">Msgr</span>
                 </a>
              </div>

              <div className="flex gap-3">
                 <button 
                    onClick={() => handleShare(shopLink, 'Mua sắm tại cửa hàng của tôi')}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                 >
                    <Share2 className="w-4 h-4" />
                    Mở rộng
                 </button>
                 <button 
                    onClick={() => window.open(shopLink, '_blank')}
                    className="px-6 bg-black text-[--color-primary] rounded-xl hover:opacity-90 transition-colors shadow-sm flex items-center justify-center"
                 >
                    <ExternalLink className="w-5 h-5" />
                 </button>
              </div>
           </div>
        </div>
      </div>

      {/* Menu Options */}
      <div className="space-y-3">
        <p className="text-[10px] text-[--color-text-secondary] font-bold uppercase tracking-widest px-4">Quản lý bán hàng</p>
        <div className="bg-white border border-[--color-border] rounded-2xl overflow-hidden divide-y divide-gray-100 card-shadow">
          <Link to="/agent/orders" className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                 <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-[--color-text-main]">Đơn hàng của tôi</p>
                <p className="text-[10px] text-[--color-text-secondary]">Lịch sử chốt đơn & Trạng thái</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </Link>
          <Link to="/agent/customers" className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
                 <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-[--color-text-main]">Khách hàng của tôi</p>
                <p className="text-[10px] text-[--color-text-secondary]">Quản lý danh sách & Doanh thu</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </Link>
          <Link to="/agent/collaborators" className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                 <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-[--color-text-main]">Cộng tác viên của tôi</p>
                <p className="text-[10px] text-[--color-text-secondary]">Quản lý mạng lưới bán hàng</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </Link>
          <Link to="/agent/points" className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-orange-500">
                 <Activity className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-[--color-text-main]">Lịch sử IbeePoint</p>
                <p className="text-[10px] text-[--color-text-secondary]">Xem chi tiết tích lũy điểm</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </Link>
          <Link to="/agent/growth-fund" className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                 <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-[--color-text-main]">Quỹ Tăng Trưởng</p>
                <p className="text-[10px] text-[--color-text-secondary]">Thu nhập thụ động từ hệ thống</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </Link>
        </div>

        <p className="text-[10px] text-[--color-text-secondary] font-bold uppercase tracking-widest px-4 mt-6">Hỗ trợ & Thông tin</p>
        <div className="bg-white border border-[--color-border] rounded-2xl overflow-hidden divide-y divide-gray-100 card-shadow">
          <Link to="/agent/about" className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600">
                 <Info className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-[--color-text-main]">Giới thiệu IbeeDrop</p>
                <p className="text-[10px] text-[--color-text-secondary]">Tìm hiểu về nền tảng & Cơ hội</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </Link>
        </div>

        <p className="text-[10px] text-[--color-text-secondary] font-bold uppercase tracking-widest px-4 mt-6">Cài đặt tài khoản</p>
        <div className="bg-white border border-[--color-border] rounded-2xl overflow-hidden divide-y divide-gray-100 card-shadow">
          <Link to="/agent/settings" className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600">
                 <User className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-[--color-text-main]">Thông tin cá nhân</p>
                <p className="text-[10px] text-[--color-text-secondary]">Hồ sơ & Tài khoản ngân hàng</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </Link>
          <button className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600">
                 <Shield className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-[--color-text-main]">Bảo mật tài khoản</p>
                <p className="text-[10px] text-[--color-text-secondary]">Mật khẩu & 2FA</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>

          <button 
            onClick={logout}
            className="w-full flex items-center justify-between p-5 text-left hover:bg-red-50 transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-600">
                 <LogOut className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-red-600">Đăng xuất</p>
                <p className="text-[10px] text-red-500">Hẹn gặp lại bạn sớm</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-red-200" />
          </button>
        </div>
      </div>

      <div className="text-center pt-8">
         <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Phiên bản 1.0.5 - iBee Agency</p>
      </div>
    </div>
  );
}

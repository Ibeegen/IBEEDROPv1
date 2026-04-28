import React from 'react';
import { Outlet, Navigate, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, MessageSquare, Package, ShoppingCart, LogOut, Image, Megaphone, BarChart3, Building2 } from 'lucide-react';
import { useAuth } from '../store/useAuth';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menu = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: Package, label: 'Sản phẩm', path: '/admin/products' },
    { icon: ShoppingCart, label: 'Đơn hàng', path: '/admin/orders' },
    { icon: Users, label: 'Đại lý', path: '/admin/users' },
    { icon: Image, label: 'Banner', path: '/admin/banners' },
    { icon: Megaphone, label: 'Khuyến mãi', path: '/admin/promotions' },
    { icon: BarChart3, label: 'Tài chính', path: '/admin/finance' },
    { icon: Building2, label: 'Nhà cung cấp', path: '/admin/suppliers' },
    { icon: MessageSquare, label: 'Chat', path: '/admin/chat' },
  ];

  return (
    <div className="min-h-screen bg-[--color-bg-base] text-[--color-text-main] flex flex-col md:flex-row font-sans pb-16 md:pb-0">
      {/* Mobile Header */}
      <header className="md:hidden h-14 bg-[--color-primary] border-b border-[--color-border] flex items-center px-4 justify-between sticky top-0 z-50">
        <span className="font-black text-black tracking-tight uppercase">Admin Portal</span>
        <button onClick={handleLogout} className="text-black/70 hover:text-black">
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      {/* Desktop Sidebar / Mobile Bottom Nav (simplified for admin) */}
      <aside className="hidden md:flex w-64 bg-white border-r border-[--color-border] flex-col">
        <div className="h-16 flex items-center px-6 border-b border-[--color-border] bg-[--color-primary]">
          <span className="font-black text-xl text-black uppercase tracking-tight">IbeeDrop Admin</span>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-bold ${
                  isActive ? 'bg-[--color-primary-light] text-orange-600' : 'text-[--color-text-secondary] hover:bg-gray-50 hover:text-[--color-text-main]'
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-[--color-border] bg-white">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-xl text-red-500 hover:bg-red-50 transition-colors text-sm font-bold"
          >
            <LogOut className="w-4 h-4" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>

      {/* Mobile Bottom Nav for Admin */}
      <nav className="md:hidden fixed bottom-0 w-full h-16 bg-white border-t border-[--color-border] flex items-center overflow-x-auto px-2 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] hide-scrollbar">
        {menu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/admin'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 p-2 min-w-[70px] transition-colors ${
                isActive ? 'text-[--color-primary-hover]' : 'text-gray-400'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[9px] font-bold uppercase tracking-widest truncate w-full text-center">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

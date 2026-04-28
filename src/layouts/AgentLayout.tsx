import React from 'react';
import { Outlet, Navigate, NavLink } from 'react-router-dom';
import { Home, Package, MessageSquare, User } from 'lucide-react';
import { useAuth } from '../store/useAuth';

export default function AgentLayout() {
  const { user } = useAuth();

  if (!user || user.role !== 'agent') {
    return <Navigate to="/agent/login" replace />;
  }

  const navItems = [
    { icon: Home, label: 'Trang chủ', path: '/agent' },
    { icon: Package, label: 'Sản phẩm', path: '/agent/products' },
    { icon: MessageSquare, label: 'Chat', path: '/agent/chat' },
    { icon: User, label: 'Cá nhân', path: '/agent/profile' },
  ];

  return (
    <div className="min-h-screen bg-[--color-bg-base] text-slate-900 flex flex-col font-sans">
      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>
      
      <nav className="fixed bottom-0 w-full h-16 bg-white border-t border-[--color-border] flex items-center justify-around px-2 z-50 card-shadow">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/agent'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 p-2 transition-colors ${
                isActive ? 'text-black' : 'text-[#9CA3AF]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={`w-5 h-5 ${isActive ? 'text-[--color-primary]' : ''}`} />
                <span className="text-[10px] font-bold">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

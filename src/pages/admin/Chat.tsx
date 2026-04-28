import React from 'react';
import ChatPanel from '../shared/ChatPanel';

export default function AdminChat() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Quản Lý Trò Chuyện</h1>
        <p className="text-slate-500">Hỗ trợ đại lý và thảo luận nội bộ.</p>
      </div>
      <ChatPanel />
    </div>
  );
}

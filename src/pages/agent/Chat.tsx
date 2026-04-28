import React from 'react';
import ChatPanel from '../shared/ChatPanel';

export default function AgentChat() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Chat Nội Bộ</h1>
        <p className="text-slate-500">Trao đổi với Quản trị viên và các Đại lý khác trong hệ thống.</p>
      </div>
      <ChatPanel />
    </div>
  );
}

import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, MessageSquare, Plus, Search, Send, User, Users, X } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { AnimatePresence, motion } from 'motion/react';
import { io, Socket } from 'socket.io-client';
import { api } from '../../services/api';
import { useAuth } from '../../store/useAuth';

interface Conversation {
  id: string;
  isGroup: boolean;
  name?: string;
  partner?: {
    id: string;
    fullName: string;
    role: string;
    avatar?: string;
  };
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
}

interface Message {
  _id: string;
  conversationId: string;
  senderId: any;
  receiverId?: string;
  content: string;
  createdAt: string;
  isRead?: boolean;
}

interface UserSummary {
  id: string;
  fullName: string;
  role: string;
  phoneNumber: string;
  avatar?: string;
}

export default function ChatPanel() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [allUsers, setAllUsers] = useState<UserSummary[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [chatError, setChatError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  const getInitials = (name?: string) => {
    if (!name) return '??';
    return name.split(' ').map((part) => part[0]).join('').toUpperCase().slice(0, 2);
  };

  const getAvatarBg = (role?: string) => {
    if (role === 'admin') return 'bg-[#FFD400] text-black';
    return 'bg-blue-500 text-white';
  };

  const fetchConversations = async () => {
    try {
      setChatError('');
      const res = await api.get('/messages/conversations');
      setConversations(res.data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setChatError('Không thể tải danh sách hội thoại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      setChatError('');
      const res = await api.get('/messages/contacts');
      setAllUsers(res.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setChatError('Không thể tải danh sách thành viên.');
    }
  };

  const fetchMessages = async (convId: string) => {
    try {
      setChatError('');
      const res = await api.get(`/messages/${convId}`);
      setMessages(res.data);
      await api.put(`/messages/read/${convId}`);
      fetchConversations();
    } catch (error) {
      console.error('Error fetching messages:', error);
      setChatError('Không thể tải tin nhắn của cuộc hội thoại này.');
    }
  };

  useEffect(() => {
    fetchConversations();
    const socket = io(window.location.origin);
    socketRef.current = socket;

    socket.on('connect', () => {
      if (user?.id) socket.emit('join', user.id);
    });

    socket.on('new_message', (msg: Message) => {
      setSelectedConv((prev) => {
        if (prev?.id === msg.conversationId) {
          setMessages((prevMsgs) => {
            if (prevMsgs.some((m) => m._id === msg._id)) return prevMsgs;
            return [...prevMsgs, msg];
          });
          api.put(`/messages/read/${msg.conversationId}`).then(() => fetchConversations());
        } else {
          fetchConversations();
        }
        return prev;
      });
    });

    socket.on('update_contacts', fetchConversations);

    return () => {
      socket.disconnect();
    };
  }, [user?.id]);

  useEffect(() => {
    if (selectedConv) {
      fetchMessages(selectedConv.id);
      if (window.innerWidth < 768) setShowSidebar(false);
    }
  }, [selectedConv?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConv) return;

    const text = newMessage.trim();
    setNewMessage('');

    try {
      setChatError('');
      const res = await api.post('/messages', {
        conversationId: selectedConv.id,
        receiverId: selectedConv.isGroup ? null : selectedConv.partner?.id,
        content: text,
      });
      setMessages((prev) => [...prev, res.data]);
      fetchConversations();
    } catch (error: any) {
      console.error('Error sending message:', error);
      setNewMessage(text);
      setChatError(error?.response?.data?.message || 'Không thể gửi tin nhắn. Vui lòng thử lại.');
    }
  };

  const startNewChat = async (partnerId: string) => {
    try {
      setChatError('');
      const res = await api.post('/messages/conversations', { partnerId });
      setSelectedConv(res.data);
      setIsNewChatModalOpen(false);
      setUserSearchTerm('');
      fetchConversations();
    } catch (error: any) {
      console.error('Error starting chat:', error);
      setChatError(error?.response?.data?.message || 'Không thể tạo cuộc trò chuyện mới.');
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    const nameToSearch = conv.isGroup ? conv.name : conv.partner?.fullName;
    return nameToSearch?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredUsers = allUsers.filter((u) =>
    u.fullName.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    u.phoneNumber.includes(userSearchTerm)
  );

  return (
    <div className="flex bg-[#F5F6F8] rounded-2xl shadow-xl border border-slate-200 overflow-hidden h-full max-h-[85vh] relative font-sans">
      {chatError && (
        <div className="absolute left-4 right-4 top-4 z-[120] bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3 text-sm font-semibold shadow-lg flex items-center justify-between gap-3">
          <span>{chatError}</span>
          <button onClick={() => setChatError('')} className="p-1 hover:bg-red-100 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className={`${showSidebar ? 'flex' : 'hidden md:flex'} w-full md:w-80 lg:w-96 border-r border-slate-200 flex-col bg-white shrink-0`}>
        <div className="p-5 border-b border-slate-100 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <div className="p-1.5 bg-[#FFD400] rounded-lg">
                <MessageSquare className="w-5 h-5 text-black" />
              </div>
              Chat
            </h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                fetchAllUsers();
                setIsNewChatModalOpen(true);
              }}
              className="w-10 h-10 bg-[#FFD400] text-black rounded-xl flex items-center justify-center hover:shadow-lg transition-all"
              title="Tạo chat mới"
            >
              <Plus className="w-6 h-6" />
            </motion.button>
          </div>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm cuộc trò chuyện..."
              className="w-full pl-11 pr-4 py-2.5 bg-[#F5F6F8] border-none rounded-xl text-sm focus:ring-2 focus:ring-[#FFD400] transition-all outline-none text-slate-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 gap-3">
              <div className="w-10 h-10 border-4 border-slate-200 border-t-[#FFD400] rounded-full animate-spin" />
              <p className="text-slate-400 text-sm font-medium">Đang tải...</p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-slate-900 font-bold mb-1">Không thấy cuộc hội thoại nào</h3>
              <p className="text-slate-400 text-xs">Hãy thử tìm kiếm với từ khóa khác hoặc tạo chat mới</p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConv(conv)}
                  className={`w-full p-3.5 flex items-start gap-4 rounded-xl transition-all border border-transparent group ${selectedConv?.id === conv.id ? 'bg-white shadow-md border-slate-100 ring-2 ring-[#FFD400]/20' : 'hover:bg-slate-50 active:scale-[0.98]'}`}
                >
                  <div className="relative shrink-0">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md border-2 border-white transition-transform group-hover:scale-105 ${conv.isGroup ? 'bg-slate-800' : getAvatarBg(conv.partner?.role)}`}>
                      {conv.isGroup ? <Users className="w-7 h-7" /> : getInitials(conv.partner?.fullName)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center h-14">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <span className="font-bold text-slate-900 truncate text-[15px]">
                        {conv.isGroup ? conv.name : conv.partner?.fullName}
                      </span>
                      {conv.lastMessageAt && (
                        <span className="text-[10px] text-slate-400 font-medium ml-2">
                          {format(new Date(conv.lastMessageAt), 'HH:mm', { locale: vi })}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className={`text-[13px] truncate leading-tight flex-1 ${conv.unreadCount > 0 ? 'text-slate-900 font-bold' : 'text-slate-500 font-normal'}`}>
                        {conv.lastMessage || 'Bắt đầu trò chuyện ngay!'}
                      </p>
                      {conv.unreadCount > 0 && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="min-w-[20px] h-5 bg-[#FFD400] text-black text-[10px] flex items-center justify-center rounded-full font-black px-1.5 ml-2">
                          {conv.unreadCount}
                        </motion.div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={`${!showSidebar ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-[#F5F6F8]`}>
        {selectedConv ? (
          <>
            <header className="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between z-20 shadow-sm sticky top-0">
              <div className="flex items-center gap-4">
                <button onClick={() => setShowSidebar(true)} className="md:hidden p-2 hover:bg-slate-50 rounded-xl transition-colors">
                  <ArrowLeft className="w-6 h-6 text-slate-600" />
                </button>
                <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md ${selectedConv.isGroup ? 'bg-slate-800' : getAvatarBg(selectedConv.partner?.role)}`}>
                  {selectedConv.isGroup ? <Users className="w-5 h-5" /> : getInitials(selectedConv.partner?.fullName)}
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-lg leading-none mb-1">
                    {selectedConv.isGroup ? selectedConv.name : selectedConv.partner?.fullName}
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                      {selectedConv.isGroup ? 'Đang hoạt động' : 'Trực tuyến'}
                    </span>
                  </div>
                </div>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar scroll-smooth">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="p-8 bg-white rounded-3xl shadow-lg border border-slate-100 flex flex-col items-center gap-4 max-w-xs text-center">
                    <div className="p-5 bg-[#FFD400]/10 rounded-2xl">
                      <MessageSquare className="w-10 h-10 text-[#FFD400]" />
                    </div>
                    <p className="text-sm font-bold text-slate-800">Bắt đầu cuộc trò chuyện ngay bây giờ!</p>
                  </motion.div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {messages.map((msg) => {
                    const senderId = typeof msg.senderId === 'string' ? msg.senderId : msg.senderId?._id;
                    const isMe = senderId === user?.id;
                    const senderName = typeof msg.senderId === 'object' ? msg.senderId?.name : '';
                    return (
                      <div key={msg._id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        {selectedConv.isGroup && !isMe && senderName && (
                          <span className="text-[10px] text-slate-500 mb-1.5 ml-1 font-black uppercase tracking-widest">{senderName}</span>
                        )}
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 shadow-sm ${isMe ? 'bg-[#FFD400] text-black font-medium rounded-tr-sm' : 'bg-white text-slate-800 border border-slate-100 rounded-tl-sm'}`}>
                          <p className="text-[14px] md:text-[15px] leading-relaxed break-words">{msg.content}</p>
                        </motion.div>
                        <div className="mt-1 text-[9px] font-bold uppercase tracking-widest text-slate-400">
                          {format(new Date(msg.createdAt), 'HH:mm', { locale: vi })}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            <div className="p-4 md:p-6 bg-white border-t border-slate-100 shadow-[0_-4px_30px_rgba(0,0,0,0.03)] z-20">
              <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex gap-3 relative">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Nhập nội dung tin nhắn..."
                  className="flex-1 pl-5 pr-5 py-4 bg-[#F5F6F8] border-2 border-transparent rounded-2xl focus:border-[#FFD400] transition-all text-[15px] outline-none text-slate-800 placeholder:text-slate-400 font-medium"
                />
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="submit" disabled={!newMessage.trim()} className="w-14 h-14 bg-[#FFD400] text-black rounded-2xl flex items-center justify-center disabled:grayscale disabled:opacity-50 transition-all shadow-[0_10px_20px_rgba(255,212,0,0.3)]">
                  <Send className="w-6 h-6 rotate-12" />
                </motion.button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-[#F5F6F8] p-12 text-center overflow-hidden">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative max-w-sm">
              <div className="w-32 h-32 bg-white rounded-[40px] flex items-center justify-center shadow-2xl mb-8 mx-auto rotate-12 ring-8 ring-[#FFD400]/5">
                <MessageSquare className="w-16 h-16 text-[#FFD400]" />
              </div>
              <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight leading-tighter">HỆ THỐNG CHAT NIỀM TIN</h2>
              <p className="text-slate-500 font-medium leading-relaxed">Chọn một cuộc hội thoại hoặc nhấn nút + để bắt đầu.</p>
            </motion.div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isNewChatModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsNewChatModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 30 }} className="bg-white rounded-[32px] w-full max-w-md shadow-2xl relative z-[101] flex flex-col max-h-[85vh] overflow-hidden border border-slate-100">
              <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-white sticky top-0 z-10">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Tạo chat mới</h3>
                <button onClick={() => setIsNewChatModalOpen(false)} className="w-10 h-10 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-full flex items-center justify-center transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Tìm theo tên hoặc số điện thoại..."
                    className="w-full pl-12 pr-4 py-3.5 bg-[#F5F6F8] border-none rounded-2xl text-[15px] focus:ring-2 focus:ring-[#FFD400] transition-all outline-none font-medium"
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                {filteredUsers.map((u) => (
                  <button key={u.id} onClick={() => startNewChat(u.id)} className="w-full p-4 flex items-center gap-4 hover:bg-[#F5F6F8] transition-all rounded-2xl text-left border border-transparent hover:border-slate-100 group active:scale-[0.98]">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md ${getAvatarBg(u.role)}`}>
                      {getInitials(u.fullName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-900 group-hover:text-black">{u.fullName}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider ${u.role === 'admin' ? 'bg-[#FFD400] text-black' : 'bg-blue-100 text-blue-700'}`}>
                          {u.role === 'admin' ? 'Quản trị' : 'Đại lý'}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">{u.phoneNumber}</span>
                      </div>
                    </div>
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      <Plus className="w-4 h-4 text-[#FFD400]" />
                    </div>
                  </button>
                ))}

                {allUsers.length === 0 && (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="w-8 h-8 text-slate-200" />
                    </div>
                    <p className="text-slate-400 font-medium">Đang tải danh sách thành viên...</p>
                  </div>
                )}

                {allUsers.length > 0 && filteredUsers.length === 0 && (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-slate-200" />
                    </div>
                    <p className="text-slate-500 font-bold">Không tìm thấy thành viên phù hợp</p>
                    <p className="text-slate-400 text-xs mt-1">Thử tìm bằng tên hoặc số điện thoại khác.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #CBD5E0; }
      `}</style>
    </div>
  );
}

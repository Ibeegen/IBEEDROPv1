import React from 'react';
import { Link } from 'react-router-dom';
import { Package, LineChart, ShieldCheck, Wallet } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F5F6F8] font-sans text-[#111827]">
      {/* Header */}
      <header className="bg-white border-b border-[#E5E7EB] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#FFD400] rounded flex items-center justify-center font-bold text-black">
              ID
            </div>
            <span className="font-bold text-xl tracking-tight">IbeeDrop</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link to="/agent/login" className="text-sm font-medium text-[#6B7280] hover:text-[#111827] transition-colors">
              Đăng nhập đại lý
            </Link>
            <Link to="/dang-ky-dai-ly" className="text-sm font-bold bg-[#FFD400] hover:bg-[#FFC400] text-[#111827] px-4 py-2 rounded-lg transition-colors">
              Đăng ký ngay
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight text-[#111827]">
            IbeeDrop — Nền tảng giúp đại lý kinh doanh online không cần ôm kho
          </h1>
          <p className="text-lg text-[#6B7280] mb-8 leading-relaxed max-w-2xl mx-auto">
            Bạn tập trung bán hàng. IbeeDrop hỗ trợ sản phẩm, vận hành đơn hàng và chính sách hoa hồng hấp dẫn. Bắt đầu sự nghiệp kinh doanh của bạn ngay hôm nay với số vốn 0 đồng.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/dang-ky-dai-ly" className="w-full sm:w-auto px-8 py-3.5 bg-[#111827] hover:bg-black text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl text-lg relative overflow-hidden group">
              <span className="relative z-10">Đăng ký làm đại lý</span>
              <div className="absolute inset-0 bg-[#FFD400] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                 <span className="text-black font-bold">Đăng ký làm đại lý</span>
              </div>
            </Link>
            <Link to="/agent/login" className="w-full sm:w-auto px-8 py-3.5 bg-white border border-[#E5E7EB] hover:bg-gray-50 text-[#111827] font-bold rounded-xl transition-all text-lg">
              Đăng nhập đại lý
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Lợi ích khi tham gia IbeeDrop</h2>
            <p className="text-[#6B7280]">Giải pháp toàn diện cho người bán hàng online</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                icon: Package,
                title: 'Không ôm hàng',
                desc: 'Khởi nghiệp với vốn 0 đồng. Không lo tồn kho, không lo đóng gói và giao hàng.'
              },
              {
                icon: ShieldCheck,
                title: 'Nguồn hàng uy tín',
                desc: 'Hàng ngàn sản phẩm có sẵn từ các nhà cung cấp đáng tin cậy đã qua kiểm duyệt.'
              },
              {
                icon: LineChart,
                title: 'Theo dõi minh bạch',
                desc: 'Quản lý đơn hàng, theo dõi giao hàng và đối soát doanh thu real-time trên app.'
              },
              {
                icon: Wallet,
                title: 'Hoa hồng hấp dẫn',
                desc: 'Chính sách chiết khấu tốt nhất. Tích điểm thưởng và tham gia Quỹ tăng trưởng IbeeDrop.'
              }
            ].map((item, i) => (
              <div key={i} className="bg-[#F5F6F8] p-6 rounded-2xl flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-[#FFD400] rounded-xl flex items-center justify-center text-black mb-4">
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-[#6B7280]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 bg-[#FFF4B5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-12 text-center text-black">Quy trình bắt đầu dễ dàng</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { step: '01', title: 'Đăng ký', desc: 'Điền form thông tin' },
              { step: '02', title: 'Chờ duyệt', desc: 'Admin xét duyệt tài khoản' },
              { step: '03', title: 'Nhận tài khoản', desc: 'Đăng nhập vào hệ thống' },
              { step: '04', title: 'Bán hàng', desc: 'Bắt đầu tạo đơn và kiếm tiền' }
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="w-16 h-16 mx-auto bg-black text-[#FFD400] font-black text-2xl rounded-2xl flex items-center justify-center mb-4 relative z-10 shadow-lg">
                  {item.step}
                </div>
                <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                <p className="text-sm text-gray-700">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Target Audience Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Nền tảng này dành cho ai?</h2>
          <p className="text-[#6B7280] mb-10">IbeeDrop được thiết kế để phù hợp với mọi cá nhân muốn kinh doanh.</p>
          <div className="flex flex-wrap justify-center gap-4">
            {['Người bán online', 'Chủ shop nhỏ', 'Cộng tác viên', 'KOL/KOC', 'Người làm văn phòng muốn kinh doanh thêm', 'Mẹ bỉm sữa'].map((audience, i) => (
              <span key={i} className="px-5 py-2.5 bg-[#F5F6F8] border border-[#E5E7EB] text-[#111827] font-medium rounded-full text-sm">
                {audience}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-20 bg-[#111827] text-white text-center px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-6">Sẵn sàng gia nhập IbeeDrop?</h2>
          <p className="text-gray-400 mb-8">Bắt đầu hành trình bán hàng không rủi ro với mức thưởng hoa hồng cao nhất nhì thị trường.</p>
          <Link to="/dang-ky-dai-ly" className="inline-block px-10 py-4 bg-[#FFD400] hover:bg-[#FFC400] text-black font-bold rounded-xl transition-transform hover:scale-105 text-lg shadow-[0_0_20px_rgba(255,212,0,0.3)]">
            Trở thành đại lý IbeeDrop ngay hôm nay
          </Link>
        </div>
      </section>
      
      {/* Simple Footer */}
      <footer className="bg-black text-gray-500 py-6 text-center text-sm">
        <p>&copy; {new Date().getFullYear()} IbeeDrop. Mọi quyền được bảo lưu.</p>
      </footer>
    </div>
  );
}

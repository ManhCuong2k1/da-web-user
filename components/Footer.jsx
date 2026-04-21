import { Layout } from 'antd';
import Image from 'next/image';

const { Footer: AntFooter } = Layout;

const aboutLinks = [
  { label: 'Về chúng tôi', href: '#' },
  { label: 'Chính sách giao dịch chung', href: '#' },
  { label: 'Chính sách đổi trả', href: '#' },
  { label: 'Chính sách giao hàng và thanh toán', href: '#' },
];
const guideLinks = [
  { label: 'Câu hỏi thường gặp', href: '/account/help' },
  { label: 'Trung tâm hỗ trợ', href: '/account/help' },
];

export default function Footer() {
  return (
    <AntFooter className="!bg-[#fff7f0] !border-0 !p-0 mt-8">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row md:justify-between md:items-start gap-10 md:gap-0">
          <div className="flex flex-col items-center md:items-start md:w-1/3 gap-3 md:gap-4">
            <Image src="/logo.png" alt="OS-User" width={120} height={40} className="object-contain mb-2" />
            <span className="text-orange-500 text-base italic md:text-lg">Kiếm tiền không giới hạn</span>
          </div>

          <div className="flex flex-row justify-center md:justify-start md:w-2/3 gap-10 md:gap-20">
            <div className="flex flex-col items-center md:items-start gap-2 md:gap-3">
              <div className="text-orange-500 font-bold text-lg mb-2 md:mb-3">GIỚI THIỆU</div>
              <ul className="space-y-1 md:space-y-2">
                {aboutLinks.map((l, i) => (
                  <li key={i}><a href={l.href} className="text-gray-700 hover:text-orange-500 transition text-sm md:text-base">{l.label}</a></li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col items-center md:items-start gap-2 md:gap-3">
              <div className="text-orange-500 font-bold text-lg mb-2 md:mb-3">THÔNG TIN HƯỚNG DẪN</div>
              <ul className="space-y-1 md:space-y-2">
                {guideLinks.map((l, i) => (
                  <li key={i}><a href={l.href} className="text-gray-700 hover:text-orange-500 transition text-sm md:text-base">{l.label}</a></li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="w-full max-w-6xl mx-auto mt-10 border-t border-orange-100 pt-6 text-center text-gray-400 text-sm">
          © {new Date().getFullYear()} <span className="text-orange-500 font-semibold">OS-User</span> - Nền tảng mua sắm trực tuyến tiện lợi, an toàn và nhanh chóng.
        </div>
      </div>
    </AntFooter>
  );
}

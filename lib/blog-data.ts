export type Post = {
  slug: string
  title: string
  excerpt: string
  category: string
  readTime: string
  views: string
  accent: string // tailwind bg for the cover block
  badge: string // tailwind bg+text for category badge
}

export const CATEGORIES = [
  'Tất cả',
  'Chấm công',
  'Bảo hiểm xã hội',
  'Lương & Thuế',
  'Nội quy',
  'Tips làm việc',
  'Sản phẩm',
]

export const FEATURED: Post = {
  slug: 'easyhrm-cham-cong',
  title: 'Hướng dẫn chấm công bằng EasyHRM từ A-Z',
  excerpt:
    'Tất tần tật về cách chấm công vào/ra, đăng ký công tác, xin nghỉ và giải trình trên EasyHRM — dành riêng cho nhân viên mới của SoftDreams.',
  category: 'Chấm công',
  readTime: '5 phút',
  views: '1.2k',
  accent: 'bg-primary/10',
  badge: 'bg-primary text-white',
}

export const POSTS: Post[] = [
  {
    slug: 'dang-ky-bhxh',
    title: 'Quy trình đăng ký và đóng BHXH tại SoftDreams',
    excerpt:
      'Các bước đăng ký bảo hiểm xã hội, mức đóng và quyền lợi bạn được hưởng khi trở thành nhân viên chính thức.',
    category: 'Bảo hiểm xã hội',
    readTime: '8 phút',
    views: '860',
    accent: 'bg-blue-50',
    badge: 'bg-blue-600 text-white',
  },
  {
    slug: 'thue-tncn-nhan-vien-moi',
    title: 'Thuế TNCN: Điều nhân viên mới cần biết ngay',
    excerpt:
      'Cách tính thuế thu nhập cá nhân, các khoản giảm trừ và lịch quyết toán thuế hàng năm.',
    category: 'Lương & Thuế',
    readTime: '6 phút',
    views: '740',
    accent: 'bg-amber-50',
    badge: 'bg-amber-600 text-white',
  },
  {
    slug: 'dang-ky-nghi-phep',
    title: 'Cách đăng ký nghỉ phép và làm thêm giờ đúng quy trình',
    excerpt:
      'Hướng dẫn chi tiết quy trình xin nghỉ phép, OT và các lưu ý để được duyệt nhanh chóng.',
    category: 'Nội quy',
    readTime: '4 phút',
    views: '910',
    accent: 'bg-primary/10',
    badge: 'bg-primary text-white',
  },
  {
    slug: 'tips-lam-viec-it',
    title: '5 tips làm việc hiệu quả trong môi trường IT',
    excerpt:
      'Những thói quen nhỏ giúp bạn quản lý thời gian, tập trung sâu và phối hợp tốt với team.',
    category: 'Tips làm việc',
    readTime: '3 phút',
    views: '1.5k',
    accent: 'bg-green-50',
    badge: 'bg-green-600 text-white',
  },
  {
    slug: 'kham-pha-6-san-pham',
    title: 'Khám phá 6 sản phẩm SoftDreams — Bạn làm việc với cái nào?',
    excerpt:
      'Tổng quan hệ sinh thái EasyInvoice, EasyBooks, EasyCA, EasyPOS, EasyDocs và EasyHRM.',
    category: 'Sản phẩm',
    readTime: '7 phút',
    views: '680',
    accent: 'bg-purple-50',
    badge: 'bg-purple-600 text-white',
  },
  {
    slug: 'giai-trinh-cham-cong',
    title: 'Khi nào cần giải trình chấm công và làm thế nào?',
    excerpt:
      'Quy định 3 lần giải trình mỗi tháng, các trường hợp áp dụng và cách thao tác trên hệ thống.',
    category: 'Chấm công',
    readTime: '4 phút',
    views: '520',
    accent: 'bg-rose-50',
    badge: 'bg-rose-600 text-white',
  },
]

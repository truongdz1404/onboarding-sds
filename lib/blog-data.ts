export type Post = {
  slug: string
  title: string
  excerpt: string
  category: string
  readTime: string
  views: string
  accent: string
  badge: string
  coverImage?: string
}

export type BlogSection = {
  heading: string
  body: string[]
  bullets?: string[]
  image?: string
}

export type BlogPostDetail = Post & {
  author: string
  authorRole: string
  publishedAt: string
  updatedAt: string
  heroLabel: string
  takeaway: string
  tableOfContents: string[]
  sections: BlogSection[]
  checklist: string[]
  relatedSlugs: string[]
  coverImage?: string
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
    'Tất tần tật về cách chấm công vào/ra, đăng ký công tác, xin nghỉ và giải trình trên EasyHRM dành riêng cho nhân viên mới của SoftDreams.',
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
      'Cách tính thuế thu nhập cá nhân, các khoản giảm trừ và lịch quyết toán thuế hằng năm.',
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
    title: 'Khám phá 6 sản phẩm SoftDreams: Bạn làm việc với cái nào?',
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

const baseDetails = {
  author: 'Phòng Nhân sự',
  authorRole: 'People Operations',
  publishedAt: '2026-06-22',
  updatedAt: '2026-06-22',
}

export const BLOG_DETAILS: BlogPostDetail[] = [
  {
    ...FEATURED,
    ...baseDetails,
    heroLabel: 'Cẩm nang ngày đầu',
    takeaway:
      'Chỉ cần nhớ 3 việc: chấm công đúng thời điểm, gửi đơn trên EasyHRM trước khi nghỉ, và giải trình ngay khi có sai lệch.',
    tableOfContents: ['Chấm công hằng ngày', 'Đăng ký nghỉ/công tác', 'Giải trình sai lệch', 'Checklist cuối ngày'],
    sections: [
      {
        heading: 'Chấm công hằng ngày',
        body: [
          'EasyHRM là nơi ghi nhận thời gian vào/ra và là dữ liệu gốc để đối soát công. Nhân viên nên tạo thói quen chấm công ngay khi bắt đầu và kết thúc ca làm việc, đặc biệt trong tuần đầu onboarding.',
          'Nếu làm việc tại văn phòng, hãy kiểm tra kết nối mạng nội bộ hoặc thiết bị chấm công theo hướng dẫn của team hành chính. Nếu làm việc từ xa hoặc đi công tác, bạn cần chọn đúng loại đăng ký để dữ liệu không bị tính thiếu.',
        ],
        bullets: ['Kiểm tra trạng thái chấm công sau mỗi lần thao tác.', 'Không nhờ người khác chấm công hộ.', 'Báo HR nếu hệ thống không ghi nhận trong ngày.'],
      },
      {
        heading: 'Đăng ký nghỉ phép, công tác và làm từ xa',
        body: [
          'Các đơn liên quan đến thời gian làm việc nên được tạo trên EasyHRM càng sớm càng tốt. Việc này giúp quản lý chủ động sắp xếp công việc, đồng thời tránh thiếu dữ liệu khi chốt công cuối tháng.',
          'Với nghỉ phép có kế hoạch, hãy gửi đơn trước tối thiểu một ngày làm việc. Với tình huống phát sinh, bạn vẫn cần cập nhật đơn ngay khi có thể và trao đổi trực tiếp với quản lý.',
        ],
        bullets: ['Chọn đúng loại đơn.', 'Điền lý do ngắn gọn, rõ ràng.', 'Theo dõi trạng thái duyệt trước ngày nghỉ.'],
      },
      {
        heading: 'Giải trình khi có sai lệch',
        body: [
          'Sai lệch thường đến từ quên chấm công, chấm nhầm vị trí, đi muộn có lý do hoặc hệ thống chưa đồng bộ. Khi thấy dữ liệu bất thường, bạn nên gửi giải trình trong tháng phát sinh.',
          'Nội dung giải trình cần có thời gian thực tế, nguyên nhân và người xác nhận nếu cần. Càng rõ ràng, HR và quản lý càng xử lý nhanh.',
        ],
      },
      {
        heading: 'Checklist cuối ngày',
        body: [
          'Trước khi rời văn phòng hoặc kết thúc ca làm từ xa, hãy mở EasyHRM kiểm tra nhanh trạng thái công trong ngày. Thao tác này chỉ mất một phút nhưng giúp tránh rất nhiều trao đổi bổ sung cuối tháng.',
        ],
      },
    ],
    checklist: ['Đã chấm công vào/ra.', 'Đơn nghỉ/công tác đã được tạo đúng loại.', 'Sai lệch được giải trình trong tháng.', 'Thông báo cho quản lý nếu có lịch làm việc đặc biệt.'],
    relatedSlugs: ['giai-trinh-cham-cong', 'dang-ky-nghi-phep'],
  },
  {
    ...POSTS[0],
    ...baseDetails,
    heroLabel: 'Phúc lợi bắt buộc',
    takeaway:
      'BHXH là quyền lợi dài hạn của bạn. Hãy nộp đủ hồ sơ cá nhân, kiểm tra thông tin định danh và theo dõi trạng thái sau khi ký hợp đồng chính thức.',
    tableOfContents: ['Hồ sơ cần chuẩn bị', 'Mốc thời gian đăng ký', 'Mức đóng và quyền lợi', 'Cách kiểm tra thông tin'],
    sections: [
      {
        heading: 'Hồ sơ cần chuẩn bị',
        body: [
          'Khi trở thành nhân viên chính thức, bạn cần cung cấp thông tin cá nhân chính xác để HR hoàn tất thủ tục bảo hiểm. Các dữ liệu như họ tên, ngày sinh, số CCCD và địa chỉ phải khớp với giấy tờ định danh.',
          'Nếu đã từng tham gia BHXH ở công ty khác, hãy cung cấp mã số BHXH hiện có để tránh tạo trùng hồ sơ.',
        ],
        bullets: ['CCCD còn hiệu lực.', 'Mã số BHXH nếu đã có.', 'Thông tin tài khoản cá nhân dùng cho tra cứu VssID.'],
      },
      {
        heading: 'Mốc thời gian đăng ký',
        body: [
          'HR tổng hợp hồ sơ theo kỳ payroll và thực hiện đăng ký theo quy định hiện hành. Bạn nên phản hồi yêu cầu bổ sung thông tin sớm để không bị lùi kỳ tham gia.',
          'Sau khi đăng ký thành công, thông tin tham gia thường cần thêm thời gian để hiển thị trên cổng tra cứu hoặc ứng dụng VssID.',
        ],
      },
      {
        heading: 'Mức đóng và quyền lợi',
        body: [
          'Khoản đóng BHXH, BHYT và BHTN được tính dựa trên mức lương đóng bảo hiểm theo hợp đồng và quy định pháp luật. Phần người lao động đóng sẽ được thể hiện trong bảng lương hằng tháng.',
          'Quyền lợi bao gồm khám chữa bệnh theo BHYT, chế độ ốm đau, thai sản, tai nạn lao động, thất nghiệp và hưu trí theo điều kiện áp dụng.',
        ],
      },
      {
        heading: 'Cách kiểm tra thông tin',
        body: [
          'Bạn có thể dùng VssID hoặc cổng thông tin BHXH Việt Nam để kiểm tra quá trình tham gia. Nếu thấy sai thông tin, hãy chụp lại màn hình và gửi HR để được hỗ trợ đối soát.',
        ],
      },
    ],
    checklist: ['Gửi đủ thông tin cá nhân cho HR.', 'Cung cấp mã số BHXH cũ nếu có.', 'Kiểm tra bảng lương có dòng bảo hiểm.', 'Tra cứu lại trên VssID sau kỳ đăng ký.'],
    relatedSlugs: ['thue-tncn-nhan-vien-moi', 'easyhrm-cham-cong'],
  },
  {
    ...POSTS[1],
    ...baseDetails,
    heroLabel: 'Payroll basics',
    takeaway:
      'Thuế TNCN không đáng sợ nếu bạn hiểu thu nhập tính thuế, các khoản giảm trừ và thời điểm quyết toán.',
    tableOfContents: ['Thu nhập tính thuế', 'Giảm trừ thường gặp', 'Cam kết và quyết toán', 'Bạn cần làm gì'],
    sections: [
      {
        heading: 'Thu nhập tính thuế gồm những gì?',
        body: [
          'Thu nhập tính thuế thường bắt đầu từ tiền lương, tiền công và các khoản có tính chất lương. Một số khoản phúc lợi hoặc hỗ trợ có thể có quy định riêng tùy chính sách và pháp luật từng thời điểm.',
          'Bảng lương hằng tháng là nguồn tham chiếu quan trọng nhất. Khi chưa rõ một khoản thu nhập được tính như thế nào, bạn nên hỏi HR hoặc Payroll trước kỳ chốt lương.',
        ],
      },
      {
        heading: 'Các khoản giảm trừ thường gặp',
        body: [
          'Nhân viên có thể được giảm trừ gia cảnh cho bản thân và người phụ thuộc nếu đáp ứng điều kiện đăng ký. Ngoài ra còn có các khoản bảo hiểm bắt buộc được trừ trước khi tính thuế.',
          'Với người phụ thuộc, hồ sơ cần chuẩn bị đầy đủ và đúng thời hạn để được ghi nhận trong kỳ tính thuế phù hợp.',
        ],
        bullets: ['Giảm trừ bản thân.', 'Giảm trừ người phụ thuộc đã đăng ký.', 'Các khoản bảo hiểm bắt buộc theo quy định.'],
      },
      {
        heading: 'Cam kết thu nhập và quyết toán năm',
        body: [
          'Một số trường hợp làm việc ngắn hạn hoặc có thu nhập tại một nơi có thể cần cam kết theo biểu mẫu phù hợp. Với quyết toán năm, công ty sẽ hướng dẫn nếu bạn đủ điều kiện ủy quyền.',
          'Nếu trong năm bạn có thu nhập từ nhiều nơi, hãy lưu lại chứng từ khấu trừ để chủ động quyết toán khi cần.',
        ],
      },
      {
        heading: 'Bạn cần làm gì trong tháng đầu?',
        body: [
          'Hãy kiểm tra mã số thuế cá nhân, thông tin người phụ thuộc nếu có và đọc kỹ bảng lương đầu tiên. Phát hiện sai sớm sẽ giúp việc điều chỉnh nhẹ nhàng hơn.',
        ],
      },
    ],
    checklist: ['Kiểm tra mã số thuế cá nhân.', 'Gửi hồ sơ người phụ thuộc nếu có.', 'Đọc bảng lương đầu tiên.', 'Lưu chứng từ thuế nếu có thu nhập nơi khác.'],
    relatedSlugs: ['dang-ky-bhxh', 'dang-ky-nghi-phep'],
  },
  {
    ...POSTS[2],
    ...baseDetails,
    heroLabel: 'Quy trình nội bộ',
    takeaway:
      'Muốn nghỉ phép hoặc OT được duyệt nhanh, hãy gửi đúng loại đơn, đúng thời điểm và để lại đủ ngữ cảnh cho quản lý.',
    tableOfContents: ['Nghỉ phép có kế hoạch', 'Nghỉ phát sinh', 'Đăng ký OT', 'Lỗi thường gặp'],
    sections: [
      {
        heading: 'Nghỉ phép có kế hoạch',
        body: [
          'Với các ngày nghỉ đã biết trước, bạn nên trao đổi với quản lý và tạo đơn trên EasyHRM trước tối thiểu một ngày làm việc. Việc này giúp team cân đối deadline, lịch họp và hỗ trợ khách hàng.',
          'Nội dung đơn không cần dài, nhưng nên ghi rõ ngày nghỉ, ca nghỉ và đầu mối bàn giao nếu công việc đang chạy.',
        ],
      },
      {
        heading: 'Nghỉ phát sinh',
        body: [
          'Khi có việc đột xuất, hãy báo quản lý trực tiếp qua kênh team đang dùng, sau đó cập nhật đơn trên hệ thống ngay khi thuận tiện. Tin nhắn báo trước không thay thế đơn trên EasyHRM.',
          'Nếu nghỉ nhiều ngày liên tiếp, bạn nên cập nhật trạng thái hằng ngày hoặc thống nhất trước thời điểm quay lại.',
        ],
      },
      {
        heading: 'Đăng ký làm thêm giờ',
        body: [
          'OT cần có sự thống nhất với quản lý trước khi thực hiện. Sau đó bạn tạo đơn hoặc cập nhật thông tin theo quy trình của phòng ban để dữ liệu được ghi nhận khi chốt công.',
          'Hãy ghi rõ lý do OT, khung giờ thực hiện và kết quả công việc dự kiến. Điều này giúp phê duyệt minh bạch hơn.',
        ],
      },
      {
        heading: 'Lỗi thường gặp',
        body: [
          'Các lỗi phổ biến gồm chọn sai loại đơn, quên bấm gửi, gửi sau kỳ chốt công hoặc thiếu thông tin bàn giao. Nếu đơn bị trả lại, hãy đọc ghi chú của người duyệt rồi cập nhật lại thay vì tạo nhiều đơn trùng nhau.',
        ],
      },
    ],
    checklist: ['Trao đổi với quản lý trước khi nghỉ/OT.', 'Tạo đúng loại đơn trên EasyHRM.', 'Ghi rõ thời gian và lý do.', 'Theo dõi trạng thái duyệt.'],
    relatedSlugs: ['easyhrm-cham-cong', 'giai-trinh-cham-cong'],
  },
  {
    ...POSTS[3],
    ...baseDetails,
    heroLabel: 'Hiệu suất cá nhân',
    takeaway:
      'Trong môi trường IT, hiệu quả đến từ việc làm rõ mục tiêu, giao tiếp sớm và bảo vệ các khoảng tập trung sâu.',
    tableOfContents: ['Làm rõ đầu việc', 'Tập trung sâu', 'Giao tiếp sớm', 'Tổng kết đều đặn'],
    sections: [
      {
        heading: 'Làm rõ đầu việc trước khi bắt tay',
        body: [
          'Một task rõ ràng nên có mục tiêu, phạm vi, tiêu chí hoàn thành và người review. Nếu thiếu một trong các phần này, hãy hỏi sớm để tránh làm lệch kỳ vọng.',
          'Với task kỹ thuật, bạn có thể viết lại ngắn gọn hướng triển khai trong ticket hoặc chat để cả team xác nhận cùng một hiểu biết.',
        ],
      },
      {
        heading: 'Bảo vệ thời gian tập trung sâu',
        body: [
          'Hãy gom các việc cần tập trung vào những khung giờ ít họp, tắt bớt thông báo không khẩn cấp và chia task lớn thành các mốc nhỏ. Tập trung sâu không phải im lặng tuyệt đối, mà là chủ động kiểm soát ngữ cảnh.',
        ],
      },
      {
        heading: 'Giao tiếp sớm khi bị chặn',
        body: [
          'Nếu bị chặn quá lâu bởi quyền truy cập, nghiệp vụ chưa rõ hoặc lỗi khó tái hiện, hãy báo sớm kèm thông tin đã thử. Một câu hỏi tốt thường tiết kiệm cho cả team nhiều giờ vòng vo.',
        ],
        bullets: ['Mô tả kỳ vọng và thực tế.', 'Gửi log hoặc ảnh chụp nếu có.', 'Nêu rõ bạn cần ai hỗ trợ.'],
      },
      {
        heading: 'Tổng kết đều đặn',
        body: [
          'Cuối ngày hoặc cuối sprint, hãy ghi lại việc đã xong, việc còn mở và rủi ro. Thói quen này giúp bàn giao mượt, review dễ hơn và giảm áp lực nhớ mọi thứ trong đầu.',
        ],
      },
    ],
    checklist: ['Task có tiêu chí hoàn thành rõ ràng.', 'Có khung giờ tập trung trong ngày.', 'Báo blocker sớm.', 'Cập nhật tiến độ trước khi kết thúc ngày.'],
    relatedSlugs: ['kham-pha-6-san-pham', 'easyhrm-cham-cong'],
  },
  {
    ...POSTS[4],
    ...baseDetails,
    heroLabel: 'Hệ sinh thái sản phẩm',
    takeaway:
      'SoftDreams xây hệ sinh thái sản phẩm cho tài chính, hóa đơn, chữ ký số, bán hàng, tài liệu và nhân sự. Hiểu bức tranh chung giúp bạn phối hợp tốt hơn.',
    tableOfContents: ['EasyInvoice', 'EasyBooks và EasyPOS', 'EasyCA và EasyDocs', 'EasyHRM'],
    sections: [
      {
        heading: 'EasyInvoice',
        body: [
          'EasyInvoice hỗ trợ doanh nghiệp phát hành, quản lý và tra cứu hóa đơn điện tử. Đây là nhóm sản phẩm có tính nghiệp vụ cao, liên quan chặt tới quy định pháp lý và trải nghiệm kế toán.',
          'Nếu bạn làm ở team kỹ thuật hoặc hỗ trợ, hãy chú ý tính chính xác dữ liệu, tốc độ xử lý và tính ổn định trong các kỳ cao điểm.',
        ],
      },
      {
        heading: 'EasyBooks và EasyPOS',
        body: [
          'EasyBooks phục vụ nghiệp vụ kế toán, quản trị sổ sách và báo cáo tài chính. EasyPOS tập trung vào bán hàng tại điểm bán, quản lý đơn, hàng hóa và dòng tiền vận hành.',
          'Hai sản phẩm này thường chạm trực tiếp đến nhịp làm việc hằng ngày của khách hàng, nên trải nghiệm thao tác nhanh và ít lỗi là ưu tiên lớn.',
        ],
      },
      {
        heading: 'EasyCA và EasyDocs',
        body: [
          'EasyCA liên quan đến chữ ký số và xác thực giao dịch điện tử. EasyDocs hỗ trợ quản lý tài liệu, luồng ký duyệt và lưu trữ hồ sơ số.',
          'Điểm chung của hai nhóm này là độ tin cậy, bảo mật và khả năng truy vết. Mỗi thay đổi nhỏ đều cần được hiểu trong bối cảnh quy trình của khách hàng.',
        ],
      },
      {
        heading: 'EasyHRM',
        body: [
          'EasyHRM hỗ trợ quản lý nhân sự, chấm công, đơn từ và các quy trình liên quan tới người lao động. Đây cũng là sản phẩm nhân viên mới tiếp xúc sớm khi onboarding.',
        ],
      },
    ],
    checklist: ['Nắm tên và phạm vi 6 sản phẩm chính.', 'Biết sản phẩm team mình đang phụ trách.', 'Hiểu khách hàng dùng sản phẩm trong bối cảnh nào.', 'Hỏi quản lý về luồng nghiệp vụ quan trọng nhất.'],
    relatedSlugs: ['easyhrm-cham-cong', 'tips-lam-viec-it'],
  },
  {
    ...POSTS[5],
    ...baseDetails,
    heroLabel: 'Chấm công chính xác',
    takeaway:
      'Giải trình chấm công nên được tạo ngay khi phát hiện sai lệch, kèm thời gian thực tế và lý do rõ ràng để được xử lý nhanh.',
    tableOfContents: ['Khi nào cần giải trình', 'Cách viết lý do', 'Quy trình duyệt', 'Lưu ý cuối tháng'],
    sections: [
      {
        heading: 'Khi nào cần giải trình?',
        body: [
          'Bạn cần giải trình khi dữ liệu công không phản ánh đúng thời gian làm việc thực tế: quên chấm công, chấm thiếu lượt, đi công tác, làm từ xa chưa đăng ký hoặc hệ thống gặp lỗi.',
          'Việc giải trình không phải là lỗi cá nhân, mà là cách bổ sung ngữ cảnh để HR và quản lý chốt công chính xác.',
        ],
      },
      {
        heading: 'Cách viết lý do rõ ràng',
        body: [
          'Một lý do tốt nên có thời điểm, tình huống và thông tin xác nhận nếu cần. Ví dụ: “Quên chấm công ra lúc 18:05 do tham gia họp dự án với team A, có quản lý trực tiếp xác nhận.”',
          'Tránh viết quá ngắn như “quên” hoặc “lỗi máy” nếu không có thêm ngữ cảnh, vì người duyệt có thể cần hỏi lại.',
        ],
      },
      {
        heading: 'Quy trình duyệt',
        body: [
          'Sau khi bạn gửi giải trình, quản lý hoặc HR sẽ xem xét theo quy trình hiện hành. Nếu cần bổ sung, hệ thống hoặc người phụ trách sẽ phản hồi để bạn cập nhật.',
          'Bạn nên theo dõi trạng thái cho đến khi giải trình được duyệt hoặc xử lý xong.',
        ],
      },
      {
        heading: 'Lưu ý cuối tháng',
        body: [
          'Đừng chờ tới sát kỳ chốt công mới kiểm tra toàn bộ tháng. Việc xử lý dồn vào cuối tháng dễ gây thiếu thông tin, quá hạn hoặc làm chậm payroll.',
        ],
      },
    ],
    checklist: ['Kiểm tra dữ liệu công hằng tuần.', 'Gửi giải trình ngay khi thấy sai lệch.', 'Nêu rõ thời gian thực tế và lý do.', 'Theo dõi trạng thái xử lý.'],
    relatedSlugs: ['easyhrm-cham-cong', 'dang-ky-nghi-phep'],
  },
]

export function getStaticBlogDetail(slug: string): BlogPostDetail | undefined {
  return BLOG_DETAILS.find((post) => post.slug === slug)
}

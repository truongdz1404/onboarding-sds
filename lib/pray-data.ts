import { Prayer } from './pray-types';

export const INITIAL_PRAYERS: Prayer[] = [
  {
    id: 'p1',
    category: 'Cầu an',
    content: 'Cầu cho cha mẹ được bình an, sức khỏe dồi dào. Mong gia đình luôn hòa thuận và hạnh phúc bên nhau.',
    timestamp: '2 phút trước',
    likes: 12,
    author: 'Minh Tâm',
    isAnonymous: false,
  },
  {
    id: 'p2',
    category: 'Công việc',
    content: 'Mong cho kỳ thi sắp tới của con được thuận lợi, đạt kết quả cao để báo hiếu cha mẹ.',
    timestamp: '15 phút trước',
    likes: 5,
    author: 'Trần An',
    isAnonymous: false,
  },
  {
    id: 'p3',
    category: 'Gia đạo',
    content: 'Gửi lời chúc lành đến tất cả mọi người trên thế giới, cầu mong dịch bệnh và thiên tai sớm chấm dứt.',
    timestamp: '1 giờ trước',
    likes: 48,
    author: 'Diệu Thảo',
    isAnonymous: false,
  },
  {
    id: 'p4',
    category: 'Bản thân',
    content: 'Cầu cho tâm được an, gạt bỏ mọi muộn phiền để đón nhận những điều tốt đẹp và bình yên trong cuộc sống.',
    timestamp: '3 giờ trước',
    likes: 31,
    author: 'Ẩn danh',
    isAnonymous: true,
  },
  {
    id: 'p5',
    category: 'Học tập',
    content: 'Chúc cho nguyện vọng thi đỗ vào trường mong muốn thành hiện thực, mọi nỗ lực đều gặt hái quả ngọt.',
    timestamp: '5 giờ trước',
    likes: 24,
    author: 'Phúc Lâm',
    isAnonymous: false,
  },
  {
    id: 'p6',
    category: 'Tình duyên',
    content: 'Cầu cho những ai còn cô đơn sẽ tìm thấy tri kỷ, người thương thấu hiểu và chia sẻ ngọt bùi.',
    timestamp: '1 ngày trước',
    likes: 19,
    author: 'Như Ý',
    isAnonymous: false,
  }
];

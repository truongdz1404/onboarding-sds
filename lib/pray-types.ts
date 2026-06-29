export interface Prayer {
  id: string;
  category: 'Cầu an' | 'Công việc' | 'Gia đạo' | 'Bản thân' | 'Học tập' | 'Tình duyên';
  content: string;
  timestamp: string;
  likes: number;
  author: string;
  isAnonymous: boolean;
}

export interface FlowerOffer {
  id: string;
  type: 'lotus' | 'marigold' | 'lily' | 'rose';
  name: string;
  offeredAt: string;
  sender: string;
}

export interface Contribution {
  id: string;
  sender: string;
  amount: number;
  message: string;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  author: string;
  content: string;
  avatar: string;
  timestamp: string;
}

export interface ZenTrack {
  id: string;
  title: string;
  genre: string;
  url: string;
  description: string;
}

export const ZEN_TRACKS: ZenTrack[] = [
  {
    id: 'default_zen_track',
    title: 'Nhạc Thiền Tịnh Tâm',
    genre: 'Nhạc Thiền',
    url: '/backgound11_5min.mp3',
    description: 'Bản nhạc thiền tịnh lặng giúp thanh lọc tâm thức, an yên tự tại.'
  }
];

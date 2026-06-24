export type ProfileLink = {
  label: string
  url: string
}

export type UserRole = 'admin' | 'moderator' | 'user'

export type UserProfile = {
  uid: string
  name: string
  username: string
  headline: string
  about: string
  links: ProfileLink[]
  photoURL?: string
  email?: string
  role?: UserRole
}

export type ProfileTab =
  | 'overview'
  | 'posts'
  | 'comments'
  | 'saved'
  | 'history'
  | 'hidden'
  | 'upvoted'
  | 'downvoted'
  | 'pending'

export const PROFILE_TABS: { id: ProfileTab; label: string }[] = [
  { id: 'overview',   label: 'Tổng quan' },
  { id: 'posts',      label: 'Bài viết' },
  { id: 'comments',   label: 'Bình luận' },
  { id: 'saved',      label: 'Đã lưu' },
  { id: 'history',    label: 'Lịch sử' },
  { id: 'hidden',     label: 'Đã ẩn' },
  { id: 'upvoted',    label: 'Đã thích' },
  { id: 'downvoted',  label: 'Đã không thích' },
  { id: 'pending',    label: 'Chờ duyệt' },
]

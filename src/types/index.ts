export interface User {
  id: number
  email?: string
  nickname: string
  avatar: string
  bio?: string
  created_at?: string
}

export interface Category {
  id: number
  name: string
  slug: string
  icon: string
}

export interface Post {
  id: number
  title: string
  content: string
  summary: string
  category: string
  categoryName?: string
  author: User
  likes: number
  comments: number
  collects: number
  createdAt: string
  isLiked?: boolean
  isCollected?: boolean
}

export interface Comment {
  id: number
  content: string
  postId: number
  parentId: number | null
  createdAt: string
  author: User
  replies: Comment[]
}

export interface UserProfile extends User {
  postsCount: number
  commentsCount: number
  collectsCount: number
  createdAt: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface AuthResponse {
  user: User
  token: string
}

export interface PostsResponse {
  posts: Post[]
  total: number
  page: number
  totalPages: number
}

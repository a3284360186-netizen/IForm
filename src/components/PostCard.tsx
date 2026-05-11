import { Link } from 'react-router-dom'
import { Heart, MessageCircle, Bookmark } from 'lucide-react'
import type { Post } from '@/types'

interface PostCardProps {
  post: Post
}

export default function PostCard({ post }: PostCardProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60))
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60))
        return `${minutes} 分钟前`
      }
      return `${hours} 小时前`
    } else if (days < 7) {
      return `${days} 天前`
    } else {
      return date.toLocaleDateString('zh-CN')
    }
  }

  return (
    <Link to={`/post/${post.id}`} className="block">
      <article className="card cursor-pointer h-full flex flex-col">
        <div className="flex items-center space-x-2 mb-3">
          {post.categoryName && (
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              {post.categoryName}
            </span>
          )}
        </div>

        <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-indigo-400 transition-colors">
          {post.title}
        </h3>

        <p className="text-gray-400 text-sm mb-4 line-clamp-3 flex-grow">
          {post.summary}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <div className="flex items-center space-x-3">
            <img
              src={post.author?.avatar || '/default-avatar.png'}
              alt={post.author?.nickname}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div>
              <p className="text-sm text-gray-300">{post.author?.nickname}</p>
              <p className="text-xs text-gray-500">{formatDate(post.createdAt)}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-gray-400">
            <span className="flex items-center space-x-1 text-sm">
              <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
              <span>{post.likes}</span>
            </span>
            <span className="flex items-center space-x-1 text-sm">
              <MessageCircle className="w-4 h-4" />
              <span>{post.comments}</span>
            </span>
            <span className="flex items-center space-x-1 text-sm">
              <Bookmark className={`w-4 h-4 ${post.isCollected ? 'fill-yellow-500 text-yellow-500' : ''}`} />
              <span>{post.collects}</span>
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}

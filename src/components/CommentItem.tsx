import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Reply, Trash2 } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import api from '@/api'

interface CommentItemProps {
  comment: {
    id: number
    content: string
    author: {
      id: number
      nickname: string
      avatar: string
    }
    createdAt: string
    replies: any[]
  }
  postId: number
  onReplyAdded: () => void
}

export default function CommentItem({ comment, postId, onReplyAdded }: CommentItemProps) {
  const { user } = useAuthStore()
  const [showReplyInput, setShowReplyInput] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    
    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes} 分钟前`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} 小时前`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days} 天前`
    return date.toLocaleDateString('zh-CN')
  }

  const handleReply = async () => {
    if (!replyContent.trim() || isSubmitting) return
    
    setIsSubmitting(true)
    try {
      await api.comments.create(postId, replyContent, comment.id)
      setReplyContent('')
      setShowReplyInput(false)
      onReplyAdded()
    } catch (error) {
      console.error('回复失败:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('确定要删除这条评论吗？')) return
    
    try {
      await api.comments.delete(postId, comment.id)
      onReplyAdded()
    } catch (error) {
      console.error('删除失败:', error)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex space-x-3">
        <Link to={`/profile/${comment.author.id}`}>
          <img
            src={comment.author.avatar || '/default-avatar.png'}
            alt={comment.author.nickname}
            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
          />
        </Link>
        
        <div className="flex-grow min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <Link
              to={`/profile/${comment.author.id}`}
              className="font-medium text-white hover:text-indigo-400"
            >
              {comment.author.nickname}
            </Link>
            <span className="text-gray-500 text-sm">{formatDate(comment.createdAt)}</span>
          </div>
          
          <p className="text-gray-300 mb-2 whitespace-pre-wrap">{comment.content}</p>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowReplyInput(!showReplyInput)}
              className="flex items-center space-x-1 text-sm text-gray-400 hover:text-indigo-400 transition-colors"
            >
              <Reply className="w-4 h-4" />
              <span>回复</span>
            </button>
            
            {user?.id === comment.author.id && (
              <button
                onClick={handleDelete}
                className="flex items-center space-x-1 text-sm text-gray-400 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>删除</span>
              </button>
            )}
          </div>

          {showReplyInput && (
            <div className="mt-3 space-y-2">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder={`回复 @${comment.author.nickname}...`}
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-800/50 text-gray-200 resize-none outline-none focus:border-indigo-500 transition-colors"
                rows={2}
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setShowReplyInput(false)
                    setReplyContent('')
                  }}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleReply}
                  disabled={!replyContent.trim() || isSubmitting}
                  className="px-4 py-2 text-sm btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? '发送中...' : '发送'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-8 pl-4 border-l-2 border-indigo-500/20 space-y-4">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postId={postId}
              onReplyAdded={onReplyAdded}
            />
          ))}
        </div>
      )}
    </div>
  )
}

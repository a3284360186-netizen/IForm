import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Heart, Bookmark, Share2, ArrowLeft, MessageCircle, Trash2 } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import CommentItem from '@/components/CommentItem'
import { useAuthStore } from '@/store/authStore'
import api from '@/api'
import type { Post, Comment } from '@/types'

export default function PostDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (id) {
      loadPost()
      loadComments()
    }
  }, [id])

  const loadPost = async () => {
    try {
      const response = await api.posts.get(parseInt(id!))
      setPost(response.data)
    } catch (error) {
      console.error('加载帖子失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadComments = async () => {
    try {
      const response = await api.comments.list(parseInt(id!))
      setComments(response.data)
    } catch (error) {
      console.error('加载评论失败:', error)
    }
  }

  const handleLike = async () => {
    if (!user) {
      navigate('/login')
      return
    }
    try {
      const response = await api.posts.like(parseInt(id!))
      setPost(prev => prev ? {
        ...prev,
        isLiked: response.data.liked,
        likes: prev.likes + (response.data.liked ? 1 : -1)
      } : null)
    } catch (error) {
      console.error('点赞失败:', error)
    }
  }

  const handleCollect = async () => {
    if (!user) {
      navigate('/login')
      return
    }
    try {
      const response = await api.posts.collect(parseInt(id!))
      setPost(prev => prev ? {
        ...prev,
        isCollected: response.data.collected,
        collects: prev.collects + (response.data.collected ? 1 : -1)
      } : null)
    } catch (error) {
      console.error('收藏失败:', error)
    }
  }

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          url,
        })
      } catch (error) {
        console.log('分享取消')
      }
    } else {
      navigator.clipboard.writeText(url)
      alert('链接已复制到剪贴板')
    }
  }

  const handleDelete = async () => {
    if (!confirm('确定要删除这篇帖子吗？')) return
    try {
      await api.posts.delete(parseInt(id!))
      navigate('/')
    } catch (error) {
      console.error('删除失败:', error)
    }
  }

  const handleComment = async () => {
    if (!user) {
      navigate('/login')
      return
    }
    if (!newComment.trim() || submitting) return

    setSubmitting(true)
    try {
      await api.comments.create(parseInt(id!), newComment)
      setNewComment('')
      loadComments()
      setPost(prev => prev ? { ...prev, comments: prev.comments + 1 } : null)
    } catch (error) {
      console.error('评论失败:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-16">
          <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-slate-700 rounded w-1/4" />
              <div className="h-12 bg-slate-700 rounded w-3/4" />
              <div className="flex space-x-4">
                <div className="w-12 h-12 bg-slate-700 rounded-full" />
                <div className="flex-grow space-y-2">
                  <div className="h-4 bg-slate-700 rounded w-1/4" />
                  <div className="h-3 bg-slate-700 rounded w-1/6" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-4 bg-slate-700 rounded" />
                <div className="h-4 bg-slate-700 rounded" />
                <div className="h-4 bg-slate-700 rounded w-5/6" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-16 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">帖子不存在</h2>
            <Link to="/" className="btn-primary">
              返回首页
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-16">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-400 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>返回</span>
          </button>

          <article className="card">
            <header className="mb-8">
              {post.categoryName && (
                <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 mb-4">
                  {post.categoryName}
                </span>
              )}
              
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">
                {post.title}
              </h1>

              <div className="flex items-center justify-between flex-wrap gap-4">
                <Link to={`/profile/${post.author.id}`} className="flex items-center space-x-3">
                  <img
                    src={post.author.avatar || '/default-avatar.png'}
                    alt={post.author.nickname}
                    className="w-12 h-12 rounded-full object-cover border-2 border-indigo-500"
                  />
                  <div>
                    <p className="font-medium text-white">{post.author.nickname}</p>
                    <p className="text-sm text-gray-400">{formatDate(post.createdAt)}</p>
                  </div>
                </Link>

                {user?.id === post.author.id && (
                  <button
                    onClick={handleDelete}
                    className="flex items-center space-x-2 px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>删除</span>
                  </button>
                )}
              </div>
            </header>

            <div className="markdown-content mb-8">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
            </div>

            <footer className="flex items-center justify-between border-t border-white/5 pt-6">
              <div className="flex items-center space-x-6">
                <button
                  onClick={handleLike}
                  className={`flex items-center space-x-2 transition-colors ${
                    post.isLiked ? 'text-red-400' : 'text-gray-400 hover:text-red-400'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
                  <span>{post.likes}</span>
                </button>
                
                <button
                  onClick={handleCollect}
                  className={`flex items-center space-x-2 transition-colors ${
                    post.isCollected ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'
                  }`}
                >
                  <Bookmark className={`w-5 h-5 ${post.isCollected ? 'fill-current' : ''}`} />
                  <span>{post.collects}</span>
                </button>
                
                <button
                  onClick={handleShare}
                  className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                  <span>分享</span>
                </button>
              </div>
            </footer>
          </article>

          <section className="mt-12">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <MessageCircle className="w-6 h-6 mr-2" />
              评论 ({post.comments})
            </h3>

            <div className="card mb-8">
              <div className="flex space-x-4">
                {user && (
                  <img
                    src={user.avatar || '/default-avatar.png'}
                    alt={user.nickname}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-grow">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={user ? '发表你的看法...' : '登录后参与评论'}
                    disabled={!user}
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-800/50 text-gray-200 resize-none outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
                    rows={3}
                  />
                  <div className="flex justify-end mt-3">
                    <button
                      onClick={handleComment}
                      disabled={!user || !newComment.trim() || submitting}
                      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? '发送中...' : '发表评论'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  postId={post.id}
                  onReplyAdded={loadComments}
                />
              ))}
              
              {comments.length === 0 && (
                <p className="text-center text-gray-400 py-8">
                  暂无评论，快来抢沙发吧！
                </p>
              )}
            </div>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}

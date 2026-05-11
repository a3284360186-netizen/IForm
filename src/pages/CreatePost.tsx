import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import MarkdownEditor from '@/components/MarkdownEditor'
import { useAuthStore } from '@/store/authStore'
import api from '@/api'
import type { Category } from '@/types'

export default function CreatePost() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    loadCategories()
  }, [user, navigate])

  const loadCategories = async () => {
    try {
      const response = await api.categories.list()
      setCategories(response.data)
    } catch (error) {
      console.error('加载分类失败:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) {
      setError('请输入标题')
      return
    }
    if (!content.trim()) {
      setError('请输入内容')
      return
    }
    if (!category) {
      setError('请选择分类')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const response = await api.posts.create(title, content, category)
      navigate(`/post/${response.data.id}`)
    } catch (err: any) {
      setError(err.message || '发布失败')
    } finally {
      setSubmitting(false)
    }
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

          <div className="card">
            <h1 className="text-2xl font-bold text-white mb-8">发布新帖子</h1>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  标题
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="输入一个有吸引力的标题"
                  className="input-field"
                  maxLength={100}
                />
                <p className="mt-1 text-sm text-gray-500">
                  {title.length}/100
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  分类
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {categories.map((cat) => (
                    <button
                      key={cat.slug}
                      type="button"
                      onClick={() => setCategory(cat.slug)}
                      className={`px-4 py-3 rounded-xl border transition-all flex items-center space-x-2 ${
                        category === cat.slug
                          ? 'border-indigo-500 bg-indigo-500/20 text-indigo-400'
                          : 'border-white/10 text-gray-400 hover:border-indigo-500/50 hover:text-white'
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span className="text-sm">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  内容 (支持 Markdown)
                </label>
                <MarkdownEditor
                  value={content}
                  onChange={setContent}
                  placeholder="分享你的知识、经验和想法..."
                />
              </div>

              <div className="flex items-center justify-end space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="btn-secondary"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? '发布中...' : '发布帖子'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}

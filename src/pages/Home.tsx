import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, TrendingUp, Clock, Search } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import PostCard from '@/components/PostCard'
import api from '@/api'
import type { Post, Category } from '@/types'

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [selectedCategory, sortBy])

  const loadData = async () => {
    setLoading(true)
    try {
      const [postsRes, categoriesRes] = await Promise.all([
        api.posts.list({ category: selectedCategory || undefined, sort: sortBy }),
        api.categories.list(),
      ])
      setPosts(postsRes.data.posts)
      setCategories(categoriesRes.data)
    } catch (error) {
      console.error('加载数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-grow pt-16">
        <div 
          className="relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 50%, rgba(34, 211, 238, 0.05) 100%)'
          }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.15),transparent_50%)]" />
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-indigo-500/20 text-indigo-400 mb-6">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">AI驱动的知识社区</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                <span className="gradient-text">探索 AI 的无限可能</span>
              </h1>
              
              <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
                加入最活跃的 AI 开发者社区，分享知识、交流想法、共同成长
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Link to="/create" className="btn-primary text-lg px-8 py-3">
                  开始发帖
                </Link>
                <button className="btn-secondary text-lg px-8 py-3 flex items-center space-x-2">
                  <Search className="w-5 h-5" />
                  <span>搜索话题</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="lg:w-64 flex-shrink-0">
              <div className="sticky top-24 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">分类</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedCategory('')}
                      className={`w-full text-left px-4 py-2 rounded-xl transition-all ${
                        selectedCategory === ''
                          ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      全部
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.slug}
                        onClick={() => setSelectedCategory(cat.slug)}
                        className={`w-full text-left px-4 py-2 rounded-xl transition-all flex items-center space-x-2 ${
                          selectedCategory === cat.slug
                            ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <span>{cat.icon}</span>
                        <span>{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            <main className="flex-grow">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {selectedCategory 
                    ? categories.find(c => c.slug === selectedCategory)?.name || '帖子列表'
                    : '全部帖子'
                  }
                </h2>
                
                <div className="flex items-center space-x-2 bg-slate-800/50 rounded-xl p-1">
                  <button
                    onClick={() => setSortBy('latest')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                      sortBy === 'latest'
                        ? 'bg-indigo-500 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    <span>最新</span>
                  </button>
                  <button
                    onClick={() => setSortBy('popular')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                      sortBy === 'popular'
                        ? 'bg-indigo-500 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span>热门</span>
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="card animate-pulse">
                      <div className="h-4 bg-slate-700 rounded w-1/4 mb-4" />
                      <div className="h-6 bg-slate-700 rounded w-3/4 mb-2" />
                      <div className="h-6 bg-slate-700 rounded w-1/2 mb-4" />
                      <div className="h-20 bg-slate-700 rounded mb-4" />
                      <div className="flex justify-between">
                        <div className="h-4 bg-slate-700 rounded w-1/3" />
                        <div className="h-4 bg-slate-700 rounded w-1/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : posts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-gray-400 text-lg">暂无帖子</p>
                  <Link to="/create" className="inline-block mt-4 btn-primary">
                    成为第一个发帖的人
                  </Link>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}

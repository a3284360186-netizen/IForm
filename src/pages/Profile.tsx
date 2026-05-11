import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Calendar, MessageSquare, Heart, Bookmark, Settings, ArrowLeft } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import PostCard from '@/components/PostCard'
import { useAuthStore } from '@/store/authStore'
import api from '@/api'
import type { UserProfile, Post } from '@/types'

export default function Profile() {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const { user: currentUser } = useAuthStore()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [collects, setCollects] = useState<Post[]>([])
  const [activeTab, setActiveTab] = useState<'posts' | 'collects'>('posts')
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({ nickname: '', bio: '' })

  const isOwnProfile = currentUser?.id === parseInt(userId || '0')

  useEffect(() => {
    if (userId) {
      loadProfile()
    }
  }, [userId])

  const loadProfile = async () => {
    try {
      const [profileRes, postsRes] = await Promise.all([
        api.users.get(parseInt(userId!)),
        api.users.posts(parseInt(userId!)),
      ])
      setProfile(profileRes.data)
      setPosts(postsRes.data)
      
      if (isOwnProfile) {
        const collectsRes = await api.users.collects(parseInt(userId!))
        setCollects(collectsRes.data)
      }
    } catch (error) {
      console.error('加载用户信息失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      await api.users.update(parseInt(userId!), editForm)
      setProfile(prev => prev ? { ...prev, ...editForm } : null)
      setEditing(false)
    } catch (error) {
      console.error('更新失败:', error)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-16">
          <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="animate-pulse space-y-6">
              <div className="flex items-center space-x-6">
                <div className="w-24 h-24 bg-slate-700 rounded-full" />
                <div className="space-y-3">
                  <div className="h-6 bg-slate-700 rounded w-32" />
                  <div className="h-4 bg-slate-700 rounded w-48" />
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-16 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">用户不存在</h2>
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

          <div className="card mb-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-6 sm:space-y-0 sm:space-x-6">
              <img
                src={profile.avatar || '/default-avatar.png'}
                alt={profile.nickname}
                className="w-24 h-24 rounded-full object-cover border-4 border-indigo-500"
              />
              
              <div className="flex-grow text-center sm:text-left">
                {editing ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={editForm.nickname}
                      onChange={(e) => setEditForm({ ...editForm, nickname: e.target.value })}
                      placeholder="昵称"
                      className="input-field"
                    />
                    <textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                      placeholder="个人简介"
                      className="input-field resize-none"
                      rows={3}
                    />
                    <div className="flex justify-center sm:justify-start space-x-3">
                      <button onClick={handleSave} className="btn-primary">
                        保存
                      </button>
                      <button
                        onClick={() => setEditing(false)}
                        className="btn-secondary"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-center sm:justify-start space-x-3 mb-2">
                      <h1 className="text-2xl font-bold text-white">{profile.nickname}</h1>
                      {isOwnProfile && (
                        <button
                          onClick={() => {
                            setEditForm({
                              nickname: profile.nickname,
                              bio: profile.bio || '',
                            })
                            setEditing(true)
                          }}
                          className="p-2 text-gray-400 hover:text-white transition-colors"
                        >
                          <Settings className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                    
                    <p className="text-gray-400 mb-4">
                      {profile.bio || '暂无个人简介'}
                    </p>
                    
                    <div className="flex flex-wrap items-center justify-center sm:justify-start space-x-6 text-sm text-gray-400">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>加入于 {formatDate(profile.createdAt)}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <MessageSquare className="w-4 h-4" />
                        <span>{profile.postsCount} 帖子</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Heart className="w-4 h-4" />
                        <span>{profile.collectsCount} 收藏</span>
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="border-b border-white/10 mb-6">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab('posts')}
                className={`pb-4 px-2 font-medium transition-colors relative ${
                  activeTab === 'posts'
                    ? 'text-indigo-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                我的帖子
                {activeTab === 'posts' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />
                )}
              </button>
              {isOwnProfile && (
                <button
                  onClick={() => setActiveTab('collects')}
                  className={`pb-4 px-2 font-medium transition-colors relative ${
                    activeTab === 'collects'
                      ? 'text-indigo-400'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  我的收藏
                  {activeTab === 'collects' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />
                  )}
                </button>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {(activeTab === 'posts' ? posts : collects).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(activeTab === 'posts' ? posts : collects).map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400">
                  {activeTab === 'posts' ? '还没有发布任何帖子' : '还没有收藏任何帖子'}
                </p>
                {activeTab === 'posts' && isOwnProfile && (
                  <Link to="/create" className="inline-block mt-4 btn-primary">
                    发布第一个帖子
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}

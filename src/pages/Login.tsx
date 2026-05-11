import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bot, Mail, Lock, User } from 'lucide-react'
import Navbar from '@/components/Navbar'
import { useAuthStore } from '@/store/authStore'

export default function Login() {
  const navigate = useNavigate()
  const { login, register, isLoading, error, clearError } = useAuthStore()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [localError, setLocalError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError('')
    clearError()

    if (!email) {
      setLocalError('请输入邮箱')
      return
    }
    if (!password) {
      setLocalError('请输入密码')
      return
    }
    if (!isLogin && !nickname) {
      setLocalError('请输入昵称')
      return
    }

    try {
      if (isLogin) {
        await login(email, password)
      } else {
        await register(email, password, nickname)
      }
      navigate('/')
    } catch (err: any) {
      setLocalError(err.message || (isLogin ? '登录失败' : '注册失败'))
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-16 flex items-center justify-center px-4">
        <div 
          className="w-full max-w-md"
          style={{
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))'
          }}
        >
          <div className="glass-effect rounded-2xl p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10" />
            
            <div className="relative">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-4">
                  <Bot className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold gradient-text">AI论坛</h1>
              </div>

              <h2 className="text-xl font-bold text-white text-center mb-6">
                {isLogin ? '欢迎回来' : '创建账户'}
              </h2>

              {(localError || error) && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm">
                  {localError || error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {!isLogin && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      昵称
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder="选择一个昵称"
                        className="input-field pl-12"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    邮箱
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="input-field pl-12"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    密码
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="input-field pl-12"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? '处理中...' : (isLogin ? '登录' : '注册')}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => {
                    setIsLogin(!isLogin)
                    setLocalError('')
                    clearError()
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {isLogin ? (
                    <>
                      还没有账户？{' '}
                      <span className="text-indigo-400">立即注册</span>
                    </>
                  ) : (
                    <>
                      已有账户？{' '}
                      <span className="text-indigo-400">立即登录</span>
                    </>
                  )}
                </button>
              </div>

              <div className="mt-8 pt-6 border-t border-white/5 text-center">
                <p className="text-sm text-gray-500">
                  {isLogin ? '演示账号：admin@ai-forum.com / admin123' : '注册即表示同意社区规范'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

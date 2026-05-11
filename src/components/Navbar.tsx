import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Bot, PenSquare, LogOut, User, Menu, X } from 'lucide-react'
import { useState } from 'react'

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
    setMobileMenuOpen(false)
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-effect">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text hidden sm:block">AI论坛</span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-300 hover:text-white transition-colors">
              首页
            </Link>
            
            {user ? (
              <>
                <Link
                  to="/create"
                  className="flex items-center space-x-2 btn-primary text-sm"
                >
                  <PenSquare className="w-4 h-4" />
                  <span>发帖</span>
                </Link>
                <Link
                  to={`/profile/${user.id}`}
                  className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                >
                  <img
                    src={user.avatar || '/default-avatar.png'}
                    alt={user.nickname}
                    className="w-8 h-8 rounded-full object-cover border-2 border-indigo-500"
                  />
                  <span className="hidden sm:block">{user.nickname}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-300 hover:text-red-400 transition-colors"
                  title="退出登录"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <Link to="/login" className="btn-primary text-sm">
                登录 / 注册
              </Link>
            )}
          </div>

          <button
            className="md:hidden p-2 text-gray-300"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden glass-effect border-t border-white/5">
          <div className="px-4 py-4 space-y-3">
            <Link
              to="/"
              className="block px-4 py-2 text-gray-300 hover:text-white rounded-lg hover:bg-white/5"
              onClick={() => setMobileMenuOpen(false)}
            >
              首页
            </Link>
            {user ? (
              <>
                <Link
                  to="/create"
                  className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-white rounded-lg hover:bg-white/5"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <PenSquare className="w-4 h-4" />
                  <span>发帖</span>
                </Link>
                <Link
                  to={`/profile/${user.id}`}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-white rounded-lg hover:bg-white/5"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="w-4 h-4" />
                  <span>个人主页</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-red-400 rounded-lg hover:bg-white/5"
                >
                  <LogOut className="w-4 h-4" />
                  <span>退出登录</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="block px-4 py-2 text-center btn-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                登录 / 注册
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

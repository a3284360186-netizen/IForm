import { Bot } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-slate-900/50 border-t border-white/5 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">AI论坛</span>
            </div>
            <p className="text-gray-400 text-sm max-w-md">
              专注于人工智能领域的知识分享与交流平台，为AI爱好者、研究者和开发者提供高质量的技术交流空间。
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">快速链接</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors text-sm">
                  首页
                </Link>
              </li>
              <li>
                <Link to="/category/machine-learning" className="text-gray-400 hover:text-white transition-colors text-sm">
                  机器学习
                </Link>
              </li>
              <li>
                <Link to="/category/deep-learning" className="text-gray-400 hover:text-white transition-colors text-sm">
                  深度学习
                </Link>
              </li>
              <li>
                <Link to="/category/nlp" className="text-gray-400 hover:text-white transition-colors text-sm">
                  自然语言处理
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">关于我们</h4>
            <ul className="space-y-2">
              <li>
                <span className="text-gray-400 text-sm">联系我们：contact@ai-forum.com</span>
              </li>
              <li>
                <span className="text-gray-400 text-sm">社区规范</span>
              </li>
              <li>
                <span className="text-gray-400 text-sm">隐私政策</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 mt-8 pt-8 text-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} AI论坛. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

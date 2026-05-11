import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Bold, Italic, Code, Link as LinkIcon, List, ListOrdered, Image, Eye, Edit3 } from 'lucide-react'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function MarkdownEditor({ value, onChange, placeholder = '在这里输入内容...' }: MarkdownEditorProps) {
  const [isPreview, setIsPreview] = useState(false)

  const insertText = (before: string, after: string = '') => {
    const textarea = document.querySelector('textarea')
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end)
    onChange(newText)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, end + before.length)
    }, 0)
  }

  const tools = [
    { icon: Bold, action: () => insertText('**', '**'), title: '粗体' },
    { icon: Italic, action: () => insertText('*', '*'), title: '斜体' },
    { icon: Code, action: () => insertText('`', '`'), title: '代码' },
    { icon: LinkIcon, action: () => insertText('[', '](url)'), title: '链接' },
    { icon: List, action: () => insertText('\n- '), title: '无序列表' },
    { icon: ListOrdered, action: () => insertText('\n1. '), title: '有序列表' },
    { icon: Image, action: () => insertText('![alt](', ')'), title: '图片' },
  ]

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden bg-slate-800/50">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800/80 border-b border-white/5">
        <div className="flex items-center space-x-1">
          {tools.map((tool, index) => (
            <button
              key={index}
              type="button"
              onClick={tool.action}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title={tool.title}
            >
              <tool.icon className="w-4 h-4" />
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setIsPreview(false)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              !isPreview ? 'bg-indigo-500 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Edit3 className="w-4 h-4 inline-block mr-1" />
            编辑
          </button>
          <button
            type="button"
            onClick={() => setIsPreview(true)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              isPreview ? 'bg-indigo-500 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Eye className="w-4 h-4 inline-block mr-1" />
            预览
          </button>
        </div>
      </div>

      {isPreview ? (
        <div className="p-6 min-h-64 markdown-content">
          {value ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
          ) : (
            <p className="text-gray-500">预览为空</p>
          )}
        </div>
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full min-h-64 p-4 bg-transparent text-gray-200 resize-none outline-none font-mono text-sm"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        />
      )}
    </div>
  )
}

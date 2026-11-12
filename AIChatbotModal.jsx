import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { aiAPI } from '../api/axios'
import {
  HiOutlineSparkles,
  HiOutlineChatBubbleLeftRight,
  HiOutlineXMark,
  HiOutlinePaperAirplane,
  HiOutlineBookOpen,
  HiOutlineShieldCheck,
  HiOutlineCalendarDays,
  HiOutlineArrowPath,
} from 'react-icons/hi2'

export default function AIChatbotModal() {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: `Hello ${user?.name || 'there'}! 👋 I am **IntelliBot**, your AI academic & attendance assistant.

I have direct access to your college's **syllabus documents**, **attendance rules**, **7-day penalty policies**, and **academic calendar**.

How can I help you today?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const quickPrompts = [
    { label: 'BDA301 Unit 2 Syllabus', icon: HiOutlineBookOpen, query: 'What are the topics in Big Data Analytics Unit 2?' },
    { label: 'Attendance & 7-Day Penalty Rules', icon: HiOutlineShieldCheck, query: 'Explain the 75% attendance rule and the 7-day penalty for proxy attendance.' },
    { label: 'Exam Schedule & Midterms', icon: HiOutlineCalendarDays, query: 'When are the mid-term and semester final exams scheduled?' },
    { label: 'How does AI risk scoring work?', icon: HiOutlineSparkles, query: 'How does the AI attendance engine calculate risk scores and select students for verification?' },
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isOpen])

  const handleSend = async (queryText) => {
    const textToSend = queryText || input
    if (!textToSend.trim() || loading) return

    const userMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMessage])
    if (!queryText) setInput('')
    setLoading(true)

    try {
      const res = await aiAPI.chat({
        message: textToSend.trim(),
        role: user?.role || 'student',
        history: messages.slice(-4).map((m) => ({
          sender: m.sender,
          text: m.text,
        })),
      })

      const botReply = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: res.data.reply || 'No response received from AI engine.',
        sources: res.data.sources || [],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }

      setMessages((prev) => [...prev, botReply])
    } catch (error) {
      console.error('Chat error:', error)
      const errorReply = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: '⚠️ Sorry, I could not process your request at this moment. Please check if the backend server is reachable or try again shortly.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, errorReply])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Format simple markdown into JSX
  const renderFormattedText = (content) => {
    return content.split('\n').map((line, idx) => {
      // Headers
      if (line.startsWith('### ')) {
        return <h4 key={idx} className="font-bold text-slate-900 mt-2 mb-1">{line.replace('### ', '')}</h4>
      }
      if (line.startsWith('## ')) {
        return <h3 key={idx} className="font-bold text-slate-900 text-base mt-2 mb-1">{line.replace('## ', '')}</h3>
      }
      if (line.startsWith('# ')) {
        return <h2 key={idx} className="font-bold text-slate-900 text-lg mt-3 mb-1">{line.replace('# ', '')}</h2>
      }
      // Bullet list items
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const item = line.trim().substring(2)
        return (
          <li key={idx} className="ml-4 list-disc text-slate-700 text-xs sm:text-sm my-0.5">
            {formatBold(item)}
          </li>
        )
      }
      // Blockquotes
      if (line.startsWith('> ')) {
        return (
          <div key={idx} className="border-l-2 border-primary-500 pl-2 text-xs text-slate-600 italic my-1.5">
            {line.replace('> ', '')}
          </div>
        )
      }
      // Empty lines
      if (!line.trim()) {
        return <div key={idx} className="h-1.5" />
      }
      // Regular line
      return (
        <p key={idx} className="text-xs sm:text-sm text-slate-800 leading-relaxed">
          {formatBold(line)}
        </p>
      )
    })
  }

  const formatBold = (str) => {
    const parts = str.split(/(\*\*.*?\*\*|\*.*?\*)/g)
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={i} className="italic text-slate-700">{part.slice(1, -1)}</em>
      }
      return part
    })
  }

  return (
    <>
      {/* Floating Pill Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-0.5 group"
            title="Ask IntelliBot AI Assistant"
          >
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:rotate-12 transition-transform">
              <HiOutlineSparkles className="w-5 h-5 text-yellow-200" />
            </div>
            <div className="text-left pr-1">
              <div className="text-xs font-bold tracking-wide uppercase text-indigo-100 flex items-center gap-1">
                IntelliBot AI
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block ml-0.5" />
              </div>
              <div className="text-[11px] text-white/80">Ask Syllabus & Rules</div>
            </div>
          </button>
        )}
      </div>

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-6 right-4 sm:right-6 w-[94vw] sm:w-[440px] h-[580px] max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-700 via-primary-600 to-indigo-700 text-white px-4 py-3.5 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center border border-white/20">
                <HiOutlineSparkles className="w-5 h-5 text-amber-200" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-display font-bold text-sm text-white">IntelliBot AI</h3>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 px-1.5 py-0.2 rounded-full font-semibold">
                    RAG Knowledge Base
                  </span>
                </div>
                <p className="text-[11px] text-indigo-100/80">College Syllabus & Attendance Policy Assistant</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <HiOutlineXMark size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/60">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center shrink-0 mt-0.5 border border-primary-200">
                    <HiOutlineSparkles size={14} />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-sm text-xs sm:text-sm ${
                    msg.sender === 'user'
                      ? 'bg-primary-600 text-white rounded-br-none'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none'
                  }`}
                >
                  <div className="space-y-1">{renderFormattedText(msg.text)}</div>
                  <div
                    className={`text-[10px] mt-1 text-right font-mono ${
                      msg.sender === 'user' ? 'text-primary-200' : 'text-slate-400'
                    }`}
                  >
                    {msg.time}
                  </div>
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex gap-2.5 justify-start items-center">
                <div className="w-7 h-7 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center shrink-0 border border-primary-200">
                  <HiOutlineArrowPath className="w-4 h-4 animate-spin text-primary-600" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl px-4 py-2.5 rounded-bl-none shadow-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-primary-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-primary-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="text-xs text-slate-400 ml-1.5 font-medium">Retrieving from syllabus & policies...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="px-3 py-2 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto no-scrollbar">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p.query)}
                disabled={loading}
                className="shrink-0 text-[11px] font-medium text-slate-600 hover:text-primary-700 bg-slate-100 hover:bg-primary-50 hover:border-primary-200 border border-slate-200 rounded-lg px-2.5 py-1 transition-all flex items-center gap-1 disabled:opacity-50"
              >
                <p.icon size={12} className="text-primary-600" />
                {p.label}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3 bg-white border-t border-slate-200">
            <div className="relative flex items-center">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about syllabus, units, attendance rules..."
                rows={1}
                disabled={loading}
                className="w-full resize-none input pr-10 py-2.5 text-xs sm:text-sm rounded-xl focus:ring-2 focus:ring-primary-500 border-slate-200"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                className="absolute right-2 p-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg disabled:opacity-40 disabled:hover:bg-primary-600 transition-colors"
                title="Send message"
              >
                <HiOutlinePaperAirplane size={14} />
              </button>
            </div>
            <div className="text-[10px] text-slate-400 text-center mt-1">
              Press <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-200 rounded text-[9px]">Enter</kbd> to ask IntelliBot
            </div>
          </div>
        </div>
      )}
    </>
  )
}

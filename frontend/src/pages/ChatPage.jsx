import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { sendChatMessage } from '../api/chat'

function ChatPage() {
  const { token } = useAuth()
  const navigate = useNavigate()

  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(event) {
    event.preventDefault()
    const trimmed = input.trim()
    if (!trimmed) return

    setMessages((prev) => [...prev, { role: 'user', text: trimmed }])
    setInput('')
    setSending(true)
    setError('')

    try {
      const data = await sendChatMessage(token, trimmed)
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: data.response, candidates: data.matched_candidates }
      ])
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-160px)]">
      <div className="flex items-center justify-between mb-md">
        <div>
          <p className="font-mono text-label-sm text-secondary uppercase tracking-widest">Ask Anything</p>
          <h1 className="font-headline text-headline-lg text-on-surface">Chat Assistant</h1>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="h-9 px-sm rounded-lg border border-outline-variant/30 font-mono text-label-sm text-on-surface shrink-0"
        >
          Dashboard
        </button>
      </div>

      <div className="flex-grow overflow-y-auto space-y-md pb-md">
        {messages.length === 0 && (
          <div className="border border-dashed border-secondary bg-[#f5f3ff] p-md rounded-xl flex gap-md items-start">
            <span className="material-symbols-outlined text-secondary shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
              auto_awesome
            </span>
            <p className="font-body text-body-sm text-on-surface-variant">
              Try asking: "Show me Python candidates" or "List shortlisted candidates with 5+ years experience"
            </p>
          </div>
        )}

        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-md py-sm ${
              msg.role === 'user'
                ? 'bg-secondary text-on-secondary'
                : 'bg-surface-container-lowest border border-outline-variant/10 shadow-card'
            }`}>
              <p className={`font-body text-body-sm ${msg.role === 'user' ? 'text-on-secondary' : 'text-on-surface'}`}>
                {msg.text}
              </p>

              {msg.candidates && msg.candidates.length > 0 && (
                <div className="mt-sm space-y-xs">
                  {msg.candidates.map((c) => (
                    <Link
                      key={c.id}
                      to={`/candidates/${c.id}`}
                      className="flex items-center justify-between bg-surface-container-low rounded-lg px-sm py-xs hover:bg-surface-container transition-colors"
                    >
                      <span className="font-body text-body-sm text-on-surface font-semibold">{c.name}</span>
                      <span className="font-mono text-label-sm text-on-surface-variant">
                        {c.status} · {c.experience_years} yrs
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex justify-start">
            <div className="bg-surface-container-lowest border border-outline-variant/10 shadow-card rounded-2xl px-md py-sm">
              <p className="font-body text-body-sm text-on-surface-variant">Thinking...</p>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {error && (
        <p className="font-body text-body-sm text-error bg-error-container/40 px-md py-xs rounded-lg mb-sm">{error}</p>
      )}

      <form onSubmit={handleSend} className="flex gap-sm">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your candidates..."
          disabled={sending}
          className="flex-grow h-12 px-md bg-surface-container-low border border-outline-variant/30 rounded-lg font-body text-body-md outline-none focus:bg-white focus:border-secondary disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="h-12 w-12 bg-secondary text-on-secondary rounded-lg flex items-center justify-center disabled:opacity-50 shrink-0"
        >
          <span className="material-symbols-outlined">send</span>
        </button>
      </form>
    </div>
  )
}

export default ChatPage
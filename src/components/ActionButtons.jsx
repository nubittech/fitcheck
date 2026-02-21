import React, { useRef, useState } from 'react'
import '../styles/ActionButtons.css'

const THROTTLE_MS = 600

const ActionButtons = ({ myVote, onDislike, onMessage, onLike }) => {
  const [animating, setAnimating] = useState(null)
  const lastCall = useRef(0)

  const handleVote = (type, handler) => {
    const now = Date.now()
    if (now - lastCall.current < THROTTLE_MS) return // throttle — prevent spam
    lastCall.current = now

    setAnimating(type)
    handler?.()
    setTimeout(() => setAnimating(null), 600)
  }

  return (
    <div className="action-buttons">
      {/* Dislike */}
      <button
        className={`action-btn skip-btn ${myVote === 'dislike' ? 'voted-dislike' : ''} ${animating === 'dislike' ? 'pop' : ''}`}
        onClick={() => handleVote('dislike', onDislike)}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Message */}
      <button className="action-btn comment-btn" onClick={onMessage}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>

      {/* Like */}
      <button
        className={`action-btn like-btn ${myVote === 'like' ? 'voted-like' : ''} ${animating === 'like' ? 'pop' : ''}`}
        onClick={() => handleVote('like', onLike)}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" stroke="none">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>
    </div>
  )
}

export default ActionButtons

import React, { useState, useEffect, useRef } from 'react'
import '../styles/BottomSheet.css'

const BottomSheet = ({ outfit, onClose, onItemVote }) => {
  const [isClosing, setIsClosing] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const startY = useRef(0)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(onClose, 300)
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) handleClose()
  }

  const handleTouchStart = (e) => {
    startY.current = e.touches[0].clientY
  }

  const handleTouchEnd = (e) => {
    const diff = e.changedTouches[0].clientY - startY.current
    if (diff > 80) handleClose()
  }

  return (
    <div className={`sheet-overlay ${isClosing ? 'closing' : ''}`} onClick={handleOverlayClick}>
      <div
        className={`bottom-sheet ${isClosing ? 'closing' : ''}`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="sheet-handle" />

        {/* Caption */}
        <div className="sheet-section">
          <p className="sheet-caption">{outfit.caption}</p>
        </div>

        {/* Item votes */}
        <div className="sheet-section">
          <h4 className="sheet-section-title">Rate each item</h4>
          <div className="item-vote-list">
            {outfit.items.map(item => {
              const total = item.votes.up + item.votes.down
              const pct = total > 0 ? Math.round((item.votes.up / total) * 100) : null
              return (
                <div key={item.id} className="item-vote-row">
                  <span className="item-vote-name">{item.name}</span>
                  <div className="item-vote-actions">
                    <button className="vote-btn vote-down" onClick={() => onItemVote(item.id, 'down')}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                    <span className="vote-pct">{pct !== null ? `${pct}%` : 'Vote?'}</span>
                    <button className={`vote-btn vote-up ${pct !== null && pct >= 70 ? 'highlighted' : ''}`} onClick={() => onItemVote(item.id, 'up')}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Nerden aldin */}
        <div className="sheet-section">
          <button className="nerden-btn">
            NERDEN ALDIN?
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 6h-2c0-2.21-1.79-4-4-4S8 3.79 8 6H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6-2c1.1 0 2 .9 2 2h-4c0-1.1.9-2 2-2zm6 16H6V8h2v2c0 .55.45 1 1 1s1-.45 1-1V8h4v2c0 .55.45 1 1 1s1-.45 1-1V8h2v12z"/></svg>
          </button>
        </div>

        {/* Comments */}
        <div className="sheet-section">
          <div className="sheet-section-header">
            <h4 className="sheet-section-title">Comments</h4>
            <span className="sheet-count">{outfit.comments.length}</span>
          </div>
          <div className="sheet-comments">
            {outfit.comments.length === 0 ? (
              <div className="no-comments">
                <p>No comments yet</p>
                <span>Be the first to comment!</span>
              </div>
            ) : (
              outfit.comments.map(comment => (
                <div key={comment.id} className="comment-item">
                  <img className="comment-avatar" src={comment.avatar} alt={comment.user} />
                  <div className="comment-body">
                    <div className="comment-header">
                      <span className="comment-user">{comment.user}</span>
                      <span className="comment-time">{comment.timestamp}</span>
                    </div>
                    <p className="comment-text">{comment.text}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Comment input */}
        <div className="sheet-input">
          <input
            type="text"
            placeholder="Add a comment..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button className="send-btn" disabled={!inputValue.trim()}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default BottomSheet

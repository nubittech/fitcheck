import React, { useState, useEffect, useRef } from 'react'
import '../styles/BottomSheet.css'

const BottomSheet = ({ comments, onClose }) => {
  const [isClosing, setIsClosing] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const sheetRef = useRef(null)
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
    if (diff > 100) handleClose()
  }

  return (
    <div className={`sheet-overlay ${isClosing ? 'closing' : ''}`} onClick={handleOverlayClick}>
      <div
        ref={sheetRef}
        className={`bottom-sheet ${isClosing ? 'closing' : ''}`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="sheet-handle" />
        <div className="sheet-header">
          <h3>Comments</h3>
          <span className="sheet-count">{comments.length}</span>
        </div>

        <div className="sheet-content">
          {comments.length === 0 ? (
            <div className="no-comments">
              <p>No comments yet</p>
              <span>Be the first to comment!</span>
            </div>
          ) : (
            comments.map(comment => (
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

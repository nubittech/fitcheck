import React, { useState, useRef } from 'react'
import ActionButtons from './ActionButtons'
import ItemDots from './ItemDots'
import MediaCarousel from './MediaCarousel'
import '../styles/OutfitCard.css'

const OutfitCard = ({ outfit, onNext, onSkip, onLike, onItemVote, onUserTap }) => {
  const [expanded, setExpanded] = useState(false)
  const [swipeDir, setSwipeDir] = useState(null)
  const [offsetX, setOffsetX] = useState(0)
  const [dragY, setDragY] = useState(0)
  const startX = useRef(0)
  const startY = useRef(0)
  const isDragging = useRef(false)
  const swipeAxis = useRef(null)
  const panelRef = useRef(null)
  const [inputValue, setInputValue] = useState('')

  // Card swipe (left/right) + panel open (swipe up on peek)
  const handleCardTouchStart = (e) => {
    if (expanded) return
    startX.current = e.touches[0].clientX
    startY.current = e.touches[0].clientY
    isDragging.current = true
    swipeAxis.current = null
    setSwipeDir(null)
  }

  const handleCardTouchMove = (e) => {
    if (!isDragging.current || expanded) return
    const diffX = e.touches[0].clientX - startX.current
    const diffY = e.touches[0].clientY - startY.current

    if (!swipeAxis.current && (Math.abs(diffX) > 10 || Math.abs(diffY) > 10)) {
      swipeAxis.current = Math.abs(diffX) > Math.abs(diffY) ? 'x' : 'y'
    }

    if (swipeAxis.current === 'x') {
      setOffsetX(diffX)
    }
  }

  const handleCardTouchEnd = (e) => {
    if (!isDragging.current || expanded) return
    isDragging.current = false

    if (swipeAxis.current === 'x' && Math.abs(offsetX) > 100) {
      if (offsetX > 0) {
        setSwipeDir('right')
        onLike()
        setTimeout(() => { setSwipeDir(null); onNext() }, 300)
      } else {
        setSwipeDir('left')
        setTimeout(() => { setSwipeDir(null); onSkip() }, 300)
      }
    }

    setOffsetX(0)
    swipeAxis.current = null
  }

  // Panel drag (on the peek bar handle area)
  const handlePanelTouchStart = (e) => {
    e.stopPropagation()
    startY.current = e.touches[0].clientY
    isDragging.current = true
    setDragY(0)
  }

  const handlePanelTouchMove = (e) => {
    e.stopPropagation()
    if (!isDragging.current) return
    const diffY = e.touches[0].clientY - startY.current

    if (expanded) {
      // Only allow dragging down when expanded
      if (diffY > 0) setDragY(diffY)
    } else {
      // Only allow dragging up when collapsed
      if (diffY < 0) setDragY(diffY)
    }
  }

  const handlePanelTouchEnd = (e) => {
    e.stopPropagation()
    isDragging.current = false

    if (expanded && dragY > 60) {
      setExpanded(false)
    } else if (!expanded && dragY < -60) {
      setExpanded(true)
    }

    setDragY(0)
  }

  return (
    <div className="outfit-card-wrapper">
      <div
        className={`outfit-card ${swipeDir ? `swipe-${swipeDir}` : ''}`}
        style={{ transform: offsetX ? `translateX(${offsetX}px) rotate(${offsetX * 0.04}deg)` : undefined }}
        onTouchStart={handleCardTouchStart}
        onTouchMove={handleCardTouchMove}
        onTouchEnd={handleCardTouchEnd}
      >
        {/* Media carousel */}
        <MediaCarousel media={outfit.media} />
        <div className="card-gradient" />

        {/* Top bar */}
        <div className="card-top-bar">
          <div className="top-avatar-placeholder" />
          <span className="top-title">OOTD</span>
          <button className="top-bell">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 002 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
            </svg>
            <div className="bell-dot" />
          </button>
        </div>

        {/* Item dots */}
        <ItemDots items={outfit.items} />

        {/* User info */}
        <div className="card-user-bar">
          <div className="user-info" onClick={onUserTap} style={{ cursor: 'pointer' }}>
            <img className="user-avatar" src={outfit.user.avatar} alt={outfit.user.name} />
            <div>
              <div className="user-name">{outfit.user.name}, {outfit.user.age}</div>
              <div className="user-location">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/></svg>
                {outfit.user.location}
              </div>
            </div>
          </div>
          <button className="share-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/>
              <polyline points="16 6 12 2 8 6"/>
              <line x1="12" y1="2" x2="12" y2="15"/>
            </svg>
          </button>
        </div>

        {/* Caption */}
        <div className="card-caption-bar">
          <p className="card-caption">{outfit.caption}</p>
        </div>

        {/* Expandable panel */}
        <div
          ref={panelRef}
          className={`slide-panel ${expanded ? 'expanded' : ''}`}
          style={dragY ? { transform: expanded ? `translateY(${dragY}px)` : `translateY(calc(100% - 86px + ${dragY}px))` } : undefined}
          onTouchStart={handlePanelTouchStart}
          onTouchMove={handlePanelTouchMove}
          onTouchEnd={handlePanelTouchEnd}
        >
          <div className="panel-handle" />

          {/* Action buttons — always visible */}
          <ActionButtons
            onSkip={onSkip}
            onLike={onLike}
            onComment={() => setExpanded(true)}
          />

          <div className="panel-hint" onClick={() => setExpanded(!expanded)}>
            <svg
              className={expanded ? 'flipped' : ''}
              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            >
              <polyline points="18 15 12 9 6 15"/>
            </svg>
            <span>{expanded ? 'Close' : 'Swipe up for details'}</span>
          </div>

          {/* Expandable content */}
          <div className="panel-detail-content">
            {/* Item votes */}
            <div className="panel-section">
              <h4 className="panel-section-title">Rate each item</h4>
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
            <div className="panel-section">
              <button className="nerden-btn">
                NERDEN ALDIN?
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 6h-2c0-2.21-1.79-4-4-4S8 3.79 8 6H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6-2c1.1 0 2 .9 2 2h-4c0-1.1.9-2 2-2zm6 16H6V8h2v2c0 .55.45 1 1 1s1-.45 1-1V8h4v2c0 .55.45 1 1 1s1-.45 1-1V8h2v12z"/></svg>
              </button>
            </div>

            {/* Comments */}
            <div className="panel-section">
              <div className="panel-section-header">
                <h4 className="panel-section-title">Comments</h4>
                <span className="panel-count">{outfit.comments.length}</span>
              </div>
              <div className="panel-comments">
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
                        <div className="comment-header-row">
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
            <div className="panel-input">
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
      </div>
    </div>
  )
}

export default OutfitCard

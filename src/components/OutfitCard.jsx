import React, { useState, useRef } from 'react'
import ActionButtons from './ActionButtons'
import ItemDots from './ItemDots'
import BottomSheet from './BottomSheet'
import '../styles/OutfitCard.css'

const OutfitCard = ({ outfit, onNext, onPrevious, onSkip, onLike }) => {
  const [showSheet, setShowSheet] = useState(false)
  const [swipeDir, setSwipeDir] = useState(null)
  const [offsetX, setOffsetX] = useState(0)
  const startX = useRef(0)
  const isDragging = useRef(false)

  const handleTouchStart = (e) => {
    startX.current = e.touches[0].clientX
    isDragging.current = true
    setSwipeDir(null)
  }

  const handleTouchMove = (e) => {
    if (!isDragging.current) return
    const diff = e.touches[0].clientX - startX.current
    setOffsetX(diff)
  }

  const handleTouchEnd = () => {
    isDragging.current = false
    if (Math.abs(offsetX) > 100) {
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
  }

  return (
    <div className="outfit-card-wrapper">
      <div
        className={`outfit-card ${swipeDir ? `swipe-${swipeDir}` : ''}`}
        style={{ transform: offsetX ? `translateX(${offsetX}px) rotate(${offsetX * 0.05}deg)` : undefined }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="card-image">
          <img src={outfit.image} alt="outfit" />

          {/* Gradient overlay */}
          <div className="card-gradient" />

          {/* User info */}
          <div className="card-header">
            <div className="user-info">
              <img className="user-avatar" src={outfit.user.avatar} alt={outfit.user.name} />
              <div>
                <div className="user-name">
                  {outfit.user.name}
                  {outfit.user.isPremium && <span className="premium-badge">PRO</span>}
                </div>
                <div className="user-location">{outfit.user.location}</div>
              </div>
            </div>
            {outfit.isBoosted && <div className="boosted-tag">Boosted</div>}
          </div>

          {/* Item dots */}
          <ItemDots items={outfit.items} />

          {/* Caption & stats */}
          <div className="card-footer">
            <p className="card-caption">{outfit.caption}</p>
            <div className="card-stats">
              <span>{outfit.stats.views} views</span>
              <span>·</span>
              <span>{outfit.stats.likes} likes</span>
              <span>·</span>
              <span>{outfit.stats.commentsCount} comments</span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <ActionButtons
          onSkip={onSkip}
          onLike={onLike}
          onComment={() => setShowSheet(true)}
        />
      </div>

      {/* Bottom sheet for comments */}
      {showSheet && (
        <BottomSheet
          comments={outfit.comments}
          onClose={() => setShowSheet(false)}
        />
      )}
    </div>
  )
}

export default OutfitCard

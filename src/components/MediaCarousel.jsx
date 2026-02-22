import React, { useState, useRef, useCallback } from 'react'
import '../styles/MediaCarousel.css'

const MediaCarousel = ({ media, onIndexChange }) => {
  const mediaList = Array.isArray(media) ? media : []
  const [currentIndex, setCurrentIndex] = useState(0)

  // Notify parent whenever slide changes
  const goToIndex = useCallback((idx) => {
    setCurrentIndex(idx)
    onIndexChange?.(idx)
  }, [onIndexChange])

  const containerRef = useRef(null)

  // Touch tracking — distinguish tap vs drag
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const touchStartTime = useRef(0)

  const handleTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    touchStartTime.current = Date.now()
  }, [])

  const handleTouchEnd = useCallback((e) => {
    const elapsed = Date.now() - touchStartTime.current
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = e.changedTouches[0].clientY - touchStartY.current

    // Pure tap (< 300ms, moved < 10px) → zone navigation
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10 && elapsed < 300) {
      const tapX = e.changedTouches[0].clientX
      const width = window.innerWidth

      if (tapX < width * 0.25) {
        goToIndex(Math.max(currentIndex - 1, 0))
      } else if (tapX > width * 0.75) {
        goToIndex(Math.min(currentIndex + 1, mediaList.length - 1))
      }
      // Middle 50% does nothing, lets OutfitCard handle clicks/swipes
    }
  }, [currentIndex, mediaList.length, goToIndex])

  const goTo = useCallback((index) => goToIndex(index), [goToIndex])

  const safeIndex = Math.min(currentIndex, Math.max(mediaList.length - 1, 0))
  const current = mediaList[safeIndex]

  if (mediaList.length === 0) {
    return (
      <div className="media-carousel">
        <div className="carousel-empty">No media</div>
      </div>
    )
  }

  return (
    <div className="media-carousel" ref={containerRef}>
      <div
        className="carousel-track"
        style={{
          transform: `translateX(-${safeIndex * 100}%)`,
          transition: 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {mediaList.map((item, index) => (
          <div className="carousel-slide" key={item.id}>
            {item.type === 'video' ? (
              <video
                className="carousel-video"
                src={item.url}
                poster={item.thumbnail}
                muted
                loop
                playsInline
                autoPlay={index === safeIndex}
              />
            ) : (
              <img className="carousel-img" src={item.url} alt="outfit" />
            )}
          </div>
        ))}
      </div>

      {/* Media type badge */}
      {current.type === 'video' && (
        <div className="media-badge video-badge">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
          Video
        </div>
      )}

      {/* Counter badge */}
      <div className="media-counter">
        {safeIndex + 1} / {mediaList.length}
      </div>

      {/* Indicator dots */}
      {mediaList.length > 1 && (
        <div className="carousel-dots">
          {mediaList.map((item, index) => (
            <button
              key={item.id}
              className={`carousel-dot ${index === safeIndex ? 'active' : ''} ${item.type === 'video' ? 'dot-video' : ''}`}
              onClick={() => goTo(index)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default MediaCarousel

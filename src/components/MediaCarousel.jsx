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
  const touchStartTime = useRef(0)
  const hasMoved = useRef(false)

  const handleTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX
    touchStartTime.current = Date.now()
    hasMoved.current = false
  }, [])

  const handleTouchMove = useCallback((e) => {
    const dx = Math.abs(e.touches[0].clientX - touchStartX.current)
    if (dx > 8) hasMoved.current = true
  }, [])

  const handleTouchEnd = useCallback((e) => {
    const elapsed = Date.now() - touchStartTime.current
    const dx = e.changedTouches[0].clientX - touchStartX.current

    // Pure tap (< 250ms, moved < 8px) → zone navigation
    if (!hasMoved.current && elapsed < 250) {
      const rect = containerRef.current?.getBoundingClientRect()
      const tapX = e.changedTouches[0].clientX
      const midX = rect ? rect.left + rect.width / 2 : window.innerWidth / 2

      if (tapX > midX) goToIndex(Math.min(currentIndex + 1, mediaList.length - 1))
      else goToIndex(Math.max(currentIndex - 1, 0))
      return
    }

    // Swipe gesture fallback (still works for deliberate slow swipes)
    if (Math.abs(dx) > 60) {
      if (dx < 0) goToIndex(Math.min(currentIndex + 1, mediaList.length - 1))
      else goToIndex(Math.max(currentIndex - 1, 0))
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
        onTouchMove={handleTouchMove}
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

      {/* Tap zone hints (subtle, invisible touch targets) */}
      {mediaList.length > 1 && (
        <>
          <div
            className="tap-zone tap-zone-left"
            onTouchStart={(e) => { e.stopPropagation(); goToIndex(Math.max(currentIndex - 1, 0)) }}
          />
          <div
            className="tap-zone tap-zone-right"
            onTouchStart={(e) => { e.stopPropagation(); goToIndex(Math.min(currentIndex + 1, mediaList.length - 1)) }}
          />
        </>
      )}

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

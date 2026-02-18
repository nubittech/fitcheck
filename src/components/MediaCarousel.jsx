import React, { useState, useRef, useCallback } from 'react'
import '../styles/MediaCarousel.css'

const MediaCarousel = ({ media }) => {
  const mediaList = Array.isArray(media) ? media : []
  const [currentIndex, setCurrentIndex] = useState(0)
  const containerRef = useRef(null)
  const startXRef = useRef(0)
  const offsetXRef = useRef(0)
  const [dragOffset, setDragOffset] = useState(0)
  const isDragging = useRef(false)

  const handleTouchStart = useCallback((e) => {
    startXRef.current = e.touches[0].clientX
    isDragging.current = true
    setDragOffset(0)
  }, [])

  const handleTouchMove = useCallback((e) => {
    if (!isDragging.current) return
    const diff = e.touches[0].clientX - startXRef.current
    offsetXRef.current = diff
    setDragOffset(diff)
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (!isDragging.current) return
    isDragging.current = false
    const threshold = 60

    if (offsetXRef.current < -threshold && currentIndex < mediaList.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else if (offsetXRef.current > threshold && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    }

    offsetXRef.current = 0
    setDragOffset(0)
  }, [currentIndex, mediaList.length])

  const goTo = useCallback((index) => {
    setCurrentIndex(index)
  }, [])

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
    <div className="media-carousel">
      <div
        ref={containerRef}
        className="carousel-track"
        style={{
          transform: `translateX(calc(-${safeIndex * 100}% + ${dragOffset}px))`,
          transition: dragOffset ? 'none' : 'transform 0.3s ease'
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

      {/* Media type badge */}
      {current.type === 'video' && (
        <div className="media-badge video-badge">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
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

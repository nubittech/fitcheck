import React, { useState } from 'react'
import '../styles/ItemDots.css'

// Items are shown only on the slide they belong to.
// Items without `mediaIndex` default to slide 0.
// Tapping a dot shows a shop popup if the item has an affiliate link.
const ItemDots = ({ items, currentSlide = 0 }) => {
  const [activeDot, setActiveDot] = useState(null) // item.id of tapped dot

  const visibleItems = items.filter(item =>
    item.position && (item.mediaIndex ?? 0) === currentSlide
  )

  if (visibleItems.length === 0) return null

  return (
    <div className="item-dots">
      {visibleItems.map(item => (
        <React.Fragment key={item.id}>
          <button
            className="item-dot"
            style={{ left: item.position.x, top: item.position.y }}
            onClick={(e) => {
              e.stopPropagation()
              setActiveDot(activeDot === item.id ? null : item.id)
            }}
          >
            <div className="dot-inner" />
          </button>

          {/* Shop popup — only if item has an affiliate link */}
          {activeDot === item.id && item.link && (
            <div
              className="dot-popup"
              style={{ left: item.position.x, top: item.position.y }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="dot-popup-info">
                <span className="dot-popup-name">{item.name}</span>
                {item.brand && item.brand !== 'Unknown' && (
                  <span className="dot-popup-brand">{item.brand}</span>
                )}
              </div>
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="dot-popup-btn"
                onClick={() => setActiveDot(null)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 6h-2c0-2.21-1.79-4-4-4S8 3.79 8 6H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6-2c1.1 0 2 .9 2 2h-4c0-1.1.9-2 2-2zm6 16H6V8h2v2c0 .55.45 1 1 1s1-.45 1-1V8h4v2c0 .55.45 1 1 1s1-.45 1-1V8h2v12z" />
                </svg>
                Satın Al
              </a>
              <button
                className="dot-popup-close"
                onClick={(e) => { e.stopPropagation(); setActiveDot(null) }}
              >
                ×
              </button>
            </div>
          )}
        </React.Fragment>
      ))}

      {/* Dismiss popup on background tap */}
      {activeDot && (
        <div
          className="dot-dismiss-bg"
          onClick={() => setActiveDot(null)}
        />
      )}
    </div>
  )
}

export default ItemDots

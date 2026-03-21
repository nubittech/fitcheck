import React from 'react'

const XPRing = ({ level = 1, avatarUrl, name, size = 120 }) => {
  return (
    <div className="xp-ring-wrap" style={{ width: size, height: size, position: 'relative' }}>
      {/* Outer Ring */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0,
        width: size, height: size,
        borderRadius: '50%',
        border: '6px solid #f68a7d',
        boxSizing: 'border-box'
      }}></div>

      {/* Avatar */}
      <div style={{
        position: 'absolute',
        top: 10, left: 10,
        width: size - 20, height: size - 20,
        borderRadius: '50%',
        overflow: 'hidden',
        background: '#1a1a1a',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '3px solid #f5f2f0',
        boxSizing: 'border-box'
      }}>
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontSize: size * 0.3, fontWeight: 700, color: '#555' }}>
            {(name || '?')[0].toUpperCase()}
          </span>
        )}
      </div>

      {/* Level badge */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        right: -8,
        background: '#ffffff',
        color: '#f0786c',
        fontSize: 14,
        fontWeight: 800,
        padding: '6px 14px',
        borderRadius: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#f0786c" stroke="none">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
        LV. {level}
      </div>
    </div>
  )
}

export default XPRing

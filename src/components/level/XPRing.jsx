import React from 'react'

const XPRing = ({ level = 1, avatarUrl, name, size = 120 }) => {
  return (
    <div className="xp-ring-wrap" style={{ width: size, height: size, position: 'relative' }}>
      <div style={{
        position: 'absolute',
        top: 0, left: 0,
        width: size, height: size,
        borderRadius: '50%',
        border: '4px solid #f68a7d',
        boxSizing: 'border-box'
      }}></div>

      {/* Avatar */}
      <div style={{
        position: 'absolute',
        top: 6, left: 6,
        width: size - 12, height: size - 12,
        borderRadius: '50%',
        overflow: 'hidden',
        background: '#1a1a1a',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '2px solid #fff'
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
        bottom: -6, left: '50%',
        transform: 'translateX(-50%)',
        background: '#ffffff',
        color: '#f0786c',
        fontSize: 12,
        fontWeight: 700,
        padding: '3px 10px',
        borderRadius: 16,
        border: '1px solid #ece7e3',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      }}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="#f0786c" stroke="none">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
        LV. {level}
      </div>
    </div>
  )
}

export default XPRing

import React from 'react'

const XPRing = ({ percentage = 0, level = 1, avatarUrl, name, size = 120 }) => {
  const radius = (size - 14) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - Math.min(percentage, 1))
  const center = size / 2

  return (
    <div className="xp-ring-wrap" style={{ width: size, height: size, position: 'relative' }}>
      <svg width={size} height={size} style={{ position: 'absolute', top: 0, left: 0 }}>
        {/* Arka plan halkasi */}
        <circle
          cx={center} cy={center} r={radius}
          fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="7"
        />
        {/* XP ilerleme halkasi */}
        <circle
          cx={center} cy={center} r={radius}
          fill="none" stroke="url(#xpGrad)" strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${center} ${center})`}
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
        <defs>
          <linearGradient id="xpGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="50%" stopColor="#FFA500" />
            <stop offset="100%" stopColor="#FF6B00" />
          </linearGradient>
        </defs>
      </svg>

      {/* Avatar */}
      <div style={{
        position: 'absolute',
        top: '7px', left: '7px',
        width: size - 14, height: size - 14,
        borderRadius: '50%',
        overflow: 'hidden',
        background: '#1a1a1a',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
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
        bottom: -4, left: '50%',
        transform: 'translateX(-50%)',
        background: 'linear-gradient(135deg, #FFD700, #FF8C00)',
        color: '#000',
        fontSize: 11,
        fontWeight: 800,
        padding: '2px 10px',
        borderRadius: 12,
        letterSpacing: '0.5px',
        boxShadow: '0 2px 8px rgba(255,165,0,0.4)',
      }}>
        LVL {level}
      </div>
    </div>
  )
}

export default XPRing

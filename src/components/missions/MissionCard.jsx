import React from 'react'

const MissionCard = ({ icon, title, progress, target, xp, completed, claimed, onClaim }) => {
  const pct = target > 0 ? Math.min(progress / target, 1) : 0

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '14px 16px',
      background: completed ? 'rgba(255,215,0,0.06)' : 'rgba(255,255,255,0.03)',
      borderRadius: 16,
      marginBottom: 8,
      border: completed ? '1px solid rgba(255,215,0,0.15)' : '1px solid rgba(255,255,255,0.06)',
      transition: 'all 0.3s ease',
    }}>
      {/* Icon */}
      <div style={{
        width: 44, height: 44,
        borderRadius: 12,
        background: completed ? 'rgba(255,215,0,0.15)' : 'rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22,
        flexShrink: 0,
      }}>
        {completed ? '✅' : (icon || '🎯')}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          color: completed ? 'rgba(255,215,0,0.9)' : '#fff',
          fontSize: 14,
          fontWeight: 600,
          marginBottom: 6,
          textDecoration: claimed ? 'line-through' : 'none',
          opacity: claimed ? 0.5 : 1,
        }}>
          {title}
        </div>

        {/* Progress bar */}
        <div style={{
          height: 6,
          borderRadius: 3,
          background: 'rgba(255,255,255,0.08)',
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${pct * 100}%`,
            height: '100%',
            borderRadius: 3,
            background: completed
              ? 'linear-gradient(90deg, #FFD700, #FF8C00)'
              : 'linear-gradient(90deg, #4FC3F7, #2196F3)',
            transition: 'width 0.5s ease',
          }} />
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 4,
        }}>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>
            {progress}/{target}
          </span>
          <span style={{
            color: completed ? '#FFD700' : 'rgba(255,255,255,0.4)',
            fontSize: 11,
            fontWeight: 600,
          }}>
            +{xp} XP
          </span>
        </div>
      </div>

      {/* Claim button */}
      {completed && !claimed && (
        <button
          onClick={(e) => { e.stopPropagation(); onClaim?.() }}
          style={{
            flexShrink: 0,
            padding: '8px 14px',
            borderRadius: 12,
            border: 'none',
            background: 'linear-gradient(135deg, #FFD700, #FF8C00)',
            color: '#000',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Al
        </button>
      )}
    </div>
  )
}

export default MissionCard

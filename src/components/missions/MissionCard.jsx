import React from 'react'

const MissionCard = ({ title, description, icon, progress, target, xp, completed, claimed, isAdmin, onClaim }) => {
  const pct = target > 0 ? Math.min((progress / target) * 100, 100) : 0
  const isClaimed = claimed
  const isDone = completed && !claimed

  return (
    <div
      className={`mission-card ${isAdmin ? 'admin-mission' : ''} ${isClaimed ? 'mission-claimed' : ''}`}
      onClick={isDone ? onClaim : undefined}
      style={{ cursor: isDone ? 'pointer' : 'default', opacity: isClaimed ? 0.65 : 1 }}
    >
      {/* Sol: İkon */}
      <div className={`mission-icon-wrap ${completed ? 'completed' : isAdmin ? 'admin' : 'default'}`}>
        {completed ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        ) : (
          <span style={{ fontSize: 18 }}>{icon || '🎯'}</span>
        )}
      </div>

      {/* Orta: Başlık + Bar */}
      <div className="mission-content">
        <div className="mission-title">{title}</div>
        {description && !completed && (
          <div className="mission-desc">{description}</div>
        )}

        {/* İlerleme barı */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
          <div style={{
            flex: 1, height: 4, borderRadius: 2,
            background: '#f0ebe8', overflow: 'hidden'
          }}>
            <div style={{
              height: '100%', borderRadius: 2,
              width: `${pct}%`,
              background: isClaimed
                ? '#ccc'
                : completed
                  ? 'linear-gradient(90deg, #f0c060, #e8943a)'
                  : isAdmin
                    ? 'linear-gradient(90deg, #6e8fc9, #4a6fa5)'
                    : 'linear-gradient(90deg, #f0786c, #e8503a)',
              transition: 'width 0.4s ease'
            }} />
          </div>
          <span style={{ fontSize: 11, color: '#9e8e88', fontWeight: 600, minWidth: 36, textAlign: 'right' }}>
            {isClaimed ? '✓' : `${progress}/${target}`}
          </span>
        </div>
      </div>

      {/* Sağ: XP */}
      <div className={`mission-xp-pill ${isClaimed ? 'claimed' : completed ? 'done' : isAdmin ? 'admin' : 'active'}`}>
        {isClaimed ? '✓ ALINDI' : isDone ? `AL +${xp}` : `+${xp} XP`}
      </div>
    </div>
  )
}

export default MissionCard

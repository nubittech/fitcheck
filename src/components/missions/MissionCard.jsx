import React from 'react'

// Action type'a göre özel SVG ikonlar — Veylo tasarım dili
const MissionIcon = ({ actionType, size = 22, isSuper }) => {
  const color = isSuper ? '#fdf0d5' : 'currentColor'

  switch (actionType) {
    case 'post_outfit':
      // Elbise / kombin paylaş ikonu — T-shirt style
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path d="M7 3L3 6v4h4v11h10V10h4V6l-4-3H7z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 3v3" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      )
    case 'ab_post':
      // A/B Kombin Paylaş — İki kart yan yana
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <rect x="2" y="6" width="9" height="12" rx="1.5" stroke={color} strokeWidth="1.8" />
          <rect x="13" y="6" width="9" height="12" rx="1.5" stroke={color} strokeWidth="1.8" />
          <path d="M4.5 12h4M15.5 12h4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M6.5 9v6M17.5 9v6" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
        </svg>
      )
    case 'like_outfit':
      // Kalp ikonu
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    case 'comment':
      // Yorum balonu ikonu
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    case 'receive_comment':
      // Gelen yorum ikonu
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 10h6M9 13h4" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      )
    case 'ab_vote':
      // A/B Oylama ikonu — iki kart ve checkmark
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <rect x="3" y="5" width="18" height="14" rx="2" stroke={color} strokeWidth="1.8"/>
          <path d="M12 5v14" stroke={color} strokeWidth="1" strokeDasharray="3 2" opacity="0.6" />
          <path d="M5 12.5l1.5 1.5 3-3" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'explore_profile':
      // Profil ziyaret ikonu
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="12" cy="7" r="4" stroke={color} strokeWidth="1.8"/>
        </svg>
      )
    case 'receive_like':
      // Gelen beğeni (dolu kalp)
      return (
        <svg width={size} height={size} viewBox="0 0 24 24">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill={color} stroke="none"/>
        </svg>
      )
    case 'link_sale':
      // Alışveriş çantası ikonu
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="3" y1="6" x2="21" y2="6" stroke={color} strokeWidth="1.8"/>
          <path d="M16 10a4 4 0 0 1-8 0" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      )
    case 'trend_finish':
      // Yıldız ikonu
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    case 'streak':
      // Seri/alev ikonu
      return (
        <svg width={size} height={size} viewBox="0 0 24 24">
          <path d="M12 23c-4.97 0-7-3.58-7-7 0-2.79 1.64-5.13 2.57-6.15.39-.43 1.09-.2 1.12.37l.1 1.76c.02.3.38.45.6.24C11.5 10.28 14 7.5 14 4c0-.55.47-.96 1-.79C18.67 4.54 21 8.14 21 12c0 4-2.5 7.5-6 9.17" fill={color} stroke="none"/>
        </svg>
      )
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.8"/>
          <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.8"/>
        </svg>
      )
  }
}

const MissionCard = ({ title, description, actionType, progress, target, xp, completed, claimed, isSuper, isAdmin, onClaim }) => {
  const pct = target > 0 ? Math.min((progress / target) * 100, 100) : 0
  const isClaimed = claimed
  const isDone = completed && !claimed

  // Günlük görevlerde ilerleme barı altında gösterilecek alt text
  const statusText = isClaimed
    ? 'TAMAMLANDI'
    : completed
      ? 'TAMAMLANDI'
      : isSuper
        ? 'SÜPER GÖREV'
        : `${progress}/${target}`

  return (
    <div
      className={`mission-card ${isSuper ? 'super-mission' : ''} ${isAdmin ? 'admin-mission' : ''} ${isClaimed ? 'mission-claimed' : ''}`}
      onClick={isDone ? onClaim : undefined}
      style={{ cursor: isDone ? 'pointer' : 'default', opacity: isClaimed ? 0.6 : 1 }}
    >
      {/* Sol: İkon */}
      <div className={`mission-icon-wrap ${completed ? 'completed' : isSuper ? 'super-icon' : isAdmin ? 'admin' : 'default'}`}>
        {completed ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <MissionIcon actionType={actionType} size={22} isSuper={isSuper} />
        )}
      </div>

      {/* Orta: Başlık + Alt yazı + Progress */}
      <div className="mission-content">
        <div className="mission-title">{title}</div>

        {/* Açıklama — tamamlanmamış tüm görevlerde */}
        {!completed && !isClaimed && description && (
          <div className="mission-desc">{description}</div>
        )}

        {/* Progress bar — tüm görev türlerinde */}
        <div className="mission-progress-row">
          <div className="mission-progress-track">
            <div
              className="mission-progress-fill"
              style={{
                width: `${pct}%`,
                background: isClaimed
                  ? '#ccc'
                  : completed
                    ? 'linear-gradient(90deg, #f0c060, #e8943a)'
                    : isSuper
                      ? 'linear-gradient(90deg, #d4a853, #b8860b)'
                      : isAdmin
                        ? 'linear-gradient(90deg, #6e8fc9, #4a6fa5)'
                        : 'linear-gradient(90deg, #f0786c, #e8503a)'
              }}
            />
          </div>
          {!isClaimed && (
            <span className="mission-progress-text">
              {completed ? '✓' : `${progress}/${target}`}
            </span>
          )}
        </div>

        {/* Tamamlandı etiketi */}
        {(isClaimed || completed) && (
          <div className="mission-subtitle" style={{ marginTop: 2 }}>TAMAMLANDI</div>
        )}
      </div>

      {/* Sağ: XP Pill */}
      <div className={`mission-xp-pill ${isClaimed ? 'claimed' : isDone ? 'done' : isSuper ? 'super' : isAdmin ? 'admin' : 'active'}`}>
        {isClaimed ? '✓' : isDone ? `AL +${xp}` : `+${xp} XP`}
      </div>
    </div>
  )
}

export default MissionCard

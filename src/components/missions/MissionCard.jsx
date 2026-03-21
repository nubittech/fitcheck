import React from 'react'

const getMissionIcon = (title, completed) => {
  if (completed) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    )
  }

  const t = title.toLowerCase()
  if (t.includes('like') || t.includes('beğeni')) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
         <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
      </svg>
    )
  }
  if (t.includes('yorum')) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
         <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
      </svg>
    )
  }
  if (t.includes('kombin') || t.includes('paylaş')) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
         <circle cx="12" cy="12" r="10"></circle>
         <path d="M12 8v8"></path>
         <path d="M8 12h8"></path>
      </svg>
    )
  }
  if (t.includes('satış') || t.includes('satis') || t.includes('link')) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
         <path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm7 17H5V8h14v12zm-7-8c-2.76 0-5-2.24-5-5h2c0 1.66 1.34 3 3 3s3-1.34 3-3h2c0 2.76-2.24 5-5 5z"></path>
      </svg>
    )
  }
  
  // Default target / task icon
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
       <polyline points="9 11 12 14 22 4"></polyline>
       <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
    </svg>
  )
}

const MissionCard = ({ title, progress, target, xp, completed, claimed, onClaim }) => {
  const isSuper = title.toLowerCase().includes('satış') || title.toLowerCase().includes('satis') || title.toLowerCase().includes('süper')
  const unitText = title.split(' ')[0] || 'ADET'

  let statusText = `${progress}/${target} ${unitText}`
  if (isSuper && progress === 0) statusText = 'SÜPER GÖREV'
  if (completed) {
     statusText = 'TAMAMLANDI'
  } else if (progress === 0 && !isSuper) {
     statusText = 'BEKLENİYOR'
  }

  return (
    <div 
      className={`mission-card ${isSuper ? 'super-mission' : ''}`}
      onClick={(completed && !claimed) ? onClaim : undefined}
      style={{ opacity: claimed ? 0.7 : 1 }}
    >
      <div className={`mission-icon-wrap ${completed ? 'completed' : (isSuper ? 'super-mission-icon' : 'default')}`}>
        {getMissionIcon(title, completed)}
      </div>

      <div className="mission-content">
        <div className="mission-title">{title}</div>
        <div className="mission-subtitle">{statusText.toUpperCase()}</div>
      </div>

      <div className={`mission-xp-pill ${claimed ? 'claimed' : (isSuper ? 'super' : 'active')}`}>
        {claimed ? 'ALINDI' : `+${xp} XP`}
      </div>
    </div>
  )
}

export default MissionCard

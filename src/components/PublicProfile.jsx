import React from 'react'
import '../styles/PublicProfile.css'

const MOCK_USER = {
  name: 'Sarah Miller',
  username: 'sarah_miller',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
  location: 'Brooklyn, NY',
  bio: 'Thrifting enthusiast & lover of earth tones. Always looking for the perfect vintage denim. Let\'s swap style tips! ✨',
  likes: '1.2k',
  outfits: 14,
  vibes: ['Minimalist', 'Vintage', 'Earth Tones', 'Boho'],
  looks: [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600',
      name: 'Linen Layers',
      timeLeft: '4H LEFT',
      isLive: true
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600',
      name: 'City Evening',
      timeLeft: '12H LEFT',
      isLive: true
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=600',
      name: 'Pop of Yellow',
      timeLeft: '1H LEFT',
      isLive: true
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600',
      name: 'Denim Days',
      timeLeft: '23H LEFT',
      isLive: true
    }
  ]
}

const PublicProfile = ({ onBack, onMessage }) => {
  const user = MOCK_USER

  return (
    <div className="public-profile-page">
      {/* Header */}
      <header className="pp-header">
        <button className="pp-back-btn" onClick={onBack}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span className="pp-header-title">PUBLIC PROFILE</span>
        <button className="pp-menu-btn">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" />
          </svg>
        </button>
      </header>

      <div className="pp-scroll-content">
        {/* Avatar */}
        <div className="pp-avatar-section">
          <div className="pp-avatar-ring">
            <img src={user.avatar} alt={user.name} className="pp-avatar-img" />
          </div>
        </div>

        {/* Name & Location */}
        <h1 className="pp-name">{user.name}</h1>
        <div className="pp-location">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/>
          </svg>
          <span>{user.location}</span>
        </div>

        {/* Bio */}
        <p className="pp-bio">{user.bio}</p>

        {/* Stats */}
        <div className="pp-stats">
          <div className="pp-stat">
            <span className="pp-stat-value">{user.likes}</span>
            <span className="pp-stat-label">LIKES</span>
          </div>
          <div className="pp-stat-divider" />
          <div className="pp-stat">
            <span className="pp-stat-value">{user.outfits}</span>
            <span className="pp-stat-label">OUTFITS</span>
          </div>
        </div>

        {/* Message Button */}
        <button className="pp-message-btn" onClick={onMessage}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
          Message {user.name.split(' ')[0]}
        </button>

        {/* Style Vibe */}
        <div className="pp-vibe-section">
          <span className="pp-vibe-label">STYLE VIBE</span>
          <div className="pp-vibe-chips">
            {user.vibes.map(vibe => (
              <span key={vibe} className="pp-vibe-chip">{vibe}</span>
            ))}
          </div>
        </div>

        {/* Current Looks */}
        <div className="pp-looks-section">
          <div className="pp-looks-header">
            <span className="pp-looks-title">Current Looks</span>
            <span className="pp-live-badge">LIVE NOW</span>
          </div>
          <div className="pp-looks-grid">
            {user.looks.map(look => (
              <div key={look.id} className="pp-look-card">
                <div className="pp-look-img-wrapper">
                  <img src={look.image} alt={look.name} className="pp-look-img" />
                  {look.timeLeft && (
                    <div className="pp-look-badge">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>
                      </svg>
                      <span>{look.timeLeft}</span>
                    </div>
                  )}
                </div>
                <span className="pp-look-name">{look.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PublicProfile

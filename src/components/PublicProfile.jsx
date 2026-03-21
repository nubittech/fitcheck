import React, { useState, useEffect } from 'react'
import { getProfile, getOutfitsByUser } from '../lib/api'
import '../styles/PublicProfile.css'

const PublicProfile = ({ userId, onBack, onMessage, onOutfitClick }) => {
  const [profile, setProfile] = useState(null)
  const [outfits, setOutfits] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    const load = async () => {
      setLoading(true)
      try {
        const [profileRes, outfitsRes] = await Promise.all([
          getProfile(userId),
          getOutfitsByUser(userId, { limit: 12 })
        ])
        if (profileRes.data) setProfile(profileRes.data)
        if (outfitsRes.data) setOutfits(outfitsRes.data)
      } catch (e) {
        console.error('[PublicProfile] load error:', e)
      }
      setLoading(false)
    }
    load()
  }, [userId])

  const totalLikes = outfits.reduce((sum, o) => sum + (o.likes_count || 0), 0)
  const formatLikes = (n) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n)

  const getFirstMedia = (outfit) => {
    if (outfit.media && outfit.media.length > 0) return outfit.media[0].url
    if (outfit.media_url) return outfit.media_url
    return null
  }

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
        <div style={{ width: 40 }} />
      </header>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, height: '60vh' }}>
          <div style={{ color: '#aaa', fontSize: 14 }}>Yükleniyor...</div>
        </div>
      ) : !profile ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, height: '60vh' }}>
          <div style={{ color: '#aaa', fontSize: 14 }}>Profil bulunamadı.</div>
        </div>
      ) : (
        <div className="pp-scroll-content">
          {/* Avatar */}
          <div className="pp-avatar-section">
            <div className="pp-avatar-ring">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.full_name} className="pp-avatar-img" />
              ) : (
                <div className="pp-avatar-img" style={{
                  background: '#E8E0DC',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 36, fontWeight: 700, color: '#C4B5AD'
                }}>
                  {(profile.full_name || profile.username || '?')[0].toUpperCase()}
                </div>
              )}
            </div>
          </div>

          {/* Name */}
          <h1 className="pp-name">{profile.full_name || profile.username}</h1>

          {/* Username */}
          {profile.username && (
            <div style={{ color: '#999', fontSize: 14, marginBottom: 8 }}>@{profile.username}</div>
          )}

          {/* Bio */}
          {profile.bio && <p className="pp-bio">{profile.bio}</p>}

          {/* Instagram */}
          {profile.instagram_handle && (
            <div className="pp-instagram-wrap">
              <a href={`https://instagram.com/${profile.instagram_handle}`} target="_blank" rel="noopener noreferrer" className="pp-instagram">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
                @{profile.instagram_handle}
              </a>
            </div>
          )}

          {/* Stats */}
          <div className="pp-stats">
            <div className="pp-stat">
              <span className="pp-stat-value">{formatLikes(totalLikes)}</span>
              <span className="pp-stat-label">LIKES</span>
            </div>
            <div className="pp-stat-divider" />
            <div className="pp-stat">
              <span className="pp-stat-value">{outfits.length}</span>
              <span className="pp-stat-label">OUTFITS</span>
            </div>
          </div>

          {/* Message Button */}
          <button className="pp-message-btn" onClick={onMessage}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
            Mesaj Gönder
          </button>

          {/* Style Vibes */}
          {profile.styles && profile.styles.length > 0 && (
            <div className="pp-vibe-section">
              <span className="pp-vibe-label">STYLE VIBE</span>
              <div className="pp-vibe-chips">
                {profile.styles.map(vibe => (
                  <span key={vibe} className="pp-vibe-chip">{vibe}</span>
                ))}
              </div>
            </div>
          )}

          {/* Outfits Grid */}
          {outfits.length > 0 && (
            <div className="pp-looks-section">
              <div className="pp-looks-header">
                <span className="pp-looks-title">Kombinler</span>
              </div>
              <div className="pp-looks-grid">
                {outfits.map(outfit => {
                  const mediaUrl = getFirstMedia(outfit)
                  return (
                    <div key={outfit.id} className="pp-look-card" onClick={() => onOutfitClick?.(outfit)} style={{ cursor: 'pointer' }}>
                      <div className="pp-look-img-wrapper">
                        {mediaUrl ? (
                          <img src={mediaUrl} alt={outfit.caption || ''} className="pp-look-img" />
                        ) : (
                          <div className="pp-look-img" style={{ background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
                              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                              <polyline points="21 15 16 10 5 21"/>
                            </svg>
                          </div>
                        )}
                        {outfit.likes_count > 0 && (
                          <div className="pp-look-badge">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                            </svg>
                            <span>{outfit.likes_count}</span>
                          </div>
                        )}
                      </div>
                      {outfit.caption && <span className="pp-look-name">{outfit.caption}</span>}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default PublicProfile

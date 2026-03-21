import React, { useState, useEffect } from 'react'
import { getEventPosts, getEventParticipations } from '../../lib/api'

const EventPage = ({ event, onBack, onOutfitClick, onProfileClick }) => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!event) return
    setLoading(true)
    getEventPosts(event.tag).then(({ data }) => {
      if (data) setPosts(data)
      setLoading(false)
    })
  }, [event])

  if (!event) return null

  const themeColor = event.theme_color || '#FF6B8A'
  const daysLeft = Math.max(0, Math.ceil(
    (new Date(event.end_date) - new Date()) / (1000 * 60 * 60 * 24)
  ))

  const getFirstMedia = (outfit) => {
    if (outfit.outfit_media?.length > 0) return outfit.outfit_media[0].media_url
    if (outfit.media_url) return outfit.media_url
    return null
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: '#0a0a0a',
      overflowY: 'auto',
      WebkitOverflowScrolling: 'touch',
    }}>
      {/* Header */}
      <header style={{
        display: 'flex', alignItems: 'center',
        padding: '52px 16px 12px',
        background: 'rgba(10,10,10,0.95)',
        backdropFilter: 'blur(12px)',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <button onClick={onBack} style={{
          background: 'none', border: 'none', color: '#fff',
          padding: 8, cursor: 'pointer',
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span style={{
          flex: 1, textAlign: 'center',
          color: '#fff', fontSize: 16, fontWeight: 700,
          letterSpacing: '1px',
        }}>
          ETKINLIK
        </span>
        <div style={{ width: 40 }} />
      </header>

      {/* Event Hero */}
      {event.banner_url && (
        <div style={{
          height: 200, overflow: 'hidden', position: 'relative',
        }}>
          <img src={event.banner_url} alt={event.title} style={{
            width: '100%', height: '100%', objectFit: 'cover',
          }} />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(0deg, #0a0a0a 0%, transparent 60%)',
          }} />
        </div>
      )}

      {/* Event Info */}
      <div style={{ padding: '0 20px 20px', marginTop: event.banner_url ? -40 : 0, position: 'relative' }}>
        <div style={{
          display: 'inline-block',
          background: `${themeColor}25`,
          color: themeColor,
          fontSize: 12, fontWeight: 700,
          padding: '4px 12px', borderRadius: 12,
          marginBottom: 8,
        }}>
          {event.tag}
        </div>

        <h1 style={{ color: '#fff', fontSize: 26, fontWeight: 800, margin: '0 0 8px' }}>
          {event.title}
        </h1>

        {event.description && (
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 1.5, margin: '0 0 16px' }}>
            {event.description}
          </p>
        )}

        {/* Stats */}
        <div style={{
          display: 'flex', gap: 20,
          fontSize: 13, color: 'rgba(255,255,255,0.5)',
        }}>
          <div>
            <span style={{ color: '#fff', fontWeight: 700, marginRight: 4 }}>{event.participation_count || 0}</span>
            katilimci
          </div>
          <div>
            <span style={{ color: themeColor, fontWeight: 700, marginRight: 4 }}>{daysLeft}</span>
            gun kaldi
          </div>
          <div>
            <span style={{ color: '#FFD700', fontWeight: 700, marginRight: 4 }}>+{event.xp_bonus}</span>
            XP
          </div>
        </div>
      </div>

      {/* Posts Grid */}
      <div style={{ padding: '0 12px 100px' }}>
        <div style={{
          color: '#fff', fontSize: 14, fontWeight: 700,
          padding: '8px 8px 12px',
          letterSpacing: '0.5px',
        }}>
          Paylasimlar ({posts.length})
        </div>

        {loading ? (
          <div style={{ color: '#666', textAlign: 'center', padding: 40, fontSize: 14 }}>
            Yukleniyor...
          </div>
        ) : posts.length === 0 ? (
          <div style={{ color: '#666', textAlign: 'center', padding: 40, fontSize: 14 }}>
            Henuz paylasim yok. Ilk sen katil!
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 4,
          }}>
            {posts.map(post => {
              const mediaUrl = getFirstMedia(post)
              return (
                <div
                  key={post.id}
                  onClick={() => onOutfitClick?.(post)}
                  style={{
                    aspectRatio: '3/4',
                    borderRadius: 8,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    position: 'relative',
                    background: '#1a1a1a',
                  }}
                >
                  {mediaUrl ? (
                    <img src={mediaUrl} alt="" style={{
                      width: '100%', height: '100%', objectFit: 'cover',
                    }} />
                  ) : (
                    <div style={{
                      width: '100%', height: '100%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#333',
                    }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    </div>
                  )}

                  {/* Like count */}
                  {post.likes_count > 0 && (
                    <div style={{
                      position: 'absolute', bottom: 4, right: 4,
                      background: 'rgba(0,0,0,0.6)',
                      color: '#fff', fontSize: 10, fontWeight: 600,
                      padding: '2px 6px', borderRadius: 8,
                      display: 'flex', alignItems: 'center', gap: 2,
                    }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                      {post.likes_count}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default EventPage

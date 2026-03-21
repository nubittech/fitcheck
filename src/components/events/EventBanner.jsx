import React from 'react'

const EventBanner = ({ event, onClick }) => {
  if (!event) return null

  const daysLeft = Math.max(0, Math.ceil(
    (new Date(event.end_date) - new Date()) / (1000 * 60 * 60 * 24)
  ))

  const themeColor = event.theme_color || '#FF6B8A'

  return (
    <div
      onClick={() => onClick?.(event)}
      style={{
        margin: '16px 16px 8px',
        borderRadius: 20,
        overflow: 'hidden',
        position: 'relative',
        cursor: 'pointer',
        border: `1px solid ${themeColor}30`,
        background: '#111',
      }}
    >
      {/* Banner image */}
      {event.banner_url && (
        <div style={{
          height: 140,
          overflow: 'hidden',
          position: 'relative',
        }}>
          <img
            src={event.banner_url}
            alt={event.title}
            style={{
              width: '100%', height: '100%',
              objectFit: 'cover',
            }}
          />
          <div style={{
            position: 'absolute', inset: 0,
            background: `linear-gradient(0deg, #111 0%, transparent 60%)`,
          }} />
        </div>
      )}

      {/* Content */}
      <div style={{
        padding: event.banner_url ? '0 16px 14px' : '16px',
        marginTop: event.banner_url ? -20 : 0,
        position: 'relative',
      }}>
        {/* Tag */}
        <div style={{
          display: 'inline-block',
          background: `${themeColor}25`,
          color: themeColor,
          fontSize: 11,
          fontWeight: 700,
          padding: '3px 10px',
          borderRadius: 10,
          letterSpacing: '0.5px',
          marginBottom: 6,
        }}>
          {event.tag}
        </div>

        {/* Title */}
        <h3 style={{
          color: '#fff',
          fontSize: 18,
          fontWeight: 700,
          margin: '0 0 6px',
          lineHeight: 1.3,
        }}>
          {event.title}
        </h3>

        {/* Meta */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          fontSize: 12,
          color: 'rgba(255,255,255,0.45)',
        }}>
          <span>{event.participation_count || 0} katilimci</span>
          <span style={{ color: themeColor, fontWeight: 600 }}>{daysLeft} gun kaldi</span>
          <span style={{
            marginLeft: 'auto',
            color: '#FFD700',
            fontWeight: 700,
            fontSize: 12,
          }}>
            +{event.xp_bonus} XP
          </span>
        </div>
      </div>

      {/* Katil butonu */}
      <div style={{
        position: 'absolute',
        top: 12, right: 12,
        background: `${themeColor}DD`,
        color: '#fff',
        fontSize: 11,
        fontWeight: 700,
        padding: '5px 14px',
        borderRadius: 14,
        letterSpacing: '0.3px',
      }}>
        Katil
      </div>
    </div>
  )
}

export default EventBanner

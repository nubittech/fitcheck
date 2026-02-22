import React, { useMemo, useState } from 'react'
import { STYLE_TYPES } from '../constants/styleTypes'
import { useLang } from '../i18n/LangContext'
import '../styles/Discover.css'

const ICONS = {
  filter: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="21" x2="4" y2="14" />
      <line x1="4" y1="10" x2="4" y2="3" />
      <line x1="12" y1="21" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12" y2="3" />
      <line x1="20" y1="21" x2="20" y2="16" />
      <line x1="20" y1="12" x2="20" y2="3" />
      <line x1="1" y1="14" x2="7" y2="14" />
      <line x1="9" y1="8" x2="15" y2="8" />
      <line x1="17" y1="16" x2="23" y2="16" />
    </svg>
  ),
  search: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  default: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8l-3.3-6.6a2 2 0 0 0-3.4 0L6 8" />
      <path d="M6 8h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2z" />
    </svg>
  )
}

const STYLE_ICON_MAP = {
  Minimalist: ICONS.default,
  Vintage: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="7" />
      <polyline points="12 9 12 12 13.5 13.5" />
      <path d="M12 5V3" /><path d="M12 21v-2" />
    </svg>
  ),
  Streetwear: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 16h16" /><path d="M12 4v4" /><path d="M12 13v3" /><circle cx="12" cy="10" r="2" />
    </svg>
  ),
  Casual: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
    </svg>
  ),
  Grunge: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" />
    </svg>
  ),
  Bohemian: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 7.5a4.5 4.5 0 1 1 4.5 4.5M12 7.5A4.5 4.5 0 1 0 7.5 12M12 9v10.5" />
    </svg>
  )
}

const Discover = ({ outfits = [], onSelectStyle, onOutfitClick }) => {
  const { t } = useLang()
  const [query, setQuery] = useState('')
  const [selectedStyle, setSelectedStyle] = useState('all')
  const [showAllStyles, setShowAllStyles] = useState(false)

  const visibleStyles = showAllStyles ? STYLE_TYPES : STYLE_TYPES.slice(0, 6)

  const filteredOutfits = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return outfits.filter((outfit) => {
      if (selectedStyle !== 'all' && outfit.vibe !== selectedStyle) return false
      if (!normalized) return true

      const haystack = [
        outfit.vibe,
        outfit.caption,
        outfit.user?.name,
        ...(outfit.items || []).map((item) => item.name)
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return haystack.includes(normalized)
    })
  }, [outfits, selectedStyle, query])

  const trendingOutfits = useMemo(() => {
    const now = Date.now()
    return filteredOutfits
      .filter((o) => {
        if (!o.createdAt) return false
        const created = new Date(o.createdAt).getTime()
        return created + 24 * 60 * 60 * 1000 > now
      })
      .sort((a, b) => (b.stats?.likes || 0) - (a.stats?.likes || 0))
      .slice(0, 8)
  }, [filteredOutfits])

  return (
    <div className="discover-page">
      <header className="discover-header">
        <h1>{t('discover')}</h1>
        <button className="icon-btn filter-btn">{ICONS.filter}</button>
      </header>

      <div className="search-container">
        <div className="search-icon">{ICONS.search}</div>
        <input
          type="text"
          placeholder={t('search_placeholder')}
          className="search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <section className="section style-types">
        <div className="section-header">
          <h2>{t('style_types')}</h2>
          <button
            className="see-all"
            onClick={() => {
              if (showAllStyles) {
                setShowAllStyles(false)
              } else if (selectedStyle !== 'all') {
                setSelectedStyle('all')
              } else {
                setShowAllStyles(true)
              }
            }}
          >
            {showAllStyles ? t('show_less') : t('see_all')}
          </button>
        </div>
        <div className="styles-grid">
          {visibleStyles.map((style) => (
            <button
              key={style}
              className={`style-card ${selectedStyle === style ? 'active' : ''}`}
              onClick={() => {
                setSelectedStyle((prev) => (prev === style ? 'all' : style))
                if (onSelectStyle) onSelectStyle(style)
              }}
            >
              <div className="style-icon-wrapper">{STYLE_ICON_MAP[style] || ICONS.default}</div>
              <span className="style-name">{style}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="section trending">
        <div className="section-header">
          <h2>{t('trending')}</h2>
          {selectedStyle !== 'all' && <span className="active-style-tag">{selectedStyle}</span>}
        </div>

        {trendingOutfits.length === 0 ? (
          <div className="discover-empty">{t('no_results')}</div>
        ) : (
          <div className="trending-content">
            {trendingOutfits.map((outfit) => {
              const firstMedia = outfit.media?.[0]
              const preview = firstMedia?.thumbnail || firstMedia?.url
              const likes = outfit.stats?.likes || 0
              return (
                <div key={outfit.id} className="trending-card" onClick={() => onOutfitClick?.(outfit)} style={{ cursor: 'pointer' }}>
                  <div className="trending-image-wrapper">
                    {preview ? (
                      <img src={preview} alt={outfit.caption || outfit.style} className="trending-img" />
                    ) : (
                      <div className="trending-img fallback">No media</div>
                    )}
                    <div className="hot-badge">🔥 {Math.min(99, Math.max(75, likes))}%</div>
                  </div>
                  <div className="trending-meta">
                    <span className="meta-style">{outfit.vibe || 'Style'}</span>
                    <span className="meta-user">@{outfit.user?.name || 'user'}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <div style={{ height: '80px' }} />
    </div>
  )
}

export default Discover

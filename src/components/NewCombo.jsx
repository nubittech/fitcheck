import React, { useState, useRef, useEffect } from 'react'
import MediaCarousel from './MediaCarousel'
import { createOutfit, uploadMedia, insertOutfitMedia, activateBoost, getBoostStatus, getDailyPostCount } from '../lib/api'
import { useLang } from '../i18n/LangContext'
import { validateAffiliateLink, affiliateLinkError } from '../lib/affiliateValidator'
import '../styles/NewCombo.css'
import { STYLE_TYPES } from '../constants/styleTypes'

const NewCombo = ({ onClose, currentUser, session, onOutfitCreated }) => {
  const { t, lang } = useLang()
  const tr = lang === 'tr'
  const [mediaFiles, setMediaFiles] = useState([])
  const [pieces, setPieces] = useState([])
  const [pieceName, setPieceName] = useState('')
  const [pieceBrand, setPieceBrand] = useState('')
  const [pieceLink, setPieceLink] = useState('')
  const [pieceLinkError, setPieceLinkError] = useState('')  // '' = no input, 'ok' = valid, error string = invalid
  const [gender, setGender] = useState('unisex')
  const [selectedStyle, setSelectedStyle] = useState('Minimalist')
  const [styleOpen, setStyleOpen] = useState(false)
  const [ageRange, setAgeRange] = useState([18, 35])
  const [draggingThumb, setDraggingThumb] = useState(null)
  const [caption, setCaption] = useState('')
  const fileInputRef = useRef(null)
  const sliderRef = useRef(null)

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    if (mediaFiles.length + files.length > 4) return

    const newMedia = files.map(file => ({
      id: Date.now() + Math.random(),
      file,
      type: file.type.startsWith('video/') ? 'video' : 'image',
      preview: URL.createObjectURL(file),
      feedbackEnabled: false
    }))
    setMediaFiles(prev => [...prev, ...newMedia])
    e.target.value = ''
  }

  const removeMedia = (id) => {
    setMediaFiles(prev => {
      const item = prev.find(m => m.id === id)
      if (item) URL.revokeObjectURL(item.preview)
      return prev.filter(m => m.id !== id)
    })
  }

  const addPiece = () => {
    if (!pieceName.trim()) return
    // Validate link if provided
    let link = pieceLink.trim()
    if (link) {
      if (!/^https?:\/\//i.test(link)) link = 'https://' + link
      const { valid, reason } = validateAffiliateLink(link)
      if (!valid) {
        setPieceLinkError(affiliateLinkError(reason, lang))
        return
      }
    }
    setPieces(prev => [...prev, {
      id: Date.now(),
      name: pieceName.trim(),
      brand: pieceBrand.trim() || 'Unknown',
      link: link || null,
      feedbackEnabled: true
    }])
    setPieceName('')
    setPieceBrand('')
    setPieceLink('')
    setPieceLinkError('')
  }

  const removePiece = (id) => {
    setPieces(prev => prev.filter(p => p.id !== id))
  }

  const toggleFeedback = (id) => {
    setPieces(prev => prev.map(p =>
      p.id === id ? { ...p, feedbackEnabled: !p.feedbackEnabled } : p
    ))
  }

  // Slider logic
  const getSliderValue = (clientX) => {
    const rect = sliderRef.current.getBoundingClientRect()
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    return Math.round(pct * (60 - 13) + 13)
  }

  const handleSliderTouchStart = (thumb) => (e) => {
    e.stopPropagation()
    setDraggingThumb(thumb)
  }

  const handleSliderTouchMove = (e) => {
    if (draggingThumb === null) return
    const val = getSliderValue(e.touches[0].clientX)
    setAgeRange(prev => {
      if (draggingThumb === 'min') return [Math.min(val, prev[1] - 1), prev[1]]
      return [prev[0], Math.max(val, prev[0] + 1)]
    })
  }

  const handleSliderTouchEnd = () => setDraggingThumb(null)

  const handleSliderMouseDown = (thumb) => (e) => {
    e.preventDefault()
    setDraggingThumb(thumb)

    const onMove = (ev) => {
      const val = getSliderValue(ev.clientX)
      setAgeRange(prev => {
        if (thumb === 'min') return [Math.min(val, prev[1] - 1), prev[1]]
        return [prev[0], Math.max(val, prev[0] + 1)]
      })
    }
    const onUp = () => {
      setDraggingThumb(null)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  const minPct = ((ageRange[0] - 13) / (60 - 13)) * 100
  const maxPct = ((ageRange[1] - 13) / (60 - 13)) * 100

  const [showPreview, setShowPreview] = useState(false)
  const [tagDots, setTagDots] = useState([])
  const [boostEnabled, setBoostEnabled] = useState(false)
  const [boostStatus, setBoostStatus] = useState({ boostsUsed: 0, maxBoosts: 1 })
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [dailyPostCount, setDailyPostCount] = useState(0)
  const FREE_DAILY_POST_LIMIT = 2

  const isPremium = Boolean(currentUser?.is_premium)
  const boostRemaining = Math.max(0, boostStatus.maxBoosts - boostStatus.boostsUsed)

  useEffect(() => {
    if (session?.user?.id) {
      getBoostStatus(session.user.id).then(setBoostStatus)
      getDailyPostCount(session.user.id).then(r => setDailyPostCount(r.count))
    }
  }, [session?.user?.id])
  const imageContainerRef = useRef(null)

  const videoCount = mediaFiles.filter(m => m.type === 'video').length
  const imageCount = mediaFiles.filter(m => m.type === 'image').length
  const canAddMore = mediaFiles.length < 4
  const isValid = mediaFiles.length > 0 && pieces.length > 0
  const postsRemaining = isPremium ? Infinity : Math.max(0, FREE_DAILY_POST_LIMIT - dailyPostCount)
  const canPost = isPremium || postsRemaining > 0

  const resetForm = () => {
    mediaFiles.forEach((m) => {
      if (m.preview) URL.revokeObjectURL(m.preview)
    })
    setMediaFiles([])
    setPieces([])
    setPieceName('')
    setPieceBrand('')
    setPieceLink('')
    setGender('unisex')
    setSelectedStyle('Minimalist')
    setStyleOpen(false)
    setAgeRange([18, 35])
    setCaption('')
    setTagDots([])
    setBoostEnabled(false)
    setShowPreview(false)
  }

  const handleShareCombo = async () => {
    if (!isValid || !session || submitting) return
    if (!canPost) {
      setSubmitError(tr ? 'Günlük kombin paylaşma limitine ulaştın (2/gün). Premium ile sınırsız paylaş!' : 'Daily combo limit reached (2/day). Go Premium for unlimited!')
      return
    }
    setSubmitting(true)
    setSubmitError('')

    try {
      // Build items with tag positions
      const itemsData = pieces.map((piece, index) => {
        const dot = tagDots[index]
        return {
          name: piece.name,
          brand: piece.brand || 'Unknown',
          link: piece.link || null,
          feedbackEnabled: piece.feedbackEnabled || false,
          position: dot ? { x: `${dot.x}%`, y: `${dot.y}%` } : null
        }
      })

      // Create outfit row
      const { data: outfit, error: outfitError } = await createOutfit({
        userId: session.user.id,
        caption: caption.trim(),
        gender,
        vibe: selectedStyle,
        ageRangeMin: ageRange[0],
        ageRangeMax: ageRange[1],
        items: itemsData,
        isBoosted: boostEnabled
      })

      if (outfitError) throw outfitError

      // Activate boost via RPC if enabled (sets boosted_at, decrements quota)
      if (boostEnabled) {
        const { data: boostResult } = await activateBoost(session.user.id)
        if (!boostResult?.success) {
          console.warn('Boost activation failed:', boostResult?.error)
        }
      }

      // Upload media files and create outfit_media rows
      for (let i = 0; i < mediaFiles.length; i++) {
        const mf = mediaFiles[i]
        const { data: uploaded, error: uploadErr } = await uploadMedia(session.user.id, mf.file)
        if (uploadErr) throw uploadErr

        await insertOutfitMedia({
          outfitId: outfit.id,
          mediaUrl: uploaded.url,
          mediaType: mf.type,
          sortOrder: i
        })
      }

      resetForm()
      onOutfitCreated?.()
    } catch (err) {
      setSubmitError(err.message || 'Failed to share combo')
      setSubmitting(false)
    }
  }

  // Build preview media array for MediaCarousel
  const previewMedia = mediaFiles.map((m) => ({
    id: m.id,
    type: m.type,
    url: m.preview,
    thumbnail: m.type === 'video' ? m.preview : undefined
  }))

  // Handle tapping on image to place tag dots
  const handleImageTap = (e) => {
    if (tagDots.length >= pieces.length) return
    const rect = imageContainerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setTagDots(prev => [...prev, { x, y, pieceIndex: prev.length }])
  }

  if (showPreview) {
    return (
      <div className="newcombo-page">
        <div className="newcombo-header">
          <button className="newcombo-cancel" onClick={() => setShowPreview(false)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <h1 className="newcombo-title">{tr ? 'Kombin Oluşturma' : 'New Combo'}</h1>
          <div className="newcombo-header-spacer" />
        </div>

        <div className="preview-card-container">
          {/* Taggable image */}
          <div
            className="tag-image-container"
            ref={imageContainerRef}
            onClick={handleImageTap}
          >
            {previewMedia.length > 0 && previewMedia[0].type === 'image' ? (
              <img className="tag-image" src={previewMedia[0].url} alt="combo" />
            ) : previewMedia.length > 0 ? (
              <video className="tag-image" src={previewMedia[0].url} muted />
            ) : null}

            {/* Placed tag dots */}
            {tagDots.map((dot, i) => (
              <div
                key={i}
                className="tag-dot-placed"
                style={{ left: `${dot.x}%`, top: `${dot.y}%` }}
              >
                <div className="tag-dot-inner" />
              </div>
            ))}

            {/* Hint at bottom */}
            {tagDots.length < pieces.length && (
              <div className="tag-hint-bar">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" opacity="0.8">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z" />
                </svg>
                <span>{tr ? 'Fotoğrafa dokun, etiket ekle' : 'Tap photo to tag items'}</span>
              </div>
            )}
          </div>

          {/* Tagged items list */}
          <div className="tagged-items-section">
            <div className="tagged-items-header">
              <span className="tagged-items-label">{tr ? 'ETİKETLENEN PARÇALAR' : 'TAGGED ITEMS'}</span>
              {tagDots.length > 0 && (
                <button className="tagged-edit-btn" onClick={() => setTagDots([])}>{tr ? 'Düzenle' : 'Edit'}</button>
              )}
            </div>

            {pieces.map((piece, index) => (
              <div key={piece.id} className="tagged-item-card">
                <div className="tagged-item-number">
                  <span>{index + 1}</span>
                </div>
                <div className="tagged-item-info">
                  <span className="tagged-item-brand">{piece.brand}</span>
                  <span className="tagged-item-name">{piece.name}</span>
                </div>
                {piece.link && (
                  <div className="tagged-item-link-badge">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M18 6h-2c0-2.21-1.79-4-4-4S8 3.79 8 6H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6-2c1.1 0 2 .9 2 2h-4c0-1.1.9-2 2-2zm6 16H6V8h2v2c0 .55.45 1 1 1s1-.45 1-1V8h4v2c0 .55.45 1 1 1s1-.45 1-1V8h2v12z" /></svg>
                    {tr ? 'Satın Al' : 'Shop'}
                  </div>
                )}
              </div>
            ))}

            {/* Add another item hint */}
            <div className="add-tag-hint" onClick={() => setShowPreview(false)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
              </svg>
              <span>{tr ? 'Başka parça eklemek için fotoğrafa dokun' : 'Tap photo to add another item'}</span>
            </div>
          </div>

          {/* Premium Boost */}
          <div className={`boost-card ${boostRemaining === 0 ? 'boost-disabled' : ''}`}>
            <div className="boost-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z" />
              </svg>
            </div>
            <div className="boost-info">
              <div className="boost-title-row">
                <span className="boost-title">{tr ? 'Öne Çıkar' : 'Boost'}</span>
                <span className="boost-pro-tag">{boostRemaining}/{boostStatus.maxBoosts}</span>
              </div>
              <span className="boost-desc">
                {boostRemaining > 0
                  ? (tr ? '2 saat boyunca 2.5x görünürlük' : '2.5x visibility for 2 hours')
                  : (tr
                    ? (isPremium ? 'Bu ay için boost hakkın bitti' : 'Boost hakkın bitti')
                    : (isPremium ? 'No boosts left this month' : 'No boosts remaining'))
                }
              </span>
            </div>
            <button
              className={`boost-toggle ${boostEnabled ? 'on' : ''}`}
              onClick={() => {
                if (boostRemaining > 0) setBoostEnabled(!boostEnabled)
              }}
              disabled={boostRemaining === 0}
            >
              <div className="boost-toggle-knob" />
            </button>
          </div>

          {/* Share button */}
          <button className="share-combo-btn" onClick={handleShareCombo}>
            {tr ? 'Kombini Paylaş' : 'Share Combination'}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="newcombo-page">
      {/* Header */}
      <div className="newcombo-header">
        <button className="newcombo-cancel" onClick={onClose}>{t('cancel')}</button>
        <h1 className="newcombo-title">{t('new_combo')}</h1>
        <div className="newcombo-header-spacer" />
      </div>

      <div className="newcombo-scroll">
        {/* Media Upload Area */}
        <div className="newcombo-section">
          <div className="media-upload-area" onClick={() => canAddMore && fileInputRef.current?.click()}>
            {mediaFiles.length === 0 ? (
              <div className="upload-placeholder">
                <div className="upload-icon">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <div className="upload-plus">+</div>
                </div>
                <span className="upload-text">{tr ? 'Kombin fotoğrafını yükle' : 'Tap to upload your look'}</span>
                <span className="upload-sub">{tr ? 'JPG, PNG desteklenir (Maks 5MB)' : 'Supports JPG, PNG (Max 5MB)'}</span>
              </div>
            ) : (
              <div className="media-preview-grid" onClick={(e) => e.stopPropagation()}>
                {mediaFiles.map((m) => (
                  <div key={m.id} className="media-preview-item">
                    {m.type === 'video' ? (
                      <video src={m.preview} className="media-thumb" muted />
                    ) : (
                      <img src={m.preview} className="media-thumb" alt="preview" />
                    )}
                    {m.type === 'video' && <div className="preview-video-badge">VIDEO</div>}
                    <button className="media-remove" onClick={() => removeMedia(m.id)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                ))}
                {canAddMore && (
                  <button className="media-add-more" onClick={() => fileInputRef.current?.click()}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    <span>{tr ? `${4 - mediaFiles.length} kaldı` : `${4 - mediaFiles.length} left`}</span>
                  </button>
                )}
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              hidden
              onChange={handleFileChange}
            />
          </div>
          {mediaFiles.length > 0 && (
            <div className="media-info-bar">
              <span>{imageCount} {tr ? `fotoğraf` : `photo${imageCount !== 1 ? 's' : ''}`}</span>
              {videoCount > 0 && <span>{videoCount} video</span>}
              <span className="media-limit">{mediaFiles.length}/4</span>
            </div>
          )}
        </div>

        {/* Caption */}
        <div className="newcombo-section">
          <textarea
            className="caption-input"
            placeholder={tr ? 'Kombin için bir başlık yaz...' : 'Write a caption for your combo...'}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            maxLength={280}
            rows={2}
          />
          <div className="caption-counter">{caption.length}/280</div>
        </div>

        {/* Tag Pieces */}
        <div className="newcombo-section">
          <div className="section-header">
            <h2 className="section-title">{t('tag_pieces')}</h2>
            {pieces.length > 0 && (
              <span className="section-badge">{pieces.length} {tr ? 'parça eklendi' : `item${pieces.length !== 1 ? 's' : ''} added`}</span>
            )}
          </div>

          {pieces.map(piece => (
            <div key={piece.id} className="piece-card">
              <div className="piece-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.38 3.46L16 2 12 5.69 8 2 3.62 3.46 2 8l3.69 4L2 16l1.62 4.54L8 22l4-3.69L16 22l4.38-1.46L22 16l-3.69-4L22 8z" />
                </svg>
              </div>
              <div className="piece-info">
                <span className="piece-name">{piece.name}</span>
                <span className="piece-brand">{piece.brand}</span>
              </div>
              <button
                className={`piece-feedback ${piece.feedbackEnabled ? 'active' : ''}`}
                onClick={() => toggleFeedback(piece.id)}
              >
                {tr ? 'GERİ BİLDİRİM' : 'FEEDBACK'}
                <div className={`feedback-toggle ${piece.feedbackEnabled ? 'on' : ''}`}>
                  {piece.feedbackEnabled ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  )}
                </div>
              </button>
              <button className="piece-remove" onClick={() => removePiece(piece.id)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}

          {/* Add piece inline */}
          <div className="add-piece-form">
            <input
              className="piece-input"
              placeholder={tr ? 'Ürün adı (ör. Beyaz T-shirt)' : 'Item name (e.g. White T-shirt)'}
              value={pieceName}
              onChange={(e) => setPieceName(e.target.value)}
            />
            <input
              className="piece-input small"
              placeholder={tr ? 'Marka (isteğe bağlı)' : 'Brand (optional)'}
              value={pieceBrand}
              onChange={(e) => setPieceBrand(e.target.value)}
            />
            <input
              className={`piece-input piece-link-input ${pieceLinkError === 'ok' ? 'link-valid' : pieceLinkError ? 'link-error' : ''}`}
              placeholder={tr ? '🔗 Satın alma linki (isteğe bağlı — aff/ref link)' : '🔗 Shop link (optional — affiliate URL)'}
              value={pieceLink}
              onChange={(e) => { setPieceLink(e.target.value); setPieceLinkError('') }}
              onBlur={() => {
                if (!pieceLink.trim()) { setPieceLinkError(''); return }
                const { valid, reason } = validateAffiliateLink(pieceLink.trim())
                setPieceLinkError(valid ? 'ok' : affiliateLinkError(reason, lang))
              }}
              type="url"
              inputMode="url"
            />
            {pieceLinkError && pieceLinkError !== 'ok' && (
              <p className="link-error-msg">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><circle cx="12" cy="16" r="1" fill="currentColor" />
                </svg>
                {pieceLinkError}
              </p>
            )}
            {pieceLinkError === 'ok' && (
              <p className="link-ok-msg">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {tr ? 'Geçerli affiliate linki ✓' : 'Valid affiliate link ✓'}
              </p>
            )}
            <button
              className="add-piece-btn"
              onClick={addPiece}
              disabled={!pieceName.trim()}
            >
              + {tr ? 'Parça ekle' : 'Add piece'}
            </button>
          </div>
        </div>

        {/* Who is this for */}
        <div className="newcombo-section">
          <h2 className="section-title">{tr ? 'Bu kombin kimin için?' : 'Who is this for?'}</h2>

          {/* Gender */}
          <label className="field-label">{tr ? 'CİNSİYET' : 'GENDER'}</label>
          <div className="gender-row">
            {['unisex', 'female', 'male'].map(g => (
              <button
                key={g}
                className={`gender-chip ${gender === g ? 'selected' : ''}`}
                onClick={() => setGender(g)}
              >
                {tr
                  ? (g === 'unisex' ? 'Unisex' : g === 'female' ? 'Kadın' : 'Erkek')
                  : g.charAt(0).toUpperCase() + g.slice(1)}
              </button>
            ))}
          </div>

          {/* Style */}
          <label className="field-label">{tr ? 'STİL' : 'STYLE'}</label>
          <div className="vibe-select" onClick={() => setStyleOpen(!styleOpen)}>
            <span>{selectedStyle}</span>
            <svg className={styleOpen ? 'flipped' : ''} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
          {styleOpen && (
            <div className="vibe-dropdown">
              {STYLE_TYPES.map(style => (
                <button
                  key={style}
                  className={`vibe-option ${style === selectedStyle ? 'active' : ''}`}
                  onClick={() => { setSelectedStyle(style); setStyleOpen(false) }}
                >
                  {style}
                </button>
              ))}
            </div>
          )}

          {/* Age Range */}
          <div className="age-header">
            <label className="field-label">{tr ? 'HEDEF YAŞ' : 'TARGET AGE'}</label>
            <span className="age-value">{ageRange[0]} - {ageRange[1]}</span>
          </div>
          <div
            className="range-slider"
            ref={sliderRef}
            onTouchMove={handleSliderTouchMove}
            onTouchEnd={handleSliderTouchEnd}
          >
            <div className="range-track" />
            <div
              className="range-fill"
              style={{ left: `${minPct}%`, width: `${maxPct - minPct}%` }}
            />
            <div
              className="range-thumb"
              style={{ left: `${minPct}%` }}
              onTouchStart={handleSliderTouchStart('min')}
              onMouseDown={handleSliderMouseDown('min')}
            />
            <div
              className="range-thumb"
              style={{ left: `${maxPct}%` }}
              onTouchStart={handleSliderTouchStart('max')}
              onMouseDown={handleSliderMouseDown('max')}
            />
          </div>
        </div>

        {/* Submit */}
        <div className="newcombo-section newcombo-submit-section">
          {!isPremium && (
            <div style={{ textAlign: 'center', marginBottom: '8px', fontSize: '12px', color: canPost ? 'var(--text-secondary)' : '#e53e3e' }}>
              {canPost
                ? (tr ? `Bugün ${postsRemaining} kombin daha paylaşabilirsin` : `${postsRemaining} posts remaining today`)
                : (tr ? 'Günlük limit doldu (2/gün)' : 'Daily limit reached (2/day)')
              }
            </div>
          )}
          {submitError && (
            <div style={{ textAlign: 'center', marginBottom: '8px', fontSize: '12px', color: '#e53e3e' }}>
              {submitError}
            </div>
          )}
          <button className={`newcombo-submit ${isValid && canPost ? '' : 'disabled'}`} disabled={!isValid || !canPost} onClick={() => setShowPreview(true)}>
            {tr ? 'Önizleme' : 'Preview Combination'}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default NewCombo

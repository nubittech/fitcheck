import React, { useState, useRef } from 'react'
import MediaCarousel from './MediaCarousel'
import { createOutfit, uploadMedia, insertOutfitMedia } from '../lib/api'
import '../styles/NewCombo.css'
import { STYLE_TYPES } from '../constants/styleTypes'

const NewCombo = ({ onClose, currentUser, session, onOutfitCreated }) => {
  const [mediaFiles, setMediaFiles] = useState([])
  const [pieces, setPieces] = useState([])
  const [pieceName, setPieceName] = useState('')
  const [pieceBrand, setPieceBrand] = useState('')
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
    setPieces(prev => [...prev, {
      id: Date.now(),
      name: pieceName.trim(),
      brand: pieceBrand.trim() || 'Unknown',
      feedbackEnabled: true
    }])
    setPieceName('')
    setPieceBrand('')
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
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const imageContainerRef = useRef(null)

  const videoCount = mediaFiles.filter(m => m.type === 'video').length
  const imageCount = mediaFiles.filter(m => m.type === 'image').length
  const canAddMore = mediaFiles.length < 4
  const isValid = mediaFiles.length > 0 && pieces.length > 0

  const resetForm = () => {
    mediaFiles.forEach((m) => {
      if (m.preview) URL.revokeObjectURL(m.preview)
    })
    setMediaFiles([])
    setPieces([])
    setPieceName('')
    setPieceBrand('')
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
    setSubmitting(true)
    setSubmitError('')

    try {
      // Build items with tag positions
      const itemsData = pieces.map((piece, index) => {
        const dot = tagDots[index]
        return {
          name: piece.name,
          brand: piece.brand || 'Unknown',
          feedbackEnabled: piece.feedbackEnabled || false,
          position: dot ? { x: `${dot.x}%`, y: `${dot.y}%` } : { x: '50%', y: `${40 + index * 12}%` }
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
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <h1 className="newcombo-title">Kombin Oluşturma</h1>
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
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/>
                </svg>
                <span>Tap photo to tag items</span>
              </div>
            )}
          </div>

          {/* Tagged items list */}
          <div className="tagged-items-section">
            <div className="tagged-items-header">
              <span className="tagged-items-label">TAGGED ITEMS</span>
              {tagDots.length > 0 && (
                <button className="tagged-edit-btn" onClick={() => setTagDots([])}>Edit</button>
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
              </div>
            ))}

            {/* Add another item hint */}
            <div className="add-tag-hint" onClick={() => setShowPreview(false)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
              <span>Tap photo to add another item</span>
            </div>
          </div>

          {/* Premium Boost */}
          <div className="boost-card">
            <div className="boost-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z"/>
              </svg>
            </div>
            <div className="boost-info">
              <div className="boost-title-row">
                <span className="boost-title">Premium Boost</span>
                <span className="boost-pro-tag">PRO</span>
              </div>
              <span className="boost-desc">Get 2x more visibility in community feed</span>
            </div>
            <button
              className={`boost-toggle ${boostEnabled ? 'on' : ''}`}
              onClick={() => setBoostEnabled(!boostEnabled)}
            >
              <div className="boost-toggle-knob" />
            </button>
          </div>

          {/* Share button */}
          <button className="share-combo-btn" onClick={handleShareCombo}>
            Share Combination
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
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
        <button className="newcombo-cancel" onClick={onClose}>Cancel</button>
        <h1 className="newcombo-title">New Combo</h1>
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
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <div className="upload-plus">+</div>
                </div>
                <span className="upload-text">Tap to upload your look</span>
                <span className="upload-sub">Supports JPG, PNG (Max 5MB)</span>
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
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                ))}
                {canAddMore && (
                  <button className="media-add-more" onClick={() => fileInputRef.current?.click()}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    <span>{4 - mediaFiles.length} left</span>
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
              <span>{imageCount} photo{imageCount !== 1 ? 's' : ''}</span>
              {videoCount > 0 && <span>{videoCount} video</span>}
              <span className="media-limit">{mediaFiles.length}/4</span>
            </div>
          )}
        </div>

        {/* Caption */}
        <div className="newcombo-section">
          <textarea
            className="caption-input"
            placeholder="Write a caption for your combo..."
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
            <h2 className="section-title">Tag Pieces</h2>
            {pieces.length > 0 && (
              <span className="section-badge">{pieces.length} item{pieces.length !== 1 ? 's' : ''} added</span>
            )}
          </div>

          {pieces.map(piece => (
            <div key={piece.id} className="piece-card">
              <div className="piece-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.38 3.46L16 2 12 5.69 8 2 3.62 3.46 2 8l3.69 4L2 16l1.62 4.54L8 22l4-3.69L16 22l4.38-1.46L22 16l-3.69-4L22 8z"/>
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
                FEEDBACK
                <div className={`feedback-toggle ${piece.feedbackEnabled ? 'on' : ''}`}>
                  {piece.feedbackEnabled ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  )}
                </div>
              </button>
              <button className="piece-remove" onClick={() => removePiece(piece.id)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          ))}

          {/* Add piece inline */}
          <div className="add-piece-form">
            <input
              className="piece-input"
              placeholder="Item name (e.g. White T-shirt)"
              value={pieceName}
              onChange={(e) => setPieceName(e.target.value)}
            />
            <input
              className="piece-input small"
              placeholder="Brand (optional)"
              value={pieceBrand}
              onChange={(e) => setPieceBrand(e.target.value)}
            />
            <button
              className="add-piece-btn"
              onClick={addPiece}
              disabled={!pieceName.trim()}
            >
              + Add piece
            </button>
          </div>
        </div>

        {/* Who is this for */}
        <div className="newcombo-section">
          <h2 className="section-title">Who is this for?</h2>

          {/* Gender */}
          <label className="field-label">GENDER</label>
          <div className="gender-row">
            {['unisex', 'female', 'male'].map(g => (
              <button
                key={g}
                className={`gender-chip ${gender === g ? 'selected' : ''}`}
                onClick={() => setGender(g)}
              >
                {g.charAt(0).toUpperCase() + g.slice(1)}
              </button>
            ))}
          </div>

          {/* Style */}
          <label className="field-label">STYLE</label>
          <div className="vibe-select" onClick={() => setStyleOpen(!styleOpen)}>
            <span>{selectedStyle}</span>
            <svg className={styleOpen ? 'flipped' : ''} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"/>
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
            <label className="field-label">TARGET AGE</label>
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
          <button className={`newcombo-submit ${isValid ? '' : 'disabled'}`} disabled={!isValid} onClick={() => setShowPreview(true)}>
            Preview Combination
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default NewCombo

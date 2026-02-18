import React, { useMemo, useState } from 'react'
import { STYLE_TYPES } from '../constants/styleTypes'
import '../styles/ProfileSetup.css'

const MAX_BIO = 150
const MAX_STYLES = 3

const ProfileSetup = ({ initialProfile, onSave }) => {
  const [name, setName] = useState(initialProfile?.name || '')
  const [bio, setBio] = useState(initialProfile?.bio || '')
  const [styles, setStyles] = useState(initialProfile?.styles?.length ? initialProfile.styles : ['Minimalist'])
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(initialProfile?.avatar || '')
  const [saving, setSaving] = useState(false)

  const canSubmit = useMemo(() => name.trim().length > 1 && styles.length > 0, [name, styles])

  const toggleStyle = (style) => {
    setStyles((prev) => {
      if (prev.includes(style)) return prev.filter((s) => s !== style)
      if (prev.length >= MAX_STYLES) return prev
      return [...prev, style]
    })
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async () => {
    if (!canSubmit || saving) return
    setSaving(true)
    await onSave({ name: name.trim(), bio: bio.trim(), styles, avatarFile, avatarPreview })
    setSaving(false)
  }

  return (
    <div className="profile-setup-page">
      <header className="profile-setup-header">
        <h1>Complete Profile</h1>
        <p>Set your photo, short bio and style preferences.</p>
      </header>

      <section className="profile-setup-avatar-section">
        <div className="profile-setup-avatar-wrap">
          <img src={avatarPreview || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400'} alt="profile" className="profile-setup-avatar" />
          <label className="profile-setup-camera-btn">
            <input type="file" accept="image/*" hidden onChange={handleFileChange} />
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </label>
        </div>
      </section>

      <section className="profile-setup-form">
        <label className="setup-label">Display Name</label>
        <input className="setup-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />

        <div className="setup-label-row">
          <label className="setup-label">Bio</label>
          <span>{bio.length}/{MAX_BIO}</span>
        </div>
        <textarea
          className="setup-textarea"
          maxLength={MAX_BIO}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell us about your style journey..."
        />

        <div className="setup-style-header">
          <label className="setup-label">General Style</label>
          <span>Select up to {MAX_STYLES}</span>
        </div>
        <div className="setup-style-grid">
          {STYLE_TYPES.map((style) => (
            <button
              key={style}
              type="button"
              className={`setup-style-chip ${styles.includes(style) ? 'active' : ''}`}
              onClick={() => toggleStyle(style)}
            >
              {style}
            </button>
          ))}
        </div>
      </section>

      <button className="profile-setup-save" onClick={handleSubmit} disabled={!canSubmit || saving}>
        {saving ? 'Saving...' : 'Continue'}
      </button>
    </div>
  )
}

export default ProfileSetup

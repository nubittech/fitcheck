import React, { useState } from 'react'
import '../styles/EditProfile.css'

const VIBE_OPTIONS = ['Minimalist', 'Streetwear', 'Vintage', 'Y2K', 'Workwear', 'Casual', 'Gorpcore']

const EditProfile = ({ onClose, profile, onSave }) => {
  const [displayName, setDisplayName] = useState(profile?.name || '')
  const [bio, setBio] = useState(profile?.bio || '')
  const [city, setCity] = useState(profile?.city && profile.city !== 'City not set' ? profile.city : '')
  const [age, setAge] = useState(profile?.age && profile.age !== '-' ? String(profile.age) : '')
  const [selectedVibes, setSelectedVibes] = useState(profile?.styles?.length ? profile.styles : [])
  const [avatarPreview, setAvatarPreview] = useState(profile?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400')
  const [avatarFile, setAvatarFile] = useState(null)

  const toggleVibe = (vibe) => {
    setSelectedVibes((prev) => {
      if (prev.includes(vibe)) return prev.filter((v) => v !== vibe)
      if (prev.length >= 3) return prev
      return [...prev, vibe]
    })
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleSave = () => {
    onSave?.({
      name: displayName.trim(),
      bio: bio.trim(),
      city: city.trim(),
      age: Number(age) || null,
      styles: selectedVibes,
      avatarPreview,
      avatarFile
    })
    onClose()
  }

  return (
    <div className="edit-profile-overlay">
      <div className="edit-profile-page">
        <header className="edit-profile-header">
          <button className="icon-plain" onClick={onClose} aria-label="Close">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <h2>Edit Profile</h2>
          <div className="header-spacer" />
        </header>

        <section className="photo-section">
          <div className="edit-avatar-wrap">
            <div className="edit-avatar-ring">
              <img
                src={avatarPreview}
                alt="Profile"
                className="edit-avatar"
              />
            </div>
            <label className="camera-fab" aria-label="Change photo">
              <input type="file" accept="image/*" hidden onChange={handleAvatarChange} />
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </label>
          </div>
          <button className="change-photo-btn">Change Profile Photo</button>
        </section>

        <section className="form-section">
          <label className="field-label">Display Name</label>
          <input
            className="field-input"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />

          <div className="field-label-row">
            <label className="field-label">Bio</label>
            <span className="field-helper">(Max 150 chars)</span>
          </div>
          <textarea
            className="field-textarea"
            placeholder="Tell us about your style journey..."
            maxLength={150}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />

          <div className="two-col-fields">
            <div>
              <label className="field-label">City</label>
              <div className="field-with-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z" />
                </svg>
                <input className="field-input" value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="field-label">Age</label>
              <input className="field-input age-input" value={age} onChange={(e) => setAge(e.target.value)} />
            </div>
          </div>
        </section>

        <section className="vibe-section">
          <div className="vibe-header">
            <h3>What's your style?</h3>
            <span>Select up to 3</span>
          </div>
          <div className="vibe-chips">
            {VIBE_OPTIONS.map((vibe) => (
              <button
                key={vibe}
                className={`vibe-chip ${selectedVibes.includes(vibe) ? 'active' : ''}`}
                onClick={() => toggleVibe(vibe)}
              >
                {vibe}
              </button>
            ))}
          </div>
        </section>

        <button className="save-changes-btn" onClick={handleSave}>Save Changes</button>
      </div>
    </div>
  )
}

export default EditProfile

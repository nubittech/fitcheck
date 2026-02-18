import React from 'react'
import '../styles/NoMoreContent.css'

const NoMoreContent = ({ onRefresh, onDiscover }) => {
  return (
    <div className="no-content-page">
      <div className="no-content-card">
        <div className="no-content-icon">✓</div>
        <h2>Bugunluk gosterecek kombin kalmadi</h2>
        <p>Yeni stiller yuklenince burada gorunecek. Bu sirada kesfet ekranina gecebilirsin.</p>
        <button className="no-content-btn primary" onClick={onDiscover}>Kesfete Git</button>
        <button className="no-content-btn ghost" onClick={onRefresh}>Basa Don</button>
      </div>
    </div>
  )
}

export default NoMoreContent

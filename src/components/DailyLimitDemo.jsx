import React from 'react'
import '../styles/DailyLimitDemo.css'

const DailyLimitDemo = ({ onBack, onGoHome }) => {
  return (
    <div className="daily-limit-overlay">
      <div className="daily-limit-page">
        <header className="daily-limit-header">
          <button className="daily-limit-back" onClick={onBack} aria-label="Geri">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
          <h2>Gunluk Tur</h2>
          <div className="daily-limit-spacer" />
        </header>

        <div className="daily-limit-content">
          <div className="daily-limit-badge">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12 3.41 13.41 9 19l12-12-1.41-1.41z"/></svg>
            <span>75/75 Tamamlandi</span>
          </div>

          <h1>Gunluk Turun Bitti!</h1>
          <p>
            Bugunluk <strong>75 kombini</strong> inceledin. Yarin yeni stillerle gorusmek uzere.
          </p>

          <button className="daily-limit-premium-btn">
            <span className="diamond">♦</span>
            Sinirsiz Erisim Icin Premium'a Gec
          </button>

          <button className="daily-limit-home-btn" onClick={onGoHome}>Anasayfaya Don</button>
        </div>
      </div>
    </div>
  )
}

export default DailyLimitDemo

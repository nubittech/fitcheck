import React, { useEffect, useState } from 'react'

const LevelUpModal = ({ oldLevel, newLevel, onClose }) => {
  const [phase, setPhase] = useState(0) // 0: enter, 1: visible, 2: exit

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 50)
    const t2 = setTimeout(() => setPhase(2), 3500)
    const t3 = setTimeout(() => onClose?.(), 4000)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onClose])

  const title = (() => {
    if (newLevel >= 50) return 'Moda Ikonu'
    if (newLevel >= 40) return 'Stil Ustasi'
    if (newLevel >= 30) return 'Trend Setter'
    if (newLevel >= 20) return 'Fashionista'
    if (newLevel >= 15) return 'Stil Avcisi'
    if (newLevel >= 10) return 'Kombin Artisti'
    if (newLevel >= 5) return 'Moda Meraklisi'
    return 'Caylak'
  })()

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: phase === 1 ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0)',
      transition: 'background 0.5s ease',
      pointerEvents: phase === 2 ? 'none' : 'auto',
    }} onClick={onClose}>
      <div style={{
        transform: phase === 1 ? 'scale(1)' : 'scale(0.7)',
        opacity: phase === 1 ? 1 : 0,
        transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        textAlign: 'center',
        padding: '40px 32px',
      }}>
        {/* Parlayan yildiz efekti */}
        <div style={{
          fontSize: 64,
          marginBottom: 16,
          animation: phase === 1 ? 'levelSpin 1s ease-out' : 'none',
        }}>
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              fill="url(#starGrad)" stroke="none"
            />
            <defs>
              <linearGradient id="starGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFD700" />
                <stop offset="100%" stopColor="#FF6B00" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div style={{
          color: '#FFD700',
          fontSize: 14,
          fontWeight: 600,
          letterSpacing: 3,
          marginBottom: 8,
          textTransform: 'uppercase',
        }}>
          Seviye Atladin!
        </div>

        <div style={{
          color: '#fff',
          fontSize: 56,
          fontWeight: 800,
          lineHeight: 1,
          marginBottom: 8,
        }}>
          LVL {newLevel}
        </div>

        <div style={{
          color: 'rgba(255,215,0,0.8)',
          fontSize: 16,
          fontWeight: 600,
        }}>
          {title}
        </div>

        <div style={{
          color: 'rgba(255,255,255,0.3)',
          fontSize: 12,
          marginTop: 24,
        }}>
          Dokunarak kapat
        </div>
      </div>

      <style>{`
        @keyframes levelSpin {
          0% { transform: scale(0.3) rotate(-180deg); opacity: 0; }
          60% { transform: scale(1.2) rotate(10deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); }
        }
      `}</style>
    </div>
  )
}

export default LevelUpModal

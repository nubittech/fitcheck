import React, { useEffect, useState } from 'react'

const XPToast = ({ amount, source }) => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
    const timer = setTimeout(() => setVisible(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div style={{
      position: 'fixed',
      top: 60,
      left: '50%',
      transform: `translateX(-50%) translateY(${visible ? '0' : '-20px'})`,
      opacity: visible ? 1 : 0,
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      zIndex: 9999,
      pointerEvents: 'none',
    }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(255,215,0,0.95), rgba(255,140,0,0.95))',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        color: '#000',
        padding: '8px 20px',
        borderRadius: 24,
        fontSize: 15,
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        boxShadow: '0 4px 20px rgba(255,165,0,0.4)',
      }}>
        <span style={{ fontSize: 18 }}>+{amount} XP</span>
        {source && (
          <span style={{ fontSize: 12, opacity: 0.7, fontWeight: 500 }}>
            {source}
          </span>
        )}
      </div>
    </div>
  )
}

export default XPToast

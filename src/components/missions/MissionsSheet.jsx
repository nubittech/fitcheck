import React, { useState, useEffect, useRef } from 'react'
import MissionCard from './MissionCard'
import { getDailyMissions, claimMissionReward } from '../../lib/api'
import { useXP } from '../../contexts/XPContext'
import '../../styles/MissionsSheet.css'

const MissionsSheet = ({ isOpen, onClose, userId }) => {
  const [missions, setMissions] = useState([])
  const [loading, setLoading] = useState(true)
  const { refreshLevel, streakInfo, level } = useXP()
  const sheetRef = useRef(null)
  const startY = useRef(0)
  const currentY = useRef(0)

  useEffect(() => {
    if (isOpen && userId) {
      setLoading(true)
      getDailyMissions(userId).then(({ data }) => {
        if (data) setMissions(data)
        setLoading(false)
      })
    }
  }, [isOpen, userId])

  const handleClaim = async (missionId) => {
    const { data } = await claimMissionReward(missionId)
    if (data) {
      setMissions(prev => prev.map(m =>
        m.id === missionId ? { ...m, status: 'claimed' } : m
      ))
      await refreshLevel()
    }
  }

  const handleClaimAll = async () => {
    const unclaimed = missions.filter(m => m.status === 'completed')
    if (unclaimed.length === 0) return
    for (const m of unclaimed) {
      await claimMissionReward(m.id)
    }
    setMissions(prev => prev.map(m =>
      m.status === 'completed' ? { ...m, status: 'claimed' } : m
    ))
    await refreshLevel()
  }

  // Swipe down to close
  const handleTouchStart = (e) => { startY.current = e.touches[0].clientY }
  const handleTouchMove = (e) => {
    currentY.current = e.touches[0].clientY - startY.current
    if (currentY.current > 0 && sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${currentY.current}px)`
    }
  }
  const handleTouchEnd = () => {
    if (currentY.current > 100) onClose?.()
    if (sheetRef.current) sheetRef.current.style.transform = ''
    currentY.current = 0
  }

  // Görevleri daily ve admin olarak ayır
  const dailyMissions = missions.filter(m => m.mission_type === 'daily')
  const adminMissions = missions.filter(m => m.mission_type === 'admin')

  const dailyCompleted = dailyMissions.filter(m => m.status === 'completed' || m.status === 'claimed').length
  const dailyTotal = dailyMissions.length
  const dailyXP = dailyMissions.reduce((sum, m) => sum + (m.xp_reward || 0), 0)
  const adminXP = adminMissions.reduce((sum, m) => sum + (m.xp_reward || 0), 0)
  const unclaimedCount = missions.filter(m => m.status === 'completed').length

  const tierLabel = (lvl) => {
    if (!lvl) return 'Başlangıç'
    if (lvl <= 10) return 'Tier 1 — Başlangıç'
    if (lvl <= 25) return 'Tier 2 — Orta'
    if (lvl <= 40) return 'Tier 3 — İleri'
    return 'Tier 4 — Efsane'
  }

  return (
    <>
      <div
        className="missions-sheet-backdrop"
        style={{ pointerEvents: isOpen ? 'auto' : 'none', opacity: isOpen ? 1 : 0 }}
        onClick={onClose}
      />
      <div
        className="missions-sheet"
        ref={sheetRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ transform: isOpen ? 'translateY(0)' : 'translateY(100%)' }}
      >
        {/* Header */}
        <div className="missions-sheet-header">
          <div>
            <h2 className="missions-sheet-title">Görevlerim</h2>
            <div className="missions-sheet-subtitle">
              {tierLabel(level?.level)} • {dailyCompleted}/{dailyTotal} TAMAMLANDI
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
              <div className="missions-total-xp">
                ⭐ Günlük: {dailyXP.toLocaleString()} XP
              </div>
              {streakInfo?.streak_days > 0 && (
                <div style={{ background: '#fff3e0', color: '#e07a2f', borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 700 }}>
                  🔥 {streakInfo.streak_days} Gün Seri
                </div>
              )}
            </div>
          </div>
          <button className="missions-sheet-close" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="missions-list-container">
          {loading ? (
            <div style={{ color: '#8f8582', fontSize: 14, textAlign: 'center', padding: 40 }}>
              Yükleniyor...
            </div>
          ) : (
            <>
              {/* Günlük Görevler */}
              {dailyMissions.length > 0 && (
                <>
                  <div style={{ padding: '12px 20px 6px', fontSize: 11, fontWeight: 700, color: '#c97b6e', letterSpacing: 1, textTransform: 'uppercase' }}>
                    📅 Günlük Görevler
                  </div>
                  {dailyMissions.map(m => (
                    <MissionCard
                      key={m.id}
                      title={m.title || 'Görev'}
                      description={m.description}
                      icon={m.icon}
                      progress={m.progress}
                      target={m.target}
                      xp={m.xp_reward || 0}
                      completed={m.status === 'completed' || m.status === 'claimed'}
                      claimed={m.status === 'claimed'}
                      onClaim={() => handleClaim(m.id)}
                    />
                  ))}
                </>
              )}

              {/* Admin / Etkinlik Görevleri */}
              {adminMissions.length > 0 && (
                <>
                  <div style={{ padding: '16px 20px 6px', fontSize: 11, fontWeight: 700, color: '#6e8fc9', letterSpacing: 1, textTransform: 'uppercase' }}>
                    🎪 Özel Görevler
                    {adminXP > 0 && (
                      <span style={{ marginLeft: 8, background: '#e8f0fe', borderRadius: 20, padding: '2px 8px', fontWeight: 700 }}>
                        +{adminXP} XP
                      </span>
                    )}
                  </div>
                  {adminMissions.map(m => (
                    <MissionCard
                      key={m.id}
                      title={m.title || 'Özel Görev'}
                      description={m.description}
                      icon={m.icon || '🎪'}
                      progress={m.progress}
                      target={m.target}
                      xp={m.xp_reward || 0}
                      completed={m.status === 'completed' || m.status === 'claimed'}
                      claimed={m.status === 'claimed'}
                      isAdmin={true}
                      onClaim={() => handleClaim(m.id)}
                    />
                  ))}
                </>
              )}

              {missions.length === 0 && (
                <div style={{ color: '#8f8582', fontSize: 14, textAlign: 'center', padding: 40 }}>
                  Bugün için görev bulunmuyor.
                </div>
              )}
            </>
          )}
        </div>

        {/* Claim All */}
        {unclaimedCount > 0 && (
          <button className="missions-claim-all-btn" onClick={handleClaimAll}>
            Tümünü Al ({unclaimedCount} görev)
          </button>
        )}
      </div>
    </>
  )
}

export default MissionsSheet

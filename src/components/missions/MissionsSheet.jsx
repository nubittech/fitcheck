import React, { useState, useEffect, useRef } from 'react'
import MissionCard from './MissionCard'
import { getDailyMissions, claimMissionReward } from '../../lib/api'
import { useXP } from '../../contexts/XPContext'
import '../../styles/MissionsSheet.css'

// Özel tasarım ikonlar
const StarIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.15))' }}>
    <defs>
      <linearGradient id="starGradPill" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFF5BA" />
        <stop offset="50%" stopColor="#FFD700" />
        <stop offset="100%" stopColor="#FFA500" />
      </linearGradient>
    </defs>
    <path
      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      fill="url(#starGradPill)"
    />
  </svg>
)

const CalendarIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ marginRight: 6 }}>
    <rect x="3" y="6" width="18" height="15" rx="2" fill="white" stroke="#c97b6e" strokeWidth="1.5" />
    <path d="M3 6h18v4.5H3V6z" fill="#c97b6e" />
    <text x="12" y="18" textAnchor="middle" fontSize="8" fontWeight="900" fill="#555" fontFamily="-apple-system, system-ui, sans-serif">17</text>
    <rect x="6" y="4" width="2" height="4" rx="1" fill="#a05a4e" />
    <rect x="16" y="4" width="2" height="4" rx="1" fill="#a05a4e" />
  </svg>
)

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
        m.id === missionId ? { ...m, is_claimed: true } : m
      ))
      await refreshLevel()
    }
  }

  const handleClaimAll = async () => {
    const unclaimed = missions.filter(m => m.is_completed && !m.is_claimed)
    if (unclaimed.length === 0) return
    for (const m of unclaimed) {
      await claimMissionReward(m.id)
    }
    setMissions(prev => prev.map(m =>
      (m.is_completed && !m.is_claimed) ? { ...m, is_claimed: true } : m
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

  // Görevleri türlerine göre ayır — link_sale görevlerini her yerde gizle
  const activeMissions = missions.filter(m => m.action_type !== 'link_sale')
  const onetimeMissions = activeMissions.filter(m => m.mission_type === 'onetime' && !m.is_claimed)
  const dailyMissions = activeMissions.filter(m => m.mission_type === 'daily')
  const superMissions = activeMissions.filter(m => m.mission_type === 'super')
  const adminMissions = activeMissions.filter(m => m.mission_type === 'admin')

  const dailyCompleted = dailyMissions.filter(m => m.is_completed).length
  const dailyTotal = dailyMissions.length
  const dailyXP = dailyMissions.reduce((sum, m) => sum + (m.xp_reward || 0), 0)
  const superXP = superMissions.reduce((sum, m) => sum + (m.xp_reward || 0), 0)
  const adminXP = adminMissions.reduce((sum, m) => sum + (m.xp_reward || 0), 0)
  const unclaimedCount = missions.filter(m => m.is_completed && !m.is_claimed).length

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
                <StarIcon size={16} />
                <span>Günlük: {dailyXP.toLocaleString()} XP</span>
              </div>
              {streakInfo?.streak_days > 0 && (
                <div style={{ background: '#fff3e0', color: '#e07a2f', borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 700 }}>
                  {streakInfo.streak_days} Gün Seri
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
              {/* Tek Seferlik Görevler */}
              {onetimeMissions.length > 0 && (
                <>
                  {onetimeMissions.map(m => (
                    <MissionCard
                      key={m.id}
                      title={m.title || 'Görev'}
                      description={m.description}
                      actionType={m.action_type}
                      progress={m.progress}
                      target={m.target}
                      xp={m.xp_reward || 0}
                      completed={m.is_completed}
                      claimed={m.is_claimed}
                      isOnetime={true}
                      onClaim={() => handleClaim(m.id)}
                    />
                  ))}
                </>
              )}

              {/* Günlük Görevler */}
              {dailyMissions.length > 0 && (
                <>
                  <div style={{ padding: '12px 0 8px', fontSize: 11, fontWeight: 800, color: '#c97b6e', letterSpacing: 0.5, textTransform: 'uppercase', display: 'flex', alignItems: 'center' }}>
                    <CalendarIcon size={18} />
                    GÜNLÜK GÖREVLER
                  </div>
                  {dailyMissions.map(m => (
                    <MissionCard
                      key={m.id}
                      title={m.title || 'Görev'}
                      description={m.description}
                      actionType={m.action_type}
                      progress={m.progress}
                      target={m.target}
                      xp={m.xp_reward || 0}
                      completed={m.is_completed}
                      claimed={m.is_claimed}
                      onClaim={() => handleClaim(m.id)}
                    />
                  ))}
                </>
              )}

              {/* Süper Görevler */}
              {superMissions.length > 0 && (
                <>
                  <div style={{ padding: '16px 0 8px', fontSize: 11, fontWeight: 700, color: '#d4a017', letterSpacing: 1, textTransform: 'uppercase' }}>
                    Süper Görevler
                    {superXP > 0 && (
                      <span style={{ marginLeft: 8, background: '#fef6e4', borderRadius: 20, padding: '2px 8px', fontWeight: 700 }}>
                        +{superXP} XP
                      </span>
                    )}
                  </div>
                  {superMissions.map(m => (
                    <MissionCard
                      key={m.id}
                      title={m.title || 'Süper Görev'}
                      description={m.description}
                      actionType={m.action_type}
                      progress={m.progress}
                      target={m.target}
                      xp={m.xp_reward || 0}
                      completed={m.is_completed}
                      claimed={m.is_claimed}
                      isSuper={true}
                      onClaim={() => handleClaim(m.id)}
                    />
                  ))}
                </>
              )}

              {/* Admin / Etkinlik Görevleri */}
              {adminMissions.length > 0 && (
                <>
                  <div style={{ padding: '16px 0 8px', fontSize: 11, fontWeight: 700, color: '#6e8fc9', letterSpacing: 1, textTransform: 'uppercase' }}>
                    Özel Görevler
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
                      actionType={m.action_type}
                      progress={m.progress}
                      target={m.target}
                      xp={m.xp_reward || 0}
                      completed={m.is_completed}
                      claimed={m.is_claimed}
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

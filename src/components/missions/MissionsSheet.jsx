import React, { useState, useEffect, useRef } from 'react'
import MissionCard from './MissionCard'
import { getDailyMissions, claimMissionReward } from '../../lib/api'
import { useXP } from '../../contexts/XPContext'
import '../../styles/MissionsSheet.css'

const MissionsSheet = ({ isOpen, onClose, userId }) => {
  const [missions, setMissions] = useState([])
  const [loading, setLoading] = useState(true)
  const { refreshLevel, streakInfo } = useXP()
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
    
    // Process sequentially to be safe, or Promise.all handling could be used.
    for (const m of unclaimed) {
      await claimMissionReward(m.id)
    }
    
    setMissions(prev => prev.map(m =>
      (m.is_completed && !m.is_claimed) ? { ...m, is_claimed: true } : m
    ))
    await refreshLevel()
  }

  // Swipe down to close
  const handleTouchStart = (e) => {
    startY.current = e.touches[0].clientY
  }
  const handleTouchMove = (e) => {
    currentY.current = e.touches[0].clientY - startY.current
    if (currentY.current > 0 && sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${currentY.current}px)`
    }
  }
  const handleTouchEnd = () => {
    if (currentY.current > 100) {
      onClose?.()
    }
    if (sheetRef.current) {
      sheetRef.current.style.transform = ''
    }
    currentY.current = 0
  }

  const completedCount = missions.filter(m => m.is_completed).length
  const totalCount = missions.length
  const totalXP = missions.reduce((sum, m) => sum + (m.mission?.xp_reward || 0), 0)
  const unclaimedCount = missions.filter(m => m.is_completed && !m.is_claimed).length

  return (
    <>
      {/* Backdrop */}
      <div
        className="missions-sheet-backdrop"
        style={{
          pointerEvents: isOpen ? 'auto' : 'none',
          opacity: isOpen ? 1 : 0
        }}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className="missions-sheet"
        ref={sheetRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
        }}
      >
        {/* Header */}
        <div className="missions-sheet-header">
          <div>
            <h2 className="missions-sheet-title">Günlük Görevler</h2>
            <div className="missions-sheet-subtitle">BUGÜN {completedCount}/{totalCount} TAMAMLANDI</div>
            
            <div className="missions-total-xp">
               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 15l-3.09-6.26L4 9.27l5 4.87-1.18 6.88L12 17.77l4.18-2.25L15 8.64l5-4.87-4.91-1.01L12 15z" />
                  <path d="M12 2v2"></path>
               </svg>
               {totalXP.toLocaleString()} XP
            </div>
          </div>
          <button className="missions-sheet-close" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Mission List */}
        <div className="missions-list-container">
          {loading ? (
            <div style={{ color: '#8f8582', fontSize: 14, textAlign: 'center', padding: 40 }}>
              Yükleniyor...
            </div>
          ) : missions.length === 0 ? (
            <div style={{ color: '#8f8582', fontSize: 14, textAlign: 'center', padding: 40 }}>
              Bugün için görev bulunmuyor.
            </div>
          ) : (
            missions.map(m => (
              <MissionCard
                key={m.id}
                title={m.mission?.title || 'Görev'}
                progress={m.progress}
                target={m.target}
                xp={m.mission?.xp_reward || 0}
                completed={m.is_completed}
                claimed={m.is_claimed}
                onClaim={() => handleClaim(m.id)}
              />
            ))
          )}
        </div>
        
        {/* Claim All Button */}
        {missions.length > 0 && (
          <button 
             className="missions-claim-all-btn" 
             onClick={handleClaimAll}
             disabled={unclaimedCount === 0}
          >
             {unclaimedCount > 0 ? `Tümünü Al (${unclaimedCount})` : 'Toplanacak Ödül Yok'}
          </button>
        )}
      </div>
    </>
  )
}

export default MissionsSheet

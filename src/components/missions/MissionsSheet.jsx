import React, { useState, useEffect, useRef } from 'react'
import MissionCard from './MissionCard'
import { getDailyMissions, claimMissionReward } from '../../lib/api'
import { useXP } from '../../contexts/XPContext'

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

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 998,
          background: isOpen ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0)',
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'background 0.3s ease',
        }}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          position: 'fixed',
          left: 0, right: 0, bottom: 0,
          zIndex: 999,
          background: '#1a1a1a',
          borderRadius: '24px 24px 0 0',
          maxHeight: '75vh',
          overflowY: 'auto',
          transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* Handle */}
        <div style={{
          width: 36, height: 4, borderRadius: 2,
          background: 'rgba(255,255,255,0.2)',
          margin: '10px auto 0',
        }} />

        {/* Header */}
        <div style={{
          padding: '16px 20px 12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <h2 style={{
              color: '#fff', fontSize: 20, fontWeight: 700, margin: 0,
            }}>
              Gunluk Gorevler
            </h2>
            {streakInfo && streakInfo.streak > 0 && (
              <div style={{
                color: '#FFD700', fontSize: 12, marginTop: 4,
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <span>🔥</span>
                <span>{streakInfo.streak} Gun Streak</span>
              </div>
            )}
          </div>
          <div style={{
            background: completedCount === totalCount && totalCount > 0
              ? 'linear-gradient(135deg, #FFD700, #FF8C00)'
              : 'rgba(255,255,255,0.08)',
            color: completedCount === totalCount && totalCount > 0 ? '#000' : '#fff',
            padding: '6px 14px',
            borderRadius: 20,
            fontSize: 13,
            fontWeight: 700,
          }}>
            {completedCount}/{totalCount}
          </div>
        </div>

        {/* Mission List */}
        <div style={{ padding: '0 16px 32px' }}>
          {loading ? (
            <div style={{ color: '#666', fontSize: 14, textAlign: 'center', padding: 40 }}>
              Yukleniyor...
            </div>
          ) : missions.length === 0 ? (
            <div style={{ color: '#666', fontSize: 14, textAlign: 'center', padding: 40 }}>
              Bugun icin gorev bulunmuyor.
            </div>
          ) : (
            missions.map(m => (
              <MissionCard
                key={m.id}
                icon={m.mission?.icon}
                title={m.mission?.title || 'Gorev'}
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
      </div>
    </>
  )
}

export default MissionsSheet

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import {
  getUserLevel, awardXp, trackAction, updateStreak,
  checkBadges, assignDailyMissions, getLevelProgress
} from '../lib/api'

const XPContext = createContext()

export const XPProvider = ({ children, userId }) => {
  const [level, setLevel] = useState(null)
  const [xpToast, setXpToast] = useState(null)
  const [levelUp, setLevelUp] = useState(null)
  const [newBadge, setNewBadge] = useState(null)
  const [streakInfo, setStreakInfo] = useState(null)
  const initRef = useRef(false)

  // Seviye verisini yukle
  const refreshLevel = useCallback(async () => {
    if (!userId) return null
    const { data } = await getUserLevel(userId)
    if (data) {
      const progress = getLevelProgress(data.xp, data.level)
      setLevel({ ...data, ...progress })
    }
    return data
  }, [userId])

  // Uygulama acildiginda: streak guncelle + gorevleri ata + seviyeyi yukle
  useEffect(() => {
    if (!userId || initRef.current) return
    initRef.current = true

    const init = async () => {
      // 1. Streak guncelle (gunluk giris XP)
      const { data: streak } = await updateStreak(userId)
      if (streak) {
        setStreakInfo(streak)
        if (streak.bonus_xp > 0 && !streak.already_claimed) {
          setXpToast({ amount: streak.bonus_xp, source: 'Gunluk Giris' })
          setTimeout(() => setXpToast(null), 3000)
        }
      }

      // 2. Gunluk gorevleri ata
      await assignDailyMissions(userId)

      // 3. Seviyeyi yukle
      await refreshLevel()

      // 4. Rozet kontrolu
      const { data: badgeResult } = await checkBadges(userId)
      if (badgeResult?.new_badges?.length > 0) {
        setNewBadge(badgeResult.new_badges[0])
      }
    }

    init().catch(console.error)
  }, [userId, refreshLevel])

  // XP ver ve toast goster
  const grantXP = useCallback(async (amount, source, sourceId) => {
    if (!userId) return null
    const { data } = await awardXp(userId, amount, source, sourceId)
    if (data) {
      // XP toast
      setXpToast({ amount: data.xp_added, source })
      setTimeout(() => setXpToast(null), 2500)

      // Level up modal
      if (data.leveled_up) {
        setTimeout(() => {
          setLevelUp({ oldLevel: data.old_level, newLevel: data.new_level })
        }, 800)
      }

      // Seviyeyi guncelle
      await refreshLevel()

      // Rozet kontrolu
      const { data: badgeResult } = await checkBadges(userId)
      if (badgeResult?.new_badges?.length > 0) {
        setTimeout(() => {
          setNewBadge(badgeResult.new_badges[0])
        }, data.leveled_up ? 3000 : 1000)
      }
    }
    return data
  }, [userId, refreshLevel])

  // Aksiyon takip (gorev ilerlemesi + XP)
  const track = useCallback(async (actionType) => {
    if (!userId) return null
    const { data } = await trackAction(userId, actionType)
    if (data?.completed_missions?.length > 0) {
      // Gorev tamamlandi — seviyeyi guncelle
      await refreshLevel()
      // Her tamamlanan gorev icin XP toast goster
      for (const m of data.completed_missions) {
        setXpToast({ amount: m.xp_earned, source: m.title })
        await new Promise(r => setTimeout(r, 2000))
      }
      setXpToast(null)
    }
    return data
  }, [userId, refreshLevel])

  return (
    <XPContext.Provider value={{
      level,
      streakInfo,
      refreshLevel,
      grantXP,
      track,
      xpToast, setXpToast,
      levelUp, setLevelUp,
      newBadge, setNewBadge
    }}>
      {children}
    </XPContext.Provider>
  )
}

export const useXP = () => useContext(XPContext)

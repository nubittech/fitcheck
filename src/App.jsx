import React, { useState, useEffect, useCallback } from 'react'
import OutfitCard from './components/OutfitCard'
import BottomNav from './components/BottomNav'
import Discover from './components/Discover'
import Profile from './components/Profile'
import Inbox, { ChatDetail } from './components/Inbox'
import NewCombo from './components/NewCombo'
import Login from './components/Login'
import PublicProfile from './components/PublicProfile'
import SignUp from './components/SignUp'
import NoMoreContent from './components/NoMoreContent'
import ProfileSetup from './components/ProfileSetup'
import DailyLimitDemo from './components/DailyLimitDemo'
import { getSession, onAuthStateChange, signOut } from './lib/auth'
import { getOutfits, getProfile, getUserLikes, likeOutfit, updateProfile, uploadAvatar, sortFeedWithBoost } from './lib/api'
import { supabase } from './lib/supabase'
import './styles/App.css'

function transformOutfit(raw) {
  const profile = raw.profiles || {}
  return {
    id: raw.id,
    user: {
      id: profile.id,
      name: profile.full_name || profile.username || 'Anonymous',
      age: profile.age,
      location: profile.city || '',
      avatar: profile.avatar_url || '',
      isPremium: profile.is_premium || false
    },
    media: (raw.outfit_media || [])
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(m => ({
        id: m.id,
        type: m.media_type,
        url: m.media_url,
        thumbnail: m.media_type === 'video' ? m.media_url : undefined
      })),
    caption: raw.caption || '',
    vibe: raw.vibe || null,
    items: (raw.items || []).map((item, i) => ({
      id: i + 1,
      name: item.name || '',
      brand: item.brand || 'Unknown',
      link: item.link || null,
      position: item.position || null,
      feedbackEnabled: item.feedbackEnabled
    })),
    comments: [],
    stats: {
      views: raw.views || 0,
      likes: raw.likes_count || 0,
      commentsCount: raw.comments_count || 0
    },
    isBoosted: raw.is_boosted || false,
    boostedAt: raw.boosted_at || null,
    createdAt: raw.created_at || null
  }
}

function App() {
  const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400'
  const [session, setSession] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [needsProfileSetup, setNeedsProfileSetup] = useState(false)
  const [profileChecked, setProfileChecked] = useState(false)
  const [lockProfileSetup, setLockProfileSetup] = useState(false)
  const [authScreen, setAuthScreen] = useState('login')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [activeTab, setActiveTab] = useState('home')
  const [outfits, setOutfits] = useState([])
  const [likedOutfitIds, setLikedOutfitIds] = useState(new Set())
  const [selectedChat, setSelectedChat] = useState(null)
  const [viewingProfile, setViewingProfile] = useState(null)
  const [feedLoading, setFeedLoading] = useState(false)
  const [signupName, setSignupName] = useState('')
  const [swipeLimitReached, setSwipeLimitReached] = useState(false)
  const [showDailyLimit, setShowDailyLimit] = useState(false)
  const [pendingChat, setPendingChat] = useState(null)
  const [selectedVibe, setSelectedVibe] = useState(null) // null = all styles

  const isLoggedIn = !!session
  const isPremiumUser = Boolean(currentUser?.is_premium)

  // Auth listener
  useEffect(() => {
    getSession().then(s => {
      setSession(s)
    })
    const { data: { subscription } } = onAuthStateChange((_event, s) => {
      setSession(s)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Fetch profile when session changes
  useEffect(() => {
    if (!session?.user?.id) {
      setCurrentUser(null)
      setNeedsProfileSetup(false)
      setProfileChecked(true)
      return
    }
    if (lockProfileSetup) {
      setCurrentUser(null)
      setNeedsProfileSetup(true)
      setProfileChecked(true)
      return
    }
    setProfileChecked(false)
    getProfile(session.user.id).then(({ data, error }) => {
      if (error) {
        // Table doesn't exist or network error — use auth metadata as fallback
        const meta = session.user.user_metadata || {}
        setCurrentUser({
          id: session.user.id,
          full_name: meta.full_name || '',
          email: session.user.email || '',
        })
        setNeedsProfileSetup(false)
        setProfileChecked(true)
        return
      }
      if (data) {
        setCurrentUser(data)
        const incomplete =
          !data.full_name ||
          !data.bio ||
          !data.vibes ||
          data.vibes.length === 0
        setNeedsProfileSetup(incomplete)
      } else {
        setNeedsProfileSetup(true)
      }
      setProfileChecked(true)
    })
  }, [session?.user?.id, lockProfileSetup])

  // Fetch feed (skip if profile setup still needed)
  const fetchFeed = useCallback(async () => {
    if (!session || needsProfileSetup) return
    setFeedLoading(true)
    try {
      const [outfitRes, likesRes] = await Promise.all([
        getOutfits({ vibe: selectedVibe }),
        getUserLikes(session.user.id)
      ])
      if (outfitRes.data) {
        const transformed = outfitRes.data.map(transformOutfit)
        setOutfits(sortFeedWithBoost(transformed))
      }
      if (likesRes.data) {
        setLikedOutfitIds(new Set(likesRes.data.map(l => l.outfit_id)))
      }
    } catch (err) {
      console.warn('Feed fetch failed:', err.message)
    }
    setFeedLoading(false)
  }, [session, needsProfileSetup, selectedVibe])

  useEffect(() => {
    if (session && !needsProfileSetup && profileChecked) fetchFeed()
  }, [session, needsProfileSetup, profileChecked, fetchFeed])

  // Re-fetch when vibe filter changes
  useEffect(() => {
    if (session && !needsProfileSetup) {
      setCurrentIndex(0)
      fetchFeed()
    }
  }, [selectedVibe])

  // Server-side swipe counter — bypass-proof
  const incrementSwipe = useCallback(async () => {
    if (!session) return false
    if (swipeLimitReached) {
      setShowDailyLimit(true)
      return false
    }
    try {
      const { data, error } = await supabase.rpc('increment_swipe')
      if (error) {
        console.warn('Swipe RPC error:', error.message)
        return true // fail open — don't block user on network error
      }
      if (!data?.allowed) {
        setSwipeLimitReached(true)
        setShowDailyLimit(true)
        return false
      }
      return true
    } catch {
      return true // fail open
    }
  }, [session, swipeLimitReached])

  const handleNext = async () => {
    if (currentIndex < outfits.length) {
      const allowed = await incrementSwipe()
      if (!allowed) return
      setCurrentIndex(prev => prev + 1)
    }
  }

  const handleSkip = () => handleNext()

  const handleLike = async () => {
    const outfit = outfits[currentIndex]
    if (!outfit || !session) return
    // Optimistic update
    setOutfits(prev => prev.map(o =>
      o.id === outfit.id
        ? { ...o, stats: { ...o.stats, likes: o.stats.likes + 1 } }
        : o
    ))
    setLikedOutfitIds(prev => new Set([...prev, outfit.id]))
    await likeOutfit({ outfitId: outfit.id, userId: session.user.id })
  }

  const handleItemVote = (itemId, type) => {
    setOutfits(prev => prev.map(o =>
      o.id === outfits[currentIndex]?.id
        ? {
          ...o,
          items: o.items.map(item =>
            item.id === itemId
              ? { ...item, votes: { ...item.votes, [type]: item.votes[type] + 1 } }
              : item
          )
        }
        : o
    ))
  }

  const handleLogout = async () => {
    await signOut()
    setSession(null)
    setCurrentUser(null)
    setNeedsProfileSetup(false)
    setProfileChecked(true)
    setLockProfileSetup(false)
    setOutfits([])
    setCurrentIndex(0)
    setActiveTab('home')
    setAuthScreen('login')
  }

  const handleProfileSetupSave = async ({ name, bio, styles, avatarFile }) => {
    if (!session?.user?.id) return

    let avatarUrl = currentUser?.avatar_url || ''
    if (avatarFile) {
      const { data } = await uploadAvatar(session.user.id, avatarFile)
      if (data?.url) avatarUrl = data.url
    }

    const { data: updated } = await updateProfile(session.user.id, {
      full_name: name,
      bio,
      vibes: styles,
      avatar_url: avatarUrl
    })

    if (updated) {
      setCurrentUser(updated)
    } else {
      setCurrentUser(prev => ({
        ...(prev || {}),
        full_name: name,
        bio,
        vibes: styles,
        avatar_url: avatarUrl
      }))
    }
    setLockProfileSetup(false)
    setNeedsProfileSetup(false)
    setSignupName('')
    setActiveTab('home')
  }

  const handleProfileEditSave = async ({ name, bio, city, age, styles, avatarFile, avatarPreview }) => {
    if (!session?.user?.id) return

    let avatarUrl = avatarPreview || currentUser?.avatar_url || DEFAULT_AVATAR
    if (avatarFile) {
      const { data } = await uploadAvatar(session.user.id, avatarFile)
      if (data?.url) avatarUrl = data.url
    }

    const { data: updated } = await updateProfile(session.user.id, {
      full_name: name,
      bio,
      city,
      age,
      vibes: styles,
      avatar_url: avatarUrl
    })

    if (updated) {
      setCurrentUser(updated)
    } else {
      setCurrentUser(prev => ({
        ...(prev || {}),
        full_name: name,
        bio,
        city,
        age,
        vibes: styles,
        avatar_url: avatarUrl
      }))
    }
  }

  const renderContent = () => {
    if (!isLoggedIn) {
      if (authScreen === 'signup') {
        return (
          <SignUp
            onBack={() => setAuthScreen('login')}
            onGoLogin={() => setAuthScreen('login')}
            onSignUp={({ session: createdSession, account }) => {
              setSession(createdSession)
              setCurrentUser(null)
              setSignupName(account?.fullName || '')
              setLockProfileSetup(true)
              setNeedsProfileSetup(true)
              setProfileChecked(true)
            }}
          />
        )
      }
      return (
        <Login
          onLogin={(s) => setSession(s)}
          onGoSignUp={() => setAuthScreen('signup')}
        />
      )
    }
    if (!profileChecked) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--secondary)' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>Preparing your profile...</p>
        </div>
      )
    }
    if (needsProfileSetup) {
      return (
        <ProfileSetup
          initialProfile={{ name: signupName || currentUser?.full_name || '', bio: currentUser?.bio || '', avatar: currentUser?.avatar_url || '', styles: currentUser?.vibes || [] }}
          onSave={handleProfileSetupSave}
        />
      )
    }
    if (viewingProfile) {
      return (
        <PublicProfile
          userId={viewingProfile.id}
          onBack={() => setViewingProfile(null)}
          onMessage={() => {
            const user = viewingProfile
            setViewingProfile(null)
            setPendingChat({
              user: user.name,
              avatar: user.avatar,
              initialMessage: 'Hey!'
            })
            setActiveTab('inbox')
          }}
        />
      )
    }
    if (activeTab === 'discover') {
      return (
        <Discover
          outfits={outfits}
          onSelectStyle={(style) => {
            setSelectedVibe(style)
            setCurrentIndex(0)
            setActiveTab('home')
          }}
        />
      )
    }
    if (activeTab === 'add') {
      return (
        <NewCombo
          currentUser={currentUser}
          session={session}
          onClose={() => setActiveTab('home')}
          onOutfitCreated={() => {
            fetchFeed()
            setCurrentIndex(0)
            setActiveTab('home')
          }}
        />
      )
    }
    if (activeTab === 'inbox') {
      if (selectedChat) {
        return <ChatDetail chat={selectedChat} onBack={() => setSelectedChat(null)} currentUser={currentUser} />
      }
      return <Inbox onChatSelect={setSelectedChat} currentUser={currentUser} />
    }
    if (activeTab === 'profile') {
      return (
        <Profile
          currentUser={currentUser}
          session={session}
          onLogout={handleLogout}
          onProfileUpdated={handleProfileEditSave}
        />
      )
    }

    if (showDailyLimit) {
      return (
        <DailyLimitDemo
          swipeCount={0}
          onBack={() => setShowDailyLimit(false)}
          onGoHome={() => {
            setShowDailyLimit(false)
            setActiveTab('home')
          }}
          onUpgrade={() => {
            alert('Premium abonelik yakinda aktif olacak! App Store entegrasyonu bekleniyor.')
            setShowDailyLimit(false)
          }}
        />
      )
    }

    if (feedLoading && outfits.length === 0) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--secondary)' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>Loading...</p>
        </div>
      )
    }

    const currentOutfit = outfits[currentIndex]
    if (!currentOutfit) {
      return (
        <NoMoreContent
          onDiscover={() => setActiveTab('discover')}
          onRefresh={() => setCurrentIndex(0)}
        />
      )
    }

    return (
      <>
        {selectedVibe && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0,
            zIndex: 50, display: 'flex', alignItems: 'center',
            justifyContent: 'center', padding: '10px 16px',
            pointerEvents: 'none'
          }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: 'rgba(224,122,95,0.92)', backdropFilter: 'blur(8px)',
              color: '#fff', borderRadius: '20px', padding: '5px 12px',
              fontSize: '13px', fontWeight: '700', pointerEvents: 'all',
              boxShadow: '0 2px 10px rgba(224,122,95,0.35)'
            }}>
              <span>{selectedVibe}</span>
              <button
                onClick={() => { setSelectedVibe(null); setCurrentIndex(0) }}
                style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '0 0 0 4px', fontSize: '16px', lineHeight: 1 }}
              >×</button>
            </div>
          </div>
        )}
        <OutfitCard
          outfit={currentOutfit}
          currentUser={currentUser}
          session={session}
          isLikedByMe={likedOutfitIds.has(currentOutfit.id)}
          onNext={handleNext}
          onSkip={handleSkip}
          onLike={handleLike}
          onItemVote={handleItemVote}
          onUserTap={() => setViewingProfile(currentOutfit.user)}
          onOpenChat={(conv) => {
            setSelectedChat(conv)
            setActiveTab('inbox')
          }}
        />
      </>
    )
  }

  return (
    <div className="app">
      {renderContent()}
      {isLoggedIn && !needsProfileSetup && activeTab !== 'add' && !viewingProfile && !selectedChat && (
        <BottomNav activeTab={activeTab} onTabChange={(tab) => {
          setActiveTab(tab)
          if (tab !== 'inbox') setSelectedChat(null)
        }} />
      )}
    </div>
  )
}

export default App

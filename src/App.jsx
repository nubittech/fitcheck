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
import { getSession, onAuthStateChange } from './lib/auth'
import { getOutfits, getProfile, getUserLikes, likeOutfit } from './lib/api'
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
    items: (raw.items || []).map((item, i) => ({
      id: i + 1,
      name: item.name || '',
      brand: item.brand || 'Unknown',
      votes: { up: 0, down: 0 },
      position: item.position || { x: '50%', y: `${35 + i * 25}%` },
      feedbackEnabled: item.feedbackEnabled
    })),
    comments: [],
    stats: {
      views: raw.views || 0,
      likes: raw.likes_count || 0,
      commentsCount: raw.comments_count || 0
    },
    isBoosted: raw.is_boosted || false
  }
}

function App() {
  const [session, setSession] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [authScreen, setAuthScreen] = useState('login')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [activeTab, setActiveTab] = useState('home')
  const [outfits, setOutfits] = useState([])
  const [likedOutfitIds, setLikedOutfitIds] = useState(new Set())
  const [selectedChat, setSelectedChat] = useState(null)
  const [viewingProfile, setViewingProfile] = useState(null)
  const [feedLoading, setFeedLoading] = useState(false)

  const isLoggedIn = !!session

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
      return
    }
    getProfile(session.user.id).then(({ data }) => {
      if (data) setCurrentUser(data)
    })
  }, [session?.user?.id])

  // Fetch feed
  const fetchFeed = useCallback(async () => {
    if (!session) return
    setFeedLoading(true)
    const [outfitRes, likesRes] = await Promise.all([
      getOutfits(),
      getUserLikes(session.user.id)
    ])
    if (outfitRes.data) {
      setOutfits(outfitRes.data.map(transformOutfit))
    }
    if (likesRes.data) {
      setLikedOutfitIds(new Set(likesRes.data.map(l => l.outfit_id)))
    }
    setFeedLoading(false)
  }, [session])

  useEffect(() => {
    if (session) fetchFeed()
  }, [session, fetchFeed])

  const handleNext = () => {
    if (currentIndex < outfits.length) {
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

  const handleLogout = () => {
    setSession(null)
    setCurrentUser(null)
    setOutfits([])
    setCurrentIndex(0)
    setActiveTab('home')
    setAuthScreen('login')
  }

  const renderContent = () => {
    if (!isLoggedIn) {
      if (authScreen === 'signup') {
        return (
          <SignUp
            onBack={() => setAuthScreen('login')}
            onGoLogin={() => setAuthScreen('login')}
            onSignUp={(s) => setSession(s)}
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
    if (viewingProfile) {
      return (
        <PublicProfile
          userId={viewingProfile.id}
          onBack={() => setViewingProfile(null)}
          onMessage={() => {
            setViewingProfile(null)
            setActiveTab('inbox')
          }}
        />
      )
    }
    if (activeTab === 'discover') {
      return <Discover outfits={outfits} />
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
        return <ChatDetail chat={selectedChat} onBack={() => setSelectedChat(null)} />
      }
      return <Inbox onChatSelect={setSelectedChat} />
    }
    if (activeTab === 'profile') {
      return (
        <Profile
          currentUser={currentUser}
          session={session}
          onLogout={handleLogout}
          onProfileUpdated={(updated) => setCurrentUser(updated)}
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
      />
    )
  }

  return (
    <div className="app">
      {renderContent()}
      {isLoggedIn && activeTab !== 'add' && !viewingProfile && (
        <BottomNav activeTab={activeTab} onTabChange={(tab) => {
          setActiveTab(tab)
          if (tab !== 'inbox') setSelectedChat(null)
        }} />
      )}
    </div>
  )
}

export default App

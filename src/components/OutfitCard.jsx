import React, { useState, useRef, useEffect } from 'react'
import ActionButtons from './ActionButtons'
import ItemDots from './ItemDots'
import MediaCarousel from './MediaCarousel'
import { voteOutfit, getOutfitVotes, voteItem, getItemVotes, findOrCreateConversation, sendMessage, getComments, addComment } from '../lib/api'
import { reportPost } from '../lib/adminApi'
import { Share } from '@capacitor/share'
import { Preferences } from '@capacitor/preferences'
import { useLang } from '../i18n/LangContext'
import '../styles/OutfitCard.css'

const OutfitCard = ({ outfit, nextOutfit, isFirstCard, onNext, onSkip, onLike, onItemVote, onUserTap, currentUser, onOpenChat }) => {
  const { t } = useLang()
  // 3-state panel: 'collapsed' | 'mid' | 'full'
  const [panelState, setPanelState] = useState('collapsed')
  const [swipeDir, setSwipeDir] = useState(null)
  const [offsetX, setOffsetX] = useState(0)
  const [dragY, setDragY] = useState(0)
  const startX = useRef(0)
  const startY = useRef(0)
  const isDragging = useRef(false)
  const swipeAxis = useRef(null)
  const panelRef = useRef(null)
  const [inputValue, setInputValue] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [showOptionsArgs, setShowOptionsArgs] = useState(false)

  // ── Walkthrough State ──
  const [walkthroughStep, setWalkthroughStep] = useState(0) // 0: hidden, 1: swipe/tap, 2: bottom sheet

  useEffect(() => {
    const checkWalkthrough = async () => {
      if (!isFirstCard) return
      const { value } = await Preferences.get({ key: 'hasSeenWalkthrough' })
      if (!value) setWalkthroughStep(1)
    }
    checkWalkthrough()
  }, [isFirstCard])

  const nextWalkthroughStep = () => {
    setWalkthroughStep(2)
  }

  const dismissWalkthrough = async () => {
    setWalkthroughStep(0)
    await Preferences.set({ key: 'hasSeenWalkthrough', value: 'true' })
  }

  // ── Share Logic ──
  const handleShare = async () => {
    try {
      await Share.share({
        title: 'Veylo Outfit',
        text: `Check out this outfit by ${outfit.user.name} on Veylo!`,
        url: `https://veyloapp.com/outfit/${outfit.id}`,
        dialogTitle: 'Share with friends',
      })
    } catch (err) {
      console.error('Error sharing outfit:', err)
    }
  }

  // ── Quick Ask (Nerden Aldın) ──
  const [showQuickAsk, setShowQuickAsk] = useState(false)
  const [quickAskOther, setQuickAskOther] = useState(false)
  const [quickAskInput, setQuickAskInput] = useState('')
  const [quickAskSending, setQuickAskSending] = useState(false)
  const [quickAskSent, setQuickAskSent] = useState(null) // item name or true
  const [currentSlide, setCurrentSlide] = useState(0) // tracks active carousel photo

  // ── Outfit-level vote state ──
  const [outfitVotes, setOutfitVotes] = useState({ likes: 0, dislikes: 0, likePct: null, myVote: null, total: 0 })
  const [votingOutfit, setVotingOutfit] = useState(false)

  // ── Item vote state: { [itemIndex]: { up, down, pct, myVote, total } } ──
  const [itemVotes, setItemVotes] = useState({})
  const [votingItem, setVotingItem] = useState({})

  // ── Comments state ──
  const [comments, setComments] = useState([])

  // Load votes when card mounts
  useEffect(() => {
    if (!outfit?.id || !currentUser?.id) return
    getOutfitVotes({ outfitId: outfit.id, userId: currentUser.id }).then(setOutfitVotes)
    getItemVotes({ outfitId: outfit.id, userId: currentUser.id }).then(setItemVotes)
    getComments(outfit.id).then(({ data }) => {
      if (data) setComments(data)
    })
  }, [outfit?.id, currentUser?.id])

  // ── Outfit vote handler ──
  const handleOutfitVote = async (vote) => {
    if (!currentUser?.id || votingOutfit) return
    setVotingOutfit(true)

    // Optimistic update — three cases:
    // 1. Toggle off (same vote clicked again) → remove vote
    // 2. Switch vote (dislike→like or like→dislike) → swap counts
    // 3. Fresh vote (no previous vote) → add 1 to chosen side
    const prev = { ...outfitVotes }
    const isToggle = prev.myVote === vote          // same button tapped again
    const wasOther = !!prev.myVote && !isToggle   // had a different vote before

    const newVote = isToggle ? null : vote

    let newLikes = prev.likes
    let newDislikes = prev.dislikes

    if (vote === 'like') {
      if (isToggle) newLikes--              // un-like
      else {
        newLikes++              // like (fresh or switched)
        if (wasOther) newDislikes--           // remove old dislike
      }
    } else {
      if (isToggle) newDislikes--           // un-dislike
      else {
        newDislikes++           // dislike (fresh or switched)
        if (wasOther) newLikes--              // remove old like
      }
    }

    const total = newLikes + newDislikes
    const likePct = total > 0 ? Math.round((newLikes / total) * 100) : null
    setOutfitVotes({ likes: newLikes, dislikes: newDislikes, likePct, myVote: newVote, total })

    try {
      await voteOutfit({ outfitId: outfit.id, userId: currentUser.id, vote })
    } catch {
      setOutfitVotes(prev) // rollback on network error
    }
    setVotingOutfit(false)
  }

  // ── Item vote handler ──
  const handleItemVote = async (itemIndex, vote) => {
    if (!currentUser?.id || votingItem[itemIndex]) return
    setVotingItem(prev => ({ ...prev, [itemIndex]: true }))

    const prevItem = itemVotes[itemIndex] || { up: 0, down: 0, pct: null, myVote: null, total: 0 }
    const isToggle = prevItem.myVote === vote
    const wasOther = prevItem.myVote && prevItem.myVote !== vote
    const newVote = isToggle ? null : vote
    const newUp = vote === 'up'
      ? prevItem.up + (isToggle ? -1 : (wasOther ? 0 : 1))
      : prevItem.up + (wasOther && prevItem.myVote === 'up' ? -1 : 0)
    const newDown = vote === 'down'
      ? prevItem.down + (isToggle ? -1 : (wasOther ? 0 : 1))
      : prevItem.down + (wasOther && prevItem.myVote === 'down' ? -1 : 0)
    const total = newUp + newDown
    const pct = total > 0 ? Math.round((newUp / total) * 100) : null
    setItemVotes(prev => ({ ...prev, [itemIndex]: { up: newUp, down: newDown, pct, myVote: newVote, total } }))

    try {
      await voteItem({ outfitId: outfit.id, itemIndex, userId: currentUser.id, vote })
    } catch {
      setItemVotes(prev => ({ ...prev, [itemIndex]: prevItem }))
    }
    setVotingItem(prev => ({ ...prev, [itemIndex]: false }))
  }

  // ── Comment submit ──
  const handleSubmitComment = async () => {
    const text = inputValue.trim()
    if (!text || !currentUser?.id || submittingComment) return
    setSubmittingComment(true)
    setInputValue('')
    const { data } = await addComment({ outfitId: outfit.id, userId: currentUser.id, text })
    if (data) setComments(prev => [...prev, data])
    setSubmittingComment(false)
  }

  // ── Report / Block ──
  const handleReport = async () => {
    setShowOptionsArgs(false)
    if (currentUser?.id && outfit?.id) {
      await reportPost({ outfitId: outfit.id, reporterId: currentUser.id, reason: 'User reported from feed' })
    }
    alert(t('report_submitted') || 'Gönderi moderatörlere bildirildi.')
    if (onSkip) onSkip()
  }

  const handleBlock = async () => {
    setShowOptionsArgs(false)
    alert(t('user_blocked') || 'Kullanıcı engellendi.')
    if (onSkip) onSkip()
  }

  // ── Message button ──
  const handleMessage = async () => {
    if (!currentUser?.id || !outfit?.user?.id) return
    if (currentUser.id === outfit.user.id) return
    const { data: conv } = await findOrCreateConversation(currentUser.id, outfit.user.id)
    if (conv && onOpenChat) {
      onOpenChat({
        id: conv.id,
        participant_1: currentUser.id < outfit.user.id ? currentUser.id : outfit.user.id,
        participant_2: currentUser.id < outfit.user.id ? outfit.user.id : currentUser.id,
        partner: {
          id: outfit.user.id,
          full_name: outfit.user.name,
          username: outfit.user.name,
          avatar_url: outfit.user.avatar
        }
      })
    }
  }

  // ── Quick Ask: send auto-message about an item ──
  const handleQuickAsk = async (itemName) => {
    if (quickAskSending) return
    if (!currentUser?.id || !outfit?.user?.id) {
      alert('Kullanıcı bilgisi eksik.')
      return
    }
    if (currentUser.id === outfit.user.id) {
      alert('Kendi kombininiz için kendinize mesaj atamazsınız.')
      return
    }
    setQuickAskSending(true)
    const msg = t('quick_ask_msg').replace('{item}', itemName)
    const { data: conv, error: convError } = await findOrCreateConversation(currentUser.id, outfit.user.id)
    if (convError) console.error('Conv Error:', convError)

    if (conv) {
      const { error: msgErr } = await sendMessage({ conversationId: conv.id, senderId: currentUser.id, text: msg })
      if (msgErr) console.error('Msg Error:', msgErr)

      if (!msgErr) {
        setQuickAskSent(itemName)
        setTimeout(() => {
          setQuickAskSent(null)
          setShowQuickAsk(false)
          setQuickAskOther(false)
          setQuickAskInput('')
        }, 1200)
      } else {
        alert('Mesaj gönderilemedi: ' + msgErr.message)
      }
    } else {
      alert('Sohbet oluşturulamadı.')
    }
    setQuickAskSending(false)
  }

  const handleQuickAskCustom = async () => {
    const text = quickAskInput.trim()
    if (!text || quickAskSending) return
    if (!currentUser?.id || !outfit?.user?.id) {
      alert('Kullanıcı bilgisi eksik.')
      return
    }
    if (currentUser.id === outfit.user.id) {
      alert('Kendi kombininiz için kendinize mesaj atamazsınız.')
      return
    }
    setQuickAskSending(true)
    const { data: conv, error: convError } = await findOrCreateConversation(currentUser.id, outfit.user.id)
    if (convError) console.error('Conv Error:', convError)

    if (conv) {
      const { error: msgErr } = await sendMessage({ conversationId: conv.id, senderId: currentUser.id, text })
      if (msgErr) console.error('Msg Error:', msgErr)

      if (!msgErr) {
        setQuickAskSent(true)
        setTimeout(() => {
          setQuickAskSent(null)
          setShowQuickAsk(false)
          setQuickAskOther(false)
          setQuickAskInput('')
        }, 1200)
      } else {
        alert('Mesaj gönderilemedi: ' + msgErr.message)
      }
    } else {
      alert('Sohbet oluşturulamadı.')
    }
    setQuickAskSending(false)
  }

  // Card swipe only works when panel is collapsed
  const handleCardTouchStart = (e) => {
    if (panelState !== 'collapsed') return
    startX.current = e.touches[0].clientX
    startY.current = e.touches[0].clientY
    isDragging.current = true
    swipeAxis.current = null
    setSwipeDir(null)
  }

  const handleCardTouchMove = (e) => {
    if (!isDragging.current || panelState !== 'collapsed') return
    const diffX = e.touches[0].clientX - startX.current
    const diffY = e.touches[0].clientY - startY.current

    if (!swipeAxis.current && (Math.abs(diffX) > 10 || Math.abs(diffY) > 10)) {
      swipeAxis.current = Math.abs(diffX) > Math.abs(diffY) ? 'x' : 'y'
    }

    if (swipeAxis.current === 'x') {
      setOffsetX(diffX)
    }
  }

  const handleCardTouchEnd = (e) => {
    if (!isDragging.current || panelState !== 'collapsed') return
    isDragging.current = false

    if (swipeAxis.current === 'x' && Math.abs(offsetX) > 100) {
      if (offsetX > 0) {
        setSwipeDir('right')
        setOffsetX(window.innerWidth) // Throw animation to right

        // Wait for animation to finish, then tell parent to load next.
        // DO NOT reset offsetX to 0 here because it makes the card snap back 
        // for a split second before React unmounts it.
        setTimeout(() => { onNext() }, 250)
      } else {
        setSwipeDir('left')
        setOffsetX(-window.innerWidth) // Throw animation to left
        setTimeout(() => { onSkip() }, 250)
      }
    } else {
      // Snap back if swipe was cancelled
      setOffsetX(0)
    }

    swipeAxis.current = null
  }

  // Auto-dismiss step 1 if they actually swipe left/right
  useEffect(() => {
    if ((swipeDir === 'left' || swipeDir === 'right') && walkthroughStep === 1) {
      nextWalkthroughStep()
    }
  }, [swipeDir, walkthroughStep])

  const handlePanelTouchStart = (e) => {
    e.stopPropagation()
    startY.current = e.touches[0].clientY
    isDragging.current = true
    setDragY(0)
  }

  const handlePanelTouchMove = (e) => {
    e.stopPropagation()
    if (!isDragging.current) return
    const diffY = e.touches[0].clientY - startY.current
    // allow drag in valid direction only
    if (panelState === 'full' && diffY > 0) setDragY(diffY)
    else if (panelState !== 'full' && diffY < 0) setDragY(diffY)
  }

  const handlePanelTouchEnd = (e) => {
    e.stopPropagation()
    isDragging.current = false
    const threshold = 50

    if (dragY < -threshold) {
      // Swipe up → advance state
      if (panelState === 'collapsed') setPanelState('mid')
      else if (panelState === 'mid') setPanelState('full')

      // Dismiss walkthrough step 2 if they actually swiped up the panel
      if (walkthroughStep === 2) {
        dismissWalkthrough()
      }
    } else if (dragY > threshold) {
      // Swipe down → go back
      if (panelState === 'full') setPanelState('mid')
      else if (panelState === 'mid') setPanelState('collapsed')
    }

    setDragY(0)
  }

  const { likePct, total: voteTotal } = outfitVotes
  const nextPrimaryMedia = nextOutfit?.media?.[0]
  const nextPrimarySrc = nextPrimaryMedia?.thumbnail || nextPrimaryMedia?.url || null

  return (
    <div className="outfit-card-wrapper">
      {nextOutfit && nextPrimarySrc && (
        <div className="outfit-card next-card-underlay" aria-hidden="true">
          {nextPrimaryMedia?.type === 'video' ? (
            <video
              className="next-card-media"
              src={nextPrimaryMedia.url}
              poster={nextPrimaryMedia.thumbnail || nextPrimaryMedia.url}
              muted
              loop
              playsInline
              autoPlay
            />
          ) : (
            <img className="next-card-media" src={nextPrimarySrc} alt="" />
          )}

          <div className="card-gradient" />

          <div className="card-user-bar">
            <div className="user-info">
              <img className="user-avatar" src={nextOutfit.user?.avatar} alt={nextOutfit.user?.name || 'user'} />
              <div>
                <div className="user-name">{nextOutfit.user?.name}, {nextOutfit.user?.age}</div>
                <div className="user-location">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z" /></svg>
                  {nextOutfit.user?.location}
                </div>
              </div>
            </div>
            <button className="share-btn" tabIndex={-1}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
            </button>
          </div>

          <div className="card-caption-bar">
            <p className="card-caption">{nextOutfit.caption}</p>
          </div>

          <div className="slide-panel next-card-panel">
            <div className="panel-handle" />
            <ActionButtons myVote={null} />
            <div className="panel-hint">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="18 15 12 9 6 15" />
              </svg>
              <span>{t('swipe_up')}</span>
            </div>
          </div>
        </div>
      )}

      {walkthroughStep > 0 && (
        <div className="walkthrough-overlay">
          {walkthroughStep === 1 && (
            <>
              {/* Swipe Zone */}
              <div className="walkthrough-swipe-zone">
                <svg className="linear-hand-swipe" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 11V6a2 2 0 0 0-4 0v4M14 11V4a2 2 0 0 0-4 0v6M10 11V5a2 2 0 0 0-4 0v8.6M6 14v-2c0-1.1-.9-2-2-2S2 10.9 2 12v4.8c0 3.3 2.7 6 6 6h4.5c2.6 0 4.8-1.8 5.4-4.3l1-4.7c.3-1.6-.9-3.1-2.5-3.1H14M14 11h4" />
                </svg>
                <div className="walkthrough-text-center" dangerouslySetInnerHTML={{ __html: t('walk_swipe') }} />
              </div>

              {/* Tap Zone */}
              <div className="walkthrough-tap-zone">
                <svg className="linear-hand-tap" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.5 10c-.83 0-1.5-.67-1.5-1.5v-5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v4" />
                  <path d="M10 10.5V11" />
                  <path d="M9 10v-1c0-.83-.67-1.5-1.5-1.5S6 8.17 6 9v3" />
                  <path d="M5.5 12c0-.55-.45-1-1-1S3.5 11.45 3.5 12v4c0 3.32 3 6 6 6s6-1.59 7-4c1.4-2.5-1.07-5.59-3.5-5.59" />
                  <path d="M18 19c-1-1-2-1-4-2" />
                </svg>
                <div className="walkthrough-text-small" dangerouslySetInnerHTML={{ __html: t('walk_tap') }} />
              </div>

              <button className="walkthrough-btn" onClick={nextWalkthroughStep}>{t('walk_got_it')}</button>
            </>
          )}

          {walkthroughStep === 2 && (
            <>
              {/* Bottom Sheet Swipe Up Zone */}
              <div className="walkthrough-bottom-zone">
                <svg className="linear-hand-up" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 11V6a2 2 0 0 0-4 0v4M14 11V4a2 2 0 0 0-4 0v6M10 11V5a2 2 0 0 0-4 0v8.6M6 14v-2c0-1.1-.9-2-2-2S2 10.9 2 12v4.8c0 3.3 2.7 6 6 6h4.5c2.6 0 4.8-1.8 5.4-4.3l1-4.7c.3-1.6-.9-3.1-2.5-3.1H14M14 11h4" />
                </svg>
                <div className="walkthrough-text-center" dangerouslySetInnerHTML={{ __html: t('walk_up') }} />
              </div>

              <button className="walkthrough-btn" onClick={dismissWalkthrough}>{t('walk_start')}</button>
            </>
          )}
        </div>
      )}

      <div
        className={`outfit-card ${swipeDir ? `swipe-${swipeDir}` : ''} ${offsetX !== 0 && !swipeDir ? 'is-dragging' : ''}`}
        style={{ transform: offsetX ? `translateX(${offsetX}px) rotate(${offsetX * 0.04}deg)` : undefined }}
        onTouchStart={handleCardTouchStart}
        onTouchMove={handleCardTouchMove}
        onTouchEnd={handleCardTouchEnd}
      >
        {/* Media carousel */}
        <MediaCarousel media={outfit.media} onIndexChange={setCurrentSlide} />
        <div className="card-gradient" />

        {/* Approval pill — top right, non-obtrusive */}
        {likePct !== null && voteTotal >= 1 && (
          <div className="approval-pill">
            <span>{likePct}%</span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
          </div>
        )}


        {/* Item dots — only shown on the photo they were tagged on */}
        <ItemDots items={outfit.items} currentSlide={currentSlide} />

        {/* User info */}
        <div className="card-user-bar">
          <div className="user-info" onClick={onUserTap} style={{ cursor: 'pointer' }}>
            <img className="user-avatar" src={outfit.user.avatar} alt={outfit.user.name} />
            <div>
              <div className="user-name">{outfit.user.name}, {outfit.user.age}</div>
              <div className="user-location">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z" /></svg>
                {outfit.user.location}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button className="share-btn" onClick={handleShare}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
            </button>
            <button className="share-btn" onClick={() => setShowOptionsArgs(true)} style={{ opacity: 0.8 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Caption */}
        <div className="card-caption-bar">
          <p className="card-caption">{outfit.caption}</p>
        </div>

        {/* Expandable panel */}
        <div
          ref={panelRef}
          className={`slide-panel ${panelState}`}
          style={dragY ? {
            transform: panelState === 'full'
              ? `translateY(${dragY}px)`
              : panelState === 'mid'
                ? `translateY(calc(100% - 55vh + ${dragY}px))`
                : `translateY(calc(100% - 86px - 74px - env(safe-area-inset-bottom, 0px) + ${dragY}px))`
          } : undefined}
          onTouchStart={handlePanelTouchStart}
          onTouchMove={handlePanelTouchMove}
          onTouchEnd={handlePanelTouchEnd}
        >
          <div className="panel-handle" />

          {/* Action buttons */}
          <ActionButtons
            myVote={outfitVotes.myVote}
            onDislike={() => handleOutfitVote('dislike')}
            onMessage={handleMessage}
            onLike={() => handleOutfitVote('like')}
            onComment={() => setPanelState(panelState === 'collapsed' ? 'mid' : panelState === 'mid' ? 'full' : 'mid')}
          />

          <div className="panel-hint" onClick={() => {
            setPanelState(prev => prev === 'collapsed' ? 'mid' : 'collapsed')
          }}>
            <svg
              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              style={{ transform: panelState !== 'collapsed' ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s' }}
            >
              <polyline points="18 15 12 9 6 15" />
            </svg>
            <span>{panelState !== 'collapsed' ? t('close') : t('swipe_up')}</span>
          </div>

          {/* Expandable content */}
          <div className="panel-detail-content">
            {/* Item votes */}
            <div className="panel-section">
              <h4 className="panel-section-title">{t('rate_each_item')}</h4>
              <div className="item-vote-list">
                {outfit.items.map((item, index) => {
                  const iv = itemVotes[index] || { up: 0, down: 0, pct: null, myVote: null, total: 0 }
                  return (
                    <div key={item.id} className="item-vote-row">
                      <div className="item-vote-meta">
                        <span className="item-vote-name">{item.name}</span>
                        {item.link && (
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="item-shop-btn"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M18 6h-2c0-2.21-1.79-4-4-4S8 3.79 8 6H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6-2c1.1 0 2 .9 2 2h-4c0-1.1.9-2 2-2zm6 16H6V8h2v2c0 .55.45 1 1 1s1-.45 1-1V8h4v2c0 .55.45 1 1 1s1-.45 1-1V8h2v12z" />
                            </svg>
                            {t('shop')}
                          </a>
                        )}
                      </div>
                      <div className="item-vote-actions">
                        <button
                          className={`vote-btn vote-down ${iv.myVote === 'down' ? 'voted' : ''}`}
                          onClick={() => handleItemVote(index, 'down')}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                        <div className="vote-stat">
                          <span className="vote-pct">{iv.pct !== null ? `${iv.pct}%` : '—'}</span>
                          {iv.total > 0 && <span className="vote-count">{iv.total} vote{iv.total !== 1 ? 's' : ''}</span>}
                        </div>
                        <button
                          className={`vote-btn vote-up ${iv.myVote === 'up' ? 'voted' : ''}`}
                          onClick={() => handleItemVote(index, 'up')}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Nerden aldin */}
            <div className="panel-section">
              <button className="nerden-btn" onClick={() => setShowQuickAsk(true)}>
                {t('where_bought')}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 6h-2c0-2.21-1.79-4-4-4S8 3.79 8 6H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6-2c1.1 0 2 .9 2 2h-4c0-1.1.9-2 2-2zm6 16H6V8h2v2c0 .55.45 1 1 1s1-.45 1-1V8h4v2c0 .55.45 1 1 1s1-.45 1-1V8h2v12z" /></svg>
              </button>
            </div>



            {/* Comments */}
            <div className="panel-section">
              <div className="panel-section-header">
                <h4 className="panel-section-title">{t('comments')}</h4>
                <span className="panel-count">{comments.length}</span>
              </div>
              <div className="panel-comments">
                {comments.length === 0 ? (
                  <div className="no-comments">
                    <p>{t('no_comments')}</p>
                    <span>{t('no_comments_sub')}</span>
                  </div>
                ) : (
                  comments.map(comment => {
                    const profile = comment.profiles || {}
                    return (
                      <div key={comment.id} className="comment-item">
                        {profile.avatar_url ? (
                          <img className="comment-avatar" src={profile.avatar_url} alt={profile.full_name} />
                        ) : (
                          <div className="comment-avatar-placeholder">
                            {(profile.full_name || '?').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="comment-body">
                          <div className="comment-header-row">
                            <span className="comment-user">{profile.full_name || profile.username || 'User'}</span>
                            <span className="comment-time">{new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="comment-text">{comment.text}</p>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            {/* Comment input */}
            <div className="panel-input">
              <input
                type="text"
                placeholder={t('add_comment')}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSubmitComment() }}
              />
              <button
                className={`send-btn ${inputValue.trim() ? 'active' : ''}`}
                disabled={!inputValue.trim() || submittingComment}
                onClick={handleSubmitComment}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Ask Sheet (Moved to root level to avoid CSS transform bugs) */}
      {showQuickAsk && (
        <div className="quick-ask-overlay" onClick={() => { setShowQuickAsk(false); setQuickAskOther(false); setQuickAskInput('') }}>
          <div className="quick-ask-sheet" onClick={(e) => e.stopPropagation()}>
            {quickAskSent ? (
              <div className="quick-ask-success">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--success, #22c55e)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <span>{t('quick_ask_sent')}</span>
              </div>
            ) : (
              <>
                <div className="quick-ask-header">
                  <h4>{t('quick_ask_title')}</h4>
                  <p>{t('quick_ask_sub')}</p>
                </div>

                <div className="quick-ask-items">
                  {outfit.items.map((item, i) => (
                    <button
                      key={i}
                      className="quick-ask-item"
                      onClick={(e) => { e.stopPropagation(); handleQuickAsk(item.name) }}
                      onTouchEnd={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleQuickAsk(item.name)
                      }}
                      disabled={quickAskSending}
                    >
                      <div className="quick-ask-item-info">
                        <span className="quick-ask-item-name">{item.name}</span>
                        {item.brand && item.brand !== 'Unknown' && (
                          <span className="quick-ask-item-brand">{item.brand}</span>
                        )}
                      </div>
                      {quickAskSending ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="22" y1="2" x2="11" y2="13" />
                          <polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>

                <div className="quick-ask-divider" />

                <div className="quick-ask-custom">
                  <input
                    type="text"
                    placeholder={t('quick_ask_other_placeholder')}
                    value={quickAskInput}
                    onChange={(e) => setQuickAskInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleQuickAskCustom() }}
                  />
                  <button
                    className={`quick-ask-send ${quickAskInput.trim() ? 'active' : ''}`}
                    onClick={(e) => { e.stopPropagation(); handleQuickAskCustom() }}
                    onTouchEnd={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleQuickAskCustom()
                    }}
                    disabled={!quickAskInput.trim() || quickAskSending}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {/* Options Modal (Report / Block) */}
      {showOptionsArgs && (
        <div className="quick-ask-overlay" onClick={() => setShowOptionsArgs(false)}>
          <div className="quick-ask-sheet" onClick={e => e.stopPropagation()} style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 20px) + 20px)' }}>
            <div className="quick-ask-header">
              <h4>{t('options') || 'Options'}</h4>
            </div>
            <div className="quick-ask-items">
              <button className="quick-ask-item" onClick={handleReport} style={{ color: '#ef4444' }}>
                <div className="quick-ask-item-info">
                  <span style={{ fontWeight: 600 }}>{t('report_post') || 'Report Post'}</span>
                </div>
              </button>
              <button className="quick-ask-item" onClick={handleBlock} style={{ color: '#ef4444' }}>
                <div className="quick-ask-item-info">
                  <span style={{ fontWeight: 600 }}>{t('block_user') || 'Block User'}</span>
                </div>
              </button>
              <button className="quick-ask-item" onClick={() => setShowOptionsArgs(false)}>
                <div className="quick-ask-item-info">
                  <span style={{ fontWeight: 500 }}>{t('cancel') || 'Cancel'}</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OutfitCard

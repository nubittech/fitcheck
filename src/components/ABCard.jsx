import React, { useState, useRef, useEffect } from 'react'
import { getAbVoteStats, voteAbTest, findOrCreateConversation, getComments, addComment } from '../lib/api'
import { reportPost } from '../lib/adminApi'
import { supabase } from '../lib/supabase'
import { Share } from '@capacitor/share'
import { useLang } from '../i18n/LangContext'
import '../styles/OutfitCard.css'
import '../styles/ABCard.css'

const ABCard = ({ outfit, isPreview, isFirstCard, onNext, onSkip, onUserTap, currentUser, onOpenChat }) => {
    const { t } = useLang()
    const [panelState, setPanelState] = useState('collapsed')
    const [swipeDir, setSwipeDir] = useState(null)
    const [offsetX, setOffsetX] = useState(0)
    const [dragY, setDragY] = useState(0)
    const startX = useRef(0)
    const startY = useRef(0)
    const isDragging = useRef(false)
    const swipeAxis = useRef(null)
    const panelRef = useRef(null)

    // A/B states
    const [myVote, setMyVote] = useState(null)
    const [abStats, setAbStats] = useState({ count_a: 0, count_b: 0, percentage_a: 0, percentage_b: 0, total: 0 })
    const [isVoting, setIsVoting] = useState(false)

    // Comments
    const [comments, setComments] = useState([])
    const [inputValue, setInputValue] = useState('')
    const [submittingComment, setSubmittingComment] = useState(false)

    // Report / Block state
    const [showOptionsArgs, setShowOptionsArgs] = useState(false)

    // Load votes & comments
    useEffect(() => {
        if (!outfit?.id || !currentUser?.id) return

        supabase
            .from('ab_votes')
            .select('vote_choice')
            .eq('outfit_id', outfit.id)
            .eq('user_id', currentUser.id)
            .maybeSingle()
            .then(({ data }) => {
                if (data) setMyVote(data.vote_choice)
            })
            .catch(() => { })

        getAbVoteStats(outfit.id)
            .then(({ data }) => { if (data) setAbStats(data) })
            .catch(() => { })

        getComments(outfit.id)
            .then(({ data }) => { if (data) setComments(data) })
            .catch(() => { })
    }, [outfit?.id, currentUser?.id])

    const handleVote = async (choice) => {
        if (!currentUser?.id || isVoting || myVote === choice) return
        setIsVoting(true)

        const prevVote = myVote
        setMyVote(choice)

        // Optimistic update
        setAbStats(prev => {
            let newA = prev.count_a
            let newB = prev.count_b

            // Remove previous vote if switching sides
            if (prevVote === 'A') newA = Math.max(0, newA - 1)
            if (prevVote === 'B') newB = Math.max(0, newB - 1)

            // Add new vote
            if (choice === 'A') newA++
            if (choice === 'B') newB++

            const newTotal = newA + newB

            return {
                count_a: newA,
                count_b: newB,
                total: newTotal,
                percentage_a: newTotal > 0 ? Math.round((newA / newTotal) * 100) : 0,
                percentage_b: newTotal > 0 ? Math.round((newB / newTotal) * 100) : 0
            }
        })

        try {
            const { error } = await voteAbTest({ outfitId: outfit.id, userId: currentUser.id, voteChoice: choice })
            if (!error) {
                const { data } = await getAbVoteStats(outfit.id)
                if (data && data.total > 0) setAbStats(data)
            }
        } catch {
            setMyVote(prevVote)
        }
        setIsVoting(false)
    }

    const handleShare = async () => {
        try {
            await Share.share({
                title: 'Veylo Outfit',
                text: `Check out this A/B testing post by ${outfit.user.name} on Veylo!`,
                url: `https://veyloapp.com/outfit/${outfit.id}`,
                dialogTitle: 'Share with friends',
            })
        } catch (err) { }
    }

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

    const handleSubmitComment = async () => {
        const text = inputValue.trim()
        if (!text || !currentUser?.id || submittingComment) return
        setSubmittingComment(true)
        setInputValue('')
        const { data } = await addComment({ outfitId: outfit.id, userId: currentUser.id, text })
        if (data) setComments(prev => [...prev, data])
        setSubmittingComment(false)
    }

    // Report / Block actions
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

    // Card swipe handlers
    const handleCardTouchStart = (e) => {
        if (isPreview) return
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

    const handleCardTouchEnd = () => {
        if (!isDragging.current || panelState !== 'collapsed') return
        isDragging.current = false

        if (swipeAxis.current === 'x' && Math.abs(offsetX) > 100) {
            if (offsetX > 0) {
                setSwipeDir('right')
                setOffsetX(window.innerWidth)
                setTimeout(() => { onSkip?.() }, 350)
            } else {
                setSwipeDir('left')
                setOffsetX(-window.innerWidth)
                setTimeout(() => { onSkip?.() }, 350)
            }
        } else {
            setOffsetX(0)
        }
        swipeAxis.current = null
    }

    // Panel drag handlers
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
        if (panelState === 'full' && diffY > 0) setDragY(diffY)
        else if (panelState === 'mid' && (diffY < 0 || diffY > 0)) setDragY(diffY)
        else if (panelState === 'collapsed' && diffY < 0) setDragY(diffY)
    }

    const handlePanelTouchEnd = (e) => {
        e.stopPropagation()
        isDragging.current = false
        const threshold = 50

        if (dragY < -threshold) {
            if (panelState === 'collapsed') setPanelState('mid')
            else if (panelState === 'mid') setPanelState('full')
        } else if (dragY > threshold) {
            if (panelState === 'full') setPanelState('mid')
            else if (panelState === 'mid') setPanelState('collapsed')
        }

        setDragY(0)
    }

    const imageA = outfit.media[0]?.url
    const imageB = outfit.imageUrlB || outfit.media[1]?.url
    const isWinnerA = abStats.percentage_a >= abStats.percentage_b && abStats.total > 0
    const isWinnerB = abStats.percentage_b > abStats.percentage_a && abStats.total > 0

    return (
        <div className={`outfit-card-shell${isPreview ? ' is-preview' : ''}`}>
            <div
                className={`outfit-card ${swipeDir ? `swipe-${swipeDir}` : ''} ${offsetX !== 0 && !swipeDir ? 'is-dragging' : ''}`}
                style={{ transform: offsetX ? `translateX(${offsetX}px) rotate(${offsetX * 0.04}deg)` : undefined }}
                onTouchStart={handleCardTouchStart}
                onTouchMove={handleCardTouchMove}
                onTouchEnd={handleCardTouchEnd}
            >
                {/* A/B Split Images */}
                <div className="ab-split-container">
                    {/* LEFT IMAGE */}
                    <div
                        className={`ab-side ${myVote === 'A' ? 'selected' : ''}`}
                        onClick={() => handleVote('A')}
                    >
                        <div className="ab-side-label left">{t('ab_left')}</div>
                        {imageA ? (
                            <div className="ab-media-wrapper">
                                <div className="ab-media-blur" style={{ backgroundImage: `url(${imageA})` }}></div>
                                {outfit.media[0]?.type === 'video' ? (
                                    <video src={imageA} autoPlay loop muted playsInline />
                                ) : (
                                    <img src={imageA} alt="A" />
                                )}
                            </div>
                        ) : null}
                        {myVote && (
                            <div className={`ab-pct-badge left ${isWinnerA ? 'winner' : ''}`}>
                                <span className="ab-pct-num">{abStats.percentage_a}%</span>
                                <span className="ab-pct-votes">{abStats.count_a} {t('ab_votes')}</span>
                            </div>
                        )}
                    </div>

                    <div className="ab-divider-line">
                        <div className="ab-vs-circle">
                            <span className="ab-vs-text">VS</span>
                        </div>
                    </div>

                    {/* RIGHT IMAGE */}
                    <div
                        className={`ab-side ${myVote === 'B' ? 'selected' : ''}`}
                        onClick={() => handleVote('B')}
                    >
                        <div className="ab-side-label right">{t('ab_right')}</div>
                        {imageB ? (
                            <div className="ab-media-wrapper">
                                <div className="ab-media-blur" style={{ backgroundImage: `url(${imageB})` }}></div>
                                {outfit.media[1]?.type === 'video' ? (
                                    <video src={imageB} autoPlay loop muted playsInline />
                                ) : (
                                    <img src={imageB} alt="B" />
                                )}
                            </div>
                        ) : null}
                        {myVote && (
                            <div className={`ab-pct-badge right ${isWinnerB ? 'winner' : ''}`}>
                                <span className="ab-pct-num">{abStats.percentage_b}%</span>
                                <span className="ab-pct-votes">{abStats.count_b} {t('ab_votes')}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="card-gradient" />

                {/* Tap hint when no vote yet */}
                {!myVote && (
                    <div className="ab-tap-hint">
                        <span>{t('ab_tap_hint')}</span>
                    </div>
                )}

                {/* User info */}
                <div className="card-user-bar">
                    <div className="user-info" onClick={onUserTap} style={{ cursor: 'pointer' }}>
                        <img className="user-avatar" src={outfit.user.avatar} alt={outfit.user.name} />
                        <div>
                            <div className="user-name">{outfit.user.name}, {outfit.user.age}</div>
                            {outfit.user.location && (
                                <div className="user-location">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z" /></svg>
                                    {outfit.user.location}
                                </div>
                            )}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
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
                {outfit.caption && (
                    <div className="card-caption-bar">
                        <p className="card-caption">{outfit.caption}</p>
                    </div>
                )}

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

                    {/* Vote buttons: Sol / Mesaj / Sag */}
                    <div className="action-buttons">
                        <button
                            className={`action-btn ab-vote-btn-left ${myVote === 'A' ? 'voted-a' : ''}`}
                            onClick={() => handleVote('A')}
                        >
                            <span className="ab-btn-label">{t('ab_left')}</span>
                        </button>

                        <button className="action-btn comment-btn" onClick={handleMessage}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                        </button>

                        <button
                            className={`action-btn ab-vote-btn-right ${myVote === 'B' ? 'voted-b' : ''}`}
                            onClick={() => handleVote('B')}
                        >
                            <span className="ab-btn-label">{t('ab_right')}</span>
                        </button>
                    </div>

                    <div className="panel-hint" onClick={() => setPanelState(prev => prev === 'collapsed' ? 'mid' : 'collapsed')}>
                        <svg
                            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                            style={{ transform: panelState !== 'collapsed' ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s' }}
                        >
                            <polyline points="18 15 12 9 6 15" />
                        </svg>
                        <span>{panelState !== 'collapsed' ? t('close') : t('swipe_up')}</span>
                    </div>

                    <div className="panel-detail-content">
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
                                                    <div className="comment-avatar-placeholder">{(profile.full_name || '?').charAt(0).toUpperCase()}</div>
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

            {/* Options Modal (Report / Block) */}
            {!isPreview && showOptionsArgs && (
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

export default ABCard

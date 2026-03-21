import React, { useEffect, useMemo, useState } from 'react';
import '../styles/Profile.css';
import BoostSelection from './BoostSelection';
import PremiumPromo from './PremiumPromo';
import EditProfile from './EditProfile';
import Settings from './Settings';
import XPRing from './level/XPRing';
import XPProgressBar from './level/XPProgressBar';
import MissionsSheet from './missions/MissionsSheet';
import { getOutfitsByUser, getBoostStatus, activateBoost, creditBoostPurchase, getUserBadges } from '../lib/api';
import { purchaseBoost } from '../lib/purchases';
import { useLang } from '../i18n/LangContext';
import { usePremium } from '../lib/usePremium';
import { useXP } from '../contexts/XPContext';

const ICONS = {
    settings: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    ),
    verified: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B" stroke="none">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
    ),
    sparkles: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none">
            <path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z" />
        </svg>
    ),
    clock: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    ),
    heart: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
    ),
    hanger: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffb7b7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 8l-3.3-6.6a2 2 0 0 0-3.4 0L6 8" />
            <path d="M6 8h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2z" />
        </svg>
    )
};

function getTimeLeft(createdAt) {
    const created = new Date(createdAt).getTime();
    const expiresAt = created + 24 * 60 * 60 * 1000;
    const now = Date.now();
    const diff = expiresAt - now;
    if (diff <= 0) return null;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
}

const Profile = ({ currentUser, session, onLogout, onProfileUpdated, onOutfitClick, onUpgrade }) => {
    const { t } = useLang();
    const { level: levelData, streakInfo } = useXP();
    const handleUpgrade = onUpgrade || (() => { });
    const [showBoost, setShowBoost] = useState(false);
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showMissions, setShowMissions] = useState(false);
    const [userOutfits, setUserOutfits] = useState([]);
    const [outfitsLoading, setOutfitsLoading] = useState(true);
    const [boostsUsed, setBoostsUsed] = useState(0);
    const [purchasedBoostBalance, setPurchasedBoostBalance] = useState(0);
    const [badges, setBadges] = useState([]);
    const [, setTick] = useState(0);

    const profile = useMemo(() => ({
        name: currentUser?.full_name || 'New Member',
        age: currentUser?.age ?? '-',
        city: currentUser?.city || 'City not set',
        avatar: currentUser?.avatar_url || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' rx='200' fill='%23E8E0DC'/%3E%3Ccircle cx='200' cy='155' r='60' fill='%23C4B5AD'/%3E%3Cellipse cx='200' cy='310' rx='95' ry='75' fill='%23C4B5AD'/%3E%3Ccircle cx='260' cy='290' r='28' fill='%23D4C8C0' stroke='%23B0A399' stroke-width='2'/%3E%3Crect x='254' y='284' width='12' height='12' rx='2' fill='%23B0A399'/%3E%3Ccircle cx='260' cy='294' r='4' fill='none' stroke='%23B0A399' stroke-width='1.5'/%3E%3C/svg%3E",
        styles: currentUser?.vibes || [],
        bio: currentUser?.bio || '',
        instagram_handle: currentUser?.instagram_handle || '',
        isPremium: Boolean(currentUser?.is_premium),
    }), [currentUser]);

    // Fetch user outfits + boost status + badges
    useEffect(() => {
        if (!session?.user?.id) return;
        setOutfitsLoading(true);
        Promise.all([
            getOutfitsByUser(session.user.id),
            getBoostStatus(session.user.id),
            getUserBadges(session.user.id)
        ]).then(([outfitRes, boostRes, badgeRes]) => {
            setUserOutfits(outfitRes.data || []);
            setBoostsUsed(boostRes.boostsUsed || 0);
            setPurchasedBoostBalance(boostRes.purchasedBalance || 0);
            setBadges(badgeRes.data || []);
            setOutfitsLoading(false);
        });
    }, [session?.user?.id]);

    // Tick every minute for countdown update
    useEffect(() => {
        const interval = setInterval(() => setTick(t => t + 1), 60000);
        return () => clearInterval(interval);
    }, []);

    // Filter active outfits (within 24h)
    const activeOutfits = useMemo(() => {
        return userOutfits.filter(o => getTimeLeft(o.created_at) !== null);
    }, [userOutfits]);

    // Stats from real data
    const totalLikes = useMemo(() => {
        return userOutfits.reduce((sum, o) => sum + (o.likes_count || 0), 0);
    }, [userOutfits]);

    const formatLikes = (n) => {
        if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
        return String(n);
    };

    const getOutfitImage = (outfit) => {
        const media = outfit.outfit_media || [];
        const sorted = [...media].sort((a, b) => a.sort_order - b.sort_order);
        return sorted[0]?.media_url || '';
    };

    return (
        <div className="profile-page">
            <header className="profile-header">
                <h1>{t('profile')}</h1>
                <div style={{ position: 'absolute', right: '0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button className="settings-btn" onClick={() => setShowMissions(true)} style={{ position: 'relative', right: 'auto' }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <circle cx="12" cy="12" r="6"></circle>
                            <circle cx="12" cy="12" r="2"></circle>
                        </svg>
                        {streakInfo && streakInfo.streak > 0 && (
                            <span style={{ 
                                position: 'absolute', top: -2, right: -4, 
                                background: '#f0786c', color: 'white', 
                                fontSize: '9px', fontWeight: 'bold', 
                                padding: '2px 4px', borderRadius: '8px',
                                border: '1px solid #fff'
                            }}>
                                {streakInfo.streak}🔥
                            </span>
                        )}
                    </button>
                    <button className="settings-btn" onClick={() => setShowSettings(true)} style={{ position: 'relative', right: 'auto' }}>
                        {ICONS.settings}
                    </button>
                </div>
            </header>

            {/* User Info — V2 with XP Ring */}
            <section className="user-info">
                <div className="avatar-container" style={{ position: 'relative' }}>
                    {levelData ? (
                        <XPRing
                            percentage={levelData.percentage || 0}
                            level={levelData.level || 1}
                            avatarUrl={profile.avatar}
                            name={profile.name}
                            size={120}
                        />
                    ) : (
                        <div className="avatar-ring">
                            <img src={profile.avatar} alt="Profile" className="avatar-img" />
                        </div>
                    )}
                    {profile.isPremium && (
                        <div className="premium-badge">
                            {ICONS.verified}
                            <span>PREMIUM</span>
                        </div>
                    )}
                </div>
                <h2 className="user-name">{profile.name}</h2>

                {/* Level title & Location */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    marginTop: '12px',
                    marginBottom: '12px'
                }}>
                    {levelData && (
                        <div style={{
                            background: '#faebe9',
                            color: '#f0786c',
                            fontSize: '12px',
                            fontWeight: '700',
                            padding: '6px 14px',
                            borderRadius: '16px',
                            letterSpacing: '0.5px',
                            textTransform: 'uppercase'
                        }}>
                            {levelData.title || 'YENİ STİLİST'}
                        </div>
                    )}

                    <p className="user-location" style={{ display: 'flex', alignItems: 'center', margin: 0, gap: '6px', fontSize: '15px', color: '#665b5b', fontWeight: '500' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        {profile.city}
                    </p>
                </div>
                {profile.bio && <p className="profile-bio">{profile.bio}</p>}
                {profile.instagram_handle && (
                    <a href={`https://instagram.com/${profile.instagram_handle}`} target="_blank" rel="noopener noreferrer" className="profile-instagram">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                        </svg>
                        @{profile.instagram_handle}
                    </a>
                )}

                {/* XP Progress Bar */}
                {levelData && (
                    <div style={{ width: '100%', maxWidth: 360, margin: '20px auto 0' }}>
                        <XPProgressBar
                            xp={levelData.xp}
                            progress={levelData.progress}
                            range={levelData.range}
                            percentage={levelData.percentage}
                            level={levelData.level}
                        />
                    </div>
                )}

                {/* Streak badge */}
                {streakInfo && streakInfo.streak > 1 && (
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        background: 'rgba(255,165,0,0.1)',
                        color: '#FFD700',
                        fontSize: 12,
                        fontWeight: 600,
                        padding: '4px 12px',
                        borderRadius: 12,
                        marginTop: 8,
                    }}>
                        🔥 {streakInfo.streak} Gun Streak
                    </div>
                )}

                {/* Badges preview */}
                {badges.length > 0 && (
                    <div style={{
                        display: 'flex',
                        gap: 6,
                        justifyContent: 'center',
                        marginTop: 10,
                        flexWrap: 'wrap',
                    }}>
                        {badges.slice(0, 5).map(ub => (
                            <div key={ub.id} style={{
                                width: 32, height: 32,
                                borderRadius: 8,
                                background: ub.badge?.rarity === 'legendary' ? 'rgba(255,215,0,0.15)' :
                                    ub.badge?.rarity === 'epic' ? 'rgba(156,39,176,0.15)' :
                                    ub.badge?.rarity === 'rare' ? 'rgba(33,150,243,0.15)' :
                                    'rgba(255,255,255,0.06)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 16,
                                border: ub.badge?.rarity === 'legendary' ? '1px solid rgba(255,215,0,0.3)' : '1px solid rgba(255,255,255,0.08)',
                            }} title={ub.badge?.name}>
                                {ub.badge?.icon_url || '🏅'}
                            </div>
                        ))}
                        {badges.length > 5 && (
                            <div style={{
                                width: 32, height: 32, borderRadius: 8,
                                background: 'rgba(255,255,255,0.06)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 11, color: '#666', fontWeight: 600,
                            }}>
                                +{badges.length - 5}
                            </div>
                        )}
                    </div>
                )}
            </section>

            <section className="stats-row">
                <div className="stat-item">
                    <span className="stat-value">{formatLikes(totalLikes)}</span>
                    <span className="stat-label">{t('total_likes')}</span>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-item">
                    <span className="stat-value">{activeOutfits.length}</span>
                    <span className="stat-label">{t('active_outfits')}</span>
                </div>
            </section>

            <section className="action-buttons">
                <button className="btn btn-edit-profile" onClick={() => setShowEditProfile(true)}>
                    {t('edit_profile')}
                </button>
                <button className="btn btn-boost-profile" onClick={() => setShowBoost(true)}>
                    Boost Profile
                    {ICONS.sparkles}
                </button>
            </section>



            {/* Premium Promo for Free Users */}
            {!profile.isPremium && <PremiumPromo onUpgrade={handleUpgrade} />}

            <section className="current-looks">
                <div className="section-header">
                    <h3>{t('current_looks')}</h3>
                    <span className="badge-24h">{t('only_24h')}</span>
                </div>

                {outfitsLoading ? (
                    <p className="looks-empty-text">{t('loading')}</p>
                ) : activeOutfits.length === 0 ? (
                    <div className="looks-empty">
                        <div className="looks-empty-icon">{ICONS.hanger}</div>
                        <p className="looks-empty-text">{t('no_active_outfits')}</p>
                        <p className="looks-empty-sub">{t('no_active_sub')}</p>
                    </div>
                ) : activeOutfits.length === 1 ? (
                    <div className="looks-single">
                        <div className="look-card large" onClick={() => onOutfitClick?.(activeOutfits[0])} style={{ cursor: 'pointer', position: 'relative' }}>
                            <img src={getOutfitImage(activeOutfits[0])} alt="Look" />
                            {activeOutfits[0].post_type === 'ab_test' && (
                                <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)', color: 'white', padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 'bold', zIndex: 2 }}>A/B</div>
                            )}
                            <div className="look-overlay">
                                <div className="timer-badge">
                                    {ICONS.clock} {getTimeLeft(activeOutfits[0].created_at)}
                                </div>
                                <div className="likes-badge">
                                    {ICONS.heart} {activeOutfits[0].likes_count || 0}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : activeOutfits.length === 2 ? (
                    <div className="looks-grid">
                        {activeOutfits.slice(0, 2).map(outfit => (
                            <div className="look-card equal" key={outfit.id} onClick={() => onOutfitClick?.(outfit)} style={{ cursor: 'pointer', position: 'relative' }}>
                                <img src={getOutfitImage(outfit)} alt="Look" />
                                {outfit.post_type === 'ab_test' && (
                                    <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)', color: 'white', padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 'bold', zIndex: 2 }}>A/B</div>
                                )}
                                <div className="look-overlay">
                                    <div className="timer-badge">
                                        {ICONS.clock} {getTimeLeft(outfit.created_at)}
                                    </div>
                                    <div className="likes-badge">
                                        {ICONS.heart} {outfit.likes_count || 0}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="looks-grid">
                        <div className="look-card large" onClick={() => onOutfitClick?.(activeOutfits[0])} style={{ cursor: 'pointer', position: 'relative' }}>
                            <img src={getOutfitImage(activeOutfits[0])} alt="Look" />
                            {activeOutfits[0].post_type === 'ab_test' && (
                                <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)', color: 'white', padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 'bold', zIndex: 2 }}>A/B</div>
                            )}
                            <div className="look-overlay">
                                <div className="timer-badge">
                                    {ICONS.clock} {getTimeLeft(activeOutfits[0].created_at)}
                                </div>
                                <div className="likes-badge">
                                    {ICONS.heart} {activeOutfits[0].likes_count || 0}
                                </div>
                            </div>
                        </div>
                        <div className="looks-column">
                            {activeOutfits.slice(1, 3).map(outfit => (
                                <div className="look-card small" key={outfit.id} onClick={() => onOutfitClick?.(outfit)} style={{ cursor: 'pointer', position: 'relative' }}>
                                    <img src={getOutfitImage(outfit)} alt="Look" />
                                    {outfit.post_type === 'ab_test' && (
                                        <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)', color: 'white', padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 'bold', zIndex: 2 }}>A/B</div>
                                    )}
                                    <div className="look-overlay">
                                        <div className="timer-badge">
                                            {ICONS.clock} {getTimeLeft(outfit.created_at)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </section>

            <footer className="profile-footer">
                <div className="hanger-icon">{ICONS.hanger}</div>
                <p>{t('thats_all')}</p>
            </footer>

            {/* Scroll Spacer */}
            <div style={{ height: '80px' }}></div>

            {showSettings && (
                <Settings
                    onClose={() => setShowSettings(false)}
                    onLogout={onLogout}
                    currentUser={currentUser}
                    session={session}
                    onUpgrade={async () => {
                        const success = await handleUpgrade()
                        if (success) setShowSettings(false)
                    }}
                />
            )}

            {showEditProfile && (
                <EditProfile
                    profile={profile}
                    onSave={onProfileUpdated}
                    onClose={() => setShowEditProfile(false)}
                />
            )}

            {/* Missions Bottom Sheet */}
            <MissionsSheet
                isOpen={showMissions}
                onClose={() => setShowMissions(false)}
                userId={session?.user?.id}
            />

            {showBoost && (
                <BoostSelection
                    userType={profile.isPremium ? 'premium' : 'free'}
                    boostsUsed={boostsUsed}
                    purchasedBalance={purchasedBoostBalance}
                    onClose={() => setShowBoost(false)}
                    onBoost={async () => {
                        if (!session?.user?.id) return;
                        const { data, error } = await activateBoost(session.user.id);
                        if (error || !data?.success) {
                            alert(data?.error || 'Boost aktifleştirilemedi.');
                            return;
                        }
                        setBoostsUsed(data.boosts_used);
                        if (data.used_purchased) {
                            setPurchasedBoostBalance(prev => Math.max(0, prev - 1));
                        }
                        setShowBoost(false);
                    }}
                    onPurchase={async () => {
                        if (!session?.user?.id) return;
                        try {
                            const result = await purchaseBoost();
                            if (result.cancelled) return;
                            if (result.success) {
                                const { data } = await creditBoostPurchase(session.user.id);
                                if (data?.success) {
                                    setPurchasedBoostBalance(data.balance);
                                }
                            }
                        } catch (err) {
                            alert(err.message || 'Satın alma başarısız oldu.');
                        }
                    }}
                />
            )}

        </div>
    );
};

export default Profile;

import React, { useEffect, useMemo, useState } from 'react';
import '../styles/Profile.css';
import BoostSelection from './BoostSelection';
import PremiumPromo from './PremiumPromo';
import EditProfile from './EditProfile';
import Settings from './Settings';
import { getOutfitsByUser, getBoostStatus, activateBoost } from '../lib/api';
import { useLang } from '../i18n/LangContext';
import { usePremium } from '../lib/usePremium';

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

const Profile = ({ currentUser, session, onLogout, onProfileUpdated }) => {
    const { t } = useLang();
    const { handleUpgrade } = usePremium();
    const [showBoost, setShowBoost] = useState(false);
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [userOutfits, setUserOutfits] = useState([]);
    const [outfitsLoading, setOutfitsLoading] = useState(true);
    const [boostsUsed, setBoostsUsed] = useState(0);
    const [, setTick] = useState(0);

    const profile = useMemo(() => ({
        name: currentUser?.full_name || 'New Member',
        age: currentUser?.age ?? '-',
        city: currentUser?.city || 'City not set',
        avatar: currentUser?.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
        styles: currentUser?.vibes || [],
        bio: currentUser?.bio || '',
        isPremium: Boolean(currentUser?.is_premium),
    }), [currentUser]);

    // Fetch user outfits + boost status
    useEffect(() => {
        if (!session?.user?.id) return;
        setOutfitsLoading(true);
        Promise.all([
            getOutfitsByUser(session.user.id),
            getBoostStatus(session.user.id)
        ]).then(([outfitRes, boostRes]) => {
            setUserOutfits(outfitRes.data || []);
            setBoostsUsed(boostRes.boostsUsed || 0);
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
                <button className="settings-btn" onClick={() => setShowSettings(true)}>
                    {ICONS.settings}
                </button>
            </header>

            {/* User Info */}
            <section className="user-info">
                <div className="avatar-container">
                    <div className="avatar-ring">
                        <img src={profile.avatar} alt="Profile" className="avatar-img" />
                    </div>
                    {profile.isPremium && (
                        <div className="premium-badge">
                            {ICONS.verified}
                            <span>PREMIUM</span>
                        </div>
                    )}
                </div>
                <h2 className="user-name">{profile.name}</h2>
                <p className="user-location">{profile.age} / {profile.city}</p>
                {profile.bio && <p className="profile-bio">{profile.bio}</p>}
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
                <button className="btn btn-outline" onClick={() => setShowEditProfile(true)}>{t('edit_profile')}</button>
                <button className="btn btn-primary" onClick={() => setShowBoost(true)}>
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
                        <div className="look-card large">
                            <img src={getOutfitImage(activeOutfits[0])} alt="Look" />
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
                            <div className="look-card equal" key={outfit.id}>
                                <img src={getOutfitImage(outfit)} alt="Look" />
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
                        <div className="look-card large">
                            <img src={getOutfitImage(activeOutfits[0])} alt="Look" />
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
                                <div className="look-card small" key={outfit.id}>
                                    <img src={getOutfitImage(outfit)} alt="Look" />
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

            {showBoost && (
                <BoostSelection
                    userType={profile.isPremium ? 'premium' : 'free'}
                    boostsUsed={boostsUsed}
                    onClose={() => setShowBoost(false)}
                    onBoost={async () => {
                        if (!session?.user?.id) return;
                        const { data, error } = await activateBoost(session.user.id);
                        if (error || !data?.success) {
                            alert(data?.error || 'Boost aktifleştirilemedi.');
                            return;
                        }
                        setBoostsUsed(data.boosts_used);
                        setShowBoost(false);
                    }}
                />
            )}

        </div>
    );
};

export default Profile;

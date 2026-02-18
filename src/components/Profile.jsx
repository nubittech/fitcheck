import React, { useMemo, useState } from 'react';
import '../styles/Profile.css';
import BoostSelection from './BoostSelection';
import PremiumPromo from './PremiumPromo';
import EditProfile from './EditProfile';
import Settings from './Settings';
import DailyLimitDemo from './DailyLimitDemo';

const CURRENT_LOOKS = [
    {
        id: 1,
        image: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=600',
        timeLeft: '18h left',
        likes: 240,
        isLarge: true
    },
    {
        id: 2,
        image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600',
        timeLeft: '4h left',
        likes: 120,
        isLarge: false
    },
    {
        id: 3,
        image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600',
        timeLeft: '23h left',
        likes: 85,
        isLarge: false
    }
];

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

const Profile = ({ currentUser, onLogout, onProfileUpdated }) => {
    const [showBoost, setShowBoost] = useState(false);
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showDailyLimitDemo, setShowDailyLimitDemo] = useState(false);
    const profile = useMemo(() => ({
        name: currentUser?.full_name || 'New Member',
        age: currentUser?.age ?? '-',
        city: currentUser?.city || 'City not set',
        avatar: currentUser?.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
        styles: currentUser?.vibes || ['Minimalist'],
        bio: currentUser?.bio || '',
        isPremium: Boolean(currentUser?.is_premium),
        stats: {
            likes: '1.2k',
            outfits: 14
        }
    }), [currentUser]);

    return (
        <div className="profile-page">
            {/* Header */}
            <header className="profile-header">
                <h1>Profile</h1>
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

            {/* Stats */}
            <section className="stats-row">
                <div className="stat-item">
                    <span className="stat-value">{profile.stats.likes}</span>
                    <span className="stat-label">TOTAL LIKES</span>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-item">
                    <span className="stat-value">{profile.stats.outfits}</span>
                    <span className="stat-label">ACTIVE OUTFITS</span>
                </div>
            </section>

            {/* Action Buttons */}
            <section className="action-buttons">
                <button className="btn btn-outline" onClick={() => setShowEditProfile(true)}>Edit Profile</button>
                <button className="btn btn-primary" onClick={() => setShowBoost(true)}>
                    Boost Profile
                    {ICONS.sparkles}
                </button>
            </section>

            {/* Premium Promo for Free Users */}
            {!profile.isPremium && <PremiumPromo onUpgrade={() => setShowDailyLimitDemo(true)} />}

            {/* Current Looks */}
            <section className="current-looks">
                <div className="section-header">
                    <h3>Current Looks</h3>
                    <span className="badge-24h">24h only</span>
                </div>

                <div className="looks-grid">
                    {/* Main Large Item */}
                    <div className="look-card large">
                        <img src={CURRENT_LOOKS[0].image} alt="Look 1" />
                        <div className="look-overlay">
                            <div className="timer-badge">
                                {ICONS.clock} {CURRENT_LOOKS[0].timeLeft}
                            </div>
                            <div className="likes-badge">
                                {ICONS.heart} {CURRENT_LOOKS[0].likes}
                            </div>
                        </div>
                    </div>

                    {/* Right Column Stack */}
                    <div className="looks-column">
                        <div className="look-card small">
                            <img src={CURRENT_LOOKS[1].image} alt="Look 2" />
                            <div className="look-overlay">
                                <div className="timer-badge">
                                    {ICONS.clock} {CURRENT_LOOKS[1].timeLeft}
                                </div>
                            </div>
                        </div>
                        <div className="look-card small">
                            <img src={CURRENT_LOOKS[2].image} alt="Look 3" />
                            <div className="look-overlay">
                                <div className="timer-badge">
                                    {ICONS.clock} {CURRENT_LOOKS[2].timeLeft}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="profile-footer">
                <div className="hanger-icon">{ICONS.hanger}</div>
                <p>That's all for today.</p>
            </footer>

            {/* Scroll Spacer */}
            <div style={{ height: '80px' }}></div>

            {showSettings && (
                <Settings onClose={() => setShowSettings(false)} onLogout={onLogout} />
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
                    onClose={() => setShowBoost(false)}
                    onBoost={() => {
                        alert('Boost activated!');
                        setShowBoost(false);
                    }}
                />
            )}

            {showDailyLimitDemo && (
                <DailyLimitDemo
                    onBack={() => setShowDailyLimitDemo(false)}
                    onGoHome={() => setShowDailyLimitDemo(false)}
                />
            )}
        </div>
    );
};

export default Profile;

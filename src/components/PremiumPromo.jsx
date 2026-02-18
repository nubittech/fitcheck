import React from 'react';
import '../styles/Profile.css';

const PremiumPromo = ({ onUpgrade }) => {
    return (
        <div className="premium-promo-card">
            <div className="promo-header">
                <div className="promo-icon-badge">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#F59E0B" stroke="none">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                </div>
                <h3>Upgrade to Premium</h3>
            </div>

            <div className="promo-features-grid">
                <div className="feature-item">
                    <div className="feature-icon icon-infinity">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18.83 17.6l-5.18-5.18a6 6 0 0 0 0-8.49 6 6 0 1 0-8.49 8.49l10.35 10.35a6 6 0 0 0 8.49-8.49z" />
                            {/* Simplified infinity-like shape or just use text for now if svg is complex, but let's try a loop */}
                            <path d="M8 8a4 4 0 1 1 0 8c-2.21 0-4-3-4-3s-1.79-3-4-3a4 4 0 0 0 0 8" opacity="0" />
                            {/* Actual infinity path */}
                            <path d="M12 12c-2-2.5-4-4-7-4a5 5 0 0 0 0 10c3 0 5-1.5 7-4 .5-1 1.5-2 2-2 2.5 0 4 1.5 4 4a5 5 0 0 1-10 0" />
                        </svg>
                    </div>
                    <span>Unlimited Feed</span>
                </div>

                <div className="feature-item">
                    <div className="feature-icon icon-filter">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                        </svg>
                    </div>
                    <span>Filtered Sharing</span>
                </div>

                <div className="feature-item">
                    <div className="feature-icon icon-bolt">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                        </svg>
                    </div>
                    <span>5 Monthly Boosts</span>
                </div>

                <div className="feature-item">
                    <div className="feature-icon icon-dollar">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="1" x2="12" y2="23" />
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </svg>
                    </div>
                    <span>Affiliate Links</span>
                </div>
            </div>

            <button className="premium-upgrade-btn" onClick={onUpgrade}>
                Get Premium for $3/mo
            </button>
        </div>
    );
};

export default PremiumPromo;

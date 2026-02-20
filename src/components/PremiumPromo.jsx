import React from 'react';
import { useLang } from '../i18n/LangContext';
import '../styles/Profile.css';

const PremiumPromo = ({ onUpgrade }) => {
    const { t, lang } = useLang();

    const features = [
        {
            icon: (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
            ),
            iconClass: 'icon-infinity',
            label: lang === 'tr' ? 'Sınırsız Kaydırma' : 'Unlimited Feed',
        },
        {
            icon: (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                </svg>
            ),
            iconClass: 'icon-filter',
            label: lang === 'tr' ? 'Filtrelenmiş Paylaşım' : 'Filtered Sharing',
        },
        {
            icon: (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
            ),
            iconClass: 'icon-bolt',
            label: lang === 'tr' ? 'Aylık 5 Öne Çıkarma' : '5 Monthly Boosts',
        },
        {
            icon: (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
            ),
            iconClass: 'icon-dollar',
            label: lang === 'tr' ? 'Affiliate Linkleri' : 'Affiliate Links',
        },
    ];

    return (
        <div className="premium-promo-card">
            <div className="promo-header">
                <div className="promo-icon-badge">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#F59E0B" stroke="none">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                </div>
                <h3>{lang === 'tr' ? "Premium'a Yükselt" : 'Upgrade to Premium'}</h3>
            </div>

            <div className="promo-features-grid">
                {features.map(f => (
                    <div key={f.label} className="feature-item">
                        <div className={`feature-icon ${f.iconClass}`}>{f.icon}</div>
                        <span>{f.label}</span>
                    </div>
                ))}
            </div>

            <button className="premium-upgrade-btn" onClick={onUpgrade}>
                {lang === 'tr' ? "Premium'a Geç — Aylık $3" : 'Get Premium for $3/mo'}
            </button>
        </div>
    );
};

export default PremiumPromo;

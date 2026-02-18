import React, { useState } from 'react';
import '../styles/Profile.css'; // Reusing profile styles for now

const BoostSelection = ({ userType = 'free', onClose, onBoost }) => {
    // userType can be 'free' or 'premium'
    // For demo purposes, we can toggle it internally or accept it as prop
    const [currentType, setCurrentType] = useState(userType);

    const isPremium = currentType === 'premium';
    const boostCount = isPremium ? 4 : 3; // Example logic
    const totalBoosts = isPremium ? 5 : 3;
    const hasBoosts = boostCount > 0;

    return (
        <div className="boost-overlay">
            <div className="boost-card">
                <div className="boost-icon-wrapper">
                    🚀
                </div>
                <div className="boost-header">
                    <h2>Kombinini Hızlıca Yayınla!</h2>
                    <p>Boost kullan, 2 saat boyunca tüm kullanıcılara öncelikli göster.</p>
                </div>

                <div className={`boost-status ${isPremium ? 'premium-bg' : 'free-bg'}`}>
                    {isPremium ? (
                        <div className="status-content">
                            <span className="status-label">PREMIUM USER</span>
                            <span className="boost-count">Kalan boost: <strong>{boostCount}/{totalBoosts}</strong> (Bu ay)</span>
                        </div>
                    ) : (
                        <div className="status-content">
                            <span className="status-label">FREE USER</span>
                            <span className="boost-count">
                                {hasBoosts ? `Kalan boost: ${boostCount}` : "Boost yok, satın al!"}
                            </span>
                        </div>
                    )}
                </div>

                <div className="boost-actions">
                    {hasBoosts ? (
                        <button className="boost-action-btn primary" onClick={onBoost}>
                            <span className="btn-icon">⚡</span>
                            Boost ile Paylaş
                        </button>
                    ) : (
                        <button className="boost-action-btn buy">
                            Boost Satın Al
                        </button>
                    )}

                    <button className="boost-action-btn secondary" onClick={onClose}>
                        Normal Paylaş
                    </button>
                </div>

                <button className="back-btn" onClick={onClose}>
                    ← Geri
                </button>

                {/* Dev Toggle for Demo */}
                <div style={{ marginTop: 20, fontSize: 10, opacity: 0.5, textAlign: 'center' }}>
                    <button onClick={() => setCurrentType(isPremium ? 'free' : 'premium')}>
                        (Dev: Toggle User Type)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BoostSelection;

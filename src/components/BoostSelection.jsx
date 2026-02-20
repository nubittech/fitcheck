import { useState } from 'react';
import '../styles/BoostSelection.css';

const BOOST_LIMITS = {
  free: { max: 1, period: 'hafta', duration: 2 },
  premium: { max: 5, period: 'ay', duration: 2 }
};

const BoostSelection = ({ userType = 'free', boostsUsed = 0, onClose, onBoost }) => {
  const [activating, setActivating] = useState(false);
  const isPremium = userType === 'premium';
  const limits = BOOST_LIMITS[isPremium ? 'premium' : 'free'];
  const remaining = Math.max(0, limits.max - boostsUsed);
  const hasBoosts = remaining > 0;

  const handleBoost = async () => {
    if (!hasBoosts || activating) return;
    setActivating(true);
    try {
      await onBoost();
    } finally {
      setActivating(false);
    }
  };

  return (
    <div className="boost-overlay" onClick={onClose}>
      <div className="boost-sheet" onClick={e => e.stopPropagation()}>
        {/* Handle */}
        <div className="boost-sheet-handle" />

        {/* Icon */}
        <div className="boost-rocket">
          <div className="boost-rocket-bg" />
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ff8a7a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
            <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
            <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 3 0 3 0" />
            <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-3 0-3" />
          </svg>
        </div>

        {/* Title */}
        <h2 className="boost-title">Profilini Öne Çıkar</h2>
        <p className="boost-subtitle">
          Boost aktifleştiğinde kombinlerin {limits.duration} saat boyunca herkese öncelikli gösterilir.
        </p>

        {/* Stats */}
        <div className="boost-stats-row">
          <div className="boost-stat-card">
            <span className="boost-stat-value">{remaining}</span>
            <span className="boost-stat-label">Kalan Boost</span>
          </div>
          <div className="boost-stat-divider" />
          <div className="boost-stat-card">
            <span className="boost-stat-value">{limits.duration}s</span>
            <span className="boost-stat-label">Süre</span>
          </div>
          <div className="boost-stat-divider" />
          <div className="boost-stat-card">
            <span className="boost-stat-value">2.5x</span>
            <span className="boost-stat-label">Görünürlük</span>
          </div>
        </div>

        {/* Plan info */}
        <div className={`boost-plan-badge ${isPremium ? 'premium' : 'free'}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
          <span>
            {isPremium
              ? `Premium · ${limits.max} boost / ${limits.period}`
              : `Free · ${limits.max} boost / ${limits.period}`
            }
          </span>
        </div>

        {/* How it works */}
        <div className="boost-how">
          <h4>Nasıl Çalışır?</h4>
          <div className="boost-how-items">
            <div className="boost-how-item">
              <div className="boost-how-num">1</div>
              <span>Boost'u aktifleştir</span>
            </div>
            <div className="boost-how-item">
              <div className="boost-how-num">2</div>
              <span>{limits.duration} saat boyunca feed'de öncelik kazan</span>
            </div>
            <div className="boost-how-item">
              <div className="boost-how-num">3</div>
              <span>2.5x daha fazla görüntülenme al</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="boost-actions-area">
          {hasBoosts ? (
            <button className="boost-activate-btn" onClick={handleBoost} disabled={activating}>
              {activating ? (
                <span>Aktifleştiriliyor...</span>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white" stroke="none">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                  <span>Boost Aktifleştir</span>
                </>
              )}
            </button>
          ) : (
            <>
              <div className="boost-empty-msg">
                Bu {limits.period} için boost hakkın bitti.
                {!isPremium && ' Premium ile 5 boost / ay kazan!'}
              </div>
              {!isPremium && (
                <button className="boost-upgrade-btn" onClick={() => {
                  alert('Premium abonelik yakında aktif olacak! App Store entegrasyonu bekleniyor.');
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="none">
                    <path d="M6 2l-4 8 10 12L22 10 18 2H6zm2.14 2h7.72l2.5 5H5.64l2.5-5z" />
                  </svg>
                  Premium'a Geç
                </button>
              )}
            </>
          )}
          <button className="boost-cancel-btn" onClick={onClose}>Şimdi Değil</button>
        </div>
      </div>
    </div>
  );
};

export default BoostSelection;

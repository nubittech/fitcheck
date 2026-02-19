import '../styles/DailyLimitDemo.css'

const DAILY_LIMIT = 75

const DailyLimitDemo = ({ swipeCount = 75, onBack, onGoHome, onUpgrade }) => {
  const count = Math.min(swipeCount, DAILY_LIMIT)

  return (
    <div className="daily-limit-overlay">
      <div className="daily-limit-page">
        {/* Top Bar */}
        <div className="daily-limit-topbar">
          <button className="dl-close-btn" onClick={onBack}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <div className="dl-plan-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#ff8a7a" stroke="none">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            <span>Free Plan</span>
          </div>
        </div>

        {/* Illustration */}
        <div className="dl-illustration">
          <div className="dl-illustration-blob" />
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDnqLxpht3vNGyxhqcASRHcOv64GjGR1F23-TPtfwRw_xj7fmsVSvNHLWGUHAJtYkQFFR9KWXaknl56WtxHGPs_ql7WFYgycx1BJoRuJuYg4tkMRkA8V0n5nfEdnYJItkq4gyYvgpyrcKU4mEsvlbOMwd-NN67HZUQRweq-mgILutd7PZIt7kq5oOuMJboBlXwJ7fTAYF3sbFE902IZJwWlckP6DpbFwM2YSTZ_kuaXznsZsWq4xW2pVrpoSz-OGS-ZRjC9vWtdXiHs"
            alt="Clothes rack illustration"
            className="dl-illustration-img"
          />
        </div>

        {/* Content */}
        <div className="dl-content">
          <h1 className="dl-title">Bugünlük<br />Bu Kadar!</h1>

          <div className="dl-counter-pill">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#ff8a7a" stroke="none">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            <span>{count}/{DAILY_LIMIT} Kombin</span>
          </div>

          <p className="dl-desc">
            Günlük {DAILY_LIMIT} kombin görme sınırına ulaştın. Yarın yeni stiller seni bekliyor olacak.
          </p>
        </div>

        {/* Premium Card */}
        <div className="dl-bottom">
          <div className="dl-premium-card">
            <div className="dl-premium-card-glow" />
            <div className="dl-premium-header">
              <div>
                <h3 className="dl-premium-title">Sınırları Kaldır</h3>
                <div className="dl-premium-subtitle">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 8a4 4 0 1 1 0 8c-2.2 0-4-1.8-4-4s1.8-4 4-4m8 0a4 4 0 1 1 0 8c-2.2 0-4-1.8-4-4s1.8-4 4-4" />
                  </svg>
                  <span>Sınırsız Kaydırma Özgürlüğü</span>
                </div>
              </div>
              <div className="dl-diamond-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="none">
                  <path d="M6 2l-4 8 10 12L22 10 18 2H6zm2.14 2h7.72l2.5 5H5.64l2.5-5z" />
                </svg>
              </div>
            </div>

            <button className="dl-premium-btn" onClick={onUpgrade}>
              <span>Premium'a Geç</span>
              <span className="dl-premium-price">($3/ay)</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>

            <p className="dl-more-link">Daha fazla avantajı gör</p>
          </div>

          <button className="dl-dismiss-btn" onClick={onGoHome}>Şimdilik bekleyeceğim</button>
        </div>
      </div>
    </div>
  )
}

export default DailyLimitDemo

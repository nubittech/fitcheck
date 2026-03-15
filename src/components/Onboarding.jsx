import React, { useState } from 'react';
import '../styles/Onboarding.css';

export default function Onboarding({ onComplete }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < 2) {
      setCurrentSlide(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const handleBack = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  return (
    <div className="onboarding-container">
      {/* Header controls */}
      <div className="onboarding-header">
        {currentSlide > 0 && currentSlide < 2 && (
          <button className="onboarding-back-btn" onClick={handleBack}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>
        )}
        
        {currentSlide < 2 && (
          <button className="onboarding-skip-btn" onClick={handleSkip}>
            Atla
          </button>
        )}

        {currentSlide === 2 && (
          <button className="onboarding-skip-btn" onClick={handleSkip}>
            Giriş Yap
          </button>
        )}
      </div>

      {/* Slider Viewport */}
      <div 
        className="onboarding-slides"
        style={{ transform: `translateX(-${currentSlide * 100}vw)` }}
      >
        {/* SLIDE 1: Tarzını Paylaş */}
        <div className="onboarding-slide">
          <div className="onboarding-graphic">
            {/* Heart Badge */}
            <div className="graphic-s1-badge">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#FF8A7A" stroke="#FF8A7A" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </div>
            {/* Hanger and Circles */}
            <svg width="140" height="140" viewBox="0 0 140 140" fill="none">
              {/* Path for a simple hanger */}
              <path className="graphic-s1-hanger" d="M70 30 C 80 30, 85 40, 75 50 L 70 55 L 70 65 M 70 65 L 30 95 L 110 95 Z" />
              <path className="graphic-s1-hanger" d="M45 95 L 45 100 M 95 95 L 95 100" />
              {/* Circles */}
              <circle cx="50" cy="120" r="15" className="graphic-s1-circle" />
              <circle cx="90" cy="120" r="15" className="graphic-s1-circle" />
            </svg>
          </div>
          <div className="onboarding-content">
            <h1 className="onboarding-title">Tarzını Paylaş</h1>
            <p className="onboarding-desc">Günlük kombinlerini paylaş, topluluktan anında geri bildirim al.</p>
          </div>
        </div>

        {/* SLIDE 2: Karar Veremedin mi? */}
        <div className="onboarding-slide">
          <div className="onboarding-graphic" style={{ background: 'transparent' }}>
            <div className="s2-card-container">
              <div className="s2-card">
                 <div className="s2-card-inner"></div>
                 <div className="s2-card-line"></div>
              </div>
              <div className="s2-card">
                 <div className="s2-card-inner"></div>
                 <div className="s2-card-line"></div>
              </div>
              <div className="s2-vs-badge">VS</div>
            </div>
          </div>
          <div className="onboarding-content">
            <h1 className="onboarding-title">Karar Veremedin mi?</h1>
            <p className="onboarding-desc">İki seçenek arasında kaldığında <strong style={{color: '#FF8A7A', fontWeight: 600}}>VS oylaması</strong> başlat, doğru kombini seçmene yardımcı olalım.</p>
          </div>
        </div>

        {/* SLIDE 3: Topluluğa Katıl */}
        <div className="onboarding-slide">
          <div className="onboarding-graphic">
            <div className="s3-circle s3-c1">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div className="s3-circle s3-c2">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div className="s3-circle s3-c3">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
            </div>
          </div>
          <div className="onboarding-content">
            <h1 className="onboarding-title">Topluluğa Katıl</h1>
            <p className="onboarding-desc">Seninle aynı zevklere sahip insanlarla tanış, moda dünyasının bir parçası ol.</p>
          </div>
        </div>
      </div>

      {/* Footer controls */}
      <div className="onboarding-footer">
        <div className="onboarding-dots">
          {[0, 1, 2].map(idx => (
            <div key={idx} className={`dot ${currentSlide === idx ? 'active' : ''}`} />
          ))}
        </div>
        
        <button className="onboarding-action-btn" onClick={handleNext}>
          {currentSlide === 2 ? 'Hemen Başla' : 'Devam Et'}
          {currentSlide < 2 && (
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
               <line x1="5" y1="12" x2="19" y2="12"></line>
               <polyline points="12 5 19 12 12 19"></polyline>
             </svg>
          )}
        </button>
      </div>

    </div>
  );
}

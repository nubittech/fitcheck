import React, { useState, useRef, useEffect } from 'react'
import { AdMob, BannerAdSize, BannerAdPosition } from '@capacitor-community/admob'
import { Capacitor } from '@capacitor/core'
import '../styles/OutfitCard.css'

const BANNER_ID_ANDROID = 'ca-app-pub-5763861638133766/3582145292'
const BANNER_ID_IOS = 'ca-app-pub-5763861638133766/9778387555'
const IS_TEST = import.meta.env.DEV
const TEST_BANNER_ANDROID = 'ca-app-pub-3940256099942544/6300978111'
const TEST_BANNER_IOS = 'ca-app-pub-3940256099942544/2934735716'

function getBannerAdId() {
  const platform = Capacitor.getPlatform()
  if (IS_TEST) {
    return platform === 'ios' ? TEST_BANNER_IOS : TEST_BANNER_ANDROID
  }
  return platform === 'ios' ? BANNER_ID_IOS : BANNER_ID_ANDROID
}

const AdCard = ({ isPreview, onNext, onSkip }) => {
  const [swipeDir, setSwipeDir] = useState(null)
  const [offsetX, setOffsetX] = useState(0)
  const [adLoaded, setAdLoaded] = useState(false)
  const startX = useRef(0)
  const startY = useRef(0)
  const isDragging = useRef(false)
  const swipeAxis = useRef(null)

  // Banner'ı göster/gizle
  useEffect(() => {
    if (isPreview) return

    const showAd = async () => {
      if (!Capacitor.isNativePlatform()) return
      try {
        const adId = getBannerAdId()
        if (!adId) return

        // Reklam yüklenme event'i
        AdMob.addListener('onAdLoaded', () => setAdLoaded(true))

        await AdMob.showBanner({
          adId,
          adSize: BannerAdSize.MEDIUM_RECTANGLE,
          position: BannerAdPosition.CENTER,
          isTesting: IS_TEST,
        })
      } catch (e) {
        console.error('[AdCard] Banner error:', e)
      }
    }

    showAd()

    return () => {
      AdMob.removeBanner().catch(() => {})
      AdMob.removeAllListeners().catch(() => {})
    }
  }, [isPreview])

  // Swipe handlers
  const handleTouchStart = (e) => {
    if (isPreview) return
    startX.current = e.touches[0].clientX
    startY.current = e.touches[0].clientY
    isDragging.current = true
    swipeAxis.current = null
  }

  const handleTouchMove = (e) => {
    if (!isDragging.current || isPreview) return
    const dx = e.touches[0].clientX - startX.current
    const dy = e.touches[0].clientY - startY.current

    if (!swipeAxis.current) {
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
        swipeAxis.current = 'horizontal'
      } else if (Math.abs(dy) > 10) {
        swipeAxis.current = 'vertical'
        isDragging.current = false
        return
      }
    }

    if (swipeAxis.current === 'horizontal') {
      setOffsetX(dx)
    }
  }

  const handleTouchEnd = () => {
    if (!isDragging.current || isPreview) return
    isDragging.current = false

    if (Math.abs(offsetX) > 100) {
      setSwipeDir(offsetX > 0 ? 'right' : 'left')
      setTimeout(() => {
        if (offsetX > 0) {
          onSkip?.()
        } else {
          onNext?.()
        }
      }, 250)
    } else {
      setOffsetX(0)
    }
  }

  const cardClass = `outfit-card ${swipeDir ? `swipe-${swipeDir}` : ''} ${isDragging.current && offsetX !== 0 ? 'is-dragging' : ''}`

  return (
    <div className={`outfit-card-shell ${isPreview ? 'is-preview' : ''}`}>
      <div
        className={cardClass}
        style={{
          transform: swipeDir
            ? undefined
            : `translateX(${offsetX}px) rotate(${offsetX * 0.05}deg)`,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Tam ekran reklam kartı */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: '#000',
          display: 'flex',
          flexDirection: 'column',
        }}>

          {/* Üst: REKLAM etiketi */}
          <div style={{
            position: 'absolute',
            top: '54px',
            right: '16px',
            zIndex: 6,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            borderRadius: '20px',
            padding: '4px 10px',
            color: 'rgba(255,255,255,0.7)',
            fontSize: '11px',
            fontWeight: '600',
            letterSpacing: '0.5px',
          }}>
            REKLAM
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/>
              <text x="12" y="16" textAnchor="middle" fontSize="14" fill="currentColor">i</text>
            </svg>
          </div>

          {/* Üst alan: Reklam görseli / banner alanı — ekranın %60'ı */}
          <div style={{
            flex: '0 0 60%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(180deg, #1a1a2e 0%, #0f3460 100%)',
            overflow: 'hidden',
            position: 'relative',
          }}>
            {/* Native banner buraya overlay olarak binecek */}
            {!adLoaded && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px',
                color: 'rgba(255,255,255,0.25)',
                animation: 'pulse 2s ease-in-out infinite',
              }}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <path d="M8 21h8M12 17v4" />
                </svg>
                <span style={{ fontSize: '13px', letterSpacing: '1px' }}>Yükleniyor...</span>
              </div>
            )}
          </div>

          {/* Alt alan: Başlık + açıklama + buton — örnekteki gibi */}
          <div style={{
            flex: 1,
            background: '#000',
            padding: '20px 16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}>
            {/* Reklam bilgi alanı */}
            <div>
              <div style={{
                color: '#fff',
                fontSize: '22px',
                fontWeight: '700',
                lineHeight: '1.3',
                marginBottom: '8px',
              }}>
                Sponsorlu İçerik
              </div>
              <div style={{
                color: 'rgba(255,255,255,0.5)',
                fontSize: '14px',
                lineHeight: '1.4',
              }}>
                Bu bir reklam kartıdır. Kaydırarak bir sonraki içeriğe geçebilirsiniz.
              </div>
            </div>

            {/* Alt butonlar — örnekteki gibi kaydır aksiyonları */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '20px',
              paddingBottom: '16px',
            }}>
              {/* Geri al */}
              <button onClick={() => onSkip?.()} style={{
                width: '52px', height: '52px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.08)', border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffb74d" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M3 12a9 9 0 1 0 9-9M3 12l4-4M3 12l4 4" />
                </svg>
              </button>

              {/* Geç (X) */}
              <button onClick={() => onNext?.()} style={{
                width: '64px', height: '64px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)', border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ff5252" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>

              {/* İleri */}
              <button onClick={() => onNext?.()} style={{
                width: '52px', height: '52px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.08)', border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4fc3f7" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdCard

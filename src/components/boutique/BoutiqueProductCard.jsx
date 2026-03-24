import React from 'react'
import { FEATURES } from '../../lib/features'
import { Browser } from '@capacitor/browser'
import BoutiqueReviews from './BoutiqueReviews'

const BoutiqueProductCard = ({ outfit, currentUserId, onUserTap }) => {
  if (!FEATURES.BOUTIQUE_ACCOUNTS) return null

  const media = (outfit.outfit_media || []).sort((a, b) => a.sort_order - b.sort_order)
  const mainImage = media[0]?.media_url || ''

  const handleGoToProduct = async () => {
    if (!outfit.product_url) return
    await Browser.open({ url: outfit.product_url })
  }

  return (
    <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
      {/* Mağaza rozeti */}
      <div style={{ position: 'relative' }}>
        <img src={mainImage} alt={outfit.caption} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover' }} />
        <div style={{
          position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.55)', color: 'white', fontSize: 10, fontWeight: 700,
          padding: '3px 10px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap'
        }}>
          🏪 MAĞAZA
        </div>
      </div>

      {/* Ürün bilgileri */}
      <div style={{ padding: '12px 14px' }}>
        <p style={{ fontWeight: 700, fontSize: 15, margin: '0 0 4px' }}>{outfit.caption}</p>
        {outfit.product_brand && (
          <p style={{ fontSize: 12, color: '#9CA3AF', margin: '0 0 8px' }}>{outfit.product_brand}</p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: '#1F2937' }}>
            {outfit.product_price ? `₺${outfit.product_price}` : ''}
          </span>
          {outfit.product_url && (
            <button
              onClick={handleGoToProduct}
              style={{
                background: '#f0786c', color: 'white', border: 'none',
                borderRadius: 20, padding: '8px 18px', fontWeight: 700,
                fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
              }}
            >
              🛍️ Ürüne Git
            </button>
          )}
        </div>
        {outfit.product_description && (
          <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 12px' }}>{outfit.product_description}</p>
        )}

        {/* Yıldız & Yorumlar */}
        <BoutiqueReviews boutiqueId={outfit.user_id} currentUserId={currentUserId} />
      </div>
    </div>
  )
}

export default BoutiqueProductCard

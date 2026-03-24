import React, { useState } from 'react'
import { FEATURES } from '../../lib/features'
import { supabase } from '../../lib/supabase'

/**
 * Hesap türü geçiş bileşeni.
 * Kişisel hesapla kayıt olunur, buradan butik/influencer'a geçiş yapılır.
 * Ödeme kesilirse account_type otomatik 'normal'e döner (webhook tarafından yönetilir).
 */
const BoutiqueUpgrade = ({ currentUser, session, onSuccess, onClose }) => {
  if (!FEATURES.BOUTIQUE_ACCOUNTS) return null

  const [selected, setSelected] = useState(null) // 'boutique' | 'influencer'
  const [boutiqueName, setBoutiqueName] = useState('')
  const [shopUrl, setShopUrl] = useState('')
  const [loading, setLoading] = useState(false)

  const plans = [
    {
      key: 'boutique',
      title: 'Butik Hesabı',
      price: '$15/ay',
      icon: '🏪',
      features: [
        'Kalıcı ürün paylaşımları',
        'Fiyat + ürün linki',
        'Affiliate link desteği',
        '30 boost/ay',
        'Takipçi sistemi',
        'Yıldız & yorum alma',
        'Keşfet sayfasında mağaza bölümü',
      ],
      noFeatures: ['Görev sistemi yok', 'XP/Level yok'],
    },
    {
      key: 'influencer',
      title: 'Influencer Hesabı',
      price: '$15/ay',
      icon: '👑',
      features: [
        'Kalıcı paylaşımlar',
        'Affiliate link desteği',
        '30 boost/ay',
        'Takipçi sistemi',
        'Görev sistemi & XP',
      ],
      noFeatures: ['Fiyat/ürün linki yok'],
    },
  ]

  const handleUpgrade = async () => {
    if (!selected) return
    if (selected === 'boutique' && !boutiqueName.trim()) {
      alert('Mağaza adı zorunlu.')
      return
    }
    setLoading(true)
    try {
      // TODO: Satın alma akışı (App Store / Play Store $15/ay subscription)
      // Başarılı satın almadan sonra account_type güncellenir
      const updates = {
        account_type: selected,
        ...(selected === 'boutique' && { boutique_name: boutiqueName.trim() }),
        ...(shopUrl.trim() && { shop_url: shopUrl.trim() }),
      }
      const { error } = await supabase.from('profiles').update(updates).eq('id', session.user.id)
      if (error) throw error
      onSuccess?.()
    } catch (err) {
      alert('Geçiş yapılamadı: ' + (err.message || err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'white', zIndex: 1100, overflowY: 'auto', padding: '20px 16px 100px' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#6B7280' }}>←</button>
        <h2 style={{ flex: 1, textAlign: 'center', margin: 0, fontSize: 18, fontWeight: 700 }}>Hesap Türünü Seç</h2>
        <div style={{ width: 36 }} />
      </div>

      <p style={{ textAlign: 'center', color: '#6B7280', fontSize: 14, marginBottom: 24 }}>
        Kişisel hesabınla devam edebilir veya aşağıdaki hesap türlerinden birine geçiş yapabilirsin.
      </p>

      {/* Plan kartları */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
        {plans.map(plan => (
          <div
            key={plan.key}
            onClick={() => setSelected(plan.key)}
            style={{
              border: `2px solid ${selected === plan.key ? '#f0786c' : '#E5E7EB'}`,
              borderRadius: 16, padding: 16, cursor: 'pointer',
              background: selected === plan.key ? '#FFF5F4' : 'white',
              transition: 'all 0.2s'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 22 }}>{plan.icon}</span>
                <span style={{ fontWeight: 700, fontSize: 16 }}>{plan.title}</span>
              </div>
              <span style={{ fontWeight: 800, fontSize: 16, color: '#f0786c' }}>{plan.price}</span>
            </div>
            <ul style={{ margin: 0, padding: '0 0 0 18px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {plan.features.map(f => (
                <li key={f} style={{ fontSize: 13, color: '#374151' }}>✅ {f}</li>
              ))}
              {plan.noFeatures.map(f => (
                <li key={f} style={{ fontSize: 13, color: '#9CA3AF' }}>❌ {f}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Butik seçilince ek alanlar */}
      {selected === 'boutique' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          <div>
            <label style={{ fontWeight: 600, fontSize: 13, display: 'block', marginBottom: 6 }}>
              Mağaza Adı <span style={{ color: '#f0786c' }}>*</span>
            </label>
            <input
              value={boutiqueName}
              onChange={e => setBoutiqueName(e.target.value)}
              placeholder="örn. Aura Boutique"
              style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 10, padding: '10px 12px', fontSize: 15, boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ fontWeight: 600, fontSize: 13, display: 'block', marginBottom: 6 }}>
              Mağaza Web Sitesi (isteğe bağlı)
            </label>
            <input
              value={shopUrl}
              onChange={e => setShopUrl(e.target.value)}
              placeholder="https://maganiz.com"
              style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 10, padding: '10px 12px', fontSize: 15, boxSizing: 'border-box' }}
            />
          </div>
        </div>
      )}

      <p style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center', marginBottom: 16 }}>
        Abonelik iptal edildiğinde hesabın otomatik olarak normal hesaba dönecektir.
      </p>

      <button
        onClick={handleUpgrade}
        disabled={!selected || loading}
        style={{
          width: '100%', background: selected && !loading ? '#f0786c' : '#E5E7EB',
          color: selected && !loading ? 'white' : '#9CA3AF',
          border: 'none', borderRadius: 24, padding: 14,
          fontSize: 16, fontWeight: 700, cursor: selected ? 'pointer' : 'default'
        }}
      >
        {loading ? 'İşleniyor...' : selected ? `${plans.find(p => p.key === selected)?.title}'na Geç` : 'Bir Plan Seç'}
      </button>
    </div>
  )
}

export default BoutiqueUpgrade

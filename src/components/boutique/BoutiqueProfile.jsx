import React, { useState, useEffect } from 'react'
import { FEATURES } from '../../lib/features'
import { supabase } from '../../lib/supabase'
import BoutiqueReviews from './BoutiqueReviews'
import { Browser } from '@capacitor/browser'

/**
 * Butik profil sayfası.
 * account_type = 'boutique' olan kullanıcıların profil sayfası bu component'i render eder.
 * Ödeme kesilirse account_type = 'normal' olur, bu component render edilmez.
 */
const BoutiqueProfile = ({ boutiqueUser, currentUser, session, onBack }) => {
  if (!FEATURES.BOUTIQUE_ACCOUNTS) return null

  const [products, setProducts] = useState([])
  const [stats, setStats] = useState({ total_products: 0, total_followers: 0, avg_rating: null, review_count: 0 })
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(true)

  const isOwnProfile = session?.user?.id === boutiqueUser?.id

  useEffect(() => {
    if (!boutiqueUser?.id) return
    fetchData()
  }, [boutiqueUser?.id])

  const fetchData = async () => {
    setLoading(true)
    const [productsRes, statsRes, followRes] = await Promise.all([
      supabase.from('outfits')
        .select('*, outfit_media(*)')
        .eq('user_id', boutiqueUser.id)
        .eq('is_boutique_product', true)
        .order('created_at', { ascending: false }),

      supabase.from('boutique_stats')
        .select('*')
        .eq('boutique_id', boutiqueUser.id)
        .single(),

      currentUser?.id
        ? supabase.from('followers').select('id').eq('follower_id', currentUser.id).eq('following_id', boutiqueUser.id).single()
        : Promise.resolve({ data: null })
    ])
    setProducts(productsRes.data || [])
    if (statsRes.data) setStats(statsRes.data)
    setIsFollowing(!!followRes.data)
    setLoading(false)
  }

  const handleFollow = async () => {
    if (!currentUser?.id) return
    if (isFollowing) {
      await supabase.from('followers').delete().eq('follower_id', currentUser.id).eq('following_id', boutiqueUser.id)
      setIsFollowing(false)
      setStats(s => ({ ...s, total_followers: Math.max(0, s.total_followers - 1) }))
    } else {
      await supabase.from('followers').insert({ follower_id: currentUser.id, following_id: boutiqueUser.id })
      setIsFollowing(true)
      setStats(s => ({ ...s, total_followers: s.total_followers + 1 }))
    }
  }

  const getMainImage = (outfit) => {
    const media = (outfit.outfit_media || []).sort((a, b) => a.sort_order - b.sort_order)
    return media[0]?.media_url || ''
  }

  return (
    <div style={{ background: '#FAF9F8', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px', background: 'white', borderBottom: '1px solid #F3F4F6' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#374151' }}>←</button>
        <h2 style={{ flex: 1, textAlign: 'center', margin: 0, fontSize: 17, fontWeight: 700 }}>
          {boutiqueUser?.boutique_name || boutiqueUser?.full_name}
        </h2>
        <div style={{ width: 36 }} />
      </div>

      {/* Profil bilgileri */}
      <div style={{ background: 'white', padding: '24px 16px 20px', textAlign: 'center', marginBottom: 12 }}>
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: 12 }}>
          <img
            src={boutiqueUser?.avatar_url || ''}
            alt=""
            style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover', border: '3px solid #F59E0B', background: '#E5E7EB' }}
          />
        </div>
        {/* VERIFIED BOUTIQUE rozeti */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#FFFBEB', border: '1px solid #F59E0B', borderRadius: 20, padding: '4px 12px', marginBottom: 10 }}>
          <span style={{ fontSize: 14 }}>🏆</span>
          <span style={{ fontSize: 11, fontWeight: 800, color: '#D97706', letterSpacing: 0.5 }}>VERIFIED BOUTIQUE</span>
        </div>

        <h2 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 800 }}>{boutiqueUser?.boutique_name || boutiqueUser?.full_name}</h2>
        {boutiqueUser?.bio && <p style={{ margin: '0 0 16px', fontSize: 14, color: '#6B7280' }}>{boutiqueUser.bio}</p>}

        {/* İstatistikler */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginBottom: 16 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 800, fontSize: 18 }}>{stats.total_followers >= 1000 ? (stats.total_followers / 1000).toFixed(1) + 'K' : stats.total_followers}</div>
            <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>TAKİPÇİ</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 800, fontSize: 18 }}>{stats.total_products}</div>
            <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>ÜRÜN</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 800, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
              {stats.avg_rating || '—'} <span style={{ color: '#F59E0B', fontSize: 16 }}>★</span>
            </div>
            <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>PUAN</div>
          </div>
        </div>

        {/* Butonlar — kendi profilinde gösterme */}
        {!isOwnProfile && (
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => {/* chat açılacak */}}
              style={{ flex: 1, background: 'white', border: '1.5px solid #E5E7EB', borderRadius: 24, padding: '10px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
            >
              Mesaj Gönder
            </button>
            <button
              onClick={handleFollow}
              style={{ flex: 1, background: isFollowing ? '#F3F4F6' : '#f0786c', color: isFollowing ? '#374151' : 'white', border: 'none', borderRadius: 24, padding: '10px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
            >
              {isFollowing ? 'Takip Ediliyor' : 'Takip Et'}
            </button>
          </div>
        )}
      </div>

      {/* Ürünler grid */}
      <div style={{ padding: '0 12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Yeni Gelenler</h3>
        </div>
        {loading ? (
          <p style={{ textAlign: 'center', color: '#9CA3AF', padding: 32 }}>Yükleniyor...</p>
        ) : products.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#9CA3AF', padding: 32 }}>Henüz ürün yok</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {products.map(product => (
              <ProductGridCard key={product.id} product={product} getMainImage={getMainImage} />
            ))}
          </div>
        )}
      </div>

      {/* Mağaza yorumları */}
      <div style={{ background: 'white', margin: '16px 0 0', padding: '16px' }}>
        <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700 }}>Değerlendirmeler</h3>
        <BoutiqueReviews boutiqueId={boutiqueUser?.id} currentUserId={currentUser?.id} />
      </div>

      <div style={{ height: 80 }} />
    </div>
  )
}

const ProductGridCard = ({ product, getMainImage }) => {
  const handleGoToProduct = async () => {
    if (!product.product_url) return
    const { Browser } = await import('@capacitor/browser')
    await Browser.open({ url: product.product_url })
  }

  return (
    <div style={{ background: 'white', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.07)' }}>
      <img src={getMainImage(product)} alt={product.caption} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover' }} />
      <div style={{ padding: '10px 10px 12px' }}>
        <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: 13, lineHeight: 1.3 }}>{product.caption}</p>
        {product.product_price && (
          <p style={{ margin: '0 0 8px', fontWeight: 800, fontSize: 15, color: '#1F2937' }}>₺{product.product_price}</p>
        )}
        <button
          onClick={handleGoToProduct}
          style={{ width: '100%', background: '#f0786c', color: 'white', border: 'none', borderRadius: 20, padding: '7px 0', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}
        >
          🛍️ Ürüne Git
        </button>
      </div>
    </div>
  )
}

export default BoutiqueProfile

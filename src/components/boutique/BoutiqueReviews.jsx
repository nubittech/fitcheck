import React, { useState, useEffect } from 'react'
import { FEATURES } from '../../lib/features'
import { supabase } from '../../lib/supabase'

if (!FEATURES.BOUTIQUE_REVIEWS) {
  // pasif — hiçbir şey render edilmez
}

const StarRating = ({ value, onChange, readonly = false }) => {
  const [hover, setHover] = useState(0)
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          onClick={() => !readonly && onChange?.(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          style={{
            fontSize: readonly ? 16 : 28,
            cursor: readonly ? 'default' : 'pointer',
            color: star <= (hover || value) ? '#F59E0B' : '#D1D5DB',
            transition: 'color 0.15s'
          }}
        >★</span>
      ))}
    </div>
  )
}

const BoutiqueReviews = ({ boutiqueId, currentUserId }) => {
  const [reviews, setReviews] = useState([])
  const [avgRating, setAvgRating] = useState(0)
  const [myRating, setMyRating] = useState(0)
  const [myComment, setMyComment] = useState('')
  const [myExisting, setMyExisting] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    if (!boutiqueId) return
    fetchReviews()
  }, [boutiqueId])

  const fetchReviews = async () => {
    const { data } = await supabase
      .from('boutique_reviews')
      .select('*, profiles:user_id(full_name, avatar_url)')
      .eq('boutique_id', boutiqueId)
      .order('created_at', { ascending: false })
    if (data) {
      setReviews(data)
      const avg = data.length ? data.reduce((s, r) => s + r.rating, 0) / data.length : 0
      setAvgRating(Math.round(avg * 10) / 10)
      const mine = data.find(r => r.user_id === currentUserId)
      if (mine) { setMyExisting(mine); setMyRating(mine.rating); setMyComment(mine.comment || '') }
    }
  }

  const handleSubmit = async () => {
    if (!myRating) return
    setSubmitting(true)
    if (myExisting) {
      await supabase.from('boutique_reviews').update({ rating: myRating, comment: myComment }).eq('id', myExisting.id)
    } else {
      await supabase.from('boutique_reviews').insert({ boutique_id: boutiqueId, user_id: currentUserId, rating: myRating, comment: myComment })
    }
    setSubmitting(false)
    setShowForm(false)
    fetchReviews()
  }

  if (!FEATURES.BOUTIQUE_REVIEWS) return null

  return (
    <div style={{ padding: '16px 0' }}>
      {/* Ortalama puan */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 28, fontWeight: 700 }}>{avgRating || '—'}</span>
        <div>
          <StarRating value={Math.round(avgRating)} readonly />
          <span style={{ fontSize: 12, color: '#9CA3AF' }}>{reviews.length} değerlendirme</span>
        </div>
        {currentUserId && (
          <button
            onClick={() => setShowForm(v => !v)}
            style={{ marginLeft: 'auto', background: '#f0786c', color: 'white', border: 'none', borderRadius: 20, padding: '6px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          >
            {myExisting ? 'Düzenle' : 'Puan Ver'}
          </button>
        )}
      </div>

      {/* Puan verme formu */}
      {showForm && (
        <div style={{ background: '#FAF9F8', borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <StarRating value={myRating} onChange={setMyRating} />
          <textarea
            value={myComment}
            onChange={e => setMyComment(e.target.value)}
            placeholder="Yorumunuzu yazın... (isteğe bağlı)"
            rows={3}
            style={{ width: '100%', marginTop: 10, border: '1px solid #E5E7EB', borderRadius: 8, padding: 10, fontSize: 14, resize: 'none', boxSizing: 'border-box' }}
          />
          <button
            onClick={handleSubmit}
            disabled={!myRating || submitting}
            style={{ marginTop: 8, background: myRating ? '#f0786c' : '#E5E7EB', color: myRating ? 'white' : '#9CA3AF', border: 'none', borderRadius: 20, padding: '8px 20px', fontWeight: 600, cursor: myRating ? 'pointer' : 'default', width: '100%' }}
          >
            {submitting ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      )}

      {/* Yorumlar listesi */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {reviews.map(r => (
          <div key={r.id} style={{ display: 'flex', gap: 10 }}>
            <img
              src={r.profiles?.avatar_url || ''}
              alt=""
              style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, background: '#E5E7EB' }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 600, fontSize: 13 }}>{r.profiles?.full_name || 'Kullanıcı'}</span>
                <StarRating value={r.rating} readonly />
              </div>
              {r.comment && <p style={{ margin: '4px 0 0', fontSize: 13, color: '#4B5563' }}>{r.comment}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default BoutiqueReviews

import React, { useState, useRef } from 'react'
import { FEATURES } from '../../lib/features'
import { createOutfit, uploadMedia, insertOutfitMedia, trackAction } from '../../lib/api'
import { STYLE_TYPES } from '../../constants/styleTypes'
import imageCompression from 'browser-image-compression'

const BoutiqueNewProduct = ({ onClose, currentUser, session, onOutfitCreated }) => {
  if (!FEATURES.BOUTIQUE_ACCOUNTS) return null

  const [mediaFiles, setMediaFiles] = useState([])
  const [caption, setCaption] = useState('')
  const [price, setPrice] = useState('')
  const [productUrl, setProductUrl] = useState('')
  const [brand, setBrand] = useState('')
  const [sizes, setSizes] = useState('')
  const [description, setDescription] = useState('')
  const [selectedStyle, setSelectedStyle] = useState('Minimalist')
  const [styleOpen, setStyleOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [urlError, setUrlError] = useState('')
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    // 1 zorunlu + 3 ek = maks 4, 1 video
    if (mediaFiles.length + files.length > 4) {
      alert('En fazla 4 dosya (1 video + 3 görsel) ekleyebilirsin.')
      return
    }
    const newMedia = files.map(file => ({
      id: Date.now() + Math.random(),
      file,
      type: file.type.startsWith('video/') ? 'video' : 'image',
      preview: URL.createObjectURL(file)
    }))
    setMediaFiles(prev => [...prev, ...newMedia])
    e.target.value = ''
  }

  const removeMedia = (id) => {
    setMediaFiles(prev => {
      const item = prev.find(m => m.id === id)
      if (item) URL.revokeObjectURL(item.preview)
      return prev.filter(m => m.id !== id)
    })
  }

  const validateUrl = (url) => {
    if (!url) return ''
    try { new URL(url); return '' }
    catch { return 'Geçerli bir URL girin (https://...)' }
  }

  const handleSubmit = async () => {
    if (!caption.trim()) { alert('Ürün başlığı zorunlu.'); return }
    if (!price || isNaN(Number(price))) { alert('Geçerli bir fiyat girin.'); return }
    if (!productUrl.trim()) { alert('Ürün linki zorunlu.'); return }
    if (mediaFiles.length === 0) { alert('En az 1 ürün görseli ekleyin.'); return }
    const err = validateUrl(productUrl)
    if (err) { setUrlError(err); return }

    setSubmitting(true)
    try {
      const { data: outfit, error } = await createOutfit({
        userId: session.user.id,
        caption: caption.trim(),
        postType: 'single',
        style: selectedStyle,
        gender: 'unisex',
        ageRange: [0, 99],
        isBoutiqueProduct: true,
        productPrice: parseFloat(price),
        productUrl: productUrl.trim(),
        productBrand: brand.trim() || null,
        productSizes: sizes.trim() || null,
        productDescription: description.trim() || null,
      })
      if (error) throw error

      for (let i = 0; i < mediaFiles.length; i++) {
        const mf = mediaFiles[i]
        let fileToUpload = mf.file
        if (mf.type === 'image') {
          fileToUpload = await imageCompression(mf.file, { maxSizeMB: 1, maxWidthOrHeight: 1080 })
        }
        const ext = mf.type === 'video' ? 'mp4' : 'jpg'
        const path = `${session.user.id}/${outfit.id}_${i}.${ext}`
        const { data: uploaded } = await uploadMedia(path, fileToUpload, mf.type === 'video' ? 'video/mp4' : 'image/jpeg')
        if (uploaded) await insertOutfitMedia(outfit.id, uploaded.url, mf.type, i)
      }

      await trackAction(session.user.id, 'post_outfit').catch(() => {})
      onOutfitCreated?.()
      onClose()
    } catch (err) {
      alert('Ürün paylaşılamadı: ' + (err.message || err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'white', zIndex: 1000, overflowY: 'auto', padding: '20px 16px 100px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 16, color: '#6B7280', cursor: 'pointer' }}>İptal</button>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Ürün Paylaş</h2>
        <div style={{ width: 48 }} />
      </div>

      {/* Görsel yükleme */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontWeight: 600, fontSize: 13, color: '#374151', display: 'block', marginBottom: 8 }}>
          Ürün Görselleri <span style={{ color: '#f0786c' }}>*</span>
          <span style={{ fontWeight: 400, color: '#9CA3AF' }}> (maks 4, 1 video)</span>
        </label>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {mediaFiles.map((mf, i) => (
            <div key={mf.id} style={{ position: 'relative', width: 80, height: 80 }}>
              {mf.type === 'video'
                ? <video src={mf.preview} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 10 }} />
                : <img src={mf.preview} alt="" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 10 }} />
              }
              {i === 0 && (
                <div style={{ position: 'absolute', bottom: 4, left: 4, background: '#f0786c', color: 'white', fontSize: 9, fontWeight: 700, padding: '2px 5px', borderRadius: 6 }}>ANA</div>
              )}
              <button onClick={() => removeMedia(mf.id)} style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: 20, height: 20, color: 'white', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            </div>
          ))}
          {mediaFiles.length < 4 && (
            <button onClick={() => fileInputRef.current?.click()} style={{ width: 80, height: 80, border: '2px dashed #f0786c', borderRadius: 10, background: '#FFF5F4', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: '#f0786c' }}>+</button>
          )}
        </div>
        <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple style={{ display: 'none' }} onChange={handleFileChange} />
      </div>

      {/* Ürün başlığı */}
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontWeight: 600, fontSize: 13, color: '#374151', display: 'block', marginBottom: 6 }}>Ürün Başlığı <span style={{ color: '#f0786c' }}>*</span></label>
        <input value={caption} onChange={e => setCaption(e.target.value)} placeholder="örn. Vintage Deri Ceket" maxLength={120}
          style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 10, padding: '10px 12px', fontSize: 15, boxSizing: 'border-box' }} />
      </div>

      {/* Fiyat */}
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontWeight: 600, fontSize: 13, color: '#374151', display: 'block', marginBottom: 6 }}>Fiyat (₺) <span style={{ color: '#f0786c' }}>*</span></label>
        <input value={price} onChange={e => setPrice(e.target.value)} placeholder="örn. 450" type="number" min="0"
          style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 10, padding: '10px 12px', fontSize: 15, boxSizing: 'border-box' }} />
      </div>

      {/* Ürün linki */}
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontWeight: 600, fontSize: 13, color: '#374151', display: 'block', marginBottom: 6 }}>Ürün Linki <span style={{ color: '#f0786c' }}>*</span></label>
        <input value={productUrl} onChange={e => { setProductUrl(e.target.value); setUrlError(validateUrl(e.target.value)) }} placeholder="https://..."
          style={{ width: '100%', border: `1px solid ${urlError ? '#f0786c' : '#E5E7EB'}`, borderRadius: 10, padding: '10px 12px', fontSize: 15, boxSizing: 'border-box' }} />
        {urlError && <p style={{ color: '#f0786c', fontSize: 12, margin: '4px 0 0' }}>{urlError}</p>}
      </div>

      {/* İsteğe bağlı alanlar */}
      <details style={{ marginBottom: 14 }}>
        <summary style={{ fontWeight: 600, fontSize: 14, color: '#374151', cursor: 'pointer', marginBottom: 10 }}>Ürün Bilgileri (isteğe bağlı)</summary>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
          <input value={brand} onChange={e => setBrand(e.target.value)} placeholder="Marka" style={{ border: '1px solid #E5E7EB', borderRadius: 10, padding: '10px 12px', fontSize: 14 }} />
          <input value={sizes} onChange={e => setSizes(e.target.value)} placeholder="Bedenler (örn. XS, S, M, L, XL)" style={{ border: '1px solid #E5E7EB', borderRadius: 10, padding: '10px 12px', fontSize: 14 }} />
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Ürün açıklaması..." rows={3}
            style={{ border: '1px solid #E5E7EB', borderRadius: 10, padding: '10px 12px', fontSize: 14, resize: 'none' }} />
        </div>
      </details>

      {/* Stil seçimi */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ fontWeight: 600, fontSize: 13, color: '#374151', display: 'block', marginBottom: 8 }}>Stil</label>
        <button onClick={() => setStyleOpen(v => !v)} style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 10, padding: '10px 12px', fontSize: 14, background: 'white', textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
          <span>{selectedStyle}</span><span>{styleOpen ? '▲' : '▼'}</span>
        </button>
        {styleOpen && (
          <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, marginTop: 4, maxHeight: 200, overflowY: 'auto' }}>
            {STYLE_TYPES.map(s => (
              <div key={s} onClick={() => { setSelectedStyle(s); setStyleOpen(false) }}
                style={{ padding: '10px 14px', cursor: 'pointer', fontWeight: selectedStyle === s ? 700 : 400, background: selectedStyle === s ? '#FFF5F4' : 'white', color: selectedStyle === s ? '#f0786c' : '#374151' }}>
                {s}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Paylaş butonu */}
      <button
        onClick={handleSubmit}
        disabled={submitting}
        style={{ width: '100%', background: submitting ? '#E5E7EB' : '#f0786c', color: submitting ? '#9CA3AF' : 'white', border: 'none', borderRadius: 24, padding: '14px', fontSize: 16, fontWeight: 700, cursor: submitting ? 'default' : 'pointer' }}
      >
        {submitting ? 'Paylaşılıyor...' : 'Ürünü Paylaş'}
      </button>
    </div>
  )
}

export default BoutiqueNewProduct

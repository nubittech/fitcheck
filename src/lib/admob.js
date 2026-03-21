import { AdMob } from '@capacitor-community/admob'
import { Capacitor } from '@capacitor/core'

const IS_TEST = import.meta.env.DEV
let initialized = false

export async function initAdMob() {
  if (!Capacitor.isNativePlatform()) return
  if (initialized) return

  try {
    // Timeout ile sarmalayarak native crash'leri önle
    const initPromise = AdMob.initialize({
      requestTrackingAuthorization: true,
      testingDevices: [],
      initializeForTesting: IS_TEST,
    })
    // 5 saniye timeout — native crash'i önlemek için
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('AdMob init timeout')), 5000)
    )
    await Promise.race([initPromise, timeoutPromise])
    initialized = true
    console.log('[AdMob] Initialized successfully')
  } catch (e) {
    console.warn('[AdMob] Init skipped:', e?.message || e)
    // AdMob başarısız olsa bile uygulama çalışmaya devam etsin
  }
}

// Feed'e reklam kartları ekle — her AD_FREQUENCY post'ta bir
const AD_FREQUENCY = 7

export function insertAdCards(outfits) {
  if (!outfits || outfits.length < AD_FREQUENCY) return outfits

  const result = []
  for (let i = 0; i < outfits.length; i++) {
    result.push(outfits[i])
    // Her AD_FREQUENCY post'tan sonra bir reklam kartı ekle
    if ((i + 1) % AD_FREQUENCY === 0 && i < outfits.length - 1) {
      result.push({ id: `ad-${i}`, isAd: true })
    }
  }
  return result
}

// Boş — artık AdCard kendi banner'ını yönetiyor
export async function trackOutfitView() {}
export async function onTabChange() {}

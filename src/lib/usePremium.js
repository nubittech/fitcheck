import { useState, useCallback } from 'react'
import { Capacitor } from '@capacitor/core'
import { getOfferings, purchasePackage, restorePurchases, checkPremiumStatus } from './purchases'

/**
 * React hook for RevenueCat premium subscriptions.
 *
 * Returns:
 *   isPremium    – current premium status
 *   loading      – whether a purchase/restore is in progress
 *   handleUpgrade    – trigger paywall purchase flow
 *   handleRestore    – restore previous purchases
 *   refreshStatus    – re-check premium status from RevenueCat
 */
export function usePremium() {
    const [isPremium, setIsPremium] = useState(false)
    const [loading, setLoading] = useState(false)

    const refreshStatus = useCallback(async () => {
        const { isPremium: status } = await checkPremiumStatus()
        setIsPremium(status)
        return status
    }, [])

    const handleUpgrade = useCallback(async () => {
        setLoading(true)
        try {
            // MOCK PURCHASE FLOW FOR TESTING WITHOUT DEVELOPER ACCOUNT
            console.log('[usePremium] MOCK: Initiating fake purchase flow...')

            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 1500))

            // Persist premium status to Supabase
            const { Purchases } = await import('@revenuecat/purchases-capacitor')
            // We don't need RevenueCat for the mock, just update the DB
            const { supabase } = await import('./supabase')
            const { data: { session } } = await supabase.auth.getSession()
            if (session?.user?.id) {
                await supabase
                    .from('profiles')
                    .update({ is_premium: true, boosts_used: 0 })
                    .eq('id', session.user.id)
            }

            setIsPremium(true)
            alert('Premium abonelik başarıyla aktifleştirildi! 🎉')

            setLoading(false)
            return true

            /* ORIGINAL REVENUECAT CODE — uncomment when Apple Developer account is ready
            const offerings = await getOfferings()
            if (!offerings?.current?.availablePackages?.length) {
                alert('Şu anda mevcut paket bulunamadı.')
                setLoading(false)
                return false
            }
            const pkg = offerings.current.availablePackages[0]
            const result = await purchasePackage(pkg)
            if (result.cancelled) { setLoading(false); return false }
            if (result.isPremium) { setIsPremium(true); setLoading(false); return true }
            */
        } catch (err) {
            console.error('[usePremium] Purchase error:', err)
            alert('Satın alma sırasında bir hata oluştu.')
        }
        setLoading(false)
        return false
    }, [])

    const handleRestore = useCallback(async () => {
        if (!Capacitor.isNativePlatform()) {
            alert('Geri yükleme yalnızca mobil uygulamada kullanılabilir.')
            return false
        }

        setLoading(true)
        try {
            const result = await restorePurchases()
            setIsPremium(result.isPremium)
            if (result.isPremium) {
                alert('Premium üyeliğiniz başarıyla geri yüklendi!')
            } else {
                alert('Geri yüklenecek aktif abonelik bulunamadı.')
            }
            setLoading(false)
            return result.isPremium
        } catch (err) {
            console.error('[usePremium] Restore error:', err)
            alert('Geri yükleme sırasında bir hata oluştu.')
        }
        setLoading(false)
        return false
    }, [])

    return { isPremium, loading, handleUpgrade, handleRestore, refreshStatus }
}

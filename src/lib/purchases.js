/**
 * RevenueCat Purchases — Capacitor SDK wrapper
 *
 * Provides premium status checks, offerings retrieval,
 * purchasing, and restore functionality.
 */
import { Purchases, LOG_LEVEL } from '@revenuecat/purchases-capacitor';
import { Capacitor } from '@capacitor/core';

const API_KEY = import.meta.env.VITE_REVENUECAT_API_KEY || '';

let isConfigured = false;

/**
 * Initialize RevenueCat SDK.
 * Should be called once on app startup (only on native platforms).
 */
export async function initPurchases(userId) {
    if (!Capacitor.isNativePlatform()) {
        console.log('[Purchases] Skipping — not a native platform');
        return;
    }

    if (!API_KEY) {
        console.warn('[Purchases] No API key found. Set VITE_REVENUECAT_API_KEY in .env');
        return;
    }

    try {
        await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });

        const config = { apiKey: API_KEY };
        if (userId) {
            config.appUserID = userId;
        }

        await Purchases.configure(config);
        isConfigured = true;
        console.log('[Purchases] Configured successfully');
    } catch (err) {
        console.error('[Purchases] Configuration failed:', err);
    }
}

/**
 * Check if the current user has an active "premium" entitlement.
 * Returns { isPremium: boolean }
 */
export async function checkPremiumStatus() {
    if (!isConfigured) return { isPremium: false };

    try {
        const { customerInfo } = await Purchases.getCustomerInfo();
        const isPremium = typeof customerInfo.entitlements?.active?.premium !== 'undefined';
        return { isPremium, customerInfo };
    } catch (err) {
        console.error('[Purchases] Failed to get customer info:', err);
        return { isPremium: false };
    }
}

/**
 * Retrieve current offerings (available subscription packages).
 */
export async function getOfferings() {
    if (!isConfigured) return null;

    try {
        const { offerings } = await Purchases.getOfferings();
        return offerings;
    } catch (err) {
        console.error('[Purchases] Failed to get offerings:', err);
        return null;
    }
}

/**
 * Purchase a specific package.
 * @param {object} pkg — a package object from getOfferings()
 */
export async function purchasePackage(pkg) {
    if (!isConfigured) throw new Error('RevenueCat not configured');

    try {
        const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg });
        const isPremium = typeof customerInfo.entitlements?.active?.premium !== 'undefined';
        return { isPremium, customerInfo };
    } catch (err) {
        // User cancelled — not a real error
        if (err.code === 1 || err.userCancelled) {
            console.log('[Purchases] User cancelled purchase');
            return { cancelled: true };
        }
        throw err;
    }
}

/**
 * Restore previously purchased subscriptions.
 */
export async function restorePurchases() {
    if (!isConfigured) throw new Error('RevenueCat not configured');

    try {
        const { customerInfo } = await Purchases.restorePurchases();
        const isPremium = typeof customerInfo.entitlements?.active?.premium !== 'undefined';
        return { isPremium, customerInfo };
    } catch (err) {
        console.error('[Purchases] Restore failed:', err);
        throw err;
    }
}

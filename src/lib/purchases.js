/**
 * RevenueCat Purchases — Capacitor SDK wrapper
 *
 * Provides premium status checks, offerings retrieval,
 * purchasing, and restore functionality.
 */
import { Purchases, LOG_LEVEL } from '@revenuecat/purchases-capacitor';
import { Capacitor } from '@capacitor/core';

const API_KEY = import.meta.env.VITE_REVENUECAT_API_KEY || '';

let _initPromise = null;

/**
 * Initialize RevenueCat SDK.
 * Safe to call multiple times — returns the same promise if already in progress.
 */
export function initPurchases(userId) {
    if (_initPromise) return _initPromise;
    _initPromise = _doInit(userId);
    return _initPromise;
}

async function _doInit(userId) {
    if (!Capacitor.isNativePlatform()) {
        console.log('[Purchases] Skipping — not a native platform');
        return;
    }

    if (!API_KEY) {
        console.warn('[Purchases] No API key found. Set VITE_REVENUECAT_API_KEY in .env');
        return;
    }

    if (API_KEY.startsWith('test_')) {
        console.warn('[Purchases] Test API key detected — skipping init.');
        return;
    }

    try {
        // setLogLevel is CAPPluginReturnNone — ignore failures
        try { await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG }); } catch (_) {}

        const config = { apiKey: API_KEY };
        if (userId) config.appUserID = userId;

        // configure is CAPPluginReturnNone — resolves immediately on native
        await Purchases.configure(config);
        console.log('[Purchases] Configured successfully');
    } catch (err) {
        console.error('[Purchases] Configuration failed:', err);
    }
}

/** Ensures initPurchases has been called, then calls SDK directly */
async function _callSDK(fn) {
    if (!_initPromise) initPurchases();
    try { await _initPromise; } catch (_) { /* init failed, still try SDK */ }
    return fn();
}

/**
 * Check if the current user has an active "premium" entitlement.
 */
export async function checkPremiumStatus() {
    try {
        const { customerInfo } = await _callSDK(() => Purchases.getCustomerInfo());
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
    try {
        // RevenueCat Capacitor returns {all: {...}, current: {...}} directly — NOT wrapped in {offerings: ...}
        const result = await _callSDK(() => Purchases.getOfferings());
        return result;
    } catch (err) {
        console.error('[Purchases] Failed to get offerings:', err);
        return null;
    }
}

/**
 * Purchase a specific package.
 */
export async function purchasePackage(pkg) {
    try {
        const { customerInfo } = await _callSDK(() => Purchases.purchasePackage({ aPackage: pkg }));
        const isPremium = typeof customerInfo.entitlements?.active?.premium !== 'undefined';
        return { isPremium, customerInfo };
    } catch (err) {
        if (String(err.code) === '1' || err.userCancelled) {
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
    try {
        const { customerInfo } = await _callSDK(() => Purchases.restorePurchases());
        const isPremium = typeof customerInfo.entitlements?.active?.premium !== 'undefined';
        return { isPremium, customerInfo };
    } catch (err) {
        console.error('[Purchases] Restore failed:', err);
        throw err;
    }
}

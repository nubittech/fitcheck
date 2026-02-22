/**
 * FitCheck Affiliate Link Validator
 *
 * Detects whether a given URL is a legitimate affiliate / ref link
 * and rejects obviously fake or non-shopping URLs.
 */

// ── Known shopping domains (whitelist) ──────────────────────────────────────
// No affiliate params needed if the domain itself is a known retailer
const SHOPPING_DOMAINS = [
    // Turkish retailers
    'trendyol.com', 'hepsiburada.com', 'n11.com', 'gittigidiyor.com',
    'morhipo.com', 'boyner.com.tr', 'beymen.com', 'vakkorama.com',
    'lcwaikiki.com', 'mavi.com.tr', 'koton.com', 'kiğılı.com.tr',
    'defacto.com.tr', 'bershka.com', 'stradivarius.com', 'pullandbear.com',
    'zara.com', 'massimodutti.com',
    // Global retailers
    'amazon.com', 'amazon.com.tr', 'amazon.co.uk', 'amazon.de',
    'asos.com', 'farfetch.com', 'net-a-porter.com', 'matchesfashion.com',
    'mytheresa.com', 'ssense.com', 'nordstrom.com', 'hm.com',
    'uniqlo.com', 'stories.com', 'cos.com', 'weekday.com',
    // Affiliate networks / link tools
    'shopmy.us', 'ltk.com', 'liketoknow.it', 'rstyle.me',
    'shareasale.com', 'awin.com', 'linktr.ee',
]

// ── URL params that indicate a ref/affiliate link ────────────────────────────
const AFFILIATE_PARAMS = [
    'ref', 'aff', 'affiliate', 'tag', 'refcode', 'refid',
    'partner', 'source', 'src', 'utm_source', 'click_id',
    'aff_id', 'affid', 'coupon', 'referral', 'promo',
    'campaign', 'influencer', 'creator'
]

/**
 * @returns {{ valid: boolean, reason?: string }}
 */
export function validateAffiliateLink(raw) {
    if (!raw || typeof raw !== 'string') {
        return { valid: false, reason: 'empty' }
    }

    let url
    try {
        // Add protocol if missing
        const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`
        url = new URL(withProtocol)
    } catch {
        return { valid: false, reason: 'invalid_url' }
    }

    // Must be HTTPS
    if (url.protocol !== 'https:') {
        return { valid: false, reason: 'no_https' }
    }

    const hostname = url.hostname.toLowerCase().replace(/^www\./, '')

    // Block localhost / IPs
    if (
        hostname === 'localhost' ||
        /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname) ||
        !hostname.includes('.')
    ) {
        return { valid: false, reason: 'invalid_domain' }
    }

    // ── Pass 1: known shopping domain ─────────────────────────────────────────
    const isKnownShop = SHOPPING_DOMAINS.some(d =>
        hostname === d || hostname.endsWith(`.${d}`)
    )
    if (isKnownShop) {
        return { valid: true }
    }

    // ── Pass 2: has affiliate URL parameter ───────────────────────────────────
    const params = [...url.searchParams.keys()].map(k => k.toLowerCase())
    const hasAffParam = AFFILIATE_PARAMS.some(p => params.includes(p))
    if (hasAffParam) {
        return { valid: true }
    }

    // ── Pass 3: path contains affiliate keywords ───────────────────────────────
    const path = url.pathname.toLowerCase()
    if (/\/(ref|aff|affiliate|partner|influencer|creator)\//.test(path)) {
        return { valid: true }
    }

    return { valid: false, reason: 'not_affiliate' }
}

/**
 * Quick boolean check for UI disabling
 */
export function isValidAffiliateLink(raw) {
    return validateAffiliateLink(raw).valid
}

/**
 * Human-readable error message for each reason
 */
export function affiliateLinkError(reason, lang = 'tr') {
    const msgs = {
        tr: {
            empty: '',
            invalid_url: 'Geçersiz URL formatı',
            no_https: 'Link https:// ile başlamalı',
            invalid_domain: 'Geçersiz domain',
            not_affiliate: 'Bilinen bir mağaza veya ref parametresi bulunamadı',
        },
        en: {
            empty: '',
            invalid_url: 'Invalid URL format',
            no_https: 'Link must start with https://',
            invalid_domain: 'Invalid domain',
            not_affiliate: 'No known store or affiliate parameter detected',
        }
    }
    return msgs[lang]?.[reason] ?? msgs.en[reason] ?? ''
}

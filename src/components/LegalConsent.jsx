import React, { useState } from 'react'
import LegalPage from './LegalPage'
import { PRIVACY_POLICY, TERMS_OF_SERVICE, COMMUNITY_GUIDELINES } from './LegalContent'
import { useLang } from '../i18n/LangContext'
import '../styles/LegalConsent.css'

const LegalConsent = ({ onAccept }) => {
    const { t, lang } = useLang()
    const tr = lang === 'tr'

    const [termsChecked, setTermsChecked] = useState(false)
    const [privacyChecked, setPrivacyChecked] = useState(false)
    const [guidelinesChecked, setGuidelinesChecked] = useState(false)
    const [viewingDoc, setViewingDoc] = useState(null) // 'terms' | 'privacy' | 'guidelines'

    const allChecked = termsChecked && privacyChecked && guidelinesChecked

    if (viewingDoc === 'terms') {
        return <LegalPage title={tr ? 'Kullanım Koşulları' : 'Terms of Service'} content={TERMS_OF_SERVICE} onBack={() => setViewingDoc(null)} />
    }
    if (viewingDoc === 'privacy') {
        return <LegalPage title={tr ? 'Gizlilik Politikası' : 'Privacy Policy'} content={PRIVACY_POLICY} onBack={() => setViewingDoc(null)} />
    }
    if (viewingDoc === 'guidelines') {
        return <LegalPage title={tr ? 'Topluluk Kuralları' : 'Community Guidelines'} content={COMMUNITY_GUIDELINES} onBack={() => setViewingDoc(null)} />
    }

    return (
        <div className="legal-consent-page">
            <div className="legal-consent-container">
                <div className="legal-consent-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent, #E07A5F)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <path d="M9 15l2 2 4-4" />
                    </svg>
                </div>

                <h1 className="legal-consent-title">
                    {tr ? 'Devam etmeden önce' : 'Before you continue'}
                </h1>
                <p className="legal-consent-subtitle">
                    {tr
                        ? 'Uygulamayı kullanabilmek için aşağıdaki koşulları okumanız ve kabul etmeniz gerekmektedir.'
                        : 'Please read and accept the following policies to use the app.'}
                </p>

                <div className="legal-consent-items">
                    {/* Terms */}
                    <div className="legal-consent-row">
                        <label className="legal-checkbox" onClick={(e) => { e.preventDefault(); setTermsChecked(v => !v) }}>
                            <div className={`checkbox-box ${termsChecked ? 'checked' : ''}`}>
                                {termsChecked && (
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                )}
                            </div>
                        </label>
                        <span className="legal-consent-text">
                            <span className="legal-link" onClick={() => setViewingDoc('terms')}>
                                {tr ? 'Kullanım Koşullarını' : 'Terms of Service'}
                            </span>
                            {tr ? ' okudum ve kabul ediyorum.' : ' — I have read and accept.'}
                        </span>
                    </div>

                    {/* Privacy */}
                    <div className="legal-consent-row">
                        <label className="legal-checkbox" onClick={(e) => { e.preventDefault(); setPrivacyChecked(v => !v) }}>
                            <div className={`checkbox-box ${privacyChecked ? 'checked' : ''}`}>
                                {privacyChecked && (
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                )}
                            </div>
                        </label>
                        <span className="legal-consent-text">
                            <span className="legal-link" onClick={() => setViewingDoc('privacy')}>
                                {tr ? 'Gizlilik Politikasını' : 'Privacy Policy'}
                            </span>
                            {tr ? ' okudum ve kabul ediyorum.' : ' — I have read and accept.'}
                        </span>
                    </div>

                    {/* Guidelines */}
                    <div className="legal-consent-row">
                        <label className="legal-checkbox" onClick={(e) => { e.preventDefault(); setGuidelinesChecked(v => !v) }}>
                            <div className={`checkbox-box ${guidelinesChecked ? 'checked' : ''}`}>
                                {guidelinesChecked && (
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                )}
                            </div>
                        </label>
                        <span className="legal-consent-text">
                            <span className="legal-link" onClick={() => setViewingDoc('guidelines')}>
                                {tr ? 'Topluluk Kurallarını' : 'Community Guidelines'}
                            </span>
                            {tr ? ' okudum ve kabul ediyorum.' : ' — I have read and accept.'}
                        </span>
                    </div>
                </div>

                <button
                    className={`legal-consent-btn ${allChecked ? 'active' : ''}`}
                    disabled={!allChecked}
                    onClick={onAccept}
                >
                    {tr ? 'Devam Et' : 'Continue'}
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                </button>
            </div>
        </div>
    )
}

export default LegalConsent

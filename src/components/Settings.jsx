import React, { useState } from 'react'
import LegalPage from './LegalPage'
import { PRIVACY_POLICY, TERMS_OF_SERVICE, COMMUNITY_GUIDELINES } from './LegalContent'
import { useLang } from '../i18n/LangContext'
import '../styles/Settings.css'

const APP_VERSION = '1.0.0'

const Settings = ({ onClose, onLogout, currentUser, onUpgrade }) => {
  const { t, lang, toggleLang } = useLang()
  const [currentView, setCurrentView] = useState('main')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const isPremium = Boolean(currentUser?.is_premium)

  if (currentView === 'privacy') {
    return <LegalPage title={t('privacy')} content={PRIVACY_POLICY} onBack={() => setCurrentView('main')} />
  }
  if (currentView === 'terms') {
    return <LegalPage title={t('terms')} content={TERMS_OF_SERVICE} onBack={() => setCurrentView('main')} />
  }
  if (currentView === 'guidelines') {
    return <LegalPage title={t('guidelines')} content={COMMUNITY_GUIDELINES} onBack={() => setCurrentView('main')} />
  }

  return (
    <div className="settings-overlay">
      <div className="settings-page">
        <header className="settings-header">
          <button className="settings-back-btn" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <span className="settings-title">{t('settings')}</span>
          <div style={{ width: 32 }} />
        </header>

        <div className="settings-scroll">
          {/* Language */}
          <div className="settings-section">
            <span className="settings-section-label">{t('language')}</span>
            <div className="settings-item">
              <div className="settings-item-left">
                <div className="settings-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                  </svg>
                </div>
                <span>{lang === 'tr' ? 'Türkçe' : 'English'}</span>
              </div>
              <button
                onClick={toggleLang}
                style={{
                  background: 'var(--accent, #E07A5F)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '14px',
                  padding: '5px 14px',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                {lang === 'tr' ? 'EN' : 'TR'}
              </button>
            </div>
          </div>

          {/* Subscription */}
          <div className="settings-section">
            <span className="settings-section-label">{t('subscription')}</span>
            <div
              className="settings-item"
              onClick={!isPremium && onUpgrade ? onUpgrade : undefined}
              style={!isPremium && onUpgrade ? { cursor: 'pointer' } : undefined}
            >
              <div className="settings-item-left">
                <div className="settings-icon premium-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z" />
                  </svg>
                </div>
                <div className="settings-item-text">
                  <span>{t('current_plan')}</span>
                  <span className="settings-item-sub">{isPremium ? t('premium') : t('free')}</span>
                </div>
              </div>
              {!isPremium && <span className="settings-upgrade-badge">{t('upgrade')}</span>}
            </div>
          </div>

          {/* Legal */}
          <div className="settings-section">
            <span className="settings-section-label">{t('legal')}</span>

            <div className="settings-item" onClick={() => setCurrentView('terms')}>
              <div className="settings-item-left">
                <div className="settings-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                </div>
                <span>{t('terms')}</span>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
            </div>

            <div className="settings-item" onClick={() => setCurrentView('privacy')}>
              <div className="settings-item-left">
                <div className="settings-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <span>{t('privacy')}</span>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
            </div>

            <div className="settings-item" onClick={() => setCurrentView('guidelines')}>
              <div className="settings-item-left">
                <div className="settings-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <path d="M9 9h6v6H9z" />
                  </svg>
                </div>
                <span>{t('guidelines')}</span>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
            </div>
          </div>

          {/* Account */}
          <div className="settings-section">
            <span className="settings-section-label">{t('account')}</span>

            <button className="settings-danger-btn" onClick={() => setShowLogoutConfirm(true)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              {t('logout')}
            </button>

            <button className="settings-danger-btn delete" onClick={() => setShowDeleteConfirm(true)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
              </svg>
              {t('delete_account')}
            </button>
          </div>

          {/* App Info */}
          <div className="settings-app-info">
            <span className="settings-app-name">fitcheck</span>
            <span className="settings-app-version">Version {APP_VERSION}</span>
            <span className="settings-app-copy">Made with love in Istanbul</span>
          </div>
        </div>
      </div>

      {/* Logout Confirmation */}
      {showLogoutConfirm && (
        <div className="settings-modal-backdrop" onClick={() => setShowLogoutConfirm(false)}>
          <div className="settings-modal" onClick={e => e.stopPropagation()}>
            <div className="settings-modal-icon logout-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </div>
            <h3>{t('logout_confirm_title')}</h3>
            <p>{t('logout_confirm_msg')}</p>
            <div className="settings-modal-actions">
              <button className="modal-btn cancel" onClick={() => setShowLogoutConfirm(false)}>{t('cancel')}</button>
              <button className="modal-btn confirm" onClick={() => { setShowLogoutConfirm(false); onLogout(); }}>{t('logout')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation */}
      {showDeleteConfirm && (
        <div className="settings-modal-backdrop" onClick={() => setShowDeleteConfirm(false)}>
          <div className="settings-modal" onClick={e => e.stopPropagation()}>
            <div className="settings-modal-icon delete-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h3>{t('delete_confirm_title')}</h3>
            <p>{t('delete_confirm_msg')}</p>
            <div className="settings-modal-actions">
              <button className="modal-btn cancel" onClick={() => setShowDeleteConfirm(false)}>{t('keep_account')}</button>
              <button className="modal-btn confirm delete" onClick={() => { setShowDeleteConfirm(false); onLogout(); }}>{t('delete_forever')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Settings

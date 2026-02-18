import React, { useState } from 'react'
import '../styles/Settings.css'

const APP_VERSION = '1.0.0'

const Settings = ({ onClose, onLogout }) => {
  const [notifications, setNotifications] = useState(true)
  const [privateAccount, setPrivateAccount] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showCancelSub, setShowCancelSub] = useState(false)

  const isPremium = false // TODO: from user context

  return (
    <div className="settings-overlay">
      <div className="settings-page">
        {/* Header */}
        <header className="settings-header">
          <button className="settings-back-btn" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <span className="settings-title">Settings</span>
          <div style={{ width: 32 }} />
        </header>

        <div className="settings-scroll">
          {/* Account Section */}
          <div className="settings-section">
            <span className="settings-section-label">ACCOUNT</span>

            <div className="settings-item" onClick={() => {}}>
              <div className="settings-item-left">
                <div className="settings-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <span>Edit Profile</span>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            </div>

            <div className="settings-item" onClick={() => {}}>
              <div className="settings-item-left">
                <div className="settings-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0110 0v4"/>
                  </svg>
                </div>
                <span>Change Password</span>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            </div>

            <div className="settings-item">
              <div className="settings-item-left">
                <div className="settings-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </div>
                <span>Private Account</span>
              </div>
              <button className={`toggle-switch ${privateAccount ? 'on' : ''}`} onClick={() => setPrivateAccount(!privateAccount)}>
                <div className="toggle-knob" />
              </button>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="settings-section">
            <span className="settings-section-label">NOTIFICATIONS</span>

            <div className="settings-item">
              <div className="settings-item-left">
                <div className="settings-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 01-3.46 0"/>
                  </svg>
                </div>
                <span>Push Notifications</span>
              </div>
              <button className={`toggle-switch ${notifications ? 'on' : ''}`} onClick={() => setNotifications(!notifications)}>
                <div className="toggle-knob" />
              </button>
            </div>
          </div>

          {/* Subscription Section */}
          <div className="settings-section">
            <span className="settings-section-label">SUBSCRIPTION</span>

            <div className="settings-item">
              <div className="settings-item-left">
                <div className="settings-icon premium-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z"/>
                  </svg>
                </div>
                <div className="settings-item-text">
                  <span>Current Plan</span>
                  <span className="settings-item-sub">{isPremium ? 'Premium' : 'Free'}</span>
                </div>
              </div>
              {isPremium ? (
                <button className="settings-text-btn danger" onClick={() => setShowCancelSub(true)}>Cancel</button>
              ) : (
                <span className="settings-upgrade-badge">Upgrade</span>
              )}
            </div>

            {isPremium && (
              <div className="settings-item">
                <div className="settings-item-left">
                  <div className="settings-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                  </div>
                  <div className="settings-item-text">
                    <span>Renewal Date</span>
                    <span className="settings-item-sub">March 18, 2026</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Appearance */}
          <div className="settings-section">
            <span className="settings-section-label">APPEARANCE</span>

            <div className="settings-item">
              <div className="settings-item-left">
                <div className="settings-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
                  </svg>
                </div>
                <span>Dark Mode</span>
              </div>
              <button className={`toggle-switch ${darkMode ? 'on' : ''}`} onClick={() => setDarkMode(!darkMode)}>
                <div className="toggle-knob" />
              </button>
            </div>

            <div className="settings-item" onClick={() => {}}>
              <div className="settings-item-left">
                <div className="settings-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="2" y1="12" x2="22" y2="12"/>
                    <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
                  </svg>
                </div>
                <div className="settings-item-text">
                  <span>Language</span>
                  <span className="settings-item-sub">English</span>
                </div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          </div>

          {/* Legal Section */}
          <div className="settings-section">
            <span className="settings-section-label">LEGAL</span>

            <div className="settings-item" onClick={() => {}}>
              <div className="settings-item-left">
                <div className="settings-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10 9 9 9 8 9"/>
                  </svg>
                </div>
                <span>Terms of Service</span>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            </div>

            <div className="settings-item" onClick={() => {}}>
              <div className="settings-item-left">
                <div className="settings-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <path d="M9 9h6v6H9z"/>
                  </svg>
                </div>
                <span>Privacy Policy</span>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            </div>

            <div className="settings-item" onClick={() => {}}>
              <div className="settings-item-left">
                <div className="settings-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </div>
                <span>Community Guidelines</span>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            </div>

            <div className="settings-item" onClick={() => {}}>
              <div className="settings-item-left">
                <div className="settings-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
                    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
                  </svg>
                </div>
                <span>Open Source Licenses</span>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          </div>

          {/* Support */}
          <div className="settings-section">
            <span className="settings-section-label">SUPPORT</span>

            <div className="settings-item" onClick={() => {}}>
              <div className="settings-item-left">
                <div className="settings-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                </div>
                <span>Help Center</span>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            </div>

            <div className="settings-item" onClick={() => {}}>
              <div className="settings-item-left">
                <div className="settings-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </div>
                <span>Contact Us</span>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            </div>

            <div className="settings-item" onClick={() => {}}>
              <div className="settings-item-left">
                <div className="settings-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/>
                  </svg>
                </div>
                <span>Report a Problem</span>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="settings-section">
            <span className="settings-section-label">DANGER ZONE</span>

            <button className="settings-danger-btn" onClick={() => setShowLogoutConfirm(true)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Log Out
            </button>

            <button className="settings-danger-btn delete" onClick={() => setShowDeleteConfirm(true)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                <line x1="10" y1="11" x2="10" y2="17"/>
                <line x1="14" y1="11" x2="14" y2="17"/>
              </svg>
              Delete Account
            </button>
          </div>

          {/* App Info */}
          <div className="settings-app-info">
            <span className="settings-app-name">fitcheck</span>
            <span className="settings-app-version">Version {APP_VERSION} (Build 1)</span>
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
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </div>
            <h3>Log Out?</h3>
            <p>Are you sure you want to log out of your account?</p>
            <div className="settings-modal-actions">
              <button className="modal-btn cancel" onClick={() => setShowLogoutConfirm(false)}>Cancel</button>
              <button className="modal-btn confirm" onClick={() => { setShowLogoutConfirm(false); onLogout(); }}>Log Out</button>
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
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <h3>Delete Account?</h3>
            <p>This action is permanent and cannot be undone. All your data, outfits, and messages will be permanently deleted.</p>
            <div className="settings-modal-actions">
              <button className="modal-btn cancel" onClick={() => setShowDeleteConfirm(false)}>Keep Account</button>
              <button className="modal-btn confirm delete" onClick={() => { setShowDeleteConfirm(false); onLogout(); }}>Delete Forever</button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Subscription Confirmation */}
      {showCancelSub && (
        <div className="settings-modal-backdrop" onClick={() => setShowCancelSub(false)}>
          <div className="settings-modal" onClick={e => e.stopPropagation()}>
            <div className="settings-modal-icon premium-modal-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z"/>
              </svg>
            </div>
            <h3>Cancel Subscription?</h3>
            <p>You'll lose access to Premium features at the end of your billing period. Your content will remain but boost features will be disabled.</p>
            <div className="settings-modal-actions">
              <button className="modal-btn cancel" onClick={() => setShowCancelSub(false)}>Keep Premium</button>
              <button className="modal-btn confirm" onClick={() => setShowCancelSub(false)}>Cancel Plan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Settings

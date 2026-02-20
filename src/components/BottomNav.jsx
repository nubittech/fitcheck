import React from 'react'
import { useLang } from '../i18n/LangContext'
import '../styles/BottomNav.css'

const ICONS = {
  home: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  discover: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  add: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  inbox: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  profile: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

const BottomNav = ({ activeTab, onTabChange }) => {
  const { t } = useLang()

  const tabs = [
    { id: 'home', labelKey: 'nav_home', icon: ICONS.home },
    { id: 'discover', labelKey: 'nav_discover', icon: ICONS.discover },
    { id: 'add', labelKey: '', icon: ICONS.add },
    { id: 'inbox', labelKey: 'nav_inbox', icon: ICONS.inbox },
    { id: 'profile', labelKey: 'nav_profile', icon: ICONS.profile },
  ]

  return (
    <nav className="bottom-nav">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`nav-tab ${tab.id === activeTab ? 'active' : ''} ${tab.id === 'add' ? 'add-tab' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          <div className="nav-icon">{tab.icon}</div>
          {tab.labelKey && <span className="nav-label">{t(tab.labelKey)}</span>}
        </button>
      ))}
    </nav>
  )
}

export default BottomNav

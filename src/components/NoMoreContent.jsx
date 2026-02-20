import React from 'react'
import { useLang } from '../i18n/LangContext'
import '../styles/NoMoreContent.css'

const NoMoreContent = ({ onRefresh, onDiscover }) => {
  const { t } = useLang()
  return (
    <div className="no-content-page">
      <div className="no-content-card">
        <div className="no-content-icon">✓</div>
        <h2>{t('no_more_title')}</h2>
        <p>{t('no_more_sub')}</p>
        <button className="no-content-btn primary" onClick={onDiscover}>{t('go_discover')}</button>
        <button className="no-content-btn ghost" onClick={onRefresh}>{t('refresh')}</button>
      </div>
    </div>
  )
}

export default NoMoreContent

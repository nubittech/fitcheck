import React, { useState } from 'react'
import { signIn } from '../lib/auth'
import { useLang } from '../i18n/LangContext'
import '../styles/Login.css'

const Login = ({ onLogin, onGoSignUp }) => {
  const { t, lang } = useLang()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { data, error: authError } = await signIn({ email, password })
    setLoading(false)
    if (authError) {
      setError(
        authError.message === 'Invalid login credentials'
          ? (lang === 'tr' ? 'E-posta veya şifre hatalı.' : 'Wrong email or password.')
          : authError.message
      )
      return
    }
    onLogin(data.session)
  }

  return (
    <div className="login-page">
      <div className="login-hero">
        <div className="login-logo-wrap">
          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500"
            alt="closet"
            className="login-logo-bg"
          />
          <div className="login-logo-mark">
            <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 8l-3.3-6.6a2 2 0 0 0-3.4 0L6 8" />
              <path d="M6 8h10a2 2 0 0 1 2 2v1H4v-1a2 2 0 0 1 2-2z" />
            </svg>
          </div>
        </div>

        <h1>{lang === 'tr' ? 'Tekrar hoş geldin!' : 'Welcome back, friend'}</h1>
        <p>{lang === 'tr' ? 'Kombin topluluğun seni bekliyor.' : 'Your closet community is waiting.'}</p>
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
        <label className="login-field">
          <span className="field-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h16a2 2 0 0 1 2 2v1l-10 7L2 7V6a2 2 0 0 1 2-2zm18 6v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8l10 7 10-7z" /></svg>
          </span>
          <input
            type="email"
            placeholder={lang === 'tr' ? 'E-posta adresi' : 'Email address'}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label className="login-field">
          <span className="field-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M17 9h-1V7a4 4 0 0 0-8 0v2H7a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2zm-6 0V7a2 2 0 1 1 4 0v2h-4z" /></svg>
          </span>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder={t('password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="toggle-pass"
            onClick={() => setShowPassword(prev => !prev)}
            aria-label="Toggle password visibility"
          >
            {showPassword ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" /><circle cx="12" cy="12" r="3" /></svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C5 20 1 12 1 12a21.77 21.77 0 0 1 5.06-6.94" /><path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a21.8 21.8 0 0 1-3.17 4.52" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
            )}
          </button>
        </label>

        <button type="button" className="forgot-link">{t('forgot_password')}</button>

        {error && <p className="login-error" style={{ color: '#EF4444', fontSize: '13px', textAlign: 'center', marginBottom: '8px' }}>{error}</p>}

        <button type="submit" className="login-btn" disabled={loading}>
          {loading ? (lang === 'tr' ? 'Giriş yapılıyor...' : 'Logging in...') : t('login')}
        </button>
      </form>

      <p className="signup-row">
        {t('no_account')} <button type="button" onClick={onGoSignUp}>{t('signup')}</button>
      </p>
    </div>
  )
}

export default Login

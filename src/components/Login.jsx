import React, { useState, useEffect } from 'react'
import { signIn } from '../lib/auth'
import { supabase } from '../lib/supabase'
import { useLang } from '../i18n/LangContext'
import { Browser } from '@capacitor/browser'
import { Capacitor } from '@capacitor/core'
import veyloLogo from '../assets/veylo-logo.png'
import '../styles/Login.css'

const Login = ({ onLogin, onGoSignUp }) => {
  const { t, lang } = useLang()
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [lastEmail, setLastEmail] = useState('')

  const isAndroid = Capacitor.getPlatform() === 'android'

  useEffect(() => {
    const savedEmail = localStorage.getItem('last_login_email')
    if (savedEmail) {
      setLastEmail(savedEmail)
      setEmail(savedEmail)
    }
  }, [])

  const handleEmailLogin = async (e) => {
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
    // Save email for next time
    localStorage.setItem('last_login_email', email)
    onLogin(data.session)
  }

  const handleSocialLogin = async (provider) => {
    setLoading(true)
    setError('')
    try {
      if (Capacitor.isNativePlatform()) {
        // Native Apple Sign In Flow
        if (provider === 'apple') {
          const { SignInWithApple } = await import('@capacitor-community/apple-sign-in')
          const options = {
            clientId: 'com.nubittech.veylo',
            redirectURI: 'https://yxgatmrkuaxhlxhgwzsi.supabase.co/auth/v1/callback',
            scopes: 'email name',
            state: '12345',
            nonce: 'nonce',
          }
          const result = await SignInWithApple.authorize(options)
          if (result && result.response && result.response.identityToken) {
            console.log('[Apple Auth] Received identity token, exchanging with Supabase...')
            const { data, error: sbError } = await supabase.auth.signInWithIdToken({
              provider: 'apple',
              token: result.response.identityToken,
            })
            if (sbError) throw sbError
            setLoading(false)
            return // success
          } else {
            throw new Error('No identity token returned from Apple')
          }
        }

        // Other Providers (Google) via OAuth
        const redirectTo = 'com.fitcheck.app://callback'
        const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo,
            skipBrowserRedirect: true,
            queryParams: provider === 'google' ? {
              access_type: 'offline',
              prompt: 'consent'
            } : undefined
          }
        })
        if (oauthError) throw oauthError
        if (data?.url) {
          await Browser.open({ url: data.url, windowName: '_self' })
        }
      } else {
        const { error: oauthError } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: window.location.origin,
            queryParams: provider === 'google' ? {
              access_type: 'offline',
              prompt: 'consent'
            } : undefined
          }
        })
        if (oauthError) throw oauthError
      }
    } catch (err) {
      console.error('OAuth error:', err)
      setError(err.message || 'Login failed')
    }
    setLoading(false)
  }

  // Exact Match SVG Icons for the new design
  const AppleIcon = () => (
    <svg width="24" height="24" viewBox="0 0 384 512" fill="black">
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
    </svg>
  )

  const EmailIcon = () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect>
      <path d="M2 7l10 7 10-7"></path>
    </svg>
  )

  const VKIcon = () => (
    <svg width="24" height="24" viewBox="0 0 576 512" fill="#2787F5">
      <path d="M545 117.1c13.7-43-4.6-71.7-52.5-71.7h-65.7c-40.4 0-58.7 21.2-68.4 44.5 0 0-33.5 81.3-80.9 133.7-15.3 15.3-22.3 20.3-30.7 20.3-4.2 0-10.2-5-10.2-19.3V117.1c0-34.9-10.1-49.8-38.6-49.8H148c-21.2 0-34.1 15.6-34.1 30.5 0 31.8 47.7 39.2 52.7 114.7v108.5c0 44.5-8 52.3-16.4 52.3-22.3 0-76.4-81.8-108.5-175.7C30.7 131.7 19.3 117.1-12.7 117.1h-65.7c-37.1 0-44.5 17.5-44.5 36.8 0 32.7 42.1 196.2 196.2 359 102.6 102.6 235.4 105.1 268 105.1 30.6 0 38.3-6.9 38.3-35.1v-53.7c0-33.6 7.1-40.3 29.4-40.3 16.3 0 44.5 8 98.4 59.8 61.2 61.2 71.4 89.2 108.8 89.2h65.7c37.1 0 55.4-18.6 44.5-54.3-12-38.6-55.6-88.8-113-154.5-31.5-35.3-79-72.9-88-87-14.7-22.8-10.3-33 0-48.8 1.6-2.5 59.8-82.9 76.5-121.2z" />
    </svg>
  )

  const GoogleIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )

  return (
    <div className="login-page">
      {/* Veylo branding header */}
      <div className="login-brand">
        <span className="login-brand-name">Veylo</span>
      </div>

      <div className="login-illustration-container">
        <div className="login-illustration-card">
          <div className="illustration-inner-card">
            <div className="illustration-avatar-head" />
            <div className="illustration-avatar-body">
              <div className="illustration-avatar-phone" />
            </div>
          </div>
          <div className="illustration-heart-badge">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
          <div className="illustration-check-badge">
            <div className="check-line" style={{ width: '40px' }} />
            <div className="check-line" style={{ width: '60px' }} />
            <div className="check-line" style={{ width: '50px' }} />
            <div style={{ marginTop: '10px', width: 24, height: 24, borderRadius: '50%', background: '#F68679', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
          </div>
        </div>
      </div>

      <div className="login-titles">
        <h1>{lang === 'tr' ? 'Bugün ne giyiyorsun?' : 'What are you wearing?'}</h1>
        <h1 className="coral-text">{lang === 'tr' ? 'Stilini göster,' : 'Show your style,'}</h1>
        <h1>{lang === 'tr' ? 'birlikte karar verelim.' : 'let\'s decide together.'}</h1>
      </div>

      <div className="login-auth-label">{lang === 'tr' ? 'Giriş Yap' : 'Authorization'}</div>

      <div className="login-methods">
        {!isAndroid && (
          <button className="login-method-btn" onClick={() => handleSocialLogin('apple')}>
            <div className="login-method-icon"><AppleIcon /></div>
            <span>Apple</span>
          </button>
        )}

        <button className="login-method-btn" onClick={() => setShowEmailForm(true)} style={{ position: 'relative' }}>
          {lastEmail && (
            <div className="login-tooltip">
              {lang === 'tr' ? 'Daha önceki giriş yöntemin' : 'Previous login method'}
              <div className="login-tooltip-sub">{lastEmail}</div>
            </div>
          )}
          <div className="login-method-icon"><EmailIcon /></div>
          <span>Email</span>
        </button>

        <button className="login-method-btn" onClick={() => handleSocialLogin('google')}>
          <div className="login-method-icon"><GoogleIcon /></div>
          <span>Google</span>
        </button>
      </div>

      <div className="login-terms">
        {lang === 'tr'
          ? <> Devam ederek <a href="#">Kullanım Koşullarını</a><br /> ve <a href="#">Gizlilik Politikasını</a> kabul etmiş ve 16 yaşından büyük olduğunuzu onaylamış olursunuz</>
          : <> By continuing, you accept the <a href="#">Terms of Use</a><br /> and <a href="#">Privacy Policy</a>, and confirm that you are over 16 years old</>
        }
      </div>

      <button className="login-cant">{lang === 'tr' ? 'Giriş yapamıyor musun?' : "Can't login?"}</button>


      {/* Fallback Email Login Form Overlay */}
      {showEmailForm && (
        <div className="login-form-overlay">
          <button onClick={() => setShowEmailForm(false)} style={{ background: 'none', border: 'none', alignSelf: 'flex-start', marginBottom: '20px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>

          <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '10px' }}>{t('login')}</h2>
          <p style={{ color: '#6B7280', marginBottom: '20px' }}>Email with password</p>

          <form className="login-form" onSubmit={handleEmailLogin}>
            <label className="login-field">
              <span className="field-icon">
                <EmailIcon />
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
                style={{ background: 'none', border: 'none', marginRight: '16px', color: '#9f9d9b' }}
              >
                {showPassword ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" /><circle cx="12" cy="12" r="3" /></svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C5 20 1 12 1 12a21.77 21.77 0 0 1 5.06-6.94" /><path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a21.8 21.8 0 0 1-3.17 4.52" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                )}
              </button>
            </label>

            {error && <p style={{ color: '#EF4444', fontSize: '13px', textAlign: 'center', margin: '4px 0' }}>{error}</p>}

            <button type="submit" className="login-btn-action" disabled={loading}>
              {loading ? (lang === 'tr' ? 'Giriş yapılıyor...' : 'Logging in...') : t('login')}
            </button>
          </form>

          <p style={{ marginTop: '30px', textAlign: 'center', color: '#6B7280' }}>
            {t('no_account')} <button onClick={onGoSignUp} style={{ background: 'none', border: 'none', color: '#FF8B7B', fontWeight: '700' }}>{t('signup')}</button>
          </p>
        </div>
      )}
    </div>
  )
}

export default Login

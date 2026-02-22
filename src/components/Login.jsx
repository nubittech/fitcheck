import React, { useState, useEffect } from 'react'
import { signIn } from '../lib/auth'
import { supabase } from '../lib/supabase'
import { useLang } from '../i18n/LangContext'
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

  useEffect(() => {
    // Check if the user has a previously saved email from a past login session
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
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: window.location.origin
      }
    })
    if (error) {
      console.error('Error logging in with ' + provider, error)
      setError(error.message)
    }
  }

  // Exact Match SVG Icons for the new design
  const AppleIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="black">
      <path d="M15.5 5.5c.3-1.6-1.5-2.9-2.8-3-1.3-.1-2.4 1-2.9 2.5-.2 1.4 1.7 3.2 2.8 3.1 1.2 0 2.5-1 2.9-2.6zM15 8c-1.3-.1-2.8.7-3.6.7s-2-.7-3.2-.7c-2 0-4.1 1.4-5.2 4-1.2 3.1-.3 7.8 1.9 10.1 1 1 2.2 1.9 3.4 1.8 1.2-.1 1.7-.8 3.2-.8 1.5 0 2 .8 3.2.8 1.3 0 2.5-1.1 3.5-2.1 1-1.3 1.5-2.8 1.6-3.1-.1-.1-2.3-.9-2.3-3.6.1-2.4 1.8-3.5 1.9-3.6-1.3-1.6-3.1-1.8-3.4-1.8z" />
    </svg>
  )

  const EmailIcon = () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect>
      <path d="M2 7l10 7 10-7"></path>
    </svg>
  )

  const VKIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="#2787F5">
      <path d="M22.5 10c.8 0 1.5-.7 1.5-1.5s-.7-1.5-1.5-1.5c-2.3 0-4.3-1.6-4.9-3.7-.2-.7-.9-1.3-1.6-1.3s-1.4.6-1.6 1.3C13.8 5.4 11.8 7 9.5 7c-.8 0-1.5.7-1.5 1.5S8.7 10 9.5 10c3 0 5.6 1.9 6.6 4.6.4 1.1 1.7 1.5 2.7.9 1-1.3 2.3-2.6 3.7-5.5z" />
      <path d="M12.9 14.9c-.8-1.5-1.9-2.7-3.2-3.6-1-.7-2.3-.3-3 .7-.7 1-.3 2.3.7 3 1 .6 1.7 1.5 2.1 2.5-3.3-1.2-5.5-4.2-5.5-7.7 0-.5-.4-1-1-1s-1 .4-1 1c0 4.1 2.5 7.6 6.1 9.2l-1.9 3.5c-.3.5-.1 1.1.4 1.4.5.3 1.1.1 1.4-.4l2.1-4c1.2.3 2.4.4 3.6.3 4.8-.4 8.7-4.4 8.7-9.3 0-.5-.4-1-1-1s-1 .4-1 1c0 3.7-2.9 6.8-6.6 7.3-.6.1-.9-.1-.9-.4M13.8 17.2zm0 0" />
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

      <div className="login-auth-label">Authorization</div>

      <div className="login-methods">
        <button className="login-method-btn" onClick={() => handleSocialLogin('apple')}>
          <div className="login-method-icon"><AppleIcon /></div>
          <span>Apple</span>
        </button>

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

        {/* VK is usually a regional Auth, using discord as a fallback if you need something else or we can keep it strictly VK if you configure it in supabase */}
        <button className="login-method-btn" onClick={() => console.log("VK Login clicked")}>
          <div className="login-method-icon"><VKIcon /></div>
          <span>VK</span>
        </button>

        <button className="login-method-btn" onClick={() => handleSocialLogin('google')}>
          <div className="login-method-icon"><GoogleIcon /></div>
          <span>Google</span>
        </button>
      </div>

      <div className="login-terms">
        By continuing, you accept the <a href="#">Terms of Use</a><br />
        and <a href="#">Privacy Policy</a>, and confirm that you are over 18 years old
      </div>

      <button className="login-cant">Can't login?</button>


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

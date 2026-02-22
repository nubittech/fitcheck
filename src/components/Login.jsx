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
      <path d="M12 20.536C9.554 20.536 7.728 18.067 7.728 15.176C7.728 11.459 10.156 9.39 12.593 9.39C13.882 9.39 14.886 9.947 15.689 10.461C15.82 10.545 15.939 10.622 16.037 10.687C16.897 11.233 17.844 11.838 18.996 11.838C20.676 11.838 22.049 10.749 22.049 10.749C21.412 13.561 19.349 15.753 17.067 18.258L16.643 18.723C15.08 20.443 13.921 21.725 12 20.536ZM16.347 8.783C15.908 8.712 15.399 8.526 14.886 8.212C13.838 7.568 12.987 6.552 12.447 5.254C12.358 5.04 12.285 4.819 12.228 4.594C13.313 4.513 14.619 4.96 15.689 5.766C16.587 6.44 17.291 7.424 17.586 8.513C17.266 8.653 16.852 8.865 16.347 8.783Z" />
    </svg>
  )

  const EmailIcon = () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect>
      <path d="M2 7l10 7 10-7"></path>
    </svg>
  )

  const VKIcon = () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="#2787F5">
      <path d="M21.547 7.118c.205-.662 0-1.118-.9-1.118h-2.618c-.768 0-1.077.397-1.25.823 0 0-1.332 3.16-3.176 5.247-.6.618-.876.81-1.25.81-.191 0-.48-.192-.48-.81V7.118c0-.768-.216-1.118-.858-1.118H7.669c-.482 0-.767.35-.767.683 0 .71.93.876 1.025 2.875v3.42c0 .97-.179 1.144-.555 1.144-1.002 0-3.418-3.187-4.85-6.84-.287-.803-.574-1.164-1.34-1.164H-1.55c-.85 0-1.02.397-1.02.823 0 .762.984 4.471 4.558 9.38 2.383 3.321 5.674 5.122 8.675 5.122 1.8 0 2.023-.397 2.023-1.076v-2.478c0-.853.18-.853.535-.853.355 0 .964.18 2.388 1.54 1.621 1.62 1.895 2.367 2.808 2.367H21.05c.85 0 1.282-.416 1.05-1.246-.24-.816-1.14-1.92-2.327-3.235-.595-.71-1.488-1.48-1.75-1.853-.356-.474-.253-.683 0-1.097 0 0 3.097-4.246 3.524-5.694z" />
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
        <img src={veyloLogo} alt="Veylo" className="login-brand-logo" />
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

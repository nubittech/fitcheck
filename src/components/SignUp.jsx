import React, { useState } from 'react'
import { signUp as signUpAuth } from '../lib/auth'
import { useLang } from '../i18n/LangContext'
import '../styles/SignUp.css'

const SignUp = ({ onBack, onSignUp, onGoLogin }) => {
  const { t, lang } = useLang()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  const tr = lang === 'tr'

  const validate = () => {
    const nextErrors = {}
    const trimmedName = fullName.trim()
    const trimmedEmail = email.trim()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!trimmedName) nextErrors.fullName = tr ? 'Ad soyad zorunludur.' : 'Full name is required.'
    if (!trimmedEmail) {
      nextErrors.email = tr ? 'E-posta zorunludur.' : 'Email is required.'
    } else if (!emailRegex.test(trimmedEmail)) {
      nextErrors.email = tr ? 'Geçerli bir e-posta girin.' : 'Please enter a valid email address.'
    }
    if (!password) {
      nextErrors.password = tr ? 'Şifre zorunludur.' : 'Password is required.'
    } else if (password.length < 8) {
      nextErrors.password = tr ? 'Şifre en az 8 karakter olmalıdır.' : 'Password must be at least 8 characters.'
    }
    if (!confirmPassword) {
      nextErrors.confirmPassword = tr ? 'Şifrenizi onaylayın.' : 'Please confirm your password.'
    } else if (confirmPassword !== password) {
      nextErrors.confirmPassword = tr ? 'Şifreler eşleşmiyor.' : 'Passwords do not match.'
    }
    return nextErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError('')
    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setLoading(true)
    const { data, error } = await signUpAuth({ email: email.trim(), password, fullName: fullName.trim() })
    setLoading(false)

    if (error) { setApiError(error.message); return }
    if (data.session) {
      onSignUp({ session: data.session, account: { fullName: fullName.trim(), email: email.trim() } })
    } else {
      setApiError(tr
        ? 'Hesap oluşturuldu! E-postanı onayla ve giriş yap.'
        : 'Account created! Check your email to confirm, then log in.')
    }
  }

  const handleFieldChange = (field, value, setter) => {
    setter(value)
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n })
  }

  return (
    <div className="signup-page">
      <button className="signup-back-btn" onClick={onBack} aria-label="Back">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
        </svg>
      </button>

      <div className="signup-hero">
        <h1>{tr ? 'Topluluğa Katıl' : 'Join the Community'}</h1>
        <p>{tr ? 'Kombin paylaş, geri bildirim al. Sadece gerçek stil.' : 'Share outfits, get feedback, no influencers. Just real style.'}</p>
      </div>

      <form className="signup-form" onSubmit={handleSubmit}>
        <div className="signup-field-wrap">
          <label className={`signup-field ${errors.fullName ? 'error' : ''}`}>
            <span className="signup-icon">
              <svg width="23" height="23" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5zm0 2c-4.41 0-8 2.24-8 5v1h16v-1c0-2.76-3.59-5-8-5z" /></svg>
            </span>
            <input type="text" placeholder={t('full_name')} value={fullName} onChange={(e) => handleFieldChange('fullName', e.target.value, setFullName)} />
          </label>
          {errors.fullName && <p className="signup-error">{errors.fullName}</p>}
        </div>

        <div className="signup-field-wrap">
          <label className={`signup-field ${errors.email ? 'error' : ''}`}>
            <span className="signup-icon">
              <svg width="23" height="23" viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h16a2 2 0 0 1 2 2v1l-10 7L2 7V6a2 2 0 0 1 2-2zm18 6v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8l10 7 10-7z" /></svg>
            </span>
            <input type="email" placeholder={tr ? 'E-posta Adresi' : 'Email Address'} value={email} onChange={(e) => handleFieldChange('email', e.target.value, setEmail)} />
          </label>
          {errors.email && <p className="signup-error">{errors.email}</p>}
        </div>

        <div className="signup-field-wrap">
          <label className={`signup-field ${errors.password ? 'error' : ''}`}>
            <span className="signup-icon">
              <svg width="23" height="23" viewBox="0 0 24 24" fill="currentColor"><path d="M17 9h-1V7a4 4 0 0 0-8 0v2H7a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2zm-6 0V7a2 2 0 1 1 4 0v2h-4z" /></svg>
            </span>
            <input type={showPassword ? 'text' : 'password'} placeholder={t('password')} value={password} onChange={(e) => handleFieldChange('password', e.target.value, setPassword)} />
            <button type="button" className="signup-toggle" onClick={() => setShowPassword(prev => !prev)}>
              {showPassword ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" /><circle cx="12" cy="12" r="3" /></svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C5 20 1 12 1 12a21.77 21.77 0 0 1 5.06-6.94" /><path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a21.8 21.8 0 0 1-3.17 4.52" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
              )}
            </button>
          </label>
          {errors.password && <p className="signup-error">{errors.password}</p>}
        </div>

        <div className="signup-field-wrap">
          <label className={`signup-field ${errors.confirmPassword ? 'error' : ''}`}>
            <span className="signup-icon">
              <svg width="23" height="23" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm4.5 11H11V7h2v4h3.5z" /></svg>
            </span>
            <input type="password" placeholder={tr ? 'Şifreyi Onayla' : 'Confirm Password'} value={confirmPassword} onChange={(e) => handleFieldChange('confirmPassword', e.target.value, setConfirmPassword)} />
          </label>
          {errors.confirmPassword && <p className="signup-error">{errors.confirmPassword}</p>}
        </div>

        {apiError && (
          <p className="signup-api-error" style={{ color: apiError.includes('Check') || apiError.includes('onayla') ? '#10B981' : '#EF4444', fontSize: '13px', textAlign: 'center', marginBottom: '8px' }}>
            {apiError}
          </p>
        )}

        <p className="signup-terms">
          {tr
            ? <><button type="button">Koşullar</button>'ı ve <button type="button">Gizlilik Politikası</button>'nı kabul ediyorum.</>
            : <>By joining, you agree to our <button type="button">Terms</button> and <button type="button">Privacy Policy</button>.</>
          }
        </p>

        <button type="submit" className="create-account-btn" disabled={loading || !fullName.trim() || !email.trim() || !password || !confirmPassword}>
          {loading ? (tr ? 'Hesap oluşturuluyor...' : 'Creating Account...') : (tr ? 'Hesap Oluştur' : 'Create Account')}
        </button>
      </form>

      <div className="signup-divider">
        <span>{tr ? 'veya şununla katıl' : 'Or join with'}</span>
      </div>

      <div className="social-row">
        <button className="social-btn" type="button" aria-label="Join with Google">
          <svg width="34" height="34" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.6 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z" /><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.2 18.9 12 24 12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.6 8.3 6.3 14.7z" /><path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.3l-6.3-5.2C29.3 35.1 26.8 36 24 36c-5.2 0-9.6-3.3-11.2-8l-6.5 5C9.5 39.6 16.2 44 24 44z" /><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4-4 5.3l.1-.1 6.3 5.2C37.3 38.2 44 33 44 24c0-1.2-.1-2.4-.4-3.5z" /></svg>
        </button>
        <button className="social-btn" type="button" aria-label="Join with Apple">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor"><path d="M19.67 16.2c-.3.69-.45 1-.84 1.62-.55.88-1.32 1.98-2.28 1.99-.86.01-1.08-.56-2.25-.56-1.17 0-1.42.54-2.27.57-.95.03-1.68-1-2.24-1.87-1.57-2.39-1.73-5.2-.76-6.7.68-1.05 1.74-1.66 2.73-1.66 1.03 0 1.67.58 2.52.58.82 0 1.31-.58 2.5-.58.89 0 1.83.49 2.52 1.35-2.21 1.3-1.85 4.46.37 5.26zM15.5 5.1c.45-.57.8-1.37.68-2.1-.73.05-1.57.48-2.06 1.08-.44.54-.8 1.35-.65 2.05.78.02 1.56-.42 2.03-1.03z" /></svg>
        </button>
      </div>

      <p className="signup-login-row">
        {t('have_account')} <button type="button" onClick={onGoLogin}>{t('login')}</button>
      </p>
    </div>
  )
}

export default SignUp

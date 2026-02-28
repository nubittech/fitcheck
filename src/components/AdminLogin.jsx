import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { checkIsAdmin } from '../lib/adminApi'
import '../styles/Admin.css'

const AdminLogin = ({ onLogin }) => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    // Check if user already has an active session (e.g. from Google OAuth)
    useEffect(() => {
        const checkExistingSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (session) {
                const isAdmin = await checkIsAdmin(session.user.id)
                if (isAdmin) {
                    onLogin(session, session.user)
                    return
                }
            }
            setLoading(false)
        }
        checkExistingSession()
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password: password
            })

            if (authError) {
                setError('Geçersiz e-posta veya şifre.')
                setLoading(false)
                return
            }

            const isAdmin = await checkIsAdmin(data.user.id)
            if (!isAdmin) {
                setError('Bu hesap yönetici yetkisine sahip değil.')
                await supabase.auth.signOut()
                setLoading(false)
                return
            }

            onLogin(data.session, data.user)
        } catch (err) {
            setError('Giriş sırasında bir hata oluştu.')
        }
        setLoading(false)
    }

    if (loading) {
        return (
            <div className="admin-login-wrapper">
                <div className="admin-login-card">
                    <div className="admin-login-logo">Veylo</div>
                    <div className="admin-login-subtitle">YÖNETİM PANELİ</div>
                    <p style={{ color: 'var(--admin-text-secondary)', fontSize: 14, marginTop: 20 }}>Oturum kontrol ediliyor...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="admin-login-wrapper">
            <form className="admin-login-card" onSubmit={handleSubmit}>
                <div className="admin-login-logo">Veylo</div>
                <div className="admin-login-subtitle">YÖNETİM PANELİ</div>

                <p style={{ color: 'var(--admin-text-secondary)', fontSize: 12, marginBottom: 24 }}>
                    Önce ana uygulamadan giriş yapın, ardından bu sayfayı yenileyin.<br />
                    Veya e-posta/şifre ile giriş yapın.
                </p>

                <div className="admin-login-field">
                    <label>E-posta</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@veyloapp.com"
                        required
                        autoComplete="email"
                    />
                </div>

                <div className="admin-login-field">
                    <label>Şifre</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        autoComplete="current-password"
                    />
                </div>

                <button type="submit" className="admin-login-btn" disabled={loading}>
                    {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
                </button>

                {error && <div className="admin-login-error">{error}</div>}
            </form>
        </div>
    )
}

export default AdminLogin

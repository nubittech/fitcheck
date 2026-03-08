import React, { useState, useEffect } from 'react'
import { getDashboardStats, getUsers, updateUserStatus, updateUserRole, getReportedPosts, resolveReport, getRecentOutfits, deleteOutfit } from '../lib/adminApi'
import '../styles/Admin.css'

// ═══ Dashboard Tab ═══
const DashboardTab = () => {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getDashboardStats()
            .then(setStats)
            .catch(() => setStats({
                totalUsers: 0, todayUsers: 0, totalOutfits: 0,
                todayOutfits: 0, totalReports: 0, pendingReports: 0
            }))
            .finally(() => setLoading(false))
    }, [])

    if (loading) return <div className="admin-loading">Yükleniyor...</div>

    return (
        <>
            <div className="admin-page-header">
                <h1>Dashboard</h1>
                <p>Veylo uygulamasının genel durumu</p>
            </div>

            <div className="admin-stats-grid">
                <div className="admin-stat-card">
                    <span className="admin-stat-label">Toplam Kullanıcı</span>
                    <span className="admin-stat-value stat-accent">{stats.totalUsers}</span>
                    <span className="admin-stat-sub">+{stats.todayUsers} bugün</span>
                </div>
                <div className="admin-stat-card">
                    <span className="admin-stat-label">Toplam Gönderi</span>
                    <span className="admin-stat-value stat-info">{stats.totalOutfits}</span>
                    <span className="admin-stat-sub">+{stats.todayOutfits} bugün</span>
                </div>
                <div className="admin-stat-card">
                    <span className="admin-stat-label">Toplam Şikayet</span>
                    <span className="admin-stat-value stat-warning">{stats.totalReports}</span>
                </div>
                <div className="admin-stat-card">
                    <span className="admin-stat-label">Bekleyen Şikayet</span>
                    <span className="admin-stat-value stat-danger">{stats.pendingReports}</span>
                    <span className="admin-stat-sub">İnceleme bekliyor</span>
                </div>
            </div>
        </>
    )
}

// ═══ Users Tab ═══
const UsersTab = () => {
    const [users, setUsers] = useState([])
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(0)
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const limit = 20

    const fetchUsers = async () => {
        setLoading(true)
        const { data, count } = await getUsers({ page, limit, search })
        setUsers(data || [])
        setTotal(count || 0)
        setLoading(false)
    }

    useEffect(() => { fetchUsers() }, [page])

    const handleSearch = (e) => {
        e.preventDefault()
        setPage(0)
        fetchUsers()
    }

    const handleStatusChange = async (userId, newStatus) => {
        if (!confirm(newStatus === 'banned' ? 'Bu kullanıcı yasaklanacak. Emin misin?' : 'Kullanıcı aktif edilecek.')) return
        await updateUserStatus(userId, newStatus)
        fetchUsers()
    }

    const handleRoleChange = async (userId, newRole) => {
        if (!confirm(`Kullanıcıya "${newRole}" rolü atanacak. Emin misin?`)) return
        await updateUserRole(userId, newRole)
        fetchUsers()
    }

    return (
        <>
            <div className="admin-page-header">
                <h1>Kullanıcı Yönetimi</h1>
                <p>{total} kayıtlı kullanıcı</p>
            </div>

            <div className="admin-table-wrapper">
                <div className="admin-table-header">
                    <h3>Kullanıcılar</h3>
                    <form onSubmit={handleSearch}>
                        <input
                            className="admin-search"
                            type="text"
                            placeholder="İsim veya e-posta ara..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </form>
                </div>

                {loading ? (
                    <div className="admin-loading">Yükleniyor...</div>
                ) : users.length === 0 ? (
                    <div className="admin-empty">
                        <h3>Kullanıcı bulunamadı</h3>
                        <p>Arama kriterlerinizi değiştirin</p>
                    </div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Kullanıcı</th>
                                <th>Şehir</th>
                                <th>Durum</th>
                                <th>Rol</th>
                                <th>Kayıt</th>
                                <th>İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td>
                                        <div className="admin-user-cell">
                                            {user.avatar_url ? (
                                                <img src={user.avatar_url} alt="" />
                                            ) : (
                                                <div style={{
                                                    width: 32, height: 32, borderRadius: '50%',
                                                    background: 'var(--admin-accent-glow)', display: 'flex',
                                                    alignItems: 'center', justifyContent: 'center',
                                                    color: 'var(--admin-accent)', fontWeight: 700, fontSize: 13
                                                }}>
                                                    {(user.full_name || '?').charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div>
                                                <div className="name">{user.full_name || 'İsimsiz'}</div>
                                                <div className="email">{user.email || user.username || '—'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{user.city || '—'}</td>
                                    <td>
                                        <span className={`admin-badge ${user.status === 'banned' ? 'badge-banned' : user.status === 'pending' ? 'badge-pending' : 'badge-active'}`}>
                                            {user.status === 'banned' ? 'Yasaklı' : user.status === 'pending' ? 'Beklemede' : 'Aktif'}
                                        </span>
                                        {user.is_premium && <span className="admin-badge badge-premium" style={{ marginLeft: 4 }}>Premium</span>}
                                    </td>
                                    <td>
                                        <span className={`admin-badge ${user.role === 'admin' ? 'badge-admin' : 'badge-active'}`}>
                                            {user.role === 'admin' ? 'Admin' : 'Kullanıcı'}
                                        </span>
                                    </td>
                                    <td style={{ fontSize: 12, color: 'var(--admin-text-secondary)' }}>
                                        {new Date(user.created_at).toLocaleDateString('tr-TR')}
                                    </td>
                                    <td>
                                        <div className="admin-actions-cell">
                                            {user.status !== 'banned' ? (
                                                <button className="admin-action-btn danger" onClick={() => handleStatusChange(user.id, 'banned')}>
                                                    Yasakla
                                                </button>
                                            ) : (
                                                <button className="admin-action-btn success" onClick={() => handleStatusChange(user.id, 'active')}>
                                                    Aktif Et
                                                </button>
                                            )}
                                            {user.role !== 'admin' && (
                                                <button className="admin-action-btn" onClick={() => handleRoleChange(user.id, 'admin')}>
                                                    Admin Yap
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {total > limit && (
                    <div className="admin-pagination">
                        <span>{page * limit + 1}–{Math.min((page + 1) * limit, total)} / {total}</span>
                        <div className="admin-pagination-btns">
                            <button disabled={page === 0} onClick={() => setPage(p => p - 1)}>← Önceki</button>
                            <button disabled={(page + 1) * limit >= total} onClick={() => setPage(p => p + 1)}>Sonraki →</button>
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}

// ═══ Reports Tab ═══
const ReportsTab = () => {
    const [reports, setReports] = useState([])
    const [filter, setFilter] = useState('pending')
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(0)
    const [total, setTotal] = useState(0)

    const fetchReports = async () => {
        setLoading(true)
        const { data, count } = await getReportedPosts({ page, status: filter })
        setReports(data || [])
        setTotal(count || 0)
        setLoading(false)
    }

    useEffect(() => { fetchReports() }, [page, filter])

    const handleResolve = async (reportId, action) => {
        const msgs = {
            dismiss: 'Şikayet yoksayılacak. Emin misin?',
            remove_post: 'Gönderi silinecek ve şikayet çözülecek. Emin misin?'
        }
        if (!confirm(msgs[action])) return
        await resolveReport(reportId, action)
        fetchReports()
    }

    return (
        <>
            <div className="admin-page-header">
                <h1>Şikayet Moderasyonu</h1>
                <p>{total} şikayet bulundu</p>
            </div>

            <div className="admin-filter-tabs">
                {['pending', 'resolved', 'dismissed', 'all'].map(f => (
                    <button
                        key={f}
                        className={`admin-filter-tab ${filter === f ? 'active' : ''}`}
                        onClick={() => { setFilter(f); setPage(0) }}
                    >
                        {f === 'pending' ? 'Bekleyen' : f === 'resolved' ? 'Çözülen' : f === 'dismissed' ? 'Yoksayılan' : 'Tümü'}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="admin-loading">Yükleniyor...</div>
            ) : reports.length === 0 ? (
                <div className="admin-empty">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3>Şikayet yok</h3>
                    <p>Şu an bekleyen şikayet bulunmuyor</p>
                </div>
            ) : (
                <div className="admin-report-list">
                    {reports.map(report => {
                        const outfit = report.outfit || {}
                        const media = (outfit.outfit_media || []).sort((a, b) => a.sort_order - b.sort_order)
                        const firstMedia = media[0]?.media_url
                        const reporter = report.reporter || {}
                        const owner = outfit.profiles || {}

                        return (
                            <div key={report.id} className="admin-report-card">
                                <div className="admin-report-media">
                                    {firstMedia && <img src={firstMedia} alt="" />}
                                </div>
                                <div className="admin-report-info">
                                    <h4>{outfit.caption || 'Başlıksız gönderi'}</h4>
                                    <div className="admin-report-meta">
                                        <span>👤 Sahibi: <strong>{owner.full_name || owner.username || '—'}</strong></span>
                                        <span>🚩 Şikayet eden: <strong>{reporter.full_name || reporter.username || '—'}</strong></span>
                                        <span>📅 {new Date(report.created_at).toLocaleString('tr-TR')}</span>
                                        {report.reason && <span>💬 Sebep: {report.reason}</span>}
                                    </div>
                                    {report.status === 'pending' && (
                                        <div className="admin-report-actions">
                                            <button className="admin-action-btn danger" onClick={() => handleResolve(report.id, 'remove_post')}>
                                                Gönderiyi Sil
                                            </button>
                                            <button className="admin-action-btn success" onClick={() => handleResolve(report.id, 'dismiss')}>
                                                Yoksay
                                            </button>
                                        </div>
                                    )}
                                    {report.status !== 'pending' && (
                                        <span className={`admin-badge ${report.status === 'resolved' ? 'badge-active' : 'badge-pending'}`}>
                                            {report.status === 'resolved' ? 'Çözüldü' : 'Yoksayıldı'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </>
    )
}

// ═══ Content Tab ═══
const ContentTab = () => {
    const [outfits, setOutfits] = useState([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(0)
    const [total, setTotal] = useState(0)

    const fetchOutfits = async () => {
        setLoading(true)
        const { data, count } = await getRecentOutfits({ page })
        setOutfits(data || [])
        setTotal(count || 0)
        setLoading(false)
    }

    useEffect(() => { fetchOutfits() }, [page])

    const handleDelete = async (outfitId) => {
        if (!confirm('Bu gönderi kalıcı olarak silinecek. Emin misin?')) return
        const { error } = await deleteOutfit(outfitId)
        if (error) {
            alert('Silme başarısız: ' + error.message)
            console.error('[AdminPanel] Delete failed:', error)
        }
        fetchOutfits()
    }

    return (
        <>
            <div className="admin-page-header">
                <h1>İçerik Yönetimi</h1>
                <p>Son yüklenen {total} gönderi</p>
            </div>

            {loading ? (
                <div className="admin-loading">Yükleniyor...</div>
            ) : outfits.length === 0 ? (
                <div className="admin-empty">
                    <h3>Henüz gönderi yok</h3>
                    <p>Kullanıcılar henüz içerik paylaşmamış</p>
                </div>
            ) : (
                <>
                    <div className="admin-content-grid">
                        {outfits.map(outfit => {
                            const media = (outfit.outfit_media || []).sort((a, b) => a.sort_order - b.sort_order)
                            const thumb = media[0]?.media_url
                            const owner = outfit.profiles || {}

                            return (
                                <div key={outfit.id} className="admin-content-item">
                                    {thumb && <img className="admin-content-thumb" src={thumb} alt="" />}
                                    <div className="admin-content-meta">
                                        <p className="author">{owner.full_name || owner.username || '—'}</p>
                                        <p>{outfit.caption ? (outfit.caption.length > 30 ? outfit.caption.slice(0, 30) + '...' : outfit.caption) : 'Başlıksız'}</p>
                                        <p>{new Date(outfit.created_at).toLocaleDateString('tr-TR')}</p>
                                    </div>
                                    <div className="admin-content-actions">
                                        <button className="admin-action-btn danger" onClick={() => handleDelete(outfit.id)} style={{ flex: 1 }}>
                                            Sil
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {total > 20 && (
                        <div className="admin-pagination" style={{ background: 'transparent', marginTop: 20 }}>
                            <span>{page * 20 + 1}–{Math.min((page + 1) * 20, total)} / {total}</span>
                            <div className="admin-pagination-btns">
                                <button disabled={page === 0} onClick={() => setPage(p => p - 1)}>← Önceki</button>
                                <button disabled={(page + 1) * 20 >= total} onClick={() => setPage(p => p + 1)}>Sonraki →</button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </>
    )
}


// ═══ Main Admin Panel ═══
const AdminPanel = ({ session, onLogout }) => {
    const [activeTab, setActiveTab] = useState('dashboard')
    const [pendingCount, setPendingCount] = useState(0)

    useEffect(() => {
        getDashboardStats()
            .then(s => setPendingCount(s.pendingReports))
            .catch(() => { })
    }, [activeTab])

    const navItems = [
        {
            id: 'dashboard', label: 'Dashboard',
            icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
        },
        {
            id: 'users', label: 'Kullanıcılar',
            icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>
        },
        {
            id: 'reports', label: 'Şikayetler',
            icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.86 2h8.28L22 7.86v8.28L16.14 22H7.86L2 16.14V7.86L7.86 2z" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>,
            badge: pendingCount
        },
        {
            id: 'content', label: 'İçerikler',
            icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
        },
    ]

    const renderTab = () => {
        switch (activeTab) {
            case 'dashboard': return <DashboardTab />
            case 'users': return <UsersTab />
            case 'reports': return <ReportsTab />
            case 'content': return <ContentTab />
            default: return <DashboardTab />
        }
    }

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="admin-sidebar-brand">
                    <h2>Veylo</h2>
                    <span>Admin Panel</span>
                </div>

                <nav className="admin-nav">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            className={`admin-nav-item ${activeTab === item.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(item.id)}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                            {item.badge > 0 && <span className="admin-nav-badge">{item.badge}</span>}
                        </button>
                    ))}
                </nav>

                <div className="admin-nav-logout">
                    <button className="admin-nav-item" onClick={onLogout}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        <span>Çıkış Yap</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-main">
                {renderTab()}
            </main>
        </div>
    )
}

export default AdminPanel

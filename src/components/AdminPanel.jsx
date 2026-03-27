import React, { useState, useEffect } from 'react'
import { getDashboardStats, getUsers, updateUserStatus, updateUserRole, getReportedPosts, resolveReport, getRecentOutfits, deleteOutfit, getMissionTemplates, createMissionTemplate, updateMissionTemplate, deleteMissionTemplate, getEvents, createEvent, updateEvent, deleteEvent, getAdminLeaderboard } from '../lib/adminApi'
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
// ═══ Missions Admin Tab ═══
const MissionsTab = () => {
    const [missions, setMissions] = useState([])
    const [loading, setLoading] = useState(true)
    const [editing, setEditing] = useState(null)
    const [filterType, setFilterType] = useState('daily')
    const [filterTier, setFilterTier] = useState(0)
    const [form, setForm] = useState({ title: '', description: '', icon: '🎯', xp_reward: 10, mission_type: 'daily', action_type: 'post_outfit', target_count: 1, is_active: true, priority: 0 })

    const actionTypes = ['post_outfit', 'like_outfit', 'comment', 'share', 'explore_profile', 'ab_post', 'ab_vote', 'use_boost', 'trend_finish', 'link_sale', 'become_premium', 'complete_profile', 'event_post', 'follow']

    useEffect(() => { loadMissions() }, [])
    const loadMissions = () => {
        setLoading(true)
        getMissionTemplates().then(({ data }) => { setMissions(data); setLoading(false) })
    }

    const filtered = missions.filter(m => {
        if (m.mission_type !== filterType) return false
        if (filterType === 'daily' && filterTier > 0 && m.tier !== filterTier) return false
        return true
    })

    const handleSave = async () => {
        if (editing) {
            await updateMissionTemplate(editing, form)
        } else {
            await createMissionTemplate(form)
        }
        setEditing(null)
        setForm({ title: '', description: '', icon: '🎯', xp_reward: 10, mission_type: 'daily', action_type: 'post_outfit', target_count: 1, is_active: true, priority: 0 })
        loadMissions()
    }

    const handleEdit = (m) => {
        setEditing(m.id)
        setForm({ title: m.title, description: m.description || '', icon: m.icon, xp_reward: m.xp_reward, mission_type: m.mission_type, action_type: m.action_type, target_count: m.target_count, is_active: m.is_active, priority: m.priority })
    }

    const handleDelete = async (id) => {
        if (!confirm('Bu gorevi silmek istediginize emin misiniz?')) return
        await deleteMissionTemplate(id)
        loadMissions()
    }

    const handleToggle = async (m) => {
        await updateMissionTemplate(m.id, { is_active: !m.is_active })
        loadMissions()
    }

    if (loading) return <div className="admin-loading">Yukleniyor...</div>

    return (
        <>
            <div className="admin-page-header">
                <h1>Gorev Yonetimi</h1>
                <p>Gunluk gorev sablonlarini yonet</p>
            </div>

            {/* Form */}
            <div className="admin-card" style={{ marginBottom: 24, padding: 20 }}>
                <h3 style={{ margin: '0 0 16px', color: '#fff' }}>{editing ? 'Gorevi Duzenle' : 'Yeni Gorev'}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <input placeholder="Baslik" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={inputStyle} />
                    <input placeholder="Aciklama" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={inputStyle} />
                    <input placeholder="Icon (emoji)" value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} style={inputStyle} />
                    <input type="number" placeholder="XP Odulu" value={form.xp_reward} onChange={e => setForm(f => ({ ...f, xp_reward: Number(e.target.value) }))} style={inputStyle} />
                    <select value={form.action_type} onChange={e => setForm(f => ({ ...f, action_type: e.target.value }))} style={inputStyle}>
                        {actionTypes.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                    <input type="number" placeholder="Hedef Sayi" value={form.target_count} onChange={e => setForm(f => ({ ...f, target_count: Number(e.target.value) }))} style={inputStyle} />
                    <input type="number" placeholder="Oncelik" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: Number(e.target.value) }))} style={inputStyle} />
                    <select value={form.mission_type} onChange={e => setForm(f => ({ ...f, mission_type: e.target.value }))} style={inputStyle}>
                        <option value="daily">Gunluk</option>
                        <option value="weekly">Haftalik</option>
                        <option value="special">Ozel</option>
                    </select>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <button onClick={handleSave} style={btnPrimary}>{editing ? 'Guncelle' : 'Ekle'}</button>
                    {editing && <button onClick={() => { setEditing(null); setForm({ title: '', description: '', icon: '🎯', xp_reward: 10, mission_type: 'daily', action_type: 'post_outfit', target_count: 1, is_active: true, priority: 0 }) }} style={btnSecondary}>Iptal</button>}
                </div>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                {['daily', 'super', 'onetime', 'admin'].map(t => (
                    <button key={t} onClick={() => { setFilterType(t); setFilterTier(0) }}
                        style={{ padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                            background: filterType === t ? '#FFD700' : 'rgba(255,255,255,0.08)',
                            color: filterType === t ? '#000' : '#aaa' }}>
                        {t === 'daily' ? `Gunluk (${missions.filter(m => m.mission_type === 'daily').length})` :
                         t === 'super' ? `Super (${missions.filter(m => m.mission_type === 'super').length})` :
                         t === 'onetime' ? `Tek Seferlik (${missions.filter(m => m.mission_type === 'onetime').length})` :
                         `Admin (${missions.filter(m => m.mission_type === 'admin').length})`}
                    </button>
                ))}
                {filterType === 'daily' && (
                    <div style={{ display: 'flex', gap: 6, marginLeft: 8 }}>
                        {[0,1,2,3,4].map(t => (
                            <button key={t} onClick={() => setFilterTier(t)}
                                style={{ padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12,
                                    background: filterTier === t ? '#fff' : 'rgba(255,255,255,0.05)',
                                    color: filterTier === t ? '#000' : '#aaa' }}>
                                {t === 0 ? 'Tumu' : `Tier ${t}`}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* List */}
            <div className="admin-card">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                            <th style={thStyle}>Icon</th>
                            <th style={thStyle}>Baslik</th>
                            <th style={thStyle}>Aksiyon</th>
                            <th style={thStyle}>Hedef</th>
                            <th style={thStyle}>XP</th>
                            <th style={thStyle}>Durum</th>
                            <th style={thStyle}>Islem</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(m => (
                            <tr key={m.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                <td style={tdStyle}>{m.icon}</td>
                                <td style={tdStyle}>{m.title}</td>
                                <td style={tdStyle}><span style={{ fontSize: 11, color: '#888' }}>{m.action_type}</span></td>
                                <td style={tdStyle}>{m.target_count}</td>
                                <td style={tdStyle}><span style={{ color: '#FFD700' }}>+{m.xp_reward}</span></td>
                                <td style={tdStyle}>
                                    <button onClick={() => handleToggle(m)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: m.is_active ? '#4CAF50' : '#f44336' }}>
                                        {m.is_active ? 'Aktif' : 'Pasif'}
                                    </button>
                                </td>
                                <td style={tdStyle}>
                                    <button onClick={() => handleEdit(m)} style={btnSmall}>Duzenle</button>
                                    <button onClick={() => handleDelete(m.id)} style={{ ...btnSmall, color: '#f44336' }}>Sil</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    )
}

// ═══ Events Admin Tab ═══
const EventsTab = () => {
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(true)
    const [editing, setEditing] = useState(null)
    const [form, setForm] = useState({ title: '', description: '', tag: '', theme_color: '#FF6B8A', xp_bonus: 50, banner_url: '', start_date: '', end_date: '', is_active: true })

    useEffect(() => { loadEvents() }, [])
    const loadEvents = () => {
        setLoading(true)
        getEvents().then(({ data }) => { setEvents(data); setLoading(false) })
    }

    const handleSave = async () => {
        const payload = { ...form }
        if (payload.start_date) payload.start_date = new Date(payload.start_date).toISOString()
        if (payload.end_date) payload.end_date = new Date(payload.end_date).toISOString()

        if (editing) {
            await updateEvent(editing, payload)
        } else {
            await createEvent(payload)
        }
        setEditing(null)
        setForm({ title: '', description: '', tag: '', theme_color: '#FF6B8A', xp_bonus: 50, banner_url: '', start_date: '', end_date: '', is_active: true })
        loadEvents()
    }

    const handleEdit = (e) => {
        setEditing(e.id)
        setForm({
            title: e.title, description: e.description || '', tag: e.tag,
            theme_color: e.theme_color || '#FF6B8A', xp_bonus: e.xp_bonus,
            banner_url: e.banner_url || '',
            start_date: e.start_date ? e.start_date.slice(0, 16) : '',
            end_date: e.end_date ? e.end_date.slice(0, 16) : '',
            is_active: e.is_active
        })
    }

    const handleDelete = async (id) => {
        if (!confirm('Bu etkinligi silmek istediginize emin misiniz?')) return
        await deleteEvent(id)
        loadEvents()
    }

    if (loading) return <div className="admin-loading">Yukleniyor...</div>

    return (
        <>
            <div className="admin-page-header">
                <h1>Etkinlik Yonetimi</h1>
                <p>Aylik etkinlik ve challange'lari yonet</p>
            </div>

            {/* Form */}
            <div className="admin-card" style={{ marginBottom: 24, padding: 20 }}>
                <h3 style={{ margin: '0 0 16px', color: '#fff' }}>{editing ? 'Etkinligi Duzenle' : 'Yeni Etkinlik'}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <input placeholder="Baslik (Sakura Mevsimi)" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={inputStyle} />
                    <input placeholder="Etiket (#SakuraSezonu)" value={form.tag} onChange={e => setForm(f => ({ ...f, tag: e.target.value }))} style={inputStyle} />
                    <input placeholder="Aciklama" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ ...inputStyle, gridColumn: '1 / -1' }} />
                    <input placeholder="Banner URL" value={form.banner_url} onChange={e => setForm(f => ({ ...f, banner_url: e.target.value }))} style={{ ...inputStyle, gridColumn: '1 / -1' }} />
                    <input type="color" value={form.theme_color} onChange={e => setForm(f => ({ ...f, theme_color: e.target.value }))} style={{ ...inputStyle, height: 40 }} />
                    <input type="number" placeholder="XP Bonus" value={form.xp_bonus} onChange={e => setForm(f => ({ ...f, xp_bonus: Number(e.target.value) }))} style={inputStyle} />
                    <div>
                        <label style={{ color: '#888', fontSize: 11 }}>Baslangic</label>
                        <input type="datetime-local" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} style={inputStyle} />
                    </div>
                    <div>
                        <label style={{ color: '#888', fontSize: 11 }}>Bitis</label>
                        <input type="datetime-local" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} style={inputStyle} />
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <button onClick={handleSave} style={btnPrimary}>{editing ? 'Guncelle' : 'Olustur'}</button>
                    {editing && <button onClick={() => { setEditing(null); setForm({ title: '', description: '', tag: '', theme_color: '#FF6B8A', xp_bonus: 50, banner_url: '', start_date: '', end_date: '', is_active: true }) }} style={btnSecondary}>Iptal</button>}
                </div>
            </div>

            {/* List */}
            <div className="admin-card">
                {events.length === 0 ? (
                    <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>Henuz etkinlik yok</div>
                ) : events.map(e => (
                    <div key={e.id} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)',
                    }}>
                        <div>
                            <div style={{ color: '#fff', fontWeight: 600 }}>{e.title}</div>
                            <div style={{ color: '#888', fontSize: 12 }}>
                                {e.tag} | {e.participation_count || 0} katilimci | +{e.xp_bonus} XP
                            </div>
                            <div style={{ color: e.is_active ? '#4CAF50' : '#f44336', fontSize: 11 }}>
                                {e.is_active ? 'Aktif' : 'Pasif'} | {new Date(e.start_date).toLocaleDateString()} - {new Date(e.end_date).toLocaleDateString()}
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => handleEdit(e)} style={btnSmall}>Duzenle</button>
                            <button onClick={() => handleDelete(e.id)} style={{ ...btnSmall, color: '#f44336' }}>Sil</button>
                        </div>
                    </div>
                ))}
            </div>
        </>
    )
}

// ═══ Leaderboard Admin Tab ═══
const LeaderboardTab = () => {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getAdminLeaderboard(50).then(({ data }) => {
            setUsers(data)
            setLoading(false)
        })
    }, [])

    if (loading) return <div className="admin-loading">Yukleniyor...</div>

    return (
        <>
            <div className="admin-page-header">
                <h1>Siralama</h1>
                <p>En yuksek XP'li kullanicilar</p>
            </div>
            <div className="admin-card">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                            <th style={thStyle}>#</th>
                            <th style={thStyle}>Kullanici</th>
                            <th style={thStyle}>Seviye</th>
                            <th style={thStyle}>XP</th>
                            <th style={thStyle}>Streak</th>
                            <th style={thStyle}>Unvan</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u, i) => (
                            <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                <td style={tdStyle}>{i + 1}</td>
                                <td style={tdStyle}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        {u.profiles?.avatar_url && <img src={u.profiles.avatar_url} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />}
                                        <span>{u.profiles?.full_name || u.profiles?.username || '-'}</span>
                                    </div>
                                </td>
                                <td style={tdStyle}><span style={{ color: '#FFD700', fontWeight: 700 }}>LVL {u.level}</span></td>
                                <td style={tdStyle}>{u.xp?.toLocaleString()}</td>
                                <td style={tdStyle}>{u.streak_days || 0} gun</td>
                                <td style={tdStyle}><span style={{ color: '#aaa' }}>{u.title}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    )
}

// Shared styles for admin forms
const inputStyle = { padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 13, outline: 'none' }
const btnPrimary = { padding: '10px 20px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #FFD700, #FF8C00)', color: '#000', fontWeight: 700, cursor: 'pointer', fontSize: 13 }
const btnSecondary = { padding: '10px 20px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#fff', cursor: 'pointer', fontSize: 13 }
const btnSmall = { background: 'none', border: 'none', color: '#4FC3F7', cursor: 'pointer', fontSize: 12, padding: '4px 8px' }
const thStyle = { padding: '10px 12px', textAlign: 'left', color: '#888', fontSize: 12, fontWeight: 600 }
const tdStyle = { padding: '10px 12px', color: '#ccc', fontSize: 13 }

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
        {
            id: 'missions', label: 'Gorevler',
            icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        },
        {
            id: 'events', label: 'Etkinlikler',
            icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        },
        {
            id: 'leaderboard', label: 'Siralama',
            icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
        },
    ]

    const renderTab = () => {
        switch (activeTab) {
            case 'dashboard': return <DashboardTab />
            case 'users': return <UsersTab />
            case 'reports': return <ReportsTab />
            case 'content': return <ContentTab />
            case 'missions': return <MissionsTab />
            case 'events': return <EventsTab />
            case 'leaderboard': return <LeaderboardTab />
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

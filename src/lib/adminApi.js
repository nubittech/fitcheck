import { supabase } from './supabase'

// ── Admin Auth ──

export async function checkIsAdmin(userId) {
    const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()
    if (error) return false
    return data?.role === 'admin'
}

// ── Dashboard Stats ──

export async function getDashboardStats() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [
        { count: totalUsers },
        { count: todayUsers },
        { count: totalOutfits },
        { count: todayOutfits },
        { count: totalReports },
        { count: pendingReports }
    ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', today.toISOString()),
        supabase.from('outfits').select('id', { count: 'exact', head: true }),
        supabase.from('outfits').select('id', { count: 'exact', head: true }).gte('created_at', today.toISOString()),
        supabase.from('reported_posts').select('id', { count: 'exact', head: true }),
        supabase.from('reported_posts').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    ])

    return {
        totalUsers: totalUsers || 0,
        todayUsers: todayUsers || 0,
        totalOutfits: totalOutfits || 0,
        todayOutfits: todayOutfits || 0,
        totalReports: totalReports || 0,
        pendingReports: pendingReports || 0,
    }
}

// ── User Management ──

export async function getUsers({ page = 0, limit = 20, search = '' } = {}) {
    let query = supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url, city, age, role, is_premium, status, created_at', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(page * limit, (page + 1) * limit - 1)

    if (search) {
        query = query.or(`full_name.ilike.%${search}%,username.ilike.%${search}%`)
    }

    const { data, error, count } = await query
    return { data: data || [], error, count: count || 0 }
}

export async function updateUserStatus(userId, status) {
    const { data, error } = await supabase
        .from('profiles')
        .update({ status })
        .eq('id', userId)
        .select()
        .single()
    return { data, error }
}

export async function updateUserRole(userId, role) {
    const { data, error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId)
        .select()
        .single()
    return { data, error }
}

// ── Content Moderation ──

export async function getReportedPosts({ page = 0, limit = 20, status = 'pending' } = {}) {
    let query = supabase
        .from('reported_posts')
        .select(`
      *,
      reporter:reporter_id ( id, full_name, username, avatar_url ),
      outfit:outfit_id (
        id, caption, post_type, image_url_b, created_at,
        profiles:user_id ( id, full_name, username, avatar_url ),
        outfit_media ( media_url, media_type, sort_order )
      )
    `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(page * limit, (page + 1) * limit - 1)

    if (status !== 'all') {
        query = query.eq('status', status)
    }

    const { data, error, count } = await query
    return { data, error, count }
}

export async function resolveReport(reportId, action) {
    // action: 'dismiss' | 'remove_post' | 'ban_user'
    const { data: report } = await supabase
        .from('reported_posts')
        .select('outfit_id')
        .eq('id', reportId)
        .single()

    // Update report status FIRST (before deleteOutfit removes the record)
    const { data, error } = await supabase
        .from('reported_posts')
        .update({ status: action === 'dismiss' ? 'dismissed' : 'resolved', resolved_at: new Date().toISOString() })
        .eq('id', reportId)
        .select()
        .single()

    if (action === 'remove_post' && report?.outfit_id) {
        // Full cascade delete (all related tables including reported_posts)
        await deleteOutfit(report.outfit_id)
    }

    return { data, error }
}

// ── Recent Outfits (Content Review) ──

export async function getRecentOutfits({ page = 0, limit = 20 } = {}) {
    const { data, error, count } = await supabase
        .from('outfits')
        .select(`
      id, caption, post_type, image_url_b, created_at, vibe, is_boosted,
      profiles:user_id ( id, full_name, username, avatar_url ),
      outfit_media ( media_url, media_type, sort_order )
    `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(page * limit, (page + 1) * limit - 1)

    return { data, error, count }
}

// ── Report Post (called from user-facing cards) ──

export async function reportPost({ outfitId, reporterId, reason = '' }) {
    const { data, error } = await supabase
        .from('reported_posts')
        .insert({ outfit_id: outfitId, reporter_id: reporterId, reason })
        .select()
        .single()
    return { data, error }
}

export async function deleteOutfit(outfitId) {
    // Delete all related records first (foreign key constraints)
    const tables = [
        'outfit_media',
        'comments',
        'likes',
        'outfit_votes',
        'item_votes',
        'ab_votes',
        'reported_posts',
    ]

    for (const table of tables) {
        const { error } = await supabase.from(table).delete().eq('outfit_id', outfitId)
        if (error) console.warn(`[deleteOutfit] Failed to delete from ${table}:`, error.message)
    }

    // Finally delete the outfit itself
    const { error } = await supabase.from('outfits').delete().eq('id', outfitId)
    if (error) console.error('[deleteOutfit] Failed to delete outfit:', error.message)
    return { error }
}

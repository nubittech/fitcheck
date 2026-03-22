import { supabase } from './supabase'

// ---- SANITIZATION ----
// Trim whitespace and enforce max length on all user-submitted strings
function sanitize(str, maxLen = 500) {
  if (typeof str !== 'string') return ''
  return str.trim().slice(0, maxLen)
}

// ---- OUTFITS ----

export async function getOutfits({ limit = 20, offset = 0, vibe = null } = {}) {
  let query = supabase
    .from('outfits')
    .select(`
      *,
      profiles:user_id ( id, full_name, username, avatar_url, city, age, is_premium ),
      outfit_media ( id, media_url, media_type, sort_order )
    `)
    .order('is_boosted', { ascending: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (vibe) query = query.eq('vibe', vibe)

  const { data, error } = await query
  return { data, error }
}

// Client-side boost-aware feed sorting
// Boosted outfits (within 2h) get 2.5x weight, appear first
export function sortFeedWithBoost(outfits) {
  const now = Date.now()
  const BOOST_WINDOW_MS = 2 * 60 * 60 * 1000 // 2 hours

  return [...outfits].sort((a, b) => {
    const aBoostActive = a.isBoosted && a.boostedAt && (now - new Date(a.boostedAt).getTime() < BOOST_WINDOW_MS)
    const bBoostActive = b.isBoosted && b.boostedAt && (now - new Date(b.boostedAt).getTime() < BOOST_WINDOW_MS)

    // Boosted items come first
    if (aBoostActive && !bBoostActive) return -1
    if (!aBoostActive && bBoostActive) return 1

    // Among boosted, sort by boost time (most recent first)
    if (aBoostActive && bBoostActive) {
      return new Date(b.boostedAt).getTime() - new Date(a.boostedAt).getTime()
    }

    // Non-boosted: by created_at descending
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  })
}

export async function getOutfitsByUser(userId, { limit = 50, offset = 0 } = {}) {
  const { data, error } = await supabase
    .from('outfits')
    .select(`
      *,
      outfit_media ( id, media_url, media_type, sort_order )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)
  return { data, error }
}

export async function getDailyPostCount(userId) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const { count, error } = await supabase
    .from('outfits')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', today.toISOString())
  return { count: count || 0, error }
}

export async function createOutfit({ userId, caption, gender, vibe, ageRangeMin, ageRangeMax, items, isBoosted, postType = 'single', imageUrlB = null }) {
  const sanitizedItems = (items || []).map(item => ({
    ...item,
    name: sanitize(item.name, 100),
    brand: sanitize(item.brand, 60),
  }))
  const { data, error } = await supabase
    .from('outfits')
    .insert({
      user_id: userId,
      caption: sanitize(caption, 280),
      gender,
      vibe,
      age_range_min: ageRangeMin,
      age_range_max: ageRangeMax,
      items: sanitizedItems,
      is_boosted: isBoosted,
      post_type: postType,
      image_url_b: imageUrlB
    })
    .select()
    .single()
  return { data, error }
}

// ---- MEDIA ----

export async function uploadMedia(userId, file) {
  const fileExt = file.name ? file.name.split('.').pop() : 'jpg'
  const filePath = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`

  // Convert File to ArrayBuffer to avoid iOS WKWebView "Load failed" error with fetch()
  const arrayBuffer = await file.arrayBuffer()

  const { error: uploadError } = await supabase.storage
    .from('media')
    .upload(filePath, arrayBuffer, {
      contentType: file.type || 'image/jpeg',
      upsert: false
    })

  if (uploadError) return { data: null, error: uploadError }

  const { data: { publicUrl } } = supabase.storage
    .from('media')
    .getPublicUrl(filePath)

  return { data: { url: publicUrl, path: filePath }, error: null }
}

export async function insertOutfitMedia({ outfitId, mediaUrl, mediaType, sortOrder }) {
  const { data, error } = await supabase
    .from('outfit_media')
    .insert({ outfit_id: outfitId, media_url: mediaUrl, media_type: mediaType, sort_order: sortOrder })
    .select()
    .single()
  return { data, error }
}

// ---- LIKES ----

export async function likeOutfit({ outfitId, userId }) {
  const { data, error } = await supabase
    .from('likes')
    .insert({ outfit_id: outfitId, user_id: userId })
    .select()
    .single()

  if (!error) {
    await supabase.rpc('increment_outfit_stat', {
      outfit_id_param: outfitId,
      column_name: 'likes_count',
      amount: 1
    })
  }
  return { data, error }
}

export async function unlikeOutfit({ outfitId, userId }) {
  const { error } = await supabase
    .from('likes')
    .delete()
    .eq('outfit_id', outfitId)
    .eq('user_id', userId)

  if (!error) {
    await supabase.rpc('increment_outfit_stat', {
      outfit_id_param: outfitId,
      column_name: 'likes_count',
      amount: -1
    })
  }
  return { error }
}

export async function getUserLikes(userId, { limit = 500 } = {}) {
  const { data, error } = await supabase
    .from('likes')
    .select('outfit_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  return { data, error }
}

// ---- COMMENTS ----

export async function getComments(outfitId, { limit = 50 } = {}) {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      profiles:user_id ( id, full_name, username, avatar_url )
    `)
    .eq('outfit_id', outfitId)
    .order('created_at', { ascending: false })
    .limit(limit)
  // Reverse so oldest first in UI
  return { data: data ? data.reverse() : data, error }
}

export async function addComment({ outfitId, userId, text }) {
  const cleanText = sanitize(text, 500)
  if (!cleanText) return { data: null, error: new Error('Comment cannot be empty') }

  const { data, error } = await supabase
    .from('comments')
    .insert({ outfit_id: outfitId, user_id: userId, text: cleanText })
    .select(`
      *,
      profiles:user_id ( id, full_name, username, avatar_url )
    `)
    .single()

  if (!error) {
    await supabase.rpc('increment_outfit_stat', {
      outfit_id_param: outfitId,
      column_name: 'comments_count',
      amount: 1
    })
  }
  return { data, error }
}

// ---- DELETE OUTFIT ----

export async function deleteOutfit(outfitId, userId) {
  // Önce outfit'in bu kullanıcıya ait olduğunu kontrol et
  const { data: outfit, error: fetchError } = await supabase
    .from('outfits')
    .select('id, user_id')
    .eq('id', outfitId)
    .eq('user_id', userId)
    .single()

  if (fetchError || !outfit) return { error: new Error('Paylaşım bulunamadı veya size ait değil') }

  // İlişkili verileri sil
  await supabase.from('comments').delete().eq('outfit_id', outfitId)
  await supabase.from('votes').delete().eq('outfit_id', outfitId)
  await supabase.from('outfit_media').delete().eq('outfit_id', outfitId)

  // Outfit'i sil
  const { error } = await supabase
    .from('outfits')
    .delete()
    .eq('id', outfitId)
    .eq('user_id', userId)

  return { error }
}

// ---- PROFILES ----

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return { data, error }
}

export async function updateProfile(userId, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  return { data, error }
}

// ---- BOOST ----

export async function activateBoost(userId) {
  const { data, error } = await supabase.rpc('activate_boost', {
    user_id_param: userId
  })
  return { data, error }
}

export async function creditBoostPurchase(userId) {
  const { data, error } = await supabase.rpc('credit_boost_purchase', {
    user_id_param: userId
  })
  return { data, error }
}

export async function getBoostStatus(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('boosts_used, boosts_reset_at, is_premium, purchased_boosts_balance')
    .eq('id', userId)
    .single()
  if (error) return { boostsUsed: 0, maxBoosts: 0, purchasedBalance: 0 }

  const isPremium = data.is_premium
  const maxBoosts = isPremium ? 3 : 0
  const purchasedBalance = data.purchased_boosts_balance || 0

  // Free users: no monthly boosts, only purchased
  if (!isPremium) {
    return { boostsUsed: 0, maxBoosts, purchasedBalance }
  }

  // Premium users: monthly reset
  const periodMs = 30 * 24 * 60 * 60 * 1000
  const resetAt = new Date(data.boosts_reset_at).getTime()
  const now = Date.now()

  if (now - resetAt > periodMs) {
    return { boostsUsed: 0, maxBoosts, purchasedBalance }
  }
  return { boostsUsed: data.boosts_used || 0, maxBoosts, purchasedBalance }
}

// Avatar sıkıştırma — max 400px, JPEG %75 kalite
function compressImage(file, maxSize = 400, quality = 0.75) {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const canvas = document.createElement('canvas')
      let { width, height } = img
      if (width > height) {
        if (width > maxSize) { height = (height * maxSize) / width; width = maxSize }
      } else {
        if (height > maxSize) { width = (width * maxSize) / height; height = maxSize }
      }
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)
      canvas.toBlob((blob) => resolve(blob || file), 'image/jpeg', quality)
    }
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file) }
    img.src = url
  })
}

export async function uploadAvatar(userId, file) {
  // Sıkıştır
  const compressed = await compressImage(file)
  const filePath = `${userId}/avatar-${Date.now()}.jpg`
  const { error: uploadError } = await supabase.storage
    .from('media')
    .upload(filePath, compressed, { upsert: true, contentType: 'image/jpeg' })

  if (uploadError) return { data: null, error: uploadError }

  const { data: { publicUrl } } = supabase.storage
    .from('media')
    .getPublicUrl(filePath)

  return { data: { url: publicUrl }, error: null }
}

// ---- MESSAGING ----

/**
 * Get all conversations for a user, including partner profile and last message info.
 */
export async function getConversations(userId, { limit = 50 } = {}) {
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      id,
      last_message,
      last_message_at,
      created_at,
      participant_1,
      participant_2,
      p1:profiles!conversations_participant_1_fkey ( id, full_name, username, avatar_url ),
      p2:profiles!conversations_participant_2_fkey ( id, full_name, username, avatar_url )
    `)
    .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
    .order('last_message_at', { ascending: false, nullsFirst: false })
    .limit(limit)

  return { data, error }
}

/**
 * Get all messages in a conversation, oldest first.
 */
export async function getMessages(conversationId, { limit = 100 } = {}) {
  const { data, error } = await supabase
    .from('messages')
    .select('id, sender_id, text, created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(limit)
  // Reverse so oldest first in UI
  return { data: data ? data.reverse() : data, error }
}

/**
 * Send a message and update the conversation's last_message snapshot.
 */
export async function sendMessage({ conversationId, senderId, text }) {
  const { data, error } = await supabase
    .from('messages')
    .insert({ conversation_id: conversationId, sender_id: senderId, text })
    .select()
    .single()

  if (!error) {
    // Update last_message snapshot on conversation
    await supabase
      .from('conversations')
      .update({ last_message: text, last_message_at: new Date().toISOString() })
      .eq('id', conversationId)
  }

  return { data, error }
}

/**
 * Find or create a conversation between two users.
 * Returns the conversation id.
 */
export async function findOrCreateConversation(myId, partnerId) {
  // Normalise order so (A,B) and (B,A) map to the same row
  const p1 = myId < partnerId ? myId : partnerId
  const p2 = myId < partnerId ? partnerId : myId

  // Try to find existing
  const { data: existing } = await supabase
    .from('conversations')
    .select('id')
    .eq('participant_1', p1)
    .eq('participant_2', p2)
    .maybeSingle()

  if (existing) return { data: existing, error: null }

  // Create new
  const { data, error } = await supabase
    .from('conversations')
    .insert({ participant_1: p1, participant_2: p2 })
    .select()
    .single()

  return { data, error }
}

/**
 * Subscribe to new messages in a conversation.
 * Returns Supabase channel — call channel.unsubscribe() on cleanup.
 */
export function subscribeToMessages(conversationId, onNewMessage) {
  return supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
      (payload) => onNewMessage(payload.new)
    )
    .subscribe()
}

// ---- OUTFIT VOTES (like / dislike) ----

export async function voteAbTest({ outfitId, userId, voteChoice }) {
  try {
    const { data, error } = await supabase
      .from('ab_votes')
      .upsert({ outfit_id: outfitId, user_id: userId, vote_choice: voteChoice }, { onConflict: 'outfit_id,user_id' })
      .select()
      .single()
    return { data, error }
  } catch (err) {
    console.warn('[voteAbTest] ab_votes table may not exist:', err.message)
    return { data: null, error: err }
  }
}

export async function getAbVoteStats(outfitId) {
  try {
    const { data, error } = await supabase.rpc('get_ab_vote_stats', { post_id: outfitId })
    if (error) {
      console.warn('[getAbVoteStats] RPC may not exist:', error.message)
      return { data: { count_a: 0, count_b: 0, percentage_a: 0, percentage_b: 0, total: 0 }, error: null }
    }
    return { data, error }
  } catch (err) {
    console.warn('[getAbVoteStats] RPC error:', err.message)
    return { data: { count_a: 0, count_b: 0, percentage_a: 0, percentage_b: 0, total: 0 }, error: null }
  }
}

/**
 * Cast or change a like/dislike vote on an outfit.
 * If the user already voted the same way, it removes the vote (toggle).
 */
export async function voteOutfit({ outfitId, userId, vote }) {
  // Check existing vote
  const { data: existing } = await supabase
    .from('outfit_votes')
    .select('id, vote')
    .eq('outfit_id', outfitId)
    .eq('user_id', userId)
    .maybeSingle()

  if (existing) {
    if (existing.vote === vote) {
      // Toggle off
      await supabase.from('outfit_votes').delete().eq('id', existing.id)
      return { vote: null }
    } else {
      // Change vote
      await supabase.from('outfit_votes').update({ vote }).eq('id', existing.id)
      return { vote }
    }
  }

  // New vote
  await supabase.from('outfit_votes').insert({ outfit_id: outfitId, user_id: userId, vote })
  return { vote }
}

/**
 * Get aggregated vote counts and current user's vote for an outfit.
 */
export async function getOutfitVotes({ outfitId, userId }) {
  const { data, error } = await supabase
    .from('outfit_votes')
    .select('vote, user_id')
    .eq('outfit_id', outfitId)
    .limit(1000)

  if (error) return { likes: 0, dislikes: 0, myVote: null }

  const likes = data.filter(v => v.vote === 'like').length
  const dislikes = data.filter(v => v.vote === 'dislike').length
  const myVote = data.find(v => v.user_id === userId)?.vote || null
  const total = likes + dislikes
  const likePct = total > 0 ? Math.round((likes / total) * 100) : null

  return { likes, dislikes, likePct, myVote, total }
}

// ---- ITEM VOTES (thumbs up / down per item) ----

/**
 * Cast or toggle a thumbs up/down vote on a specific item in an outfit.
 */
export async function voteItem({ outfitId, itemIndex, userId, vote }) {
  const { data: existing } = await supabase
    .from('item_votes')
    .select('id, vote')
    .eq('outfit_id', outfitId)
    .eq('item_index', itemIndex)
    .eq('user_id', userId)
    .maybeSingle()

  if (existing) {
    if (existing.vote === vote) {
      await supabase.from('item_votes').delete().eq('id', existing.id)
      return { vote: null }
    } else {
      await supabase.from('item_votes').update({ vote }).eq('id', existing.id)
      return { vote }
    }
  }

  await supabase.from('item_votes').insert({
    outfit_id: outfitId,
    item_index: itemIndex,
    user_id: userId,
    vote
  })
  return { vote }
}

/**
 * Get item vote counts for all items in an outfit and current user's votes.
 */
export async function getItemVotes({ outfitId, userId }) {
  const { data, error } = await supabase
    .from('item_votes')
    .select('item_index, vote, user_id')
    .eq('outfit_id', outfitId)
    .limit(1000)

  if (error || !data) return {}

  // Group by item_index
  const result = {}
  for (const row of data) {
    if (!result[row.item_index]) {
      result[row.item_index] = { up: 0, down: 0, myVote: null, total: 0 }
    }
    if (row.vote === 'up') result[row.item_index].up++
    else result[row.item_index].down++
    if (row.user_id === userId) result[row.item_index].myVote = row.vote
  }

  // Compute percentage
  for (const idx of Object.keys(result)) {
    const r = result[idx]
    r.total = r.up + r.down
    r.pct = r.total > 0 ? Math.round((r.up / r.total) * 100) : null
  }

  return result
}

// ---- V2: LEVEL & XP ----

export async function getUserLevel(userId) {
  const { data, error } = await supabase
    .from('user_levels')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  return { data, error }
}

export async function getXpHistory(userId, limit = 20) {
  const { data, error } = await supabase
    .from('xp_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  return { data, error }
}

export async function awardXp(userId, amount, source, sourceId = null) {
  const { data, error } = await supabase
    .rpc('award_xp', {
      p_user_id: userId,
      p_amount: amount,
      p_source: source,
      p_source_id: sourceId
    })
  return { data, error }
}

export async function updateStreak(userId) {
  const { data, error } = await supabase
    .rpc('update_streak', { p_user_id: userId })
  return { data, error }
}

export async function trackAction(userId, actionType) {
  const { data, error } = await supabase
    .rpc('update_mission_progress', {
      p_user_id: userId,
      p_action_type: actionType,
      p_increment: 1
    })
  return { data, error }
}

export async function checkBadges(userId) {
  const { data, error } = await supabase
    .rpc('check_badges', { p_user_id: userId })
  return { data, error }
}

// XP icin gereken seviye hesabi — SQL formülü: L × (L-1) × 50
// LVL 1=0, LVL 2=100, LVL 3=300, LVL 4=600, LVL 5=1000, LVL 50=122500
export function getXpForLevel(level) {
  return level * (level - 1) * 50
}

export function getLevelProgress(xp, level) {
  const currentLevelXp = getXpForLevel(level)
  const nextLevelXp = getXpForLevel(level + 1)
  const range = nextLevelXp - currentLevelXp
  const progress = xp - currentLevelXp
  return { progress, range, percentage: range > 0 ? Math.min(progress / range, 1) : 0 }
}

// Yeni kullanıcı için user_levels satırı yoksa oluştur
export async function ensureUserLevel(userId) {
  const { data } = await supabase
    .from('user_levels')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle()
  if (!data) {
    await supabase
      .from('user_levels')
      .upsert({ user_id: userId, xp: 0, level: 1, title: 'Yeni Stilist' }, { onConflict: 'user_id' })
  }
}

// ---- V2: DAILY MISSIONS ----

export async function getDailyMissions(userId) {
  // Yeni get_user_missions RPC — daily + admin görevleri döner
  const { data, error } = await supabase
    .rpc('get_user_missions', { p_user_id: userId })
  return { data, error }
}

export async function assignDailyMissions(userId) {
  const { data, error } = await supabase
    .rpc('assign_daily_missions', { p_user_id: userId })
  return { data, error }
}

export async function claimMissionReward(missionId) {
  const { data, error } = await supabase
    .from('user_missions')
    .update({ is_claimed: true })
    .eq('id', missionId)
    .eq('is_completed', true)
    .eq('is_claimed', false)
    .select()
    .single()
  return { data, error }
}

// ---- V2: EVENTS ----

export async function getActiveEvents() {
  const now = new Date().toISOString()
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('is_active', true)
    .lte('start_date', now)
    .gte('end_date', now)
    .order('start_date', { ascending: false })
  return { data, error }
}

export async function getEventById(eventId) {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .single()
  return { data, error }
}

export async function getEventPosts(eventTag, limit = 50) {
  // outfits tablosunda tags array kolonu olabilir veya caption icinde arama
  const { data, error } = await supabase
    .from('outfits')
    .select(`
      *,
      profiles:user_id ( id, full_name, username, avatar_url ),
      outfit_media ( id, media_url, media_type, sort_order )
    `)
    .ilike('caption', `%${eventTag}%`)
    .order('created_at', { ascending: false })
    .limit(limit)
  return { data, error }
}

export async function joinEvent(eventId, userId, outfitId) {
  const { data, error } = await supabase
    .from('event_participations')
    .insert({
      event_id: eventId,
      user_id: userId,
      outfit_id: outfitId
    })
    .select()
    .single()
  return { data, error }
}

export async function getEventParticipations(eventId) {
  const { data, error } = await supabase
    .from('event_participations')
    .select(`
      *,
      profiles:user_id ( id, full_name, username, avatar_url )
    `)
    .eq('event_id', eventId)
    .order('created_at', { ascending: false })
  return { data, error }
}

// ---- V2: BADGES ----

export async function getUserBadges(userId) {
  const { data, error } = await supabase
    .from('user_badges')
    .select('*, badge:badges(*)')
    .eq('user_id', userId)
    .order('earned_at', { ascending: false })
  return { data, error }
}

export async function getAllBadges() {
  const { data, error } = await supabase
    .from('badges')
    .select('*')
    .eq('is_active', true)
    .order('rarity', { ascending: true })
  return { data, error }
}

// ---- V2: LEADERBOARD ----

export async function getLeaderboard(limit = 50) {
  const { data, error } = await supabase
    .from('user_levels')
    .select('*, profiles:user_id(full_name, username, avatar_url)')
    .order('xp', { ascending: false })
    .limit(limit)
  return { data, error }
}

// ---- ACCOUNT DELETION ----

export async function deleteAccount(userId) {
  try {
    // 1. Get user's outfit IDs to delete their media references
    const { data: userOutfits } = await supabase
      .from('outfits')
      .select('id')
      .eq('user_id', userId)

    const outfitIds = (userOutfits || []).map(o => o.id)

    // 2. Delete outfit_media for user's outfits
    if (outfitIds.length > 0) {
      await supabase.from('outfit_media').delete().in('outfit_id', outfitIds)
    }

    // 3. Delete votes on user's outfits + votes cast by user
    if (outfitIds.length > 0) {
      await supabase.from('outfit_votes').delete().in('outfit_id', outfitIds)
      await supabase.from('item_votes').delete().in('outfit_id', outfitIds)
    }
    await supabase.from('outfit_votes').delete().eq('user_id', userId)
    await supabase.from('item_votes').delete().eq('user_id', userId)

    // 4. Delete likes (given and received)
    await supabase.from('likes').delete().eq('user_id', userId)
    if (outfitIds.length > 0) {
      await supabase.from('likes').delete().in('outfit_id', outfitIds)
    }

    // 5. Delete comments
    await supabase.from('comments').delete().eq('user_id', userId)

    // 6. Delete messages & conversations
    await supabase.from('messages').delete().eq('sender_id', userId)
    await supabase.from('conversations').delete().eq('user1_id', userId)
    await supabase.from('conversations').delete().eq('user2_id', userId)

    // 7. Delete outfits
    await supabase.from('outfits').delete().eq('user_id', userId)

    // 8. Delete storage files
    const { data: files } = await supabase.storage.from('media').list(userId)
    if (files && files.length > 0) {
      const paths = files.map(f => `${userId}/${f.name}`)
      await supabase.storage.from('media').remove(paths)
    }

    // 9. Delete profile
    await supabase.from('profiles').delete().eq('id', userId)

    // 10. Sign out
    await supabase.auth.signOut()

    return { success: true }
  } catch (err) {
    console.error('[deleteAccount] Error:', err)
    return { success: false, error: err.message }
  }
}

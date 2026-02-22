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

export async function getOutfitsByUser(userId) {
  const { data, error } = await supabase
    .from('outfits')
    .select(`
      *,
      outfit_media ( id, media_url, media_type, sort_order )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
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

export async function createOutfit({ userId, caption, gender, vibe, ageRangeMin, ageRangeMax, items, isBoosted }) {
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
      is_boosted: isBoosted
    })
    .select()
    .single()
  return { data, error }
}

// ---- MEDIA ----

export async function uploadMedia(userId, file) {
  const fileExt = file.name.split('.').pop()
  const filePath = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from('media')
    .upload(filePath, file)

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

export async function getUserLikes(userId) {
  const { data, error } = await supabase
    .from('likes')
    .select('outfit_id')
    .eq('user_id', userId)
  return { data, error }
}

// ---- COMMENTS ----

export async function getComments(outfitId) {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      profiles:user_id ( id, full_name, username, avatar_url )
    `)
    .eq('outfit_id', outfitId)
    .order('created_at', { ascending: true })
  return { data, error }
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
    .upsert({ id: userId, ...updates })
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

export async function getBoostStatus(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('boosts_used, boosts_reset_at, is_premium')
    .eq('id', userId)
    .single()
  if (error) return { boostsUsed: 0, maxBoosts: 2 }

  const isPremium = data.is_premium
  const maxBoosts = isPremium ? 5 : 2

  // Free users: no reset, 2 total lifetime boosts
  if (!isPremium) {
    return { boostsUsed: data.boosts_used || 0, maxBoosts }
  }

  // Premium users: monthly reset
  const periodMs = 30 * 24 * 60 * 60 * 1000
  const resetAt = new Date(data.boosts_reset_at).getTime()
  const now = Date.now()

  if (now - resetAt > periodMs) {
    return { boostsUsed: 0, maxBoosts }
  }
  return { boostsUsed: data.boosts_used || 0, maxBoosts }
}

export async function uploadAvatar(userId, file) {
  const filePath = `${userId}/avatar-${Date.now()}.${file.name.split('.').pop()}`
  const { error: uploadError } = await supabase.storage
    .from('media')
    .upload(filePath, file, { upsert: true })

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
export async function getConversations(userId) {
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

  return { data, error }
}

/**
 * Get all messages in a conversation, oldest first.
 */
export async function getMessages(conversationId) {
  const { data, error } = await supabase
    .from('messages')
    .select('id, sender_id, text, created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  return { data, error }
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

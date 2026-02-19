import { supabase } from './supabase'

// ---- OUTFITS ----

export async function getOutfits({ limit = 20, offset = 0 } = {}) {
  const { data, error } = await supabase
    .from('outfits')
    .select(`
      *,
      profiles:user_id ( id, full_name, username, avatar_url, city, age, is_premium ),
      outfit_media ( id, media_url, media_type, sort_order )
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)
  return { data, error }
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

export async function createOutfit({ userId, caption, gender, vibe, ageRangeMin, ageRangeMax, items, isBoosted }) {
  const { data, error } = await supabase
    .from('outfits')
    .insert({
      user_id: userId,
      caption,
      gender,
      vibe,
      age_range_min: ageRangeMin,
      age_range_max: ageRangeMax,
      items,
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
  const { data, error } = await supabase
    .from('comments')
    .insert({ outfit_id: outfitId, user_id: userId, text })
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

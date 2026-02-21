// seed-outfits.mjs
// Run AFTER seed-profiles.mjs completes
// Usage: node seed-outfits.mjs

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://yxgatmrkuaxhlxhgwzsi.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_qsiGcv1ADFPZlSmWP8ZVcQ_1FPK8bbn'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// 5 profiles with their outfits
const accounts = [
    {
        email: 'test2@gmail.com',
        password: 'test1234',
        outfit: {
            caption: 'Minimalist Monday vibes. Less is more. 🤍',
            gender: 'female',
            vibe: 'Minimalist',
            age_range_min: 20,
            age_range_max: 30,
            items: [
                { name: 'Beyaz Oversize Gömlek', brand: 'Zara', link: null, feedbackEnabled: true, position: { x: '50%', y: '30%' } },
                { name: 'Wide Leg Pantolon', brand: 'Mango', link: null, feedbackEnabled: true, position: { x: '50%', y: '60%' } },
                { name: 'Deri Sandalet', brand: 'Aldo', link: null, feedbackEnabled: true, position: { x: '50%', y: '85%' } },
            ],
            photos: [
                'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
                'https://images.unsplash.com/photo-1581338834647-b0fb40704e21?w=800&q=80',
                'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80',
            ],
        },
    },
    {
        email: 'test3@gmail.com',
        password: 'test1234',
        outfit: {
            caption: 'Vintage garage sale find + kicks 🔥 #streetwear',
            gender: 'male',
            vibe: 'Streetwear',
            age_range_min: 18,
            age_range_max: 30,
            items: [
                { name: 'Vintage Bomber Ceket', brand: 'Thrift', link: null, feedbackEnabled: true, position: { x: '50%', y: '35%' } },
                { name: 'Siyah Cargo Pantolon', brand: 'H&M', link: null, feedbackEnabled: true, position: { x: '50%', y: '62%' } },
                { name: 'Air Force 1', brand: 'Nike', link: null, feedbackEnabled: true, position: { x: '50%', y: '88%' } },
            ],
            photos: [
                'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=800&q=80',
                'https://images.unsplash.com/photo-1516826957135-700dedea698c?w=800&q=80',
                'https://images.unsplash.com/photo-1541647376583-8934aaf3448a?w=800&q=80',
            ],
        },
    },
    {
        email: 'test4@gmail.com',
        password: 'test1234',
        outfit: {
            caption: 'Boho summer afternoon ✨🌿 rate my fit!',
            gender: 'female',
            vibe: 'Bohemian',
            age_range_min: 18,
            age_range_max: 28,
            items: [
                { name: 'Çiçekli Midi Elbise', brand: 'Free People', link: null, feedbackEnabled: true, position: { x: '50%', y: '45%' } },
                { name: 'Hasır Çanta', brand: 'Stradivarius', link: null, feedbackEnabled: true, position: { x: '70%', y: '65%' } },
                { name: 'Platform Espadrille', brand: 'Zara', link: null, feedbackEnabled: true, position: { x: '50%', y: '88%' } },
            ],
            photos: [
                'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80',
                'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80',
                'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&q=80',
            ],
        },
    },
    {
        email: 'test5@gmail.com',
        password: 'test1234',
        outfit: {
            caption: 'Grunge is not dead. 🖤⛓️',
            gender: 'male',
            vibe: 'Grunge',
            age_range_min: 20,
            age_range_max: 32,
            items: [
                { name: 'Siyah Band Tişört', brand: 'Thrift', link: null, feedbackEnabled: true, position: { x: '50%', y: '32%' } },
                { name: 'Yırtık Denim Pantolon', brand: "Levi's", link: null, feedbackEnabled: true, position: { x: '50%', y: '60%' } },
                { name: 'Dr. Martens Bot', brand: 'Dr. Martens', link: null, feedbackEnabled: true, position: { x: '50%', y: '87%' } },
            ],
            photos: [
                'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80',
                'https://images.unsplash.com/photo-1475180098004-ca77a66827be?w=800&q=80',
                'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=800&q=80',
            ],
        },
    },
    {
        email: 'test6@gmail.com',
        password: 'test1234',
        outfit: {
            caption: 'Y2K era never left my closet 💿✨',
            gender: 'female',
            vibe: 'Vintage',
            age_range_min: 18,
            age_range_max: 28,
            items: [
                { name: 'Baby Tee', brand: 'Vintage', link: null, feedbackEnabled: true, position: { x: '50%', y: '28%' } },
                { name: 'Low Rise Denim', brand: "Levi's", link: null, feedbackEnabled: true, position: { x: '50%', y: '58%' } },
                { name: 'Platform Sneaker', brand: 'Buffalo', link: null, feedbackEnabled: true, position: { x: '50%', y: '86%' } },
            ],
            photos: [
                'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80',
                'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80',
                'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
            ],
        },
    },
]

async function seedOutfit(account) {
    const { email, password, outfit } = account
    console.log(`\n→ Signing in as ${email}...`)

    // Sign in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) {
        console.error(`  ✗ Sign in failed: ${signInError.message}`)
        return
    }

    const userId = signInData.user.id
    console.log(`  ✓ Signed in: ${userId}`)

    // Create outfit row
    const { data: outfitRow, error: outfitError } = await supabase
        .from('outfits')
        .insert({
            user_id: userId,
            caption: outfit.caption,
            gender: outfit.gender,
            vibe: outfit.vibe,
            age_range_min: outfit.age_range_min,
            age_range_max: outfit.age_range_max,
            items: outfit.items,
            is_boosted: false,
        })
        .select()
        .single()

    if (outfitError) {
        console.error(`  ✗ Outfit insert failed: ${outfitError.message}`)
        return
    }
    console.log(`  ✓ Outfit created: ${outfitRow.id}`)

    // Insert 3 media rows
    for (let i = 0; i < outfit.photos.length; i++) {
        const { error: mediaError } = await supabase
            .from('outfit_media')
            .insert({
                outfit_id: outfitRow.id,
                media_url: outfit.photos[i],
                media_type: 'image',
                sort_order: i,
            })

        if (mediaError) {
            console.error(`  ✗ Media ${i + 1} failed: ${mediaError.message}`)
        } else {
            console.log(`  ✓ Photo ${i + 1}/3 added`)
        }
    }

    // Sign out
    await supabase.auth.signOut()
}

; (async () => {
    for (const account of accounts) {
        await seedOutfit(account)
        await new Promise(r => setTimeout(r, 600))
    }
    console.log('\n✅ All outfits seeded!')
    process.exit(0)
})()

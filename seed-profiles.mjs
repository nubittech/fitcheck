// seed-profiles.mjs
// Run with: node seed-profiles.mjs
// Requires: npm install @supabase/supabase-js node-fetch

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://yxgatmrkuaxhlxhgwzsi.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_qsiGcv1ADFPZlSmWP8ZVcQ_1FPK8bbn'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const profiles = [
    {
        email: 'test2@gmail.com',
        password: 'test1234',
        full_name: 'Ayşe Kaya',
        age: 23,
        city: 'İstanbul',
        bio: 'Minimalist giyim tutkunu. Sade ama şık.',
        vibes: ['Minimalist', 'Casual'],
        avatar_url: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&q=80',
    },
    {
        email: 'test3@gmail.com',
        password: 'test1234',
        full_name: 'Mert Demir',
        age: 26,
        city: 'Ankara',
        bio: 'Sokak modası ve vintage parçalar benim dünyam.',
        vibes: ['Streetwear', 'Vintage'],
        avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
    },
    {
        email: 'test4@gmail.com',
        password: 'test1234',
        full_name: 'Zeynep Şahin',
        age: 21,
        city: 'İzmir',
        bio: 'Bohem ruhlu, rengarenk stilin peşindeyim.',
        vibes: ['Bohemian', 'Casual'],
        avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
    },
    {
        email: 'test5@gmail.com',
        password: 'test1234',
        full_name: 'Can Yılmaz',
        age: 28,
        city: 'İstanbul',
        bio: 'Grunge ve alternatif modayı karıştırıyorum.',
        vibes: ['Grunge', 'Streetwear'],
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    },
    {
        email: 'test6@gmail.com',
        password: 'test1234',
        full_name: 'Lara Çetin',
        age: 24,
        city: 'Bursa',
        bio: 'Y2K ve vintage karışımı bir stile sahibim.',
        vibes: ['Vintage', 'Minimalist'],
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
    },
]

async function createProfile(p) {
    console.log(`\n→ Creating ${p.email}...`)

    // 1. Sign up
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: p.email,
        password: p.password,
        options: { data: { full_name: p.full_name } }
    })

    if (signUpError) {
        console.error(`  ✗ SignUp error: ${signUpError.message}`)
        return
    }

    const userId = signUpData.user?.id
    if (!userId) {
        console.error('  ✗ No user ID returned')
        return
    }
    console.log(`  ✓ User created: ${userId}`)

    // 2. Upsert profile row
    const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
            id: userId,
            full_name: p.full_name,
            age: p.age,
            city: p.city,
            bio: p.bio,
            vibes: p.vibes,
            avatar_url: p.avatar_url,
            updated_at: new Date().toISOString(),
        })

    if (profileError) {
        console.error(`  ✗ Profile upsert error: ${profileError.message}`)
    } else {
        console.log(`  ✓ Profile row saved (${p.full_name}, ${p.age}, ${p.city})`)
    }
}

; (async () => {
    for (const p of profiles) {
        await createProfile(p)
        // small delay between requests
        await new Promise(r => setTimeout(r, 800))
    }
    console.log('\n✅ All done!')
    process.exit(0)
})()

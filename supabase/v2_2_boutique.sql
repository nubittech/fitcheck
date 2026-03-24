-- ============================================================
-- V2.2 Boutique & Influencer Account System
-- Feature flag: FEATURES.BOUTIQUE_ACCOUNTS = false (pasif)
-- ============================================================

-- 1. profiles tablosuna yeni alanlar
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS account_type text NOT NULL DEFAULT 'normal'
    CHECK (account_type IN ('normal', 'premium', 'boutique', 'influencer')),
  ADD COLUMN IF NOT EXISTS boutique_name text,
  ADD COLUMN IF NOT EXISTS shop_url text;

-- 2. outfits tablosuna butik ürün alanları
ALTER TABLE outfits
  ADD COLUMN IF NOT EXISTS is_boutique_product boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS product_price numeric(10,2),
  ADD COLUMN IF NOT EXISTS product_url text,
  ADD COLUMN IF NOT EXISTS product_brand text,
  ADD COLUMN IF NOT EXISTS product_sizes text,
  ADD COLUMN IF NOT EXISTS product_description text;

-- 3. Butik yorumlar tablosu
CREATE TABLE IF NOT EXISTS boutique_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  boutique_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(boutique_id, user_id)  -- kullanıcı başına 1 yorum
);

-- 4. RLS
ALTER TABLE boutique_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "boutique_reviews_select" ON boutique_reviews
  FOR SELECT USING (true);

CREATE POLICY "boutique_reviews_insert" ON boutique_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "boutique_reviews_update" ON boutique_reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "boutique_reviews_delete" ON boutique_reviews
  FOR DELETE USING (auth.uid() = user_id);

-- 5. Butik ortalama puanı hesaplayan view
CREATE OR REPLACE VIEW boutique_stats AS
SELECT
  p.id AS boutique_id,
  p.boutique_name,
  p.account_type,
  COUNT(DISTINCT o.id) AS total_products,
  COUNT(DISTINCT f.follower_id) AS total_followers,
  ROUND(AVG(r.rating)::numeric, 1) AS avg_rating,
  COUNT(r.id) AS review_count
FROM profiles p
LEFT JOIN outfits o ON o.user_id = p.id AND o.is_boutique_product = true
LEFT JOIN boutique_reviews r ON r.boutique_id = p.id
LEFT JOIN followers f ON f.following_id = p.id
WHERE p.account_type IN ('boutique', 'influencer')
GROUP BY p.id, p.boutique_name, p.account_type;

-- 6. Takipçi tablosu (influencer + butik için)
CREATE TABLE IF NOT EXISTS followers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

ALTER TABLE followers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "followers_select" ON followers
  FOR SELECT USING (true);

CREATE POLICY "followers_insert" ON followers
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "followers_delete" ON followers
  FOR DELETE USING (auth.uid() = follower_id);

-- 7. Index'ler
CREATE INDEX IF NOT EXISTS idx_outfits_boutique ON outfits(user_id) WHERE is_boutique_product = true;
CREATE INDEX IF NOT EXISTS idx_boutique_reviews_boutique_id ON boutique_reviews(boutique_id);
CREATE INDEX IF NOT EXISTS idx_followers_following ON followers(following_id);
CREATE INDEX IF NOT EXISTS idx_followers_follower ON followers(follower_id);

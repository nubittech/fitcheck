-- =============================================
-- V2.1 AB + SÜPER Görevler
-- 1. AB görevleri (ab_vote, ab_post) — her tier'a 2 yeni
-- 2. Süper görevler — kalıcı/haftalık
-- 3. get_user_missions güncelle — super görevleri de dönsün
-- 4. assign_super_missions fonksiyonu
-- 5. check_trending_missions — trend mekaniği
-- =============================================


-- =============================================
-- BÖLÜM 1: AB Mission Templates (daily)
-- =============================================

-- Tier 1 (Level 1-10)
INSERT INTO mission_templates (title, description, icon, xp_reward, mission_type, action_type, target_count, is_active, priority, min_level, max_level, tier) VALUES
  ('A/B Oyla', 'Bir A/B kıyaslamasında oy ver', 'ab_vote', 30, 'daily', 'ab_vote', 1, true, 5, 1, 10, 1),
  ('A/B Kombin Paylaş', 'Bir A/B kıyaslamalı kombin paylaş', 'ab_post', 50, 'daily', 'ab_post', 1, true, 5, 1, 10, 1);

-- Tier 2 (Level 11-25)
INSERT INTO mission_templates (title, description, icon, xp_reward, mission_type, action_type, target_count, is_active, priority, min_level, max_level, tier) VALUES
  ('A/B Jürisi', '2 A/B kıyaslamasında oy ver', 'ab_vote', 60, 'daily', 'ab_vote', 2, true, 5, 11, 25, 2),
  ('A/B Moda Düellosu', 'Bir A/B kıyaslamalı kombin paylaş', 'ab_post', 80, 'daily', 'ab_post', 1, true, 5, 11, 25, 2);

-- Tier 3 (Level 26-40)
INSERT INTO mission_templates (title, description, icon, xp_reward, mission_type, action_type, target_count, is_active, priority, min_level, max_level, tier) VALUES
  ('Stil Hakemi', '3 A/B kıyaslamasında oy ver', 'ab_vote', 100, 'daily', 'ab_vote', 3, true, 5, 26, 40, 3),
  ('A/B Kombinci', 'Bir A/B kıyaslamalı kombin paylaş', 'ab_post', 150, 'daily', 'ab_post', 1, true, 5, 26, 40, 3);

-- Tier 4 (Level 41-50)
INSERT INTO mission_templates (title, description, icon, xp_reward, mission_type, action_type, target_count, is_active, priority, min_level, max_level, tier) VALUES
  ('A/B Uzmanı', '4 A/B kıyaslamasında oy ver', 'ab_vote', 150, 'daily', 'ab_vote', 4, true, 5, 41, 50, 4),
  ('A/B Showdown', 'Bir A/B kıyaslamalı kombin paylaş', 'ab_post', 200, 'daily', 'ab_post', 1, true, 5, 41, 50, 4);


-- =============================================
-- BÖLÜM 2: Süper Görev Templates
-- "Kombininle Trendlere Gir" kaldırıldı — Trend Yıldızı zaten aynı
-- link_sale görevleri is_active=false (mekanik henüz yok)
-- =============================================

DELETE FROM mission_templates WHERE mission_type = 'super';

INSERT INTO mission_templates (title, description, icon, xp_reward, mission_type, action_type, target_count, is_active, priority, min_level, max_level, tier) VALUES
  ('Trend Yıldızı', 'Kombinin 24 saat sonunda trendlerde bitirsin', 'trend_finish', 150, 'super', 'trend_finish', 1, true, 20, 1, 50, 0),
  ('Trend Hakimi', 'Kombinin 3 kez trendlerde bitirsin', 'trend_finish', 500, 'super', 'trend_finish', 3, true, 15, 1, 50, 0),
  ('Link''ten Satış', 'Paylaştığın linkten bir satış gerçekleştir', 'link_sale', 100, 'super', 'link_sale', 1, false, 20, 1, 50, 0),
  ('Satış Ustası', 'Linklerinden 3 satış gerçekleştir', 'link_sale', 300, 'super', 'link_sale', 3, false, 15, 1, 50, 0);


-- =============================================
-- BÖLÜM 3: assign_super_missions — haftalık süper görev ata
-- =============================================

DROP FUNCTION IF EXISTS assign_super_missions(UUID);

CREATE OR REPLACE FUNCTION assign_super_missions(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  this_monday DATE;
BEGIN
  this_monday := date_trunc('week', CURRENT_DATE)::DATE;

  IF EXISTS (
    SELECT 1 FROM user_missions um
    JOIN mission_templates mt ON mt.id = um.mission_id
    WHERE um.user_id = p_user_id
      AND um.assigned_date = this_monday
      AND mt.mission_type = 'super'
  ) THEN
    RETURN;
  END IF;

  INSERT INTO user_missions (user_id, mission_id, assigned_date, progress, target, expires_at)
  SELECT
    p_user_id,
    mt.id,
    this_monday,
    0,
    mt.target_count,
    (this_monday + INTERVAL '7 days')::TIMESTAMPTZ
  FROM mission_templates mt
  WHERE mt.is_active = true
    AND mt.mission_type = 'super'
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION assign_super_missions TO authenticated;


-- =============================================
-- BÖLÜM 4: get_user_missions güncelle — super görevleri de dönsün
-- =============================================

DROP FUNCTION IF EXISTS get_user_missions(UUID, DATE);

CREATE OR REPLACE FUNCTION get_user_missions(p_user_id UUID, p_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
  id UUID,
  mission_id UUID,
  title TEXT,
  description TEXT,
  icon TEXT,
  xp_reward INTEGER,
  mission_type TEXT,
  action_type TEXT,
  target_count INTEGER,
  progress INTEGER,
  target INTEGER,
  is_completed BOOLEAN,
  is_claimed BOOLEAN,
  assigned_date DATE,
  expires_at TIMESTAMPTZ,
  tier INTEGER,
  min_level INTEGER,
  max_level INTEGER
) AS $$
BEGIN
  PERFORM assign_super_missions(p_user_id);

  RETURN QUERY
  SELECT
    um.id, um.mission_id, mt.title, mt.description, mt.icon,
    mt.xp_reward, mt.mission_type, mt.action_type, mt.target_count,
    um.progress, um.target, um.is_completed, um.is_claimed,
    um.assigned_date, um.expires_at, mt.tier, mt.min_level, mt.max_level
  FROM user_missions um
  JOIN mission_templates mt ON mt.id = um.mission_id
  WHERE um.user_id = p_user_id
    AND (
      (mt.mission_type = 'daily' AND um.assigned_date = p_date)
      OR
      (mt.mission_type = 'super' AND (um.expires_at IS NULL OR um.expires_at > now()) AND um.is_claimed = false)
      OR
      (mt.mission_type = 'admin' AND (um.expires_at IS NULL OR um.expires_at > now()) AND um.is_claimed = false)
    )
  ORDER BY
    CASE mt.mission_type
      WHEN 'daily' THEN 1
      WHEN 'super' THEN 2
      WHEN 'admin' THEN 3
    END,
    mt.priority DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_user_missions TO authenticated;


-- =============================================
-- BÖLÜM 5: check_trending_missions — Trend mekaniği
-- Son 24 saatteki en çok beğenilen top 8 outfit = trending
-- Bu fonksiyon her saat çalıştırılabilir (pg_cron ile)
-- veya manuel çağrılabilir
-- =============================================

DROP FUNCTION IF EXISTS check_trending_missions();

CREATE OR REPLACE FUNCTION check_trending_missions()
RETURNS INTEGER AS $$
DECLARE
  affected_count INTEGER := 0;
  trending_outfit RECORD;
BEGIN
  -- Son 24 saatteki top 8 outfit = trending
  FOR trending_outfit IN (
    SELECT o.id, o.user_id
    FROM outfits o
    WHERE o.created_at > now() - INTERVAL '24 hours'
    ORDER BY o.likes_count DESC
    LIMIT 8
  )
  LOOP
    -- Bu kullanıcının trend_finish görevine +1 progress ekle
    UPDATE user_missions um
    SET progress = LEAST(progress + 1, um.target),
        is_completed = CASE WHEN LEAST(progress + 1, um.target) >= um.target THEN true ELSE is_completed END
    FROM mission_templates mt
    WHERE um.mission_id = mt.id
      AND um.user_id = trending_outfit.user_id
      AND mt.action_type = 'trend_finish'
      AND um.is_completed = false
      AND (um.expires_at IS NULL OR um.expires_at > now());

    IF FOUND THEN
      affected_count := affected_count + 1;
    END IF;
  END LOOP;

  RETURN affected_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- pg_cron ile her saat çalıştırılabilir:
-- SELECT cron.schedule('check-trending', '0 * * * *', 'SELECT check_trending_missions()');

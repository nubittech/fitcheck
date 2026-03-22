-- =============================================
-- 0. Tablo yoksa oluştur + eksik kolonları ekle
-- =============================================
CREATE TABLE IF NOT EXISTS mission_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '🎯',
  xp_reward INTEGER NOT NULL DEFAULT 10,
  mission_type TEXT NOT NULL DEFAULT 'daily',
  action_type TEXT NOT NULL,
  target_count INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE mission_templates ADD COLUMN IF NOT EXISTS min_level INTEGER DEFAULT 1;
ALTER TABLE mission_templates ADD COLUMN IF NOT EXISTS max_level INTEGER DEFAULT 100;
ALTER TABLE mission_templates ADD COLUMN IF NOT EXISTS tier INTEGER DEFAULT 0;

CREATE TABLE IF NOT EXISTS user_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_id UUID NOT NULL REFERENCES mission_templates(id) ON DELETE CASCADE,
  assigned_date DATE DEFAULT CURRENT_DATE,
  progress INTEGER DEFAULT 0,
  target INTEGER DEFAULT 1,
  is_completed BOOLEAN DEFAULT false,
  is_claimed BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, mission_id, assigned_date)
);

CREATE TABLE IF NOT EXISTS user_levels (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  title TEXT DEFAULT 'Yeni Stilist',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- 1. Profil Tamamla görevi — tek seferlik, 50 XP
-- =============================================
INSERT INTO mission_templates (title, description, icon, xp_reward, mission_type, action_type, target_count, is_active, priority, min_level, max_level, tier)
VALUES
  ('Profilini Tamamla', 'Profil bilgilerini doldur (ad, kullanıcı adı, fotoğraf, şehir, yaş)', 'complete_profile', 50, 'onetime', 'complete_profile', 1, true, 99, 1, 100, 0);


-- 2. Tüm mevcut kullanıcılara profil görevini ata
INSERT INTO user_missions (user_id, mission_id, assigned_date, progress, target, is_completed, is_claimed)
SELECT
  ul.user_id,
  mt.id,
  CURRENT_DATE,
  0,
  1,
  false,
  false
FROM user_levels ul
CROSS JOIN mission_templates mt
WHERE mt.action_type = 'complete_profile'
  AND mt.mission_type = 'onetime'
ON CONFLICT DO NOTHING;


-- 3. Profil güncellendiğinde otomatik kontrol trigger
CREATE OR REPLACE FUNCTION on_profile_update_check_mission()
RETURNS TRIGGER AS $$
BEGIN
  IF (
    NEW.full_name IS NOT NULL AND NEW.full_name != '' AND
    NEW.username IS NOT NULL AND NEW.username != '' AND
    NEW.avatar_url IS NOT NULL AND NEW.avatar_url != '' AND
    NEW.city IS NOT NULL AND NEW.city != '' AND
    NEW.age IS NOT NULL AND NEW.age > 0
  ) THEN
    UPDATE user_missions
    SET progress = 1, is_completed = true
    WHERE user_id = NEW.id
      AND is_completed = false
      AND mission_id IN (
        SELECT id FROM mission_templates
        WHERE action_type = 'complete_profile' AND mission_type = 'onetime'
      );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_profile_update_mission ON profiles;
CREATE TRIGGER trg_profile_update_mission
  AFTER UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION on_profile_update_check_mission();


-- =============================================
-- 4. Günlük görevlere "Boost Kullan" ekle — her tier'a 1 tane
-- =============================================
INSERT INTO mission_templates (title, description, icon, xp_reward, mission_type, action_type, target_count, is_active, priority, min_level, max_level, tier) VALUES
  ('Boost Kullan', '1 boost kullan', 'use_boost', 30, 'daily', 'use_boost', 1, true, 4, 1, 10, 1),
  ('Boost Kullan', '1 boost kullan', 'use_boost', 55, 'daily', 'use_boost', 1, true, 4, 11, 25, 2),
  ('Boost Kullan', '1 boost kullan', 'use_boost', 90, 'daily', 'use_boost', 1, true, 4, 26, 40, 3),
  ('Boost Kullan', '1 boost kullan', 'use_boost', 130, 'daily', 'use_boost', 1, true, 4, 41, 100, 4);


-- =============================================
-- 5. Süper görevlere "3 Boost Kullan" ve "Premium Ol" ekle
-- =============================================
INSERT INTO mission_templates (title, description, icon, xp_reward, mission_type, action_type, target_count, is_active, priority, min_level, max_level, tier) VALUES
  ('Boost Ustası', '3 boost kullan', 'use_boost', 200, 'super', 'use_boost', 3, true, 18, 1, 100, 0),
  ('Premium Ol', 'Premium üyeliğe geç', 'premium', 500, 'super', 'become_premium', 1, true, 17, 1, 100, 0);


-- =============================================
-- 6. Yeni süper görevleri tüm kullanıcılara ata
-- =============================================
INSERT INTO user_missions (user_id, mission_id, assigned_date, progress, target, is_completed, is_claimed)
SELECT
  ul.user_id,
  mt.id,
  date_trunc('week', CURRENT_DATE)::DATE,
  0,
  mt.target_count,
  false,
  false
FROM user_levels ul
CROSS JOIN mission_templates mt
WHERE mt.mission_type = 'super'
  AND mt.is_active = true
  AND mt.action_type IN ('use_boost', 'become_premium')
ON CONFLICT DO NOTHING;


-- =============================================
-- 7. get_user_missions güncelle — onetime görevleri dahil et
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
DECLARE
  this_monday DATE;
BEGIN
  this_monday := date_trunc('week', CURRENT_DATE)::DATE;

  -- Süper görevleri ata (yoksa)
  PERFORM assign_super_missions(p_user_id);

  RETURN QUERY
  SELECT
    um.id,
    um.mission_id,
    mt.title,
    mt.description,
    mt.icon,
    mt.xp_reward,
    mt.mission_type,
    mt.action_type,
    mt.target_count,
    um.progress,
    um.target,
    um.is_completed,
    um.is_claimed,
    um.assigned_date,
    um.expires_at,
    mt.tier,
    mt.min_level,
    mt.max_level
  FROM user_missions um
  JOIN mission_templates mt ON mt.id = um.mission_id
  WHERE um.user_id = p_user_id
    AND (
      (mt.mission_type = 'daily' AND um.assigned_date = p_date)
      OR
      (mt.mission_type = 'super' AND um.assigned_date = this_monday)
      OR
      (mt.mission_type = 'onetime' AND um.is_claimed = false)
      OR
      (mt.mission_type = 'admin' AND (um.expires_at IS NULL OR um.expires_at > now()) AND um.is_claimed = false)
    )
  ORDER BY
    CASE mt.mission_type
      WHEN 'onetime' THEN 0
      WHEN 'daily' THEN 1
      WHEN 'super' THEN 2
      WHEN 'admin' THEN 3
    END,
    um.is_completed ASC,
    mt.xp_reward DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

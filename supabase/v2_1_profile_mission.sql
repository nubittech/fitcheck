-- =============================================
-- Profil Tamamla görevi — tek seferlik, 50 XP
-- =============================================

-- 1. Mission template ekle
INSERT INTO mission_templates (title, description, icon, xp_reward, mission_type, action_type, target_count, is_active, priority, min_level, max_level, tier)
VALUES
  ('Profilini Tamamla', 'Profil bilgilerini doldur (ad, kullanıcı adı, fotoğraf, şehir, yaş)', 'complete_profile', 50, 'onetime', 'complete_profile', 1, true, 99, 1, 100, 0);


-- 2. Tüm mevcut kullanıcılara ata (henüz tamamlamamış olanlar)
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


-- 3. check_profile_complete fonksiyonu — profil alanlarını kontrol et
CREATE OR REPLACE FUNCTION check_profile_complete(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  profile_ok BOOLEAN;
BEGIN
  SELECT (
    full_name IS NOT NULL AND full_name != '' AND
    username IS NOT NULL AND username != '' AND
    avatar_url IS NOT NULL AND avatar_url != '' AND
    city IS NOT NULL AND city != '' AND
    age IS NOT NULL AND age > 0
  ) INTO profile_ok
  FROM profiles
  WHERE id = p_user_id;

  RETURN COALESCE(profile_ok, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 4. Profil güncellendiğinde otomatik kontrol et ve görevi tamamla
CREATE OR REPLACE FUNCTION on_profile_update_check_mission()
RETURNS TRIGGER AS $$
DECLARE
  mission_row RECORD;
BEGIN
  -- Profil tamamlandı mı kontrol et
  IF (
    NEW.full_name IS NOT NULL AND NEW.full_name != '' AND
    NEW.username IS NOT NULL AND NEW.username != '' AND
    NEW.avatar_url IS NOT NULL AND NEW.avatar_url != '' AND
    NEW.city IS NOT NULL AND NEW.city != '' AND
    NEW.age IS NOT NULL AND NEW.age > 0
  ) THEN
    -- complete_profile görevini bul ve tamamla
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

-- Trigger oluştur
DROP TRIGGER IF EXISTS trg_profile_update_mission ON profiles;
CREATE TRIGGER trg_profile_update_mission
  AFTER UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION on_profile_update_check_mission();


-- 5. get_user_missions güncelle — onetime görevleri de dahil et
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
      -- Günlük görevler: bugün atanan
      (mt.mission_type = 'daily' AND um.assigned_date = p_date)
      OR
      -- Süper görevler: bu hafta atanan
      (mt.mission_type = 'super' AND um.assigned_date = this_monday)
      OR
      -- Tek seferlik görevler: claim edilmemiş olanlar
      (mt.mission_type = 'onetime' AND um.is_claimed = false)
      OR
      -- Admin görevleri: süresi dolmamış ve claim edilmemiş
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

-- =============================================
-- assign_super_missions — Haftalık süper görev atama
-- Her pazartesi yenilenir, tamamlansa da tamamlanmasa da
-- =============================================
DROP FUNCTION IF EXISTS assign_super_missions(UUID);

CREATE OR REPLACE FUNCTION assign_super_missions(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  this_monday DATE;
BEGIN
  -- Bu haftanın pazartesisini bul
  this_monday := date_trunc('week', CURRENT_DATE)::DATE;

  -- Bu hafta zaten atandıysa çık
  IF EXISTS (
    SELECT 1 FROM user_missions um
    JOIN mission_templates mt ON mt.id = um.mission_id
    WHERE um.user_id = p_user_id
      AND um.assigned_date = this_monday
      AND mt.mission_type = 'super'
  ) THEN
    RETURN;
  END IF;

  -- Geçen haftanın süper görevlerini sil (tamamlansa da tamamlanmasa da)
  DELETE FROM user_missions
  WHERE user_id = p_user_id
    AND assigned_date < this_monday
    AND mission_id IN (SELECT id FROM mission_templates WHERE mission_type = 'super');

  -- Aktif süper görevleri ata
  INSERT INTO user_missions (user_id, mission_id, assigned_date, progress, target, is_completed, is_claimed)
  SELECT
    p_user_id,
    mt.id,
    this_monday,
    0,
    mt.target_count,
    false,
    false
  FROM mission_templates mt
  WHERE mt.mission_type = 'super'
    AND mt.is_active = true
  ON CONFLICT DO NOTHING;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =============================================
-- get_user_missions güncelle — süper görevleri bu haftanınkileri getir
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

  -- Önce süper görevleri ata (yoksa)
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
      -- Admin görevleri: süresi dolmamış ve claim edilmemiş
      (mt.mission_type = 'admin' AND (um.expires_at IS NULL OR um.expires_at > now()) AND um.is_claimed = false)
    )
  ORDER BY
    CASE mt.mission_type
      WHEN 'daily' THEN 1
      WHEN 'super' THEN 2
      WHEN 'admin' THEN 3
    END,
    um.is_completed ASC,
    mt.xp_reward DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =============================================
-- Mevcut süper görevleri bu haftanın pazartesine güncelle
-- =============================================
UPDATE user_missions
SET assigned_date = date_trunc('week', CURRENT_DATE)::DATE
WHERE mission_id IN (SELECT id FROM mission_templates WHERE mission_type = 'super');

-- =============================================
-- V2.1 FIX: user_missions tablosu is_completed/is_claimed kullanıyor
-- "status" kolonu yok — fonksiyonları düzelt
-- =============================================

-- Önce expires_at kolonu ekle (admin görevleri için)
ALTER TABLE user_missions
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- Mevcut fonksiyonları sil
DROP FUNCTION IF EXISTS assign_daily_missions(UUID);
DROP FUNCTION IF EXISTS get_user_missions(UUID, DATE);
DROP FUNCTION IF EXISTS admin_broadcast_mission(UUID, TIMESTAMPTZ);


-- =============================================
-- 1. assign_daily_missions — DÜZELTILMIŞ (status yok)
-- =============================================
CREATE OR REPLACE FUNCTION assign_daily_missions(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  today DATE := CURRENT_DATE;
  user_level INTEGER;
BEGIN
  -- Bugün zaten atandıysa çık
  IF EXISTS (
    SELECT 1 FROM user_missions um
    JOIN mission_templates mt ON mt.id = um.mission_id
    WHERE um.user_id = p_user_id
      AND um.assigned_date = today
      AND mt.mission_type = 'daily'
  ) THEN
    RETURN;
  END IF;

  -- Kullanıcının mevcut levelini al
  SELECT COALESCE(level, 1) INTO user_level
  FROM user_levels
  WHERE user_id = p_user_id;

  IF user_level IS NULL THEN
    user_level := 1;
  END IF;

  -- Kullanıcının level'ına uygun tier'dan 6 rastgele görev ata
  INSERT INTO user_missions (user_id, mission_id, assigned_date, progress, target)
  SELECT
    p_user_id,
    mt.id,
    today,
    0,
    mt.target_count
  FROM mission_templates mt
  WHERE mt.is_active = true
    AND mt.mission_type = 'daily'
    AND mt.min_level <= user_level
    AND mt.max_level >= user_level
  ORDER BY RANDOM()
  LIMIT 6
  ON CONFLICT DO NOTHING;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =============================================
-- 2. get_user_missions — DÜZELTILMIŞ (is_completed/is_claimed)
-- =============================================
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
      -- Admin görevleri: süresi dolmamış ve claim edilmemiş
      (mt.mission_type = 'admin' AND (um.expires_at IS NULL OR um.expires_at > now()) AND um.is_claimed = false)
    )
  ORDER BY mt.mission_type DESC, mt.priority DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_user_missions TO authenticated;


-- =============================================
-- 3. admin_broadcast_mission — DÜZELTILMIŞ (status yok)
-- =============================================
CREATE OR REPLACE FUNCTION admin_broadcast_mission(
  p_mission_id UUID,
  p_expires_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  assigned_count INTEGER := 0;
  target_count_val INTEGER;
BEGIN
  SELECT target_count INTO target_count_val
  FROM mission_templates WHERE id = p_mission_id;

  INSERT INTO user_missions (user_id, mission_id, assigned_date, progress, target, expires_at)
  SELECT
    ul.user_id,
    p_mission_id,
    CURRENT_DATE,
    0,
    target_count_val,
    COALESCE(p_expires_at, CURRENT_DATE + INTERVAL '7 days')
  FROM user_levels ul
  WHERE ul.last_active_date >= CURRENT_DATE - INTERVAL '30 days'
     OR ul.last_active_date IS NULL
  ON CONFLICT DO NOTHING;

  GET DIAGNOSTICS assigned_count = ROW_COUNT;
  RETURN assigned_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION admin_broadcast_mission TO authenticated;


-- =============================================
-- 4. Mevcut tüm kullanıcılara user_levels oluştur + görev ata
-- =============================================
INSERT INTO user_levels (user_id, xp, level, title)
SELECT id, 0, 1, 'Yeni Stilist'
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_levels)
ON CONFLICT (user_id) DO NOTHING;

-- Bugün için tüm kullanıcılara görev ata
SELECT assign_daily_missions(user_id)
FROM user_levels;


-- =============================================
-- 5. Kontrol sorgusu
-- =============================================
-- SELECT user_id, COUNT(*) as gorev_sayisi
-- FROM user_missions WHERE assigned_date = CURRENT_DATE
-- GROUP BY user_id;

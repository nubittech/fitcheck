-- =============================================
-- assign_daily_missions — DÜZELTME: aynı action_type'tan birden fazla görev atanmamalı
-- =============================================
DROP FUNCTION IF EXISTS assign_daily_missions(UUID);

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

  -- Her action_type'tan sadece 1 template seç, sonra rastgele 6 tane al
  INSERT INTO user_missions (user_id, mission_id, assigned_date, progress, target)
  SELECT
    p_user_id,
    id,
    today,
    0,
    target_count
  FROM (
    SELECT DISTINCT ON (action_type)
      mt.id,
      mt.action_type,
      mt.target_count
    FROM mission_templates mt
    WHERE mt.is_active = true
      AND mt.mission_type = 'daily'
      AND mt.min_level <= user_level
      AND mt.max_level >= user_level
    ORDER BY action_type, RANDOM()
  ) unique_missions
  ORDER BY RANDOM()
  LIMIT 6
  ON CONFLICT DO NOTHING;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =============================================
-- Bugünkü duplikat görevleri temizle ve yeniden ata
-- =============================================
DELETE FROM user_missions
WHERE assigned_date = CURRENT_DATE
  AND mission_id IN (SELECT id FROM mission_templates WHERE mission_type = 'daily');

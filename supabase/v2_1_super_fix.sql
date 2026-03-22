-- =============================================
-- 1. Süper görev açıklamalarını güncelle
-- =============================================
UPDATE mission_templates
SET description = 'Kombinin 24 saat sonunda trendlerde bitirsin'
WHERE action_type = 'trend_finish' AND target_count = 1;

UPDATE mission_templates
SET description = 'Kombinin 3 kez trendlerde bitirsin'
WHERE action_type = 'trend_finish' AND target_count = 3;


-- =============================================
-- 2. get_user_missions — super görevleri de dahil et
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
      -- Süper görevler: claim edilmemiş olanlar (haftalık, süresiz)
      (mt.mission_type = 'super' AND um.is_claimed = false)
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

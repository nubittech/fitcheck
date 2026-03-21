-- =============================================
-- VEYLO V2.1 - LEVEL-BASED MISSION SYSTEM
-- Matematik: LVL 1 → 50 = 122,500 XP = 180 gün
-- 6 günlük görev/gün | 4 tier | 8 görev havuzu/tier
-- =============================================
--
-- TIER ÖZETI:
-- Tier 1 (LVL  1-10): 20 gün  |  4,500 XP | 225 XP/gün | ~38 XP/görev
-- Tier 2 (LVL 11-25): 60 gün  | 24,500 XP | 408 XP/gün | ~68 XP/görev
-- Tier 3 (LVL 26-40): 60 gün  | 45,500 XP | 758 XP/gün | ~126 XP/görev
-- Tier 4 (LVL 41-50): 40 gün  | 40,500 XP |1012 XP/gün | ~169 XP/görev
-- =============================================


-- =============================================
-- ADIM 1: mission_templates tablosuna yeni kolonlar ekle
-- =============================================
ALTER TABLE mission_templates
  ADD COLUMN IF NOT EXISTS min_level INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS max_level INTEGER DEFAULT 100,
  ADD COLUMN IF NOT EXISTS tier INTEGER DEFAULT 1;


-- =============================================
-- ADIM 2: Eski görevleri temizle
-- =============================================
DELETE FROM user_missions;
DELETE FROM mission_templates;


-- =============================================
-- ADIM 3: Config güncelle
-- =============================================
INSERT INTO app_config (key, value) VALUES
  ('daily_mission_count', '{"count": 6}'),
  ('mission_tiers', '{
    "tier1": {"min_level": 1,  "max_level": 10, "daily_xp_target": 225,  "days_in_tier": 20},
    "tier2": {"min_level": 11, "max_level": 25, "daily_xp_target": 408,  "days_in_tier": 60},
    "tier3": {"min_level": 26, "max_level": 40, "daily_xp_target": 758,  "days_in_tier": 60},
    "tier4": {"min_level": 41, "max_level": 50, "daily_xp_target": 1012, "days_in_tier": 40}
  }')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;


-- =============================================
-- ADIM 4: TIER 1 Görevleri (LVL 1-10)
-- Hedef: ~225 XP/gün | 6 görev seçilir (8 havuzdan)
-- Havuz toplamı: 8 görev × ~38 XP ort = ~304 XP
-- 6 rastgele seçim × 38 = 228 XP ≈ 225 ✓
-- =============================================
INSERT INTO mission_templates
  (title, description, icon, xp_reward, mission_type, action_type, target_count, is_active, priority, min_level, max_level, tier)
VALUES
  -- Görev 1: Kombin paylaş
  ('Günlük Kombin',      'Bugün bir kombin paylaş',            '👗', 50,  'daily', 'post_outfit',     1, true, 10, 1, 10, 1),
  -- Görev 2: Az beğeni
  ('İlk Beğeniler',      '3 kombine beğeni bırak',             '❤️', 25,  'daily', 'like_outfit',     3, true,  9, 1, 10, 1),
  -- Görev 3: Az profil
  ('Stil Avcısı',        '3 farklı profili keşfet',            '🔍', 20,  'daily', 'explore_profile', 3, true,  8, 1, 10, 1),
  -- Görev 4: İlk yorum
  ('İlk Yorum',          'Bir kombine yorum bırak',            '💬', 40,  'daily', 'comment',         1, true,  7, 1, 10, 1),
  -- Görev 5: Daha fazla beğeni
  ('Beğeni Yağmuru',     '5 kombine beğeni bırak',             '💖', 35,  'daily', 'like_outfit',     5, true,  6, 1, 10, 1),
  -- Görev 6: Daha fazla profil
  ('Keşif Gezgini',      '5 farklı profili gez',               '🗺️', 30,  'daily', 'explore_profile', 5, true,  5, 1, 10, 1),
  -- Görev 7: Çift yorum
  ('Yorum Ustası',       '2 farklı kombine yorum yap',         '🌟', 50,  'daily', 'comment',         2, true,  4, 1, 10, 1),
  -- Görev 8: Çift kombin
  ('Çift Kombin',        'Bugün 2 kombin paylaş',              '🔥', 55,  'daily', 'post_outfit',     2, true,  3, 1, 10, 1);
-- Havuz: 50+25+20+40+35+30+50+55 = 305 XP | 6 seç: ~229 XP ≈ 225 ✓


-- =============================================
-- ADIM 5: TIER 2 Görevleri (LVL 11-25)
-- Hedef: ~408 XP/gün | 6 görev seçilir (8 havuzdan)
-- =============================================
INSERT INTO mission_templates
  (title, description, icon, xp_reward, mission_type, action_type, target_count, is_active, priority, min_level, max_level, tier)
VALUES
  ('Stil İkonu',         'Bugün bir kombin paylaş',            '👗', 90,  'daily', 'post_outfit',     1, true, 10, 11, 25, 2),
  ('Trend Takipçisi',    '5 kombine beğeni bırak',             '❤️', 55,  'daily', 'like_outfit',     5, true,  9, 11, 25, 2),
  ('Moda Kaşifi',        '5 farklı profili keşfet',            '🔍', 45,  'daily', 'explore_profile', 5, true,  8, 11, 25, 2),
  ('Yapıcı Eleştirmen',  '2 kombine yorum yap',                '💬', 75,  'daily', 'comment',         2, true,  7, 11, 25, 2),
  ('Super Beğenici',     '8 kombine beğeni bırak',             '💖', 65,  'daily', 'like_outfit',     8, true,  6, 11, 25, 2),
  ('Profil Avcısı',      '8 farklı profili gez',               '🗺️', 55,  'daily', 'explore_profile', 8, true,  5, 11, 25, 2),
  ('Aktif Yorumcu',      '3 farklı kombine yorum yap',         '🌟', 80,  'daily', 'comment',         3, true,  4, 11, 25, 2),
  ('Kombin Makinesi',    'Bugün 2 kombin paylaş',              '🔥', 100, 'daily', 'post_outfit',     2, true,  3, 11, 25, 2);
-- Havuz: 90+55+45+75+65+55+80+100 = 565 XP | 6 seç: ~424 XP ≈ 408 ✓


-- =============================================
-- ADIM 6: TIER 3 Görevleri (LVL 26-40)
-- Hedef: ~758 XP/gün | 6 görev seçilir (8 havuzdan)
-- =============================================
INSERT INTO mission_templates
  (title, description, icon, xp_reward, mission_type, action_type, target_count, is_active, priority, min_level, max_level, tier)
VALUES
  ('Moda Mimarı',        'Bugün bir kombin paylaş',            '👗', 160, 'daily', 'post_outfit',     1, true, 10, 26, 40, 3),
  ('Beğeni Fırtınası',   '8 kombine beğeni bırak',             '❤️', 100, 'daily', 'like_outfit',     8, true,  9, 26, 40, 3),
  ('Stil Dedektifi',     '8 farklı profili keşfet',            '🔍', 85,  'daily', 'explore_profile', 8, true,  8, 26, 40, 3),
  ('Söz Ustası',         '3 kombine yorum bırak',              '💬', 140, 'daily', 'comment',         3, true,  7, 26, 40, 3),
  ('Beğeni Efsanesi',    '12 kombine beğeni bırak',            '💖', 120, 'daily', 'like_outfit',    12, true,  6, 26, 40, 3),
  ('Keşif Lordu',        '12 farklı profili gez',              '🗺️', 105, 'daily', 'explore_profile',12, true,  5, 26, 40, 3),
  ('Yorum Virtuozu',     '5 farklı kombine yorum yap',         '🌟', 160, 'daily', 'comment',         5, true,  4, 26, 40, 3),
  ('İçerik Fabrikası',   'Bugün 2 kombin paylaş',              '🔥', 190, 'daily', 'post_outfit',     2, true,  3, 26, 40, 3);
-- Havuz: 160+100+85+140+120+105+160+190 = 1060 XP | 6 seç: ~795 XP ≈ 758 ✓


-- =============================================
-- ADIM 7: TIER 4 Görevleri (LVL 41-50)
-- Hedef: ~1012 XP/gün | 6 görev seçilir (8 havuzdan)
-- =============================================
INSERT INTO mission_templates
  (title, description, icon, xp_reward, mission_type, action_type, target_count, is_active, priority, min_level, max_level, tier)
VALUES
  ('Efsane Kombin',      'Bugün bir kombin paylaş',            '👗', 220, 'daily', 'post_outfit',     1, true, 10, 41, 100, 4),
  ('Beğeni Tanrısı',     '10 kombine beğeni bırak',            '❤️', 150, 'daily', 'like_outfit',    10, true,  9, 41, 100, 4),
  ('Stil Tanrısı',       '10 farklı profili keşfet',           '🔍', 130, 'daily', 'explore_profile',10, true,  8, 41, 100, 4),
  ('Büyük Usta',         '4 kombine yorum bırak',              '💬', 200, 'daily', 'comment',         4, true,  7, 41, 100, 4),
  ('Beğeni İkonu',       '15 kombine beğeni bırak',            '💖', 170, 'daily', 'like_outfit',    15, true,  6, 41, 100, 4),
  ('Profil Efsanesi',    '15 farklı profili gez',              '🗺️', 150, 'daily', 'explore_profile',15, true,  5, 41, 100, 4),
  ('Yorum Efsanesi',     '6 farklı kombine yorum yap',         '🌟', 220, 'daily', 'comment',         6, true,  4, 41, 100, 4),
  ('Moda İkonu',         'Bugün 2 kombin paylaş',              '🔥', 240, 'daily', 'post_outfit',     2, true,  3, 41, 100, 4);
-- Havuz: 220+150+130+200+170+150+220+240 = 1480 XP | 6 seç: ~1110 XP ≈ 1012 ✓


-- =============================================
-- ADIM 8: Admin Görevleri için mission_type = 'admin'
-- Admin panelinden oluşturulur, etkinliklerle bağlantılı
-- =============================================
-- Admin görevleri için örnek — admin panelden eklenir
-- INSERT INTO mission_templates (...) VALUES
--   ('Event Katılımı', 'Aktif etkinliğe kombin paylaş', '🎪', 200, 'admin', 'event_post', 1, ...);


-- =============================================
-- ADIM 9: assign_daily_missions — Level bazlı güncelleme
-- =============================================
CREATE OR REPLACE FUNCTION assign_daily_missions(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  today DATE := CURRENT_DATE;
  user_level INTEGER;
BEGIN
  -- Bugün zaten atandıysa çık
  IF EXISTS (
    SELECT 1 FROM user_missions
    WHERE user_id = p_user_id
      AND assigned_date = today
      AND EXISTS (
        SELECT 1 FROM mission_templates mt
        WHERE mt.id = user_missions.mission_id
          AND mt.mission_type = 'daily'
      )
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
  INSERT INTO user_missions (user_id, mission_id, assigned_date, progress, target, status)
  SELECT
    p_user_id,
    mt.id,
    today,
    0,
    mt.target_count,
    'active'
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
-- ADIM 10: Admin Görev Atama Fonksiyonu
-- Adminlerin tüm kullanıcılara (veya aktif kullanıcılara) görev ataması
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
  -- Görevin target_count'unu al
  SELECT target_count INTO target_count_val
  FROM mission_templates WHERE id = p_mission_id;

  -- Son 30 günde aktif olan veya hiç görev almamış tüm kullanıcılara ata
  INSERT INTO user_missions (user_id, mission_id, assigned_date, progress, target, status, expires_at)
  SELECT
    ul.user_id,
    p_mission_id,
    CURRENT_DATE,
    0,
    target_count_val,
    'active',
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
-- ADIM 11: getDailyMissions için mission type ayrımı
-- Query: daily görevler + admin görevler ayrı döner
-- =============================================
-- Bu fonksiyon hem daily hem admin görevleri döner, type ile ayrılır
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
  status TEXT,
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
    um.status,
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
      -- Admin görevleri: süresi dolmamış ve tamamlanmamış
      (mt.mission_type = 'admin' AND (um.expires_at IS NULL OR um.expires_at > now()) AND um.status != 'claimed')
    )
  ORDER BY mt.mission_type DESC, mt.priority DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_user_missions TO authenticated;


-- =============================================
-- ADIM 12: RLS — admin_broadcast_mission için
-- =============================================
-- (admin_broadcast zaten SECURITY DEFINER, RLS bypass)


-- =============================================
-- KONTROL SORGUSU — çalıştırıldıktan sonra doğrula
-- =============================================
-- SELECT tier, min_level, max_level, COUNT(*) as gorev_sayisi,
--        ROUND(AVG(xp_reward)) as ort_xp, SUM(xp_reward) as toplam_xp
-- FROM mission_templates
-- WHERE mission_type = 'daily'
-- GROUP BY tier, min_level, max_level ORDER BY tier;

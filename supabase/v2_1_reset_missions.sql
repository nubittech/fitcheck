-- =============================================
-- MISSION TEMPLATES RESET
-- Tüm duplikatları sil, tek seferlik temiz liste yükle
-- =============================================

-- 1. Önce user_missions'daki daily görev atamaları sil (super/onetime/admin dokunma)
DELETE FROM user_missions
WHERE mission_id IN (
  SELECT id FROM mission_templates WHERE mission_type = 'daily'
);

-- 2. Tüm mission_templates'i temizle
DELETE FROM mission_templates;


-- =============================================
-- TIER 1 (LVL 1-10) — Hedef: ~225 XP/gün
-- =============================================
INSERT INTO mission_templates (title, description, icon, xp_reward, mission_type, action_type, target_count, is_active, priority, min_level, max_level, tier) VALUES
  ('Günlük Kombin',     'Bugün bir kombin paylaş',            '👗', 50,  'daily', 'post_outfit',     1, true, 10, 1, 10, 1),
  ('İlk Beğeniler',     '3 kombine beğeni bırak',             '❤️', 25,  'daily', 'like_outfit',     3, true,  9, 1, 10, 1),
  ('Stil Avcısı',       '3 farklı profili keşfet',            '🔍', 20,  'daily', 'explore_profile', 3, true,  8, 1, 10, 1),
  ('İlk Yorum',         'Bir kombine yorum bırak',            '💬', 40,  'daily', 'comment',         1, true,  7, 1, 10, 1),
  ('Beğeni Yağmuru',    '5 kombine beğeni bırak',             '💖', 35,  'daily', 'like_outfit',     5, true,  6, 1, 10, 1),
  ('Keşif Gezgini',     '5 farklı profili gez',               '🗺️', 30,  'daily', 'explore_profile', 5, true,  5, 1, 10, 1),
  ('Yorum Ustası',      '2 farklı kombine yorum yap',         '🌟', 50,  'daily', 'comment',         2, true,  4, 1, 10, 1),
  ('Çift Kombin',       'Bugün 2 kombin paylaş',              '🔥', 55,  'daily', 'post_outfit',     2, true,  3, 1, 10, 1),
  ('A/B Oyla',          'Bir A/B kıyaslamasında oy ver',      'ab_vote', 30, 'daily', 'ab_vote',     1, true,  5, 1, 10, 1),
  ('A/B Kombin Paylaş', 'Bir A/B kıyaslamalı kombin paylaş', 'ab_post', 50, 'daily', 'ab_post',     1, true,  5, 1, 10, 1),
  ('Boost Kullan',      '1 boost kullan',                     'use_boost', 30, 'daily', 'use_boost', 1, true,  4, 1, 10, 1);

-- =============================================
-- TIER 2 (LVL 11-25) — Hedef: ~408 XP/gün
-- =============================================
INSERT INTO mission_templates (title, description, icon, xp_reward, mission_type, action_type, target_count, is_active, priority, min_level, max_level, tier) VALUES
  ('Stil İkonu',        'Bugün bir kombin paylaş',            '👗', 90,  'daily', 'post_outfit',     1, true, 10, 11, 25, 2),
  ('Trend Takipçisi',   '5 kombine beğeni bırak',             '❤️', 55,  'daily', 'like_outfit',     5, true,  9, 11, 25, 2),
  ('Moda Kaşifi',       '5 farklı profili keşfet',            '🔍', 45,  'daily', 'explore_profile', 5, true,  8, 11, 25, 2),
  ('Yapıcı Eleştirmen', '2 kombine yorum yap',                '💬', 75,  'daily', 'comment',         2, true,  7, 11, 25, 2),
  ('Süper Beğenici',    '8 kombine beğeni bırak',             '💖', 65,  'daily', 'like_outfit',     8, true,  6, 11, 25, 2),
  ('Profil Avcısı',     '8 farklı profili gez',               '🗺️', 55,  'daily', 'explore_profile', 8, true,  5, 11, 25, 2),
  ('Aktif Yorumcu',     '3 farklı kombine yorum yap',         '🌟', 80,  'daily', 'comment',         3, true,  4, 11, 25, 2),
  ('Kombin Makinesi',   'Bugün 2 kombin paylaş',              '🔥', 100, 'daily', 'post_outfit',     2, true,  3, 11, 25, 2),
  ('A/B Jürisi',        '2 A/B kıyaslamasında oy ver',        'ab_vote', 60, 'daily', 'ab_vote',     2, true,  5, 11, 25, 2),
  ('A/B Moda Düellosu', 'Bir A/B kıyaslamalı kombin paylaş', 'ab_post', 80, 'daily', 'ab_post',     1, true,  5, 11, 25, 2),
  ('Boost Kullan',      '1 boost kullan',                     'use_boost', 55, 'daily', 'use_boost', 1, true,  4, 11, 25, 2);

-- =============================================
-- TIER 3 (LVL 26-40) — Hedef: ~758 XP/gün
-- =============================================
INSERT INTO mission_templates (title, description, icon, xp_reward, mission_type, action_type, target_count, is_active, priority, min_level, max_level, tier) VALUES
  ('Moda Mimarı',       'Bugün bir kombin paylaş',            '👗', 160, 'daily', 'post_outfit',     1, true, 10, 26, 40, 3),
  ('Beğeni Fırtınası',  '8 kombine beğeni bırak',             '❤️', 100, 'daily', 'like_outfit',     8, true,  9, 26, 40, 3),
  ('Stil Dedektifi',    '8 farklı profili keşfet',            '🔍', 85,  'daily', 'explore_profile', 8, true,  8, 26, 40, 3),
  ('Söz Ustası',        '3 kombine yorum bırak',              '💬', 140, 'daily', 'comment',         3, true,  7, 26, 40, 3),
  ('Beğeni Efsanesi',   '12 kombine beğeni bırak',            '💖', 120, 'daily', 'like_outfit',    12, true,  6, 26, 40, 3),
  ('Keşif Lordu',       '12 farklı profili gez',              '🗺️', 105, 'daily', 'explore_profile',12, true,  5, 26, 40, 3),
  ('Yorum Virtuozu',    '5 farklı kombine yorum yap',         '🌟', 160, 'daily', 'comment',         5, true,  4, 26, 40, 3),
  ('İçerik Fabrikası',  'Bugün 2 kombin paylaş',              '🔥', 190, 'daily', 'post_outfit',     2, true,  3, 26, 40, 3),
  ('Stil Hakemi',       '3 A/B kıyaslamasında oy ver',        'ab_vote', 100, 'daily', 'ab_vote',    3, true,  5, 26, 40, 3),
  ('A/B Kombinci',      'Bir A/B kıyaslamalı kombin paylaş', 'ab_post', 150, 'daily', 'ab_post',     1, true,  5, 26, 40, 3),
  ('Boost Kullan',      '1 boost kullan',                     'use_boost', 90, 'daily', 'use_boost', 1, true,  4, 26, 40, 3);

-- =============================================
-- TIER 4 (LVL 41-50) — Hedef: ~1012 XP/gün
-- =============================================
INSERT INTO mission_templates (title, description, icon, xp_reward, mission_type, action_type, target_count, is_active, priority, min_level, max_level, tier) VALUES
  ('Efsane Kombin',     'Bugün bir kombin paylaş',            '👗', 220, 'daily', 'post_outfit',     1, true, 10, 41, 100, 4),
  ('Beğeni Tanrısı',    '10 kombine beğeni bırak',            '❤️', 150, 'daily', 'like_outfit',    10, true,  9, 41, 100, 4),
  ('Stil Tanrısı',      '10 farklı profili keşfet',           '🔍', 130, 'daily', 'explore_profile',10, true,  8, 41, 100, 4),
  ('Büyük Usta',        '4 kombine yorum bırak',              '💬', 200, 'daily', 'comment',         4, true,  7, 41, 100, 4),
  ('Beğeni İkonu',      '15 kombine beğeni bırak',            '💖', 170, 'daily', 'like_outfit',    15, true,  6, 41, 100, 4),
  ('Profil Efsanesi',   '15 farklı profili gez',              '🗺️', 150, 'daily', 'explore_profile',15, true,  5, 41, 100, 4),
  ('Yorum Efsanesi',    '6 farklı kombine yorum yap',         '🌟', 220, 'daily', 'comment',         6, true,  4, 41, 100, 4),
  ('Moda İkonu',        'Bugün 2 kombin paylaş',              '🔥', 240, 'daily', 'post_outfit',     2, true,  3, 41, 100, 4),
  ('A/B Uzmanı',        '4 A/B kıyaslamasında oy ver',        'ab_vote', 150, 'daily', 'ab_vote',    4, true,  5, 41, 100, 4),
  ('A/B Showdown',      'Bir A/B kıyaslamalı kombin paylaş', 'ab_post', 200, 'daily', 'ab_post',     1, true,  5, 41, 100, 4),
  ('Boost Kullan',      '1 boost kullan',                     'use_boost', 130, 'daily', 'use_boost',1, true,  4, 41, 100, 4);

-- =============================================
-- SÜPER GÖREVLER
-- =============================================
INSERT INTO mission_templates (title, description, icon, xp_reward, mission_type, action_type, target_count, is_active, priority, min_level, max_level, tier) VALUES
  ('Trend Yıldızı',   'Kombinin 24 saat sonunda trendlerde bitirsin', 'trend_finish',  150, 'super', 'trend_finish',    1, true,  20, 1, 100, 0),
  ('Trend Hakimi',    'Kombinin 3 kez trendlerde bitirsin',           'trend_finish',  500, 'super', 'trend_finish',    3, true,  15, 1, 100, 0),
  ('Link''ten Satış', 'Paylaştığın linkten bir satış gerçekleştir',   'link_sale',     100, 'super', 'link_sale',       1, false, 20, 1, 100, 0),
  ('Satış Ustası',    'Linklerinden 3 satış gerçekleştir',            'link_sale',     300, 'super', 'link_sale',       3, false, 15, 1, 100, 0),
  ('Boost Ustası',    '3 boost kullan',                               'use_boost',     200, 'super', 'use_boost',       3, true,  18, 1, 100, 0),
  ('Premium Ol',      'Premium üyeliğe geç',                          'premium',       500, 'super', 'become_premium',  1, true,  17, 1, 100, 0);

-- =============================================
-- ONETİME GÖREVLER
-- =============================================
INSERT INTO mission_templates (title, description, icon, xp_reward, mission_type, action_type, target_count, is_active, priority, min_level, max_level, tier) VALUES
  ('Profilini Tamamla', 'Profil bilgilerini doldur (ad, kullanıcı adı, fotoğraf, şehir, yaş)', 'complete_profile', 50, 'onetime', 'complete_profile', 1, true, 99, 1, 100, 0);

-- =============================================
-- KONTROL
-- =============================================
SELECT mission_type, tier, COUNT(*) as adet
FROM mission_templates
GROUP BY mission_type, tier
ORDER BY mission_type, tier;

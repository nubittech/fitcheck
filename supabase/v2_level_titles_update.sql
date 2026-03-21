-- =============================================
-- V2 Level Titles Güncelleme
-- Çaylak → Yeni Stilist + Yeni ara seviyeler
-- Supabase SQL Editor'de çalıştırın
-- =============================================

-- 1. app_config level_titles güncelle
UPDATE app_config
SET value = '{"1": "Yeni Stilist", "3": "Moda Meraklisi", "5": "Kombin Asigi", "8": "Stil Kasifi", "12": "Kombin Artisti", "16": "Fashionista", "20": "Stil Avcisi", "25": "Trend Setter", "30": "Moda Gurusu", "35": "Stil Ustasi", "40": "Moda Efsanesi", "50": "Moda Ikonu"}',
    updated_at = now()
WHERE key = 'level_titles';

-- 2. user_levels default title güncelle
ALTER TABLE user_levels ALTER COLUMN title SET DEFAULT 'Yeni Stilist';

-- 3. Mevcut Çaylak kullanıcıları güncelle
UPDATE user_levels SET title = 'Yeni Stilist' WHERE title = 'Caylak';

-- 4. calculate_level fonksiyonunu güncelle
CREATE OR REPLACE FUNCTION calculate_level()
RETURNS TRIGGER AS $$
DECLARE
  new_level INTEGER;
  new_title TEXT;
BEGIN
  new_level := GREATEST(1, FLOOR(0.5 + SQRT(0.25 + NEW.xp / 50.0))::INTEGER);

  new_title := CASE
    WHEN new_level >= 50 THEN 'Moda Ikonu'
    WHEN new_level >= 40 THEN 'Moda Efsanesi'
    WHEN new_level >= 35 THEN 'Stil Ustasi'
    WHEN new_level >= 30 THEN 'Moda Gurusu'
    WHEN new_level >= 25 THEN 'Trend Setter'
    WHEN new_level >= 20 THEN 'Stil Avcisi'
    WHEN new_level >= 16 THEN 'Fashionista'
    WHEN new_level >= 12 THEN 'Kombin Artisti'
    WHEN new_level >= 8  THEN 'Stil Kasifi'
    WHEN new_level >= 5  THEN 'Kombin Asigi'
    WHEN new_level >= 3  THEN 'Moda Meraklisi'
    ELSE 'Yeni Stilist'
  END;

  NEW.level := new_level;
  NEW.title := new_title;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

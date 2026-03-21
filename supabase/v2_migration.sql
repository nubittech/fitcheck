-- =============================================
-- VEYLO V2 - LEVEL / MISSION / EVENT SYSTEM
-- Supabase SQL Editor'de calistirin
-- =============================================

-- 1. APP CONFIG (Admin tarafindan yonetilebilir ayarlar)
CREATE TABLE IF NOT EXISTS app_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO app_config (key, value) VALUES
  ('xp_rewards', '{"post_outfit": 20, "like_outfit": 2, "receive_like": 5, "daily_login": 10, "comment": 5, "explore_profile": 1, "event_post": 50, "streak_7": 50, "streak_14": 100, "streak_30": 200}'),
  ('level_titles', '{"1": "Yeni Stilist", "3": "Moda Meraklisi", "5": "Kombin Asigi", "8": "Stil Kâsifi", "12": "Kombin Artisti", "16": "Fashionista", "20": "Stil Avcisi", "25": "Trend Setter", "30": "Moda Gurusu", "35": "Stil Ustasi", "40": "Moda Efsanesi", "50": "Moda Ikonu"}'),
  ('daily_mission_count', '{"count": 3}')
ON CONFLICT (key) DO NOTHING;


-- 2. USER LEVELS (Kullanici seviye ve XP)
CREATE TABLE IF NOT EXISTS user_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  title TEXT DEFAULT 'Yeni Stilist',
  streak_days INTEGER DEFAULT 0,
  last_active_date DATE,
  boost_multiplier FLOAT DEFAULT 1.0,
  boost_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_levels_xp ON user_levels(xp DESC);
CREATE INDEX IF NOT EXISTS idx_user_levels_level ON user_levels(level DESC);

ALTER TABLE user_levels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read levels" ON user_levels FOR SELECT USING (true);
CREATE POLICY "Users update own level" ON user_levels FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System inserts levels" ON user_levels FOR INSERT WITH CHECK (auth.uid() = user_id);


-- 3. XP TRANSACTIONS (XP kazanim gecmisi — audit log)
CREATE TABLE IF NOT EXISTS xp_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  source TEXT NOT NULL,
  source_id UUID,
  multiplier FLOAT DEFAULT 1.0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_xp_tx_user ON xp_transactions(user_id, created_at DESC);

ALTER TABLE xp_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own xp" ON xp_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System inserts xp" ON xp_transactions FOR INSERT WITH CHECK (true);


-- 4. MISSION TEMPLATES (Admin tarafindan yonetilen gorev sablonlari)
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

ALTER TABLE mission_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read missions" ON mission_templates FOR SELECT USING (true);
CREATE POLICY "Admins manage missions" ON mission_templates FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Default gorevler
INSERT INTO mission_templates (title, description, icon, xp_reward, mission_type, action_type, target_count, priority) VALUES
  ('Kombin Paylas', 'Bugün bir kombin paylas', '👗', 20, 'daily', 'post_outfit', 1, 10),
  ('3 Kombine Like At', 'Bugün 3 kombine like at', '❤️', 15, 'daily', 'like_outfit', 3, 9),
  ('5 Profili Kesfet', 'Bugün 5 farkli profili ziyaret et', '🔍', 10, 'daily', 'explore_profile', 5, 8),
  ('Yorum Yap', 'Bir kombine yorum birak', '💬', 10, 'daily', 'comment', 1, 7),
  ('2 Kombin Paylas', '2 farkli kombin paylas', '🔥', 30, 'daily', 'post_outfit', 2, 6),
  ('10 Like At', 'Toplam 10 kombine like at', '💖', 25, 'daily', 'like_outfit', 10, 5),
  ('Etkinlige Katil', 'Aktif bir etkinlige kombin paylas', '🎪', 50, 'daily', 'event_post', 1, 4)
ON CONFLICT DO NOTHING;


-- 5. USER MISSIONS (Kullanicinin aktif gorevleri)
CREATE TABLE IF NOT EXISTS user_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_id UUID REFERENCES mission_templates(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  target INTEGER NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  is_claimed BOOLEAN DEFAULT false,
  assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(user_id, mission_id, assigned_date)
);

CREATE INDEX IF NOT EXISTS idx_user_missions_active ON user_missions(user_id, assigned_date, is_completed);

ALTER TABLE user_missions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own missions" ON user_missions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own missions" ON user_missions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System inserts missions" ON user_missions FOR INSERT WITH CHECK (true);


-- 6. EVENTS (Aylik etkinlikler)
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  banner_url TEXT,
  tag TEXT NOT NULL UNIQUE,
  theme_color TEXT DEFAULT '#FF6B8A',
  xp_bonus INTEGER DEFAULT 50,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  participation_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_events_active ON events(is_active, start_date, end_date);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read events" ON events FOR SELECT USING (true);
CREATE POLICY "Admins manage events" ON events FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);


-- 7. EVENT PARTICIPATIONS (Etkinlik katilimlari)
CREATE TABLE IF NOT EXISTS event_participations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  outfit_id UUID,
  xp_awarded BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(event_id, user_id, outfit_id)
);

CREATE INDEX IF NOT EXISTS idx_event_parts ON event_participations(event_id, user_id);

ALTER TABLE event_participations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read participations" ON event_participations FOR SELECT USING (true);
CREATE POLICY "Users insert own" ON event_participations FOR INSERT WITH CHECK (auth.uid() = user_id);


-- 8. BADGES (Rozetler)
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  category TEXT DEFAULT 'general',
  requirement_type TEXT,
  requirement_value INTEGER,
  rarity TEXT DEFAULT 'common',
  xp_reward INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read badges" ON badges FOR SELECT USING (true);
CREATE POLICY "Admins manage badges" ON badges FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Default rozetler
INSERT INTO badges (name, description, icon_url, category, requirement_type, requirement_value, rarity, xp_reward) VALUES
  ('Ilk Adim', 'Ilk kombinini paylas', NULL, 'general', 'outfits_count', 1, 'common', 10),
  ('Stil Baslangici', '5 kombin paylas', NULL, 'general', 'outfits_count', 5, 'common', 25),
  ('Kombin Ustasi', '25 kombin paylas', NULL, 'general', 'outfits_count', 25, 'rare', 50),
  ('100 Club', '100 kombin paylas', NULL, 'general', 'outfits_count', 100, 'epic', 200),
  ('Hafta Savaşçısı', '7 gun streak', NULL, 'streak', 'streak_days', 7, 'common', 50),
  ('Ay Yildizi', '30 gun streak', NULL, 'streak', 'streak_days', 30, 'rare', 200),
  ('Seviye 10', 'Seviye 10a ulas', NULL, 'level', 'level_reach', 10, 'common', 50),
  ('Seviye 25', 'Seviye 25e ulas', NULL, 'level', 'level_reach', 25, 'rare', 100),
  ('Seviye 50', 'Seviye 50ye ulas', NULL, 'level', 'level_reach', 50, 'legendary', 500),
  ('Populer', '100 like al', NULL, 'social', 'likes_total', 100, 'rare', 75),
  ('Influencer', '1000 like al', NULL, 'social', 'likes_total', 1000, 'epic', 300)
ON CONFLICT DO NOTHING;


-- 9. USER BADGES
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(user_id, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_user_badges ON user_badges(user_id);

ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read user badges" ON user_badges FOR SELECT USING (true);
CREATE POLICY "System inserts badges" ON user_badges FOR INSERT WITH CHECK (true);


-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- A. Level hesaplama trigger'i
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

DROP TRIGGER IF EXISTS trg_calculate_level ON user_levels;
CREATE TRIGGER trg_calculate_level
  BEFORE INSERT OR UPDATE OF xp ON user_levels
  FOR EACH ROW EXECUTE FUNCTION calculate_level();


-- B. XP verme fonksiyonu (RPC)
CREATE OR REPLACE FUNCTION award_xp(
  p_user_id UUID,
  p_amount INTEGER,
  p_source TEXT,
  p_source_id UUID DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  current_boost FLOAT;
  final_amount INTEGER;
  old_level INTEGER;
  new_level_val INTEGER;
  result JSON;
BEGIN
  -- Boost kontrolu
  SELECT COALESCE(
    CASE WHEN boost_expires_at > now() THEN boost_multiplier ELSE 1.0 END,
    1.0
  ) INTO current_boost
  FROM user_levels WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    INSERT INTO user_levels (user_id, xp) VALUES (p_user_id, 0);
    current_boost := 1.0;
  END IF;

  final_amount := CEIL(p_amount * current_boost);

  SELECT level INTO old_level FROM user_levels WHERE user_id = p_user_id;

  UPDATE user_levels SET xp = xp + final_amount WHERE user_id = p_user_id;

  SELECT level INTO new_level_val FROM user_levels WHERE user_id = p_user_id;

  INSERT INTO xp_transactions (user_id, amount, source, source_id, multiplier)
  VALUES (p_user_id, final_amount, p_source, p_source_id, current_boost);

  result := json_build_object(
    'xp_added', final_amount,
    'multiplier', current_boost,
    'old_level', old_level,
    'new_level', new_level_val,
    'leveled_up', new_level_val > old_level
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- C. Gorev ilerlemesi guncelleme (RPC)
CREATE OR REPLACE FUNCTION update_mission_progress(
  p_user_id UUID,
  p_action_type TEXT,
  p_increment INTEGER DEFAULT 1
)
RETURNS JSON AS $$
DECLARE
  mission RECORD;
  results JSON[] := ARRAY[]::JSON[];
  xp_result JSON;
BEGIN
  FOR mission IN
    SELECT um.id, um.progress, um.target, mt.xp_reward, mt.title
    FROM user_missions um
    JOIN mission_templates mt ON mt.id = um.mission_id
    WHERE um.user_id = p_user_id
      AND um.assigned_date = CURRENT_DATE
      AND um.is_completed = false
      AND mt.action_type = p_action_type
  LOOP
    UPDATE user_missions
    SET
      progress = LEAST(progress + p_increment, mission.target),
      is_completed = (mission.progress + p_increment >= mission.target),
      completed_at = CASE WHEN mission.progress + p_increment >= mission.target THEN now() ELSE NULL END
    WHERE id = mission.id;

    IF mission.progress + p_increment >= mission.target THEN
      SELECT award_xp(p_user_id, mission.xp_reward, 'mission', mission.id) INTO xp_result;
      results := results || json_build_object(
        'mission_id', mission.id,
        'title', mission.title,
        'xp_earned', mission.xp_reward
      )::JSON;
    END IF;
  END LOOP;

  RETURN json_build_object('completed_missions', to_json(results));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- D. Streak guncelleme (RPC)
CREATE OR REPLACE FUNCTION update_streak(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  rec RECORD;
  streak_xp INTEGER := 0;
  base_xp INTEGER := 10;
BEGIN
  SELECT * INTO rec FROM user_levels WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    INSERT INTO user_levels (user_id, xp, last_active_date, streak_days)
    VALUES (p_user_id, 0, CURRENT_DATE, 1);
    PERFORM award_xp(p_user_id, base_xp, 'daily_login');
    RETURN json_build_object('streak', 1, 'bonus_xp', base_xp, 'is_new', true);
  END IF;

  IF rec.last_active_date = CURRENT_DATE THEN
    RETURN json_build_object('streak', rec.streak_days, 'bonus_xp', 0, 'already_claimed', true);

  ELSIF rec.last_active_date = CURRENT_DATE - 1 THEN
    UPDATE user_levels SET
      streak_days = streak_days + 1,
      last_active_date = CURRENT_DATE
    WHERE user_id = p_user_id;

    IF rec.streak_days + 1 = 7 THEN streak_xp := 50;
    ELSIF rec.streak_days + 1 = 14 THEN streak_xp := 100;
    ELSIF rec.streak_days + 1 = 30 THEN streak_xp := 200;
    END IF;

    PERFORM award_xp(p_user_id, base_xp + streak_xp, 'daily_login');
    RETURN json_build_object('streak', rec.streak_days + 1, 'bonus_xp', base_xp + streak_xp);

  ELSE
    UPDATE user_levels SET streak_days = 1, last_active_date = CURRENT_DATE
    WHERE user_id = p_user_id;
    PERFORM award_xp(p_user_id, base_xp, 'daily_login');
    RETURN json_build_object('streak', 1, 'bonus_xp', base_xp, 'streak_reset', true);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- E. Gunluk gorev atama fonksiyonu (manuel veya cron ile cagrilir)
CREATE OR REPLACE FUNCTION assign_daily_missions(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  mission_count INTEGER;
  assigned INTEGER;
BEGIN
  SELECT (value->>'count')::int INTO mission_count
  FROM app_config WHERE key = 'daily_mission_count';
  IF mission_count IS NULL THEN mission_count := 3; END IF;

  -- Bugun zaten atanmis mi?
  SELECT COUNT(*) INTO assigned
  FROM user_missions
  WHERE user_id = p_user_id AND assigned_date = CURRENT_DATE;

  IF assigned >= mission_count THEN
    RETURN json_build_object('status', 'already_assigned', 'count', assigned);
  END IF;

  -- Rastgele gorevler ata
  INSERT INTO user_missions (user_id, mission_id, target, assigned_date)
  SELECT
    p_user_id,
    m.id,
    m.target_count,
    CURRENT_DATE
  FROM mission_templates m
  WHERE m.is_active = true AND m.mission_type = 'daily'
  ORDER BY RANDOM()
  LIMIT mission_count
  ON CONFLICT DO NOTHING;

  SELECT COUNT(*) INTO assigned
  FROM user_missions
  WHERE user_id = p_user_id AND assigned_date = CURRENT_DATE;

  RETURN json_build_object('status', 'assigned', 'count', assigned);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- F. Rozet kontrolu (herhangi bir XP eklendikten sonra cagrilabilir)
CREATE OR REPLACE FUNCTION check_badges(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  badge RECORD;
  new_badges JSON[] := ARRAY[]::JSON[];
  user_stat INTEGER;
BEGIN
  FOR badge IN
    SELECT b.* FROM badges b
    WHERE b.is_active = true
    AND NOT EXISTS (
      SELECT 1 FROM user_badges ub WHERE ub.badge_id = b.id AND ub.user_id = p_user_id
    )
  LOOP
    user_stat := 0;

    CASE badge.requirement_type
      WHEN 'outfits_count' THEN
        SELECT COUNT(*) INTO user_stat FROM outfits WHERE user_id = p_user_id;
      WHEN 'streak_days' THEN
        SELECT COALESCE(streak_days, 0) INTO user_stat FROM user_levels WHERE user_id = p_user_id;
      WHEN 'level_reach' THEN
        SELECT COALESCE(level, 1) INTO user_stat FROM user_levels WHERE user_id = p_user_id;
      WHEN 'likes_total' THEN
        SELECT COALESCE(SUM(likes_count), 0) INTO user_stat FROM outfits WHERE user_id = p_user_id;
      WHEN 'event_join' THEN
        SELECT COUNT(*) INTO user_stat FROM event_participations WHERE user_id = p_user_id;
      ELSE
        CONTINUE;
    END CASE;

    IF user_stat >= badge.requirement_value THEN
      INSERT INTO user_badges (user_id, badge_id) VALUES (p_user_id, badge.id) ON CONFLICT DO NOTHING;

      IF badge.xp_reward > 0 THEN
        PERFORM award_xp(p_user_id, badge.xp_reward, 'badge', badge.id);
      END IF;

      new_badges := new_badges || json_build_object(
        'badge_id', badge.id,
        'name', badge.name,
        'rarity', badge.rarity,
        'xp_reward', badge.xp_reward
      )::JSON;
    END IF;
  END LOOP;

  RETURN json_build_object('new_badges', to_json(new_badges));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- G. Etkinlik katilim sayacini guncelle
CREATE OR REPLACE FUNCTION update_event_participation_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE events SET
    participation_count = participation_count + 1,
    updated_at = now()
  WHERE id = NEW.event_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_event_participation ON event_participations;
CREATE TRIGGER trg_event_participation
  AFTER INSERT ON event_participations
  FOR EACH ROW EXECUTE FUNCTION update_event_participation_count();

-- Migration v2: Fix activate_boost integer overflow + 5 boosts per purchase
-- Run this in Supabase SQL Editor

-- 1. Fix credit_boost_purchase to give 5 boosts per purchase
CREATE OR REPLACE FUNCTION credit_boost_purchase(user_id_param UUID)
RETURNS JSON AS $$
DECLARE
  new_balance INT;
BEGIN
  UPDATE profiles
  SET purchased_boosts_balance = COALESCE(purchased_boosts_balance, 0) + 5
  WHERE id = user_id_param
  RETURNING purchased_boosts_balance INTO new_balance;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'User not found');
  END IF;

  RETURN json_build_object('success', true, 'balance', new_balance);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Fix activate_boost: remove ms arithmetic (caused integer overflow), use INTERVAL instead
CREATE OR REPLACE FUNCTION activate_boost(user_id_param UUID)
RETURNS JSON AS $$
DECLARE
  user_record RECORD;
  max_boosts INT;
BEGIN
  SELECT * INTO user_record FROM profiles WHERE id = user_id_param;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'User not found');
  END IF;

  IF user_record.is_premium THEN
    max_boosts := 3;

    -- Reset monthly boosts if 30 days have passed (uses INTERVAL, no integer overflow)
    IF COALESCE(user_record.boosts_reset_at, NOW() - INTERVAL '31 days') < NOW() - INTERVAL '30 days' THEN
      UPDATE profiles
      SET boosts_used = 0, boosts_reset_at = NOW()
      WHERE id = user_id_param;
      user_record.boosts_used := 0;
    END IF;

    -- Use monthly boost if available
    IF COALESCE(user_record.boosts_used, 0) < max_boosts THEN
      UPDATE profiles
      SET boosts_used = COALESCE(boosts_used, 0) + 1
      WHERE id = user_id_param;

      UPDATE outfits
      SET is_boosted = true, boosted_at = NOW()
      WHERE user_id = user_id_param
        AND created_at > NOW() - INTERVAL '24 hours';

      RETURN json_build_object(
        'success', true,
        'boosts_used', COALESCE(user_record.boosts_used, 0) + 1,
        'used_purchased', false
      );
    END IF;
  END IF;

  -- Use purchased boost if available
  IF COALESCE(user_record.purchased_boosts_balance, 0) > 0 THEN
    UPDATE profiles
    SET purchased_boosts_balance = purchased_boosts_balance - 1
    WHERE id = user_id_param;

    UPDATE outfits
    SET is_boosted = true, boosted_at = NOW()
    WHERE user_id = user_id_param
      AND created_at > NOW() - INTERVAL '24 hours';

    RETURN json_build_object(
      'success', true,
      'boosts_used', COALESCE(user_record.boosts_used, 0),
      'used_purchased', true,
      'remaining_purchased', user_record.purchased_boosts_balance - 1
    );
  END IF;

  RETURN json_build_object('success', false, 'error', 'Boost hakkın kalmadı');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

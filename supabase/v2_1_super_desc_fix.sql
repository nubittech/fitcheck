-- Süper görev açıklamalarını güncelle
UPDATE mission_templates
SET description = 'Kombinin 24 saat sonunda trendlerde bitirsin'
WHERE action_type = 'trend_finish' AND target_count = 1;

UPDATE mission_templates
SET description = 'Kombinin 3 kez trendlerde bitirsin'
WHERE action_type = 'trend_finish' AND target_count = 3;

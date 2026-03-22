-- =============================================
-- Mevcut mission_templates icon'larını emoji yerine
-- action_type key'lerine güncelle (frontend SVG kullanacak)
-- =============================================

UPDATE mission_templates SET icon = action_type WHERE icon IS NOT NULL;

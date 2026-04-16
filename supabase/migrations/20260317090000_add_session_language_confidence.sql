-- Multilingual processing support:
-- 1) Store Deepgram language confidence
-- 2) Backward-compatible default language for legacy rows
ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS language_confidence double precision;

ALTER TABLE public.sessions
  ALTER COLUMN language_detected SET DEFAULT 'en';

UPDATE public.sessions
SET language_detected = 'en'
WHERE language_detected IS NULL OR btrim(language_detected) = '';

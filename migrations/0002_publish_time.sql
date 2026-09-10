ALTER TABLE lyrics
ADD COLUMN publish_time TEXT NOT NULL DEFAULT '00:00';

ALTER TABLE lyrics
ADD COLUMN publish_epoch INTEGER;

-- Existing rows already behave as published content.
-- Give them a reasonable legacy timestamp so they continue to work.
UPDATE lyrics
SET publish_epoch = unixepoch(publish_date || 'T00:00:00Z')
WHERE publish_epoch IS NULL;

DROP VIEW IF EXISTS public_lyrics;

CREATE VIEW public_lyrics AS
SELECT
  id,
  publish_date,
  publish_time,
  publish_epoch,
  artist,
  artist_slug,
  song_title,
  song_slug,
  album_title,
  release_year,
  genre,
  genre_slug,
  lyric_text,
  commentary,
  spotify_url,
  apple_music_url,
  youtube_url,

  -- Anything visible through this view is effectively published.
  'published' AS status,

  created_at,
  updated_at
FROM lyrics
WHERE status IN ('published', 'scheduled')
  AND publish_epoch IS NOT NULL
  AND publish_epoch <= unixepoch();

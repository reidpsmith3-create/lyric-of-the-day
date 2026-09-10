PRAGMA foreign_keys = ON;

-- =========================================================
-- LYRICS
-- One record per featured day.
-- =========================================================

CREATE TABLE IF NOT EXISTS lyrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  publish_date TEXT NOT NULL UNIQUE,

  artist TEXT NOT NULL,
  artist_slug TEXT NOT NULL,

  song_title TEXT NOT NULL,
  song_slug TEXT NOT NULL,

  album_title TEXT,

  release_year INTEGER
    CHECK (
      release_year IS NULL
      OR release_year BETWEEN 1900 AND 2100
    ),

  genre TEXT,
  genre_slug TEXT,

  lyric_text TEXT NOT NULL,
  commentary TEXT NOT NULL DEFAULT '',

  spotify_url TEXT,
  apple_music_url TEXT,
  youtube_url TEXT,

  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (
      status IN (
        'draft',
        'scheduled',
        'published'
      )
    ),

  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_lyrics_publish_date
  ON lyrics(publish_date DESC);

CREATE INDEX IF NOT EXISTS idx_lyrics_artist_slug
  ON lyrics(artist_slug);

CREATE INDEX IF NOT EXISTS idx_lyrics_song_slug
  ON lyrics(song_slug);

CREATE INDEX IF NOT EXISTS idx_lyrics_genre_slug
  ON lyrics(genre_slug);

CREATE INDEX IF NOT EXISTS idx_lyrics_release_year
  ON lyrics(release_year);

CREATE INDEX IF NOT EXISTS idx_lyrics_status
  ON lyrics(status);


-- =========================================================
-- TAGS
-- Flexible editorial tags:
-- nostalgia, heartbreak, storytelling, fatherhood, etc.
-- =========================================================

CREATE TABLE IF NOT EXISTS tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,

  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lyric_tags (
  lyric_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,

  PRIMARY KEY (lyric_id, tag_id),

  FOREIGN KEY (lyric_id)
    REFERENCES lyrics(id)
    ON DELETE CASCADE,

  FOREIGN KEY (tag_id)
    REFERENCES tags(id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_lyric_tags_tag_id
  ON lyric_tags(tag_id);


-- =========================================================
-- COMMENTS
-- Email is stored for moderation only and will never
-- be selected by the public-facing comment queries.
-- =========================================================

CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  lyric_id INTEGER NOT NULL,

  name TEXT NOT NULL,
  email TEXT NOT NULL,
  comment_text TEXT NOT NULL,

  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (
      status IN (
        'pending',
        'approved',
        'hidden',
        'spam'
      )
    ),

  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (lyric_id)
    REFERENCES lyrics(id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_comments_lyric_id
  ON comments(lyric_id);

CREATE INDEX IF NOT EXISTS idx_comments_status
  ON comments(status);

CREATE INDEX IF NOT EXISTS idx_comments_created_at
  ON comments(created_at DESC);


-- =========================================================
-- ADMIN SETTINGS
-- Small key/value table for site-level settings later.
-- =========================================================

CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- =========================================================
-- TRIGGERS
-- =========================================================

CREATE TRIGGER IF NOT EXISTS trg_lyrics_updated_at
AFTER UPDATE ON lyrics
FOR EACH ROW
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE lyrics
  SET updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.id;
END;


CREATE TRIGGER IF NOT EXISTS trg_comments_updated_at
AFTER UPDATE ON comments
FOR EACH ROW
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE comments
  SET updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.id;
END;

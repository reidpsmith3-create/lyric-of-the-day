import { getDb } from "@/lib/db";

export type LyricRow = {
  id: number;
  publish_date: string;
  artist: string;
  artist_slug: string;
  song_title: string;
  song_slug: string;
  album_title: string | null;
  release_year: number | null;
  genre: string | null;
  genre_slug: string | null;
  lyric_text: string;
  commentary: string;
  spotify_url: string | null;
  apple_music_url: string | null;
  youtube_url: string | null;
  status: "draft" | "scheduled" | "published";
};

export type TagRow = {
  name: string;
  slug: string;
};

export function getCentralDate() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  return `${year}-${month}-${day}`;
}

export function formatPublishDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));
}

export function dateToPath(date: string) {
  return `/${date.replaceAll("-", "/")}`;
}

export async function getLyricByDate(date: string) {
  const db = getDb();

  const lyric = await db
    .prepare(
      `
      SELECT *
      FROM public_lyrics
      WHERE publish_date = ?
        AND status = 'published'
      LIMIT 1
      `
    )
    .bind(date)
    .first<LyricRow>();

  if (!lyric) {
    return null;
  }

  const { results: tags } = await db
    .prepare(
      `
      SELECT tags.name, tags.slug
      FROM tags
      INNER JOIN lyric_tags ON lyric_tags.tag_id = tags.id
      WHERE lyric_tags.lyric_id = ?
      ORDER BY tags.name ASC
      `
    )
    .bind(lyric.id)
    .all<TagRow>();

  return {
    lyric,
    tags: tags ?? [],
  };
}

export async function getLatestPublishedLyric() {
  const db = getDb();
  const today = getCentralDate();

  const lyric = await db
    .prepare(
      `
      SELECT *
      FROM public_lyrics
      WHERE status = 'published'
        AND publish_date <= ?
      ORDER BY publish_date DESC
      LIMIT 1
      `
    )
    .bind(today)
    .first<LyricRow>();

  if (!lyric) {
    return null;
  }

  const { results: tags } = await db
    .prepare(
      `
      SELECT tags.name, tags.slug
      FROM tags
      INNER JOIN lyric_tags ON lyric_tags.tag_id = tags.id
      WHERE lyric_tags.lyric_id = ?
      ORDER BY tags.name ASC
      `
    )
    .bind(lyric.id)
    .all<TagRow>();

  return {
    lyric,
    tags: tags ?? [],
  };
}

export async function getAdjacentPublishedLyrics(date: string) {
  const db = getDb();
  const today = getCentralDate();

  const previous = await db
    .prepare(
      `
      SELECT publish_date, artist, song_title
      FROM public_lyrics
      WHERE status = 'published'
        AND publish_date < ?
      ORDER BY publish_date DESC
      LIMIT 1
      `
    )
    .bind(date)
    .first<{
      publish_date: string;
      artist: string;
      song_title: string;
    }>();

  const next = await db
    .prepare(
      `
      SELECT publish_date, artist, song_title
      FROM public_lyrics
      WHERE status = 'published'
        AND publish_date > ?
        AND publish_date <= ?
      ORDER BY publish_date ASC
      LIMIT 1
      `
    )
    .bind(date, today)
    .first<{
      publish_date: string;
      artist: string;
      song_title: string;
    }>();

  return {
    previous,
    next,
  };
}

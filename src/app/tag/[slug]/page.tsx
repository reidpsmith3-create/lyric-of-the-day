import { notFound } from "next/navigation";
import LyricCollectionPage, {
  type CollectionLyric,
} from "@/components/LyricCollectionPage";
import { getDb } from "@/lib/db";
import { getCentralDate } from "@/lib/lyrics";

export const dynamic = "force-dynamic";

export default async function TagPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const db = getDb();
  const today = getCentralDate();

  const tag = await db
    .prepare(
      `
      SELECT name
      FROM tags
      WHERE slug = ?
      LIMIT 1
      `
    )
    .bind(slug)
    .first<{ name: string }>();

  if (!tag) {
    notFound();
  }

  const { results: lyrics = [] } = await db
    .prepare(
      `
      SELECT DISTINCT
        lyrics.id,
        lyrics.publish_date,
        lyrics.artist,
        lyrics.artist_slug,
        lyrics.song_title,
        lyrics.album_title,
        lyrics.release_year,
        lyrics.genre,
        lyrics.genre_slug
      FROM public_lyrics
      INNER JOIN lyric_tags
        ON lyric_tags.lyric_id = lyrics.id
      INNER JOIN tags
        ON tags.id = lyric_tags.tag_id
      WHERE tags.slug = ?
        AND lyrics.status = 'published'
        AND lyrics.publish_date <= ?
      ORDER BY lyrics.publish_date DESC
      `
    )
    .bind(slug, today)
    .all<CollectionLyric>();

  if (lyrics.length === 0) {
    notFound();
  }

  return (
    <LyricCollectionPage
      eyebrow="Tag"
      title={tag.name}
      description={`Lyrics connected by ${tag.name.toLowerCase()}.`}
      lyrics={lyrics}
    />
  );
}

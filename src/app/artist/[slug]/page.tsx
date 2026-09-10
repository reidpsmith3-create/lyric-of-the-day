import { notFound } from "next/navigation";
import LyricCollectionPage, {
  type CollectionLyric,
} from "@/components/LyricCollectionPage";
import { getDb } from "@/lib/db";
import { getCentralDate } from "@/lib/lyrics";

export const dynamic = "force-dynamic";

export default async function ArtistPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const db = getDb();
  const today = getCentralDate();

  const artist = await db
    .prepare(
      `
      SELECT artist
      FROM public_lyrics
      WHERE artist_slug = ?
        AND status = 'published'
        AND publish_date <= ?
      ORDER BY publish_date DESC
      LIMIT 1
      `
    )
    .bind(slug, today)
    .first<{ artist: string }>();

  if (!artist) {
    notFound();
  }

  const { results: lyrics = [] } = await db
    .prepare(
      `
      SELECT
        id,
        publish_date,
        artist,
        artist_slug,
        song_title,
        album_title,
        release_year,
        genre,
        genre_slug
      FROM public_lyrics
      WHERE artist_slug = ?
        AND status = 'published'
        AND publish_date <= ?
      ORDER BY publish_date DESC
      `
    )
    .bind(slug, today)
    .all<CollectionLyric>();

  return (
    <LyricCollectionPage
      eyebrow="Artist"
      title={artist.artist}
      description={`Every Lyric of the Day selection featuring ${artist.artist}.`}
      lyrics={lyrics}
    />
  );
}

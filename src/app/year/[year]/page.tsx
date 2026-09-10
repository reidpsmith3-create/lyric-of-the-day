import { notFound } from "next/navigation";
import LyricCollectionPage, {
  type CollectionLyric,
} from "@/components/LyricCollectionPage";
import { getDb } from "@/lib/db";
import { getCentralDate } from "@/lib/lyrics";

export const dynamic = "force-dynamic";

export default async function YearPage({
  params,
}: {
  params: Promise<{ year: string }>;
}) {
  const { year } = await params;

  if (!/^\d{4}$/.test(year)) {
    notFound();
  }

  const releaseYear = Number(year);
  const db = getDb();
  const today = getCentralDate();

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
      WHERE release_year = ?
        AND status = 'published'
        AND publish_date <= ?
      ORDER BY publish_date DESC
      `
    )
    .bind(releaseYear, today)
    .all<CollectionLyric>();

  if (lyrics.length === 0) {
    notFound();
  }

  return (
    <LyricCollectionPage
      eyebrow="Release Year"
      title={year}
      description={`Lyric of the Day selections from songs released in ${year}.`}
      lyrics={lyrics}
    />
  );
}

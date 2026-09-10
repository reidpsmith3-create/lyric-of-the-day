import { getDb } from "@/lib/db";
import { dateToPath, getCentralDate } from "@/lib/lyrics";

export const dynamic = "force-dynamic";

export async function GET() {
  const db = getDb();
  const today = getCentralDate();

  const lyric = await db
    .prepare(
      `
      SELECT publish_date
      FROM public_lyrics
      WHERE status = 'published'
        AND publish_date <= ?
      ORDER BY RANDOM()
      LIMIT 1
      `
    )
    .bind(today)
    .first<{ publish_date: string }>();

  if (!lyric) {
    return new Response(null, {
      status: 303,
      headers: {
        Location: "/",
      },
    });
  }

  return new Response(null, {
    status: 303,
    headers: {
      Location: dateToPath(lyric.publish_date),
    },
  });
}

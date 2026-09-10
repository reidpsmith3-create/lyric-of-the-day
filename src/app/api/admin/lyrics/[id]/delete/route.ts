import { env } from "cloudflare:workers";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const lyricId = Number(id);

  if (!Number.isInteger(lyricId)) {
    return new Response("Invalid lyric ID.", {
      status: 400,
    });
  }

  const db = env.DB;

  const existing = await db
    .prepare(`
      SELECT id
      FROM lyrics
      WHERE id = ?
      LIMIT 1
    `)
    .bind(lyricId)
    .first<{ id: number }>();

  if (!existing) {
    return new Response("Lyric not found.", {
      status: 404,
    });
  }

  await db
    .prepare(`
      DELETE FROM lyrics
      WHERE id = ?
    `)
    .bind(lyricId)
    .run();

  return new Response(null, {
    status: 303,
    headers: {
      Location: "/admin?deleted=1",
    },
  });
}

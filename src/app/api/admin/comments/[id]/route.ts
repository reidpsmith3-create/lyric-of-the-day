import { getDb } from "@/lib/db";

const allowedStatuses = new Set([
  "pending",
  "approved",
  "hidden",
  "spam",
]);

export async function POST(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  const { id } = await context.params;
  const commentId = Number(id);

  if (!Number.isInteger(commentId) || commentId <= 0) {
    return new Response("Invalid comment.", { status: 400 });
  }

  const formData = await request.formData();
  const action = String(formData.get("action") ?? "");

  const db = getDb();

  const existing = await db
    .prepare(
      `
      SELECT id
      FROM comments
      WHERE id = ?
      LIMIT 1
      `
    )
    .bind(commentId)
    .first<{ id: number }>();

  if (!existing) {
    return new Response("Comment not found.", { status: 404 });
  }

  if (action === "delete") {
    await db
      .prepare(
        `
        DELETE FROM comments
        WHERE id = ?
        `
      )
      .bind(commentId)
      .run();

    return new Response(null, {
      status: 303,
      headers: {
        Location: "/admin?comment=deleted",
      },
    });
  }

  if (!allowedStatuses.has(action)) {
    return new Response("Invalid moderation action.", {
      status: 400,
    });
  }

  await db
    .prepare(
      `
      UPDATE comments
      SET status = ?
      WHERE id = ?
      `
    )
    .bind(action, commentId)
    .run();

  return new Response(null, {
    status: 303,
    headers: {
      Location: `/admin?comment=${action}`,
    },
  });
}

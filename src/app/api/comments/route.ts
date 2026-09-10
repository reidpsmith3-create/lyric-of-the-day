import { getDb } from "@/lib/db";

const blockedWords = [
  "fuck",
  "fucking",
  "fucked",
  "fucker",
  "shit",
  "shitty",
  "bullshit",
  "bitch",
  "bitches",
  "asshole",
  "assholes",
  "cunt",
  "cunts",
  "dick",
  "dicks",
  "pussy",
  "pussies",
  "motherfucker",
  "motherfuckers",
];

function containsBlockedWord(text: string) {
  const normalized = text.toLowerCase();

  return blockedWords.some((word) => {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`\\b${escaped}\\b`, "i");

    return pattern.test(normalized);
  });
}

export async function POST(request: Request) {
  const db = getDb();
  const formData = await request.formData();

  const lyricId = Number(formData.get("lyricId"));
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const commentText = String(formData.get("comment") ?? "").trim();
  const redirectTo = String(formData.get("redirectTo") ?? "/");

  if (!Number.isInteger(lyricId) || lyricId <= 0) {
    return new Response("Invalid lyric.", { status: 400 });
  }

  if (!name || !email || !commentText) {
    return new Response("Name, email, and comment are required.", {
      status: 400,
    });
  }

  if (name.length > 100) {
    return new Response("Name is too long.", { status: 400 });
  }

  if (email.length > 254) {
    return new Response("Email is too long.", { status: 400 });
  }

  if (commentText.length > 3000) {
    return new Response("Comment is too long.", { status: 400 });
  }

  const lyric = await db
    .prepare(
      `
      SELECT id
      FROM public_lyrics
      WHERE id = ?
        AND status = 'published'
      LIMIT 1
      `
    )
    .bind(lyricId)
    .first<{ id: number }>();

  if (!lyric) {
    return new Response("Lyric not found.", { status: 404 });
  }

  const status = containsBlockedWord(commentText)
    ? "pending"
    : "approved";

  await db
    .prepare(
      `
      INSERT INTO comments (
        lyric_id,
        name,
        email,
        comment_text,
        status
      )
      VALUES (?, ?, ?, ?, ?)
      `
    )
    .bind(
      lyricId,
      name,
      email.toLowerCase(),
      commentText,
      status
    )
    .run();

  const separator = redirectTo.includes("?") ? "&" : "?";

  return new Response(null, {
    status: 303,
    headers: {
      Location: `${redirectTo}${separator}comment=${
        status === "approved" ? "approved" : "submitted"
      }`,
    },
  });
}

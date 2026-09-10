import { env } from "cloudflare:workers";
import { centralDateTimeToEpoch } from "@/lib/publishing";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function optionalString(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text || null;
}

export async function POST(request: Request) {
  const formData = await request.formData();

  const publishDate = String(formData.get("publish_date") ?? "").trim();
  const publishTime = String(
    formData.get("publish_time") ?? "00:00"
  ).trim();
  const status = String(formData.get("status") ?? "draft").trim();

  const artist = String(formData.get("artist") ?? "").trim();
  const songTitle = String(formData.get("song_title") ?? "").trim();

  const albumTitle = optionalString(formData.get("album_title"));
  const genre = optionalString(formData.get("genre"));

  const lyricText = String(formData.get("lyric_text") ?? "").trim();
  const commentary = String(formData.get("commentary") ?? "").trim();

  const spotifyUrl = optionalString(formData.get("spotify_url"));
  const appleMusicUrl = optionalString(formData.get("apple_music_url"));
  const youtubeUrl = optionalString(formData.get("youtube_url"));

  const releaseYearRaw = String(
    formData.get("release_year") ?? ""
  ).trim();

  const releaseYear = releaseYearRaw
    ? Number.parseInt(releaseYearRaw, 10)
    : null;

  const tags = String(formData.get("tags") ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .filter(
      (tag, index, array) =>
        array.findIndex(
          (candidate) =>
            candidate.toLowerCase() === tag.toLowerCase()
        ) === index
    );

  if (
    !publishDate ||
    !publishTime ||
    !artist ||
    !songTitle ||
    !lyricText
  ) {
    return new Response("Missing required fields.", {
      status: 400,
    });
  }

  if (!["draft", "scheduled", "published"].includes(status)) {
    return new Response("Invalid status.", {
      status: 400,
    });
  }

  if (
    releaseYear !== null &&
    (!Number.isInteger(releaseYear) ||
      releaseYear < 1900 ||
      releaseYear > 2100)
  ) {
    return new Response("Invalid release year.", {
      status: 400,
    });
  }

  let publishEpoch: number;

  try {
    publishEpoch = centralDateTimeToEpoch(
      publishDate,
      publishTime
    );
  } catch {
    return new Response("Invalid publication date or time.", {
      status: 400,
    });
  }

  const db = env.DB;

  try {
    const result = await db
      .prepare(`
        INSERT INTO lyrics (
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
          status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        RETURNING id
      `)
      .bind(
        publishDate,
        publishTime,
        publishEpoch,
        artist,
        slugify(artist),
        songTitle,
        slugify(songTitle),
        albumTitle,
        releaseYear,
        genre,
        genre ? slugify(genre) : null,
        lyricText,
        commentary,
        spotifyUrl,
        appleMusicUrl,
        youtubeUrl,
        status
      )
      .first<{ id: number }>();

    if (!result?.id) {
      throw new Error("Lyric insert did not return an ID.");
    }

    for (const tagName of tags) {
      const tagSlug = slugify(tagName);

      if (!tagSlug) continue;

      await db
        .prepare(`
          INSERT INTO tags (name, slug)
          VALUES (?, ?)
          ON CONFLICT(slug) DO NOTHING
        `)
        .bind(tagName, tagSlug)
        .run();

      const tag = await db
        .prepare(`
          SELECT id
          FROM tags
          WHERE slug = ?
          LIMIT 1
        `)
        .bind(tagSlug)
        .first<{ id: number }>();

      if (!tag) continue;

      await db
        .prepare(`
          INSERT OR IGNORE INTO lyric_tags (
            lyric_id,
            tag_id
          )
          VALUES (?, ?)
        `)
        .bind(result.id, tag.id)
        .run();
    }

    return new Response(null, {
      status: 303,
      headers: {
        Location: "/admin?saved=1",
      },
    });
  } catch (error) {
    console.error("Failed to save lyric:", error);

    const message =
      error instanceof Error ? error.message : String(error);

    if (
      message.includes("UNIQUE constraint failed") &&
      message.includes("publish_date")
    ) {
      return new Response(
        "A lyric already exists for that publication date.",
        { status: 409 }
      );
    }

    return new Response("Unable to save lyric.", {
      status: 500,
    });
  }
}

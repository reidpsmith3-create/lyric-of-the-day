import Link from "next/link";
import ShareLyricButton from "@/components/ShareLyricButton";
import { getDb } from "@/lib/db";
import {
  dateToPath,
  formatPublishDate,
  type LyricRow,
  type TagRow,
} from "@/lib/lyrics";

type ApprovedComment = {
  id: number;
  name: string;
  comment_text: string;
  created_at: string;
};

function formatCommentDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export default async function LyricEntry({
  lyric,
  tags,
  commentStatus,
}: {
  lyric: LyricRow;
  tags: TagRow[];
  commentStatus?: string;
}) {
  const db = getDb();

  const { results: comments = [] } = await db
    .prepare(
      `
      SELECT
        id,
        name,
        comment_text,
        created_at
      FROM comments
      WHERE lyric_id = ?
        AND status = 'approved'
      ORDER BY created_at ASC
      `
    )
    .bind(lyric.id)
    .all<ApprovedComment>();

  const permanentPath = dateToPath(lyric.publish_date);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 md:py-20">
      <section className="mx-auto max-w-4xl">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-[var(--accent)]">
              Lyric of the Day
            </p>

            <p className="mt-2 text-sm text-black/45">
              {formatPublishDate(lyric.publish_date)}
            </p>
          </div>

          <span className="hidden text-xs uppercase tracking-[0.2em] text-black/35 md:block">
            One lyric. Every day.
          </span>
        </div>

        <blockquote className="max-w-4xl text-[clamp(2.25rem,5.4vw,5.1rem)] font-medium leading-[1.02] tracking-[-0.04em]">
          “{lyric.lyric_text}”
        </blockquote>

        <div className="mt-14 grid gap-8 border-t border-black/15 pt-7 md:grid-cols-[1.3fr_1fr] md:items-end">
          <div>
            <Link
              href={`/artist/${lyric.artist_slug}`}
              className="text-sm uppercase tracking-[0.17em] text-[var(--accent)]"
            >
              {lyric.artist}
            </Link>

            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em] md:text-4xl">
              {lyric.song_title}
            </h1>

            {(lyric.album_title || lyric.release_year) && (
              <p className="mt-2 text-sm text-black/45">
                {lyric.album_title}
                {lyric.album_title && lyric.release_year ? " · " : ""}
                {lyric.release_year}
              </p>
            )}
          </div>

          <div className="flex flex-col items-start gap-3 md:items-end">
            <div className="flex flex-wrap gap-2 md:justify-end">
              {lyric.genre && lyric.genre_slug && (
              <Link
                href={`/genre/${lyric.genre_slug}`}
                className="tag-pill"
              >
                {lyric.genre}
              </Link>
            )}

            {lyric.release_year && (
              <Link
                href={`/year/${lyric.release_year}`}
                className="tag-pill"
              >
                {lyric.release_year}
              </Link>
            )}

              {tags.map((tag) => (
                <Link
                  key={tag.slug}
                  href={`/tag/${tag.slug}`}
                  className="tag-pill"
                >
                  {tag.name}
                </Link>
              ))}
            </div>

            <ShareLyricButton
              url={permanentPath}
              artist={lyric.artist}
              songTitle={lyric.song_title}
            />
          </div>
        </div>

        {lyric.commentary?.trim() && (
          <section className="mt-16 grid gap-8 border-t border-black/10 pt-10 md:grid-cols-[180px_1fr]">
            <div>
              <p className="eyebrow">Why This Lyric</p>
            </div>

            <div className="max-w-2xl">
              <p className="whitespace-pre-line text-xl leading-8 text-black/80 md:text-2xl md:leading-9">
                {lyric.commentary}
              </p>
            </div>
          </section>
        )}

        {(lyric.spotify_url ||
          lyric.apple_music_url ||
          lyric.youtube_url) && (
          <section className="mt-14 grid gap-8 border-t border-black/10 pt-8 md:grid-cols-[180px_1fr]">
            <div>
              <p className="eyebrow">Listen</p>
            </div>

            <div className="flex flex-wrap gap-3">
              {lyric.spotify_url && (
                <a
                  href={lyric.spotify_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="listen-link"
                >
                  Spotify ↗
                </a>
              )}

              {lyric.apple_music_url && (
                <a
                  href={lyric.apple_music_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="listen-link"
                >
                  Apple Music ↗
                </a>
              )}

              {lyric.youtube_url && (
                <a
                  href={lyric.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="listen-link"
                >
                  YouTube ↗
                </a>
              )}
            </div>
          </section>
        )}

        <section className="mt-16 border-t border-black/10 pt-10">
          {commentStatus === "approved" && (
            <div className="mb-8 rounded-2xl border border-black/10 bg-white/35 px-5 py-4">
              <p className="font-semibold">Thanks for commenting.</p>
              <p className="mt-1 text-sm text-black/50">
                Your comment has been published.
              </p>
            </div>
          )}

          {commentStatus === "submitted" && (
            <div className="mb-8 rounded-2xl border border-black/10 bg-white/35 px-5 py-4">
              <p className="font-semibold">Thanks for commenting.</p>
              <p className="mt-1 text-sm text-black/50">
                Your comment is awaiting moderation.
              </p>
            </div>
          )}

          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Conversation</p>

              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.02em]">
                Comments
              </h2>
            </div>

            <p className="text-sm text-black/45">
              What does this lyric mean to you?
            </p>
          </div>

          {comments.length > 0 && (
            <div className="mt-8 divide-y divide-black/10 border-y border-black/10">
              {comments.map((comment) => (
                <article key={comment.id} className="py-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-semibold">{comment.name}</p>

                    <p className="text-xs uppercase tracking-[0.15em] text-black/35">
                      {formatCommentDate(comment.created_at)}
                    </p>
                  </div>

                  <p className="mt-3 whitespace-pre-line leading-7 text-black/70">
                    {comment.comment_text}
                  </p>
                </article>
              ))}
            </div>
          )}

          <details className="group mt-8 rounded-2xl border border-black/10 bg-white/30">
            <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 font-medium">
              Leave a comment

              <span className="text-xl font-light transition group-open:rotate-45">
                +
              </span>
            </summary>

            <form
              action="/api/comments"
              method="post"
              className="border-t border-black/10 p-5"
            >
              <input
                type="hidden"
                name="lyricId"
                value={lyric.id}
              />

              <input
                type="hidden"
                name="redirectTo"
                value={permanentPath}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <input
                  type="text"
                  name="name"
                  required
                  maxLength={100}
                  placeholder="Name"
                  className="field"
                />

                <input
                  type="email"
                  name="email"
                  required
                  maxLength={254}
                  placeholder="Email — never displayed"
                  className="field"
                />
              </div>

              <textarea
                name="comment"
                required
                maxLength={3000}
                placeholder="What does this lyric mean to you?"
                rows={5}
                className="field mt-4 resize-none"
              />

              <div className="mt-4 flex items-center justify-between gap-4">
                <p className="text-xs text-black/40">
                  Comments are reviewed before appearing publicly.
                </p>

                <button
                  type="submit"
                  className="rounded-full bg-[var(--ink)] px-5 py-2.5 text-sm font-semibold text-white"
                >
                  Post Comment
                </button>
              </div>
            </form>
          </details>
        </section>
      </section>
    </div>
  );
}

import { getDb } from "@/lib/db";
import { notFound } from "next/navigation";
import DeleteLyricButton from "@/components/admin/DeleteLyricButton";

type LyricRow = {
  id: number;
  publish_date: string;
  publish_time: string;
  artist: string;
  song_title: string;
  album_title: string | null;
  release_year: number | null;
  genre: string | null;
  lyric_text: string;
  commentary: string;
  spotify_url: string | null;
  apple_music_url: string | null;
  youtube_url: string | null;
  status: string;
};

type TagRow = {
  name: string;
};

export default async function EditLyricPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const lyricId = Number(id);

  if (!Number.isInteger(lyricId)) {
    notFound();
  }

  const db = getDb();

  const lyric = await db
    .prepare(`
      SELECT
        id,
        publish_date,
        publish_time,
        artist,
        song_title,
        album_title,
        release_year,
        genre,
        lyric_text,
        commentary,
        spotify_url,
        apple_music_url,
        youtube_url,
        CASE
          WHEN status = 'scheduled'
            AND publish_epoch IS NOT NULL
            AND publish_epoch <= unixepoch()
          THEN 'published'
          ELSE status
        END AS status
      FROM lyrics
      WHERE id = ?
      LIMIT 1
    `)
    .bind(lyricId)
    .first<LyricRow>();

  if (!lyric) {
    notFound();
  }

  const { results: tags = [] } = await db
    .prepare(`
      SELECT t.name
      FROM tags t
      INNER JOIN lyric_tags lt
        ON lt.tag_id = t.id
      WHERE lt.lyric_id = ?
      ORDER BY t.name ASC
    `)
    .bind(lyricId)
    .all<TagRow>();

  return (
    <main className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      <header className="border-b border-black/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em]">
              Lyric of the Day
            </p>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-black/40">
              Publisher
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/admin"
              className="rounded-full border border-black/15 px-4 py-2 text-sm font-medium transition hover:border-black/40"
            >
              ← New Lyric
            </a>

            <a
              href="/"
              className="rounded-full border border-black/15 px-4 py-2 text-sm font-medium transition hover:border-black/40"
            >
              View Site ↗
            </a>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-10 md:py-14">
        <div className="mb-8">
          <p className="eyebrow text-[var(--accent)]">
            Publishing
          </p>

          <h1 className="mt-2 text-4xl font-semibold tracking-[-0.035em]">
            Edit Lyric
          </h1>

          <p className="mt-2 text-sm text-black/45">
            {lyric.publish_date} · {lyric.artist} · {lyric.song_title}
          </p>
        </div>

        <form
          action={`/api/admin/lyrics/${lyric.id}`}
          method="post"
          className="space-y-8"
        >
          <AdminSection
            title="Publication"
            description="Choose when this lyric should appear."
          >
            <div className="grid gap-4 md:grid-cols-3">
              <AdminField label="Publication date">
                <input
                  className="admin-input"
                  type="date"
                  name="publish_date"
                  defaultValue={lyric.publish_date}
                  required
                />
              </AdminField>

              <AdminField label="Publication time">
                <input
                  className="admin-input"
                  type="time"
                  name="publish_time"
                  defaultValue={lyric.publish_time || "00:00"}
                  required
                />
              </AdminField>

              <AdminField label="Status">
                <select
                  className="admin-input"
                  name="status"
                  defaultValue={lyric.status}
                >
                  <option value="draft">Draft</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="published">Published</option>
                </select>
              </AdminField>
            </div>
          </AdminSection>

          <AdminSection
            title="Song"
            description="The structured information used throughout the archive."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <AdminField label="Artist">
                <input
                  className="admin-input"
                  name="artist"
                  defaultValue={lyric.artist}
                  required
                />
              </AdminField>

              <AdminField label="Song title">
                <input
                  className="admin-input"
                  name="song_title"
                  defaultValue={lyric.song_title}
                  required
                />
              </AdminField>

              <AdminField label="Album">
                <input
                  className="admin-input"
                  name="album_title"
                  defaultValue={lyric.album_title ?? ""}
                />
              </AdminField>

              <AdminField label="Release year">
                <input
                  className="admin-input"
                  type="number"
                  name="release_year"
                  min="1900"
                  max="2100"
                  defaultValue={lyric.release_year ?? ""}
                />
              </AdminField>

              <AdminField label="Genre">
                <input
                  className="admin-input"
                  name="genre"
                  defaultValue={lyric.genre ?? ""}
                />
              </AdminField>

              <AdminField label="Tags">
                <input
                  className="admin-input"
                  name="tags"
                  defaultValue={tags.map((tag) => tag.name).join(", ")}
                />
              </AdminField>
            </div>

            <p className="mt-3 text-xs leading-5 text-black/40">
              Separate tags with commas. Existing tags will be reused automatically.
            </p>
          </AdminSection>

          <AdminSection
            title="Lyric"
            description="The selected line or lines you're featuring."
          >
            <textarea
              className="admin-input min-h-40 resize-y"
              name="lyric_text"
              defaultValue={lyric.lyric_text}
              required
            />
          </AdminSection>

          <AdminSection
            title="Why This Lyric"
            description="Your editorial note about why you chose it."
          >
            <textarea
              className="admin-input min-h-48 resize-y"
              name="commentary"
              defaultValue={lyric.commentary}
              required
            />
          </AdminSection>

          <AdminSection
            title="Listen"
            description="Optional links to the song."
          >
            <div className="space-y-4">
              <AdminField label="Spotify">
                <input
                  className="admin-input"
                  type="url"
                  name="spotify_url"
                  defaultValue={lyric.spotify_url ?? ""}
                />
              </AdminField>

              <AdminField label="Apple Music">
                <input
                  className="admin-input"
                  type="url"
                  name="apple_music_url"
                  defaultValue={lyric.apple_music_url ?? ""}
                />
              </AdminField>

              <AdminField label="YouTube">
                <input
                  className="admin-input"
                  type="url"
                  name="youtube_url"
                  defaultValue={lyric.youtube_url ?? ""}
                />
              </AdminField>
            </div>
          </AdminSection>

          <div className="flex items-center justify-between border-t border-black/10 pt-6">
            <DeleteLyricButton lyricId={lyric.id} />

            <button
              type="submit"
              className="rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

function AdminSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-5 border-t border-black/10 pt-7 md:grid-cols-[180px_1fr]">
      <div>
        <h2 className="font-semibold">{title}</h2>
        <p className="mt-2 text-sm leading-5 text-black/45">
          {description}
        </p>
      </div>

      <div>{children}</div>
    </section>
  );
}

function AdminField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-black/45">
        {label}
      </span>

      {children}
    </label>
  );
}

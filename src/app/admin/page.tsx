import { getDb } from "@/lib/db";

type LyricSummary = {
  id: number;
  publish_date: string;
  publish_time: string;
  artist: string;
  song_title: string;
  status: string;
};

type PendingComment = {
  id: number;
  name: string;
  email: string;
  comment_text: string;
  created_at: string;
  lyric_id: number;
  publish_date: string;
  artist: string;
  song_title: string;
};

function addDays(date: string, amount: number) {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + amount);

  return value.toISOString().slice(0, 10);
}

function formatDashboardDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));
}

function formatDashboardTime(time: string) {
  const [hourValue, minuteValue] = time.split(":").map(Number);

  const suffix = hourValue >= 12 ? "PM" : "AM";
  const hour = hourValue % 12 || 12;

  return `${hour}:${String(minuteValue).padStart(2, "0")} ${suffix}`;
}

function getCentralDate() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  return `${year}-${month}-${day}`;
}

export default async function AdminPage() {
  const db = getDb();
  const today = getCentralDate();

  const { results: lyrics = [] } = await db
    .prepare(`
      SELECT
        id,
        publish_date,
        publish_time,
        artist,
        song_title,
        CASE
          WHEN status = 'scheduled'
            AND publish_epoch IS NOT NULL
            AND publish_epoch <= unixepoch()
          THEN 'published'
          ELSE status
        END AS status
      FROM lyrics
      ORDER BY publish_date DESC
      LIMIT 20
    `)
    .all<LyricSummary>();

  const { results: pendingComments = [] } = await db
    .prepare(`
      SELECT
        comments.id,
        comments.name,
        comments.email,
        comments.comment_text,
        comments.created_at,
        comments.lyric_id,
        lyrics.publish_date,
        lyrics.artist,
        lyrics.song_title
      FROM comments
      INNER JOIN lyrics
        ON lyrics.id = comments.lyric_id
      WHERE comments.status = 'pending'
      ORDER BY comments.created_at ASC
      LIMIT 50
    `)
    .all<PendingComment>();

  const todayLyric = await db
    .prepare(`
      SELECT
        id,
        publish_date,
        publish_time,
        artist,
        song_title,
        CASE
          WHEN status = 'scheduled'
            AND publish_epoch IS NOT NULL
            AND publish_epoch <= unixepoch()
          THEN 'published'
          ELSE status
        END AS status
      FROM lyrics
      WHERE publish_date = ?
      LIMIT 1
    `)
    .bind(today)
    .first<LyricSummary>();

  const seventhDay = addDays(today, 7);

  const { results: upcomingLyrics = [] } = await db
    .prepare(`
      SELECT
        id,
        publish_date,
        publish_time,
        artist,
        song_title,
        CASE
          WHEN status = 'scheduled'
            AND publish_epoch IS NOT NULL
            AND publish_epoch <= unixepoch()
          THEN 'published'
          ELSE status
        END AS status
      FROM lyrics
      WHERE publish_date > ?
        AND publish_date <= ?
      ORDER BY publish_date ASC
    `)
    .bind(today, seventhDay)
    .all<LyricSummary>();

  const nextSevenDays = Array.from(
    { length: 7 },
    (_, index) => {
      const date = addDays(today, index + 1);

      return {
        date,
        lyric:
          upcomingLyrics.find(
            (lyric) => lyric.publish_date === date
          ) ?? null,
      };
    }
  );

  const { results: draftLyrics = [] } = await db
    .prepare(`
      SELECT
        id,
        publish_date,
        publish_time,
        artist,
        song_title,
        CASE
          WHEN status = 'scheduled'
            AND publish_epoch IS NOT NULL
            AND publish_epoch <= unixepoch()
          THEN 'published'
          ELSE status
        END AS status
      FROM lyrics
      WHERE status = 'draft'
      ORDER BY publish_date ASC
      LIMIT 10
    `)
    .all<LyricSummary>();

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

          <a
            href="/"
            className="rounded-full border border-black/15 px-4 py-2 text-sm font-medium transition hover:border-black/40"
          >
            View Site ↗
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10 md:py-14">
        <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
          <section>
            <div className="mb-8">
              <p className="eyebrow text-[var(--accent)]">
                Publishing
              </p>

              <h1 className="mt-2 text-4xl font-semibold tracking-[-0.035em]">
                New Lyric
              </h1>
            </div>

            <form
              action="/api/admin/lyrics"
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
                      required
                    />
                  </AdminField>

                  <AdminField label="Publication time">
                    <input
                      className="admin-input"
                      type="time"
                      name="publish_time"
                      defaultValue="00:00"
                      required
                    />
                  </AdminField>

                  <AdminField label="Status">
                    <select
                      className="admin-input"
                      name="status"
                      defaultValue="draft"
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
                description="The structured information we'll use throughout the archive."
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <AdminField label="Artist">
                    <input
                      className="admin-input"
                      name="artist"
                      placeholder="Bon Iver"
                      required
                    />
                  </AdminField>

                  <AdminField label="Song title">
                    <input
                      className="admin-input"
                      name="song_title"
                      placeholder="Holocene"
                      required
                    />
                  </AdminField>

                  <AdminField label="Album">
                    <input
                      className="admin-input"
                      name="album_title"
                      placeholder="Bon Iver, Bon Iver"
                    />
                  </AdminField>

                  <AdminField label="Release year">
                    <input
                      className="admin-input"
                      type="number"
                      name="release_year"
                      min="1900"
                      max="2100"
                      placeholder="2011"
                    />
                  </AdminField>

                  <AdminField label="Genre">
                    <input
                      className="admin-input"
                      name="genre"
                      placeholder="Indie Folk"
                    />
                  </AdminField>

                  <AdminField label="Tags">
                    <input
                      className="admin-input"
                      name="tags"
                      placeholder="Nostalgia, Growing Up, Storytelling"
                    />
                  </AdminField>
                </div>

                <p className="mt-3 text-xs leading-5 text-black/40">
                  Separate tags with commas. Existing tags will be reused
                  automatically.
                </p>
              </AdminSection>

              <AdminSection
                title="Lyric"
                description="The selected line or lines you're featuring."
              >
                <textarea
                  className="admin-input min-h-40 resize-y"
                  name="lyric_text"
                  placeholder="Enter the lyric..."
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
                  placeholder="What makes this lyric worth featuring?"
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
                      placeholder="https://..."
                    />
                  </AdminField>

                  <AdminField label="Apple Music">
                    <input
                      className="admin-input"
                      type="url"
                      name="apple_music_url"
                      placeholder="https://..."
                    />
                  </AdminField>

                  <AdminField label="YouTube">
                    <input
                      className="admin-input"
                      type="url"
                      name="youtube_url"
                      placeholder="https://..."
                    />
                  </AdminField>
                </div>
              </AdminSection>

              <div className="flex justify-end border-t border-black/10 pt-6">
                <button
                  type="submit"
                  className="rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  Save Lyric
                </button>
              </div>
            </form>
          </section>

          <aside>
            <div className="sticky top-8 space-y-8">
              <section>
                <div className="flex items-center justify-between gap-3">
                  <p className="eyebrow">Pending Comments</p>

                  {pendingComments.length > 0 && (
                    <span className="rounded-full bg-[var(--accent)] px-2.5 py-1 text-xs font-semibold text-white">
                      {pendingComments.length}
                    </span>
                  )}
                </div>

                <div className="mt-4 overflow-hidden rounded-2xl border border-black/10">
                  {pendingComments.length === 0 ? (
                    <div className="p-5">
                      <p className="text-sm font-medium">
                        You're all caught up.
                      </p>

                      <p className="mt-1 text-xs leading-5 text-black/40">
                        New comments awaiting review will appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-black/10">
                      {pendingComments.map((comment) => (
                        <article key={comment.id} className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold">
                                {comment.name}
                              </p>

                              <p className="mt-0.5 text-xs text-black/40">
                                {comment.email}
                              </p>
                            </div>

                            <span className="text-[10px] uppercase tracking-[0.12em] text-black/35">
                              Pending
                            </span>
                          </div>

                          <p className="mt-3 text-sm leading-6 text-black/70">
                            {comment.comment_text}
                          </p>

                          <div className="mt-3 rounded-xl bg-black/[0.025] px-3 py-2">
                            <p className="text-xs font-medium">
                              {comment.song_title}
                            </p>

                            <p className="mt-0.5 text-[11px] text-black/40">
                              {comment.artist} · {comment.publish_date}
                            </p>
                          </div>

                          <form
                            action={`/api/admin/comments/${comment.id}`}
                            method="post"
                            className="mt-4 grid grid-cols-2 gap-2"
                          >
                            <button
                              type="submit"
                              name="action"
                              value="approved"
                              className="rounded-full bg-[var(--accent)] px-3 py-2 text-xs font-semibold text-white"
                            >
                              Approve
                            </button>

                            <button
                              type="submit"
                              name="action"
                              value="hidden"
                              className="rounded-full border border-black/15 px-3 py-2 text-xs font-semibold"
                            >
                              Hide
                            </button>

                            <button
                              type="submit"
                              name="action"
                              value="spam"
                              className="rounded-full border border-black/15 px-3 py-2 text-xs font-semibold text-black/55"
                            >
                              Spam
                            </button>

                            <button
                              type="submit"
                              name="action"
                              value="delete"
                              className="rounded-full border border-red-900/20 px-3 py-2 text-xs font-semibold text-red-900"
                            >
                              Delete
                            </button>
                          </form>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              <section>
                <p className="eyebrow">Today</p>

                <div className="mt-4 overflow-hidden rounded-2xl border border-black/10">
                  {todayLyric ? (
                    <a
                      href={`/admin/${todayLyric.id}`}
                      className="block p-5 transition hover:bg-black/[0.025]"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs text-black/40">
                          {todayLyric.publish_date}
                        </span>

                        <span className="rounded-full bg-[var(--accent)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
                          {todayLyric.status}
                        </span>
                      </div>

                      <p className="mt-3 text-lg font-semibold">
                        {todayLyric.song_title}
                      </p>

                      <p className="mt-1 text-sm text-black/50">
                        {todayLyric.artist}
                      </p>
                    </a>
                  ) : (
                    <div className="p-5">
                      <p className="text-sm font-medium">
                        Nothing scheduled for today.
                      </p>

                      <p className="mt-1 text-xs leading-5 text-black/40">
                        Add a lyric dated {today} when you're ready.
                      </p>
                    </div>
                  )}
                </div>
              </section>

              <section>
                <div className="flex items-center justify-between gap-3">
                  <p className="eyebrow">Next 7 Days</p>

                  <span className="text-xs text-black/35">
                    Central Time
                  </span>
                </div>

                <div className="mt-4 overflow-hidden rounded-2xl border border-black/10">
                  <div className="divide-y divide-black/10">
                    {nextSevenDays.map(({ date, lyric }) =>
                      lyric ? (
                        <a
                          key={date}
                          href={`/admin/${lyric.id}`}
                          className="block p-4 transition hover:bg-black/[0.025]"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-xs font-medium text-black/45">
                              {formatDashboardDate(date)}
                            </span>

                            <span className="rounded-full border border-black/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-black/45">
                              {lyric.status}
                            </span>
                          </div>

                          <p className="mt-2 font-semibold">
                            {lyric.song_title}
                          </p>

                          <div className="mt-1 flex items-center justify-between gap-3 text-xs text-black/45">
                            <span>{lyric.artist}</span>

                            <span>
                              {formatDashboardTime(
                                lyric.publish_time || "00:00"
                              )}
                            </span>
                          </div>
                        </a>
                      ) : (
                        <div
                          key={date}
                          className="flex items-center justify-between gap-4 p-4"
                        >
                          <span className="text-xs font-medium text-black/45">
                            {formatDashboardDate(date)}
                          </span>

                          <span className="rounded-full bg-[var(--accent)]/8 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--accent)]">
                            Needs Lyric
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </section>

              <section>
                <div className="flex items-center justify-between gap-3">
                  <p className="eyebrow">Drafts</p>

                  {draftLyrics.length > 0 && (
                    <span className="rounded-full border border-black/10 px-2 py-0.5 text-xs text-black/45">
                      {draftLyrics.length}
                    </span>
                  )}
                </div>

                <div className="mt-4 overflow-hidden rounded-2xl border border-black/10">
                  {draftLyrics.length === 0 ? (
                    <p className="p-5 text-sm text-black/45">
                      No drafts.
                    </p>
                  ) : (
                    <div className="divide-y divide-black/10">
                      {draftLyrics.map((lyric) => (
                        <a
                          key={lyric.id}
                          href={`/admin/${lyric.id}`}
                          className="block p-4 transition hover:bg-black/[0.025]"
                        >
                          <span className="text-xs text-black/40">
                            {lyric.publish_date}
                          </span>

                          <p className="mt-2 font-semibold">
                            {lyric.song_title}
                          </p>

                          <p className="mt-1 text-sm text-black/50">
                            {lyric.artist}
                          </p>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              <section>
                <p className="eyebrow">Recent Entries</p>

              <div className="mt-4 overflow-hidden rounded-2xl border border-black/10">
                {lyrics.length === 0 ? (
                  <p className="p-5 text-sm text-black/45">
                    No entries yet.
                  </p>
                ) : (
                  <div className="divide-y divide-black/10">
                    {lyrics.map((lyric) => (
                      <a
                        key={lyric.id}
                        href={`/admin/${lyric.id}`}
                        className="block p-4 transition hover:bg-black/[0.025]"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs text-black/40">
                            {lyric.publish_date}
                          </span>

                          <span className="rounded-full border border-black/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-black/45">
                            {lyric.status}
                          </span>
                        </div>

                        <p className="mt-2 font-semibold">
                          {lyric.song_title}
                        </p>

                        <p className="mt-1 text-sm text-black/50">
                          {lyric.artist}
                        </p>
                      </a>
                    ))}
                  </div>
                )}
              </div>
              </section>
            </div>
          </aside>
        </div>
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

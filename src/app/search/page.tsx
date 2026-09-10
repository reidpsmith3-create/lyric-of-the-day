import Link from "next/link";
import { getDb } from "@/lib/db";
import {
  dateToPath,
  formatPublishDate,
  getCentralDate,
} from "@/lib/lyrics";
import { HeaderBrand, FooterBrand } from "@/components/SiteBrand";
import ThemeToggle from "@/components/ThemeToggle";

export const dynamic = "force-dynamic";

type SearchRow = {
  id: number;
  publish_date: string;
  artist: string;
  artist_slug: string;
  song_title: string;
  album_title: string | null;
  release_year: number | null;
  genre: string | null;
  genre_slug: string | null;
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
  }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const today = getCentralDate();

  let lyrics: SearchRow[] = [];

  if (query) {
    const db = getDb();
    const search = `%${query}%`;

    const result = await db
      .prepare(
        `
        SELECT DISTINCT
          lyrics.id,
          lyrics.publish_date,
          lyrics.artist,
          lyrics.artist_slug,
          lyrics.song_title,
          lyrics.album_title,
          lyrics.release_year,
          lyrics.genre,
          lyrics.genre_slug
        FROM public_lyrics AS lyrics
        LEFT JOIN lyric_tags
          ON lyric_tags.lyric_id = lyrics.id
        LEFT JOIN tags
          ON tags.id = lyric_tags.tag_id
        WHERE lyrics.status = 'published'
          AND lyrics.publish_date <= ?
          AND (
            lyrics.song_title LIKE ? COLLATE NOCASE
            OR lyrics.artist LIKE ? COLLATE NOCASE
            OR lyrics.album_title LIKE ? COLLATE NOCASE
            OR lyrics.genre LIKE ? COLLATE NOCASE
            OR lyrics.lyric_text LIKE ? COLLATE NOCASE
            OR lyrics.commentary LIKE ? COLLATE NOCASE
            OR tags.name LIKE ? COLLATE NOCASE
          )
        ORDER BY lyrics.publish_date DESC
        LIMIT 100
        `
      )
      .bind(
        today,
        search,
        search,
        search,
        search,
        search,
        search,
        search
      )
      .all<SearchRow>();

    lyrics = result.results ?? [];
  }

  return (
    <main className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      <header className="border-b border-black/10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:gap-6 sm:px-6 sm:py-5 md:flex-nowrap">
          <Link href="/" className="group flex items-center gap-2 sm:gap-3">
            <HeaderBrand />

            <div className="hidden leading-none sm:block">
              <div className="text-sm font-bold uppercase tracking-[0.22em]">
                Lyric
              </div>
              <div className="mt-1 text-[11px] uppercase tracking-[0.27em] text-black/50">
                of the day
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-5">
            <nav className="hidden items-center gap-6 text-sm md:flex">
              <Link className="site-link" href="/">
                Today
              </Link>

              <Link className="site-link" href="/archive">
                Archive
              </Link>

              <Link className="site-link" href="/about">
                About
              </Link>
            </nav>

            <Link
              href="/search"
              aria-label="Search"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--accent)] text-[var(--accent)]"
            >
              <span className="text-base">⌕</span>
            </Link>
            <ThemeToggle />


            <Link
              href="/random"
              className="rounded-full bg-[var(--accent)] px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90 sm:px-4 sm:text-sm"
            >
              <span className="sm:hidden">Random</span>
              <span className="hidden sm:inline">Random Lyric</span>
            </Link>
          </div>
        
          <nav
            aria-label="Mobile navigation"
            className="order-3 flex w-full items-center gap-6 border-t border-black/10 pt-3 text-xs md:hidden"
          >
            <Link className="site-link" href="/">
              Today
            </Link>

            <Link className="site-link" href="/archive">
              Archive
            </Link>

            <Link className="site-link" href="/about">
              About
            </Link>
          </nav>
</div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-16 md:py-24">
        <section>
          <p className="eyebrow text-[var(--accent)]">
            Search
          </p>

          <h1 className="mt-6 max-w-3xl text-5xl font-medium leading-[0.95] tracking-[-0.045em] md:text-7xl">
            Find a lyric.
          </h1>

          <form action="/search" method="get" className="mt-10">
            <div className="flex max-w-3xl gap-3">
              <input
                type="search"
                name="q"
                defaultValue={query}
                placeholder="Song, artist, album, lyric, tag..."
                autoFocus
                className="field min-w-0 flex-1"
              />

              <button
                type="submit"
                className="rounded-full bg-[var(--ink)] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-85"
              >
                Search
              </button>
            </div>
          </form>
        </section>

        {query && (
          <section className="mt-16 border-t border-black/15">
            <div className="flex flex-wrap items-center justify-between gap-4 py-6">
              <p className="text-sm text-black/50">
                {lyrics.length === 1
                  ? `1 result for “${query}”`
                  : `${lyrics.length} results for “${query}”`}
              </p>

              <Link
                href="/search"
                className="text-sm text-black/45 transition hover:text-black"
              >
                Clear search
              </Link>
            </div>

            {lyrics.length === 0 ? (
              <div className="border-t border-black/10 py-16">
                <h2 className="text-2xl font-semibold">
                  Nothing found.
                </h2>

                <p className="mt-3 text-black/50">
                  Try a song title, artist, album, genre, lyric, or tag.
                </p>
              </div>
            ) : (
              lyrics.map((lyric) => (
                <article
                  key={lyric.id}
                  className="border-t border-black/10 py-8"
                >
                  <div className="grid gap-5 md:grid-cols-12 md:items-center">
                    <div className="md:col-span-3">
                      <p className="text-xs uppercase tracking-[0.16em] text-black/40">
                        {formatPublishDate(lyric.publish_date)}
                      </p>
                    </div>

                    <div className="md:col-span-8">
                      <Link
                        href={dateToPath(lyric.publish_date)}
                        className="group inline-block"
                      >
                        <h2 className="text-2xl font-semibold tracking-[-0.025em] transition group-hover:text-[var(--accent)] md:text-3xl">
                          {lyric.song_title}
                        </h2>
                      </Link>

                      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                        <Link
                          href={`/artist/${lyric.artist_slug}`}
                          className="font-medium hover:text-[var(--accent)]"
                        >
                          {lyric.artist}
                        </Link>

                        {(lyric.album_title || lyric.release_year) && (
                          <>
                            <span className="text-black/25">·</span>

                            <span className="text-black/45">
                              {lyric.album_title}
                              {lyric.album_title && lyric.release_year
                                ? " · "
                                : ""}
                              {lyric.release_year}
                            </span>
                          </>
                        )}
                      </div>

                      {lyric.genre && lyric.genre_slug && (
                        <div className="mt-4">
                          <Link
                            href={`/genre/${lyric.genre_slug}`}
                            className="tag-pill"
                          >
                            {lyric.genre}
                          </Link>
                        </div>
                      )}
                    </div>

                    <div className="md:col-span-1 md:flex md:justify-end">
                      <Link
                        href={dateToPath(lyric.publish_date)}
                        aria-label={`Read ${lyric.song_title} by ${lyric.artist}`}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/15 text-lg transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                      >
                        →
                      </Link>
                    </div>
                  </div>
                </article>
              ))
            )}
          </section>
        )}
      </div>

      <footer className="border-t border-black/10">
        <div className="mx-auto grid max-w-6xl items-center gap-6 px-6 py-8 text-sm text-black/45 md:grid-cols-3">
          <div className="flex justify-center md:justify-start">
            <FooterBrand />
          </div>

          <div className="text-center">
            <p>© 2026 Lyric of the Day</p>
          </div>

          <div className="flex justify-center md:justify-end">
            <div className="flex gap-5">
            <Link className="site-link" href="/about">
              About
            </Link>

            <Link className="site-link" href="/archive">
              Archive
            </Link>

            <Link className="site-link" href="/search">
              Search
            </Link>
          </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

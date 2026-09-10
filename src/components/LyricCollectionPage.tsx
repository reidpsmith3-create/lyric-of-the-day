import Link from "next/link";
import {
  dateToPath,
  formatPublishDate,
} from "@/lib/lyrics";
import { HeaderBrand, FooterBrand } from "@/components/SiteBrand";
import ThemeToggle from "@/components/ThemeToggle";
import HeaderSearch from "@/components/HeaderSearch";

export type CollectionLyric = {
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

export default function LyricCollectionPage({
  eyebrow,
  title,
  description,
  lyrics,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  lyrics: CollectionLyric[];
}) {
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

            <HeaderSearch />
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
        <section className="pb-14">
          <p className="eyebrow text-[var(--accent)]">
            {eyebrow}
          </p>

          <h1 className="mt-6 max-w-4xl text-5xl font-medium leading-[0.95] tracking-[-0.045em] md:text-7xl">
            {title}
          </h1>

          {description && (
            <p className="mt-6 max-w-2xl text-lg leading-7 text-black/55">
              {description}
            </p>
          )}

          <p className="mt-7 text-sm text-black/45">
            {lyrics.length === 1
              ? "1 lyric in this collection."
              : `${lyrics.length} lyrics in this collection.`}
          </p>
        </section>

        <section className="border-t border-black/15">
          {lyrics.length === 0 ? (
            <div className="py-16">
              <p className="text-2xl font-medium">
                Nothing here yet.
              </p>
            </div>
          ) : (
            lyrics.map((lyric) => (
              <article
                key={lyric.id}
                className="border-b border-black/10 py-8"
              >
                <div className="grid gap-6 md:grid-cols-12 md:items-center">
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

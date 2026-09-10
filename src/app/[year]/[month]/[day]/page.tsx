import Link from "next/link";
import { notFound } from "next/navigation";
import LyricEntry from "@/components/LyricEntry";
import {
  dateToPath,
  getAdjacentPublishedLyrics,
  getCentralDate,
  getLyricByDate,
} from "@/lib/lyrics";
import { HeaderBrand, FooterBrand } from "@/components/SiteBrand";
import ThemeToggle from "@/components/ThemeToggle";

export const dynamic = "force-dynamic";

export default async function HistoricalLyricPage({
  params,
  searchParams,
}: {
  params: Promise<{
    year: string;
    month: string;
    day: string;
  }>;
  searchParams: Promise<{ comment?: string }>;
}) {
  const { year, month, day } = await params;
  const { comment } = await searchParams;

  if (
    !/^\d{4}$/.test(year) ||
    !/^\d{2}$/.test(month) ||
    !/^\d{2}$/.test(day)
  ) {
    notFound();
  }

  const date = `${year}-${month}-${day}`;
  const today = getCentralDate();

  if (date > today) {
    notFound();
  }

  const result = await getLyricByDate(date);

  if (!result) {
    notFound();
  }

  const { lyric, tags } = result;
  const { previous, next } = await getAdjacentPublishedLyrics(date);

  return (
    <main>
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
              className="flex h-9 w-9 items-center justify-center rounded-full border border-black/15 transition hover:border-black/35"
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

      <LyricEntry
        lyric={lyric}
        tags={tags}
        commentStatus={comment}
      />

      <section className="border-t border-black/10">
        <div className="mx-auto grid max-w-5xl gap-4 px-6 py-12 sm:px-8 md:grid-cols-3">
          {previous ? (
            <Link
              href={dateToPath(previous.publish_date)}
              className="daily-nav-card"
            >
              <div className="eyebrow">Previous</div>
              <div className="mt-3 font-semibold">{previous.artist}</div>
              <div className="mt-1 text-sm text-black/55">
                {previous.song_title}
              </div>
            </Link>
          ) : (
            <div className="daily-nav-card opacity-35">
              <div className="eyebrow">Previous</div>
              <div className="mt-3 font-semibold">Beginning of archive</div>
            </div>
          )}

          <Link href="/random" className="daily-nav-card text-center">
            <div className="eyebrow">Discover</div>
            <div className="mt-3 font-semibold">Random Lyric</div>
            <div className="mt-1 text-sm text-black/55">
              Surprise me →
            </div>
          </Link>

          {next ? (
            <Link href={dateToPath(next.publish_date)} className="daily-nav-card">
              <div className="eyebrow">Next</div>
              <div className="mt-3 font-semibold">{next.artist}</div>
              <div className="mt-1 text-sm text-black/55">
                {next.song_title}
              </div>
            </Link>
          ) : (
            <Link href="/" className="daily-nav-card">
              <div className="eyebrow">Latest</div>
              <div className="mt-3 font-semibold">Today</div>
              <div className="mt-1 text-sm text-black/55">
                Back to the latest lyric →
              </div>
            </Link>
          )}
        </div>
      </section>

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

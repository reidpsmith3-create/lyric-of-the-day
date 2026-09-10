import type { Metadata } from "next";
import Link from "next/link";
import LyricEntry from "@/components/LyricEntry";
import {
  dateToPath,
  getAdjacentPublishedLyrics,
  getLatestPublishedLyric,
} from "@/lib/lyrics";
import { HeaderBrand, FooterBrand } from "@/components/SiteBrand";
import ThemeToggle from "@/components/ThemeToggle";
import HeaderSearch from "@/components/HeaderSearch";

export const metadata: Metadata = {
  title: "Lyric of the Day",
  description:
    "One lyric every day, with original commentary on the words that stay with us.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Lyric of the Day",
    description:
      "One lyric every day, with original commentary on the words that stay with us.",
    url: "/",
    siteName: "Lyric of the Day",
    type: "website",
  },
};

export const dynamic = "force-dynamic";

function isPreviousCalendarDay(current: string, previous: string) {
  const currentDate = new Date(`${current}T12:00:00Z`);
  currentDate.setUTCDate(currentDate.getUTCDate() - 1);

  return currentDate.toISOString().slice(0, 10) === previous;
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ comment?: string }>;
}) {
  const { comment } = await searchParams;
  const result = await getLatestPublishedLyric();

  if (!result) {
    return (
      <main className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
        <div className="mx-auto max-w-4xl px-6 py-24">
          <p className="eyebrow text-[var(--accent)]">
            Lyric of the Day
          </p>

          <h1 className="mt-6 text-5xl font-semibold tracking-[-0.04em]">
            No lyric published yet.
          </h1>

          <p className="mt-4 text-lg text-black/55">
            Check back soon.
          </p>
        </div>
      </main>
    );
  }

  const { lyric, tags } = result;
  const { previous } = await getAdjacentPublishedLyrics(
    lyric.publish_date
  );

  const previousLabel =
    previous &&
    isPreviousCalendarDay(lyric.publish_date, previous.publish_date)
      ? "Yesterday"
      : "Previous";

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

      <LyricEntry
        lyric={lyric}
        tags={tags}
        commentStatus={comment}
      />

      <nav className="mx-auto grid max-w-4xl grid-cols-1 gap-3 border-t border-black/10 px-6 pb-20 pt-8 md:grid-cols-2">
        {previous ? (
          <Link
            href={dateToPath(previous.publish_date)}
            className="daily-nav-card"
          >
            <span className="text-xs uppercase tracking-[0.18em] text-black/40">
              {previousLabel}
            </span>

            <span className="mt-2 font-semibold">
              {previous.artist}
            </span>

            <span className="mt-1 text-sm text-black/45">
              {previous.song_title}
            </span>
          </Link>
        ) : (
          <div className="daily-nav-card opacity-40">
            <span className="text-xs uppercase tracking-[0.18em] text-black/40">
              Previous
            </span>

            <span className="mt-2 font-semibold">
              Beginning of archive
            </span>
          </div>
        )}

        <Link
          href="/random"
          className="daily-nav-card text-left md:text-center"
        >
          <span className="text-xs uppercase tracking-[0.18em] text-black/40">
            Discover
          </span>

          <span className="mt-2 font-semibold">
            Random Lyric
          </span>

          <span className="mt-1 text-sm text-black/45">
            Surprise me →
          </span>
        </Link>
      </nav>

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

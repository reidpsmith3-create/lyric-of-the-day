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
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 sm:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-black text-[10px] font-bold tracking-[0.12em]">
              LOTD
            </div>

            <div className="text-xs font-semibold leading-tight tracking-[0.2em]">
              LYRIC
              <br />
              OF THE DAY
            </div>
          </Link>

          <nav className="hidden items-center gap-8 text-sm md:flex">
            <Link href="/" className="site-link">
              Today
            </Link>
            <Link href="/archive" className="site-link">
              Archive
            </Link>
            <Link href="/about" className="site-link">
              About
            </Link>
            <Link href="/search" className="site-link" aria-label="Search">
              Search
            </Link>
            <Link
              href="/random"
              className="rounded-full bg-[var(--accent)] px-5 py-2.5 font-semibold text-white"
            >
              Random Lyric
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
          <div className="mb-8">
            <FooterBrand />
          </div>
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-8 text-sm text-black/50 sm:px-8 md:flex-row md:items-center md:justify-between">
          <div>© 2026 Lyric of the Day</div>

          <div className="flex gap-6">
            <Link href="/about" className="hover:text-black">
              About
            </Link>
            <Link href="/archive" className="hover:text-black">
              Archive
            </Link>
            <Link href="/search" className="hover:text-black">
              Search
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

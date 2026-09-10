import Link from "next/link";
import { HeaderBrand, FooterBrand } from "@/components/SiteBrand";
import ThemeToggle from "@/components/ThemeToggle";
import HeaderSearch from "@/components/HeaderSearch";

export default function AboutPage() {
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

              <Link
                className="site-link font-semibold text-[var(--accent)]"
                href="/about"
              >
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

      <div className="mx-auto max-w-4xl px-6 py-16 md:py-24">
        <section>
          <p className="eyebrow text-[var(--accent)]">
            About
          </p>

          <h1 className="mt-6 max-w-3xl text-5xl font-medium leading-[0.95] tracking-[-0.045em] md:text-7xl">
            One lyric.
            <br />
            Every day.
          </h1>

          <div className="mt-14 max-w-2xl space-y-7 text-xl leading-8 text-black/75 md:text-2xl md:leading-9">
            <p>
              Lyric of the Day is a daily celebration of songwriting —
              one line, verse, or moment worth stopping for.
            </p>

            <p>
              Each selection is paired with a short reflection on what
              makes it work: the writing, the feeling, the story, or the
              way a few words can completely change a song.
            </p>

            <p>
              The goal is simple: not to collect every great lyric, but
              to spend a little more time with one.
            </p>
          </div>
        </section>

        <section className="border-t border-black/15 pt-12" style={{ marginTop: "7rem" }}>
          <div className="grid gap-10 md:grid-cols-[180px_1fr]">
            <p className="eyebrow">
              Explore
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <Link href="/" className="daily-nav-card">
                <span className="text-xs uppercase tracking-[0.18em] text-black/40">
                  Daily
                </span>

                <span className="mt-2 font-semibold">
                  Today’s Lyric
                </span>

                <span className="mt-1 text-sm text-black/45">
                  See the latest selection →
                </span>
              </Link>

              <Link href="/archive" className="daily-nav-card">
                <span className="text-xs uppercase tracking-[0.18em] text-black/40">
                  Browse
                </span>

                <span className="mt-2 font-semibold">
                  The Archive
                </span>

                <span className="mt-1 text-sm text-black/45">
                  Revisit past selections →
                </span>
              </Link>

              <Link href="/search" className="daily-nav-card">
                <span className="text-xs uppercase tracking-[0.18em] text-black/40">
                  Find
                </span>

                <span className="mt-2 font-semibold">
                  Search
                </span>

                <span className="mt-1 text-sm text-black/45">
                  Artist, song, lyric, genre →
                </span>
              </Link>

              <Link href="/random" className="daily-nav-card">
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
            </div>
          </div>
        </section>

        <section className="border-t border-black/15 pt-12" style={{ marginTop: "7rem" }}>
          <div className="grid gap-8 md:grid-cols-[180px_1fr]">
            <p className="eyebrow">
              A Note
            </p>

            <div className="max-w-2xl space-y-5 text-base leading-7 text-black/60">
              <p>
                Lyric excerpts are presented alongside original
                commentary and criticism. Songwriting and lyrics remain
                the property of their respective copyright holders.
              </p>

              <p>
                Listening links are provided to help readers support the
                artists and hear each lyric in its full musical context.
              </p>
            </div>
          </div>
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

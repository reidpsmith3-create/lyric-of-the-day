"use client";

import { useState } from "react";

type CopyTweetButtonProps = {
  lyricText: string;
  songTitle: string;
  artist: string;
  compact?: boolean;
};

const SITE_URL = "https://todayslyric.com";
const MAX_TWEET_LENGTH = 280;

function cleanLyric(text: string) {
  return text
    .trim()
    .replace(/\r?\n+/g, " / ")
    .replace(/\s+/g, " ");
}

function buildTweet(
  lyricText: string,
  songTitle: string,
  artist: string
) {
  const attribution = `\n\n“${songTitle}” — ${artist}\n${SITE_URL}`;
  const cleanedLyric = cleanLyric(lyricText);

  const availableForLyric =
    MAX_TWEET_LENGTH - attribution.length - 2;

  let excerpt = cleanedLyric;

  if (excerpt.length > availableForLyric) {
    excerpt =
      excerpt
        .slice(0, Math.max(0, availableForLyric - 1))
        .trimEnd() + "…";
  }

  return `“${excerpt}”${attribution}`;
}

export default function CopyTweetButton({
  lyricText,
  songTitle,
  artist,
  compact = false,
}: CopyTweetButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const tweet = buildTweet(
      lyricText,
      songTitle,
      artist
    );

    await navigator.clipboard.writeText(tweet);

    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 1800);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      style={
        compact
          ? {
              height: "36px",
              fontSize: "12px",
              lineHeight: "12px",
              fontFamily: "inherit",
              fontWeight: 600,
            }
          : undefined
      }
      className={`inline-flex items-center justify-center rounded-full border border-black/15 transition hover:border-[var(--accent)] hover:text-[var(--accent)] ${
        compact
          ? "px-3 py-0"
          : "px-5 py-3 text-sm font-semibold"
      }`}
    >
      {copied ? "Copied ✓" : "Copy Tweet"}
    </button>
  );
}

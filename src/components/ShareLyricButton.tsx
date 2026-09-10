"use client";

import { useState } from "react";

export default function ShareLyricButton({
  url,
  artist,
  songTitle,
}: {
  url: string;
  artist: string;
  songTitle: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const absoluteUrl = new URL(url, window.location.origin).toString();

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${songTitle} — ${artist} | Lyric of the Day`,
          text: `Today's lyric: ${songTitle} by ${artist}`,
          url: absoluteUrl,
        });

        return;
      }

      await navigator.clipboard.writeText(absoluteUrl);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch (error) {
      if (
        error instanceof DOMException &&
        error.name === "AbortError"
      ) {
        return;
      }

      try {
        await navigator.clipboard.writeText(absoluteUrl);
        setCopied(true);

        window.setTimeout(() => {
          setCopied(false);
        }, 1800);
      } catch {
        // Leave the button unchanged if clipboard access is unavailable.
      }
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="share-lyric-button"
      aria-label={`Share ${songTitle} by ${artist}`}
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-4 w-4"
      >
        <circle cx="18" cy="5" r="2.25" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="6" cy="12" r="2.25" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="18" cy="19" r="2.25" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path
          d="M8 11l8-4.7M8 13l8 4.7"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>

      <span>{copied ? "Copied" : "Share"}</span>
    </button>
  );
}

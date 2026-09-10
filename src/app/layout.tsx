import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Lyric of the Day",
    template: "%s | Lyric of the Day",
  },
  description:
    "One lyric every day, with original commentary on the words that stay with us.",
  icons: {
    icon: [
      {
        url: "/brand/app-logo.png",
        type: "image/png",
      },
    ],
    shortcut: "/brand/app-logo.png",
    apple: "/brand/app-logo.png",
  },
  applicationName: "Lyric of the Day",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var saved = localStorage.getItem("lotd-theme");
                var dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                document.documentElement.dataset.theme =
                  saved === "dark" || (!saved && dark) ? "dark" : "light";
              } catch (_) {
                document.documentElement.dataset.theme = "light";
              }
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

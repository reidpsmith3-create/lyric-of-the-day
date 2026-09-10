import type { MetadataRoute } from "next";
import { getDb } from "@/lib/db";
import { dateToPath } from "@/lib/lyrics";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const db = getDb();

  const { results: lyrics = [] } = await db
    .prepare(
      `
      SELECT
        publish_date,
        updated_at
      FROM public_lyrics
      ORDER BY publish_date DESC
      `
    )
    .all<{
      publish_date: string;
      updated_at: string;
    }>();

  const baseUrl = "https://todayslyric.com";

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/archive`,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];

  const lyricPages: MetadataRoute.Sitemap = lyrics.map((lyric) => ({
    url: `${baseUrl}${dateToPath(lyric.publish_date)}`,
    lastModified: lyric.updated_at
      ? new Date(lyric.updated_at)
      : undefined,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticPages, ...lyricPages];
}

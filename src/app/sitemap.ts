import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://youtubedownload-ssun.vercel.app";
  return [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/settings`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/support`,
      lastModified: new Date(),
    },
  ];
}

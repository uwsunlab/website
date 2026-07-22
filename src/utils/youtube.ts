const YOUTUBE_HOSTS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be']);

export function getYouTubeVideoId(url: string | undefined): string | null {
  if (!url) return null;

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  if (!YOUTUBE_HOSTS.has(parsed.hostname)) return null;

  if (parsed.hostname === 'youtu.be') {
    return parsed.pathname.slice(1) || null;
  }

  const videoParam = parsed.searchParams.get('v');
  if (videoParam) return videoParam;

  const pathMatch = parsed.pathname.match(/^\/(embed|shorts|live)\/([^/]+)/);
  return pathMatch ? pathMatch[2] : null;
}

// hqdefault.jpg is 4:3 and letterboxes 16:9 videos with baked-in black bars, so
// prefer maxresdefault (16:9, but missing on some videos) and fall back to
// mqdefault (16:9, always present) rather than to hqdefault.
export function getYouTubeThumbnailUrl(url: string | undefined): string | null {
  const id = getYouTubeVideoId(url);
  return id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : null;
}

export function getYouTubeThumbnailFallbackUrl(url: string | undefined): string | null {
  const id = getYouTubeVideoId(url);
  return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null;
}

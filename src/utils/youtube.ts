const validId = (s: string | null | undefined): string | null =>
  s && /^[\w-]{11}$/.test(s) ? s : null;

const cleanHost = (raw: string): string =>
  new URL(raw.trim()).hostname.replace(/^(www|m|music)\./, '');

/** Trích video ID từ link YouTube (watch, youtu.be, shorts, embed, live). */
export function parseYouTubeId(raw: string): string | null {
  try {
    const u = new URL(raw.trim());
    const host = cleanHost(raw);
    if (host === 'youtu.be') return validId(u.pathname.slice(1));
    if (host === 'youtube.com') {
      if (u.pathname === '/watch') return validId(u.searchParams.get('v'));
      const m = u.pathname.match(/^\/(embed|shorts|live)\/([\w-]{11})/);
      if (m) return m[2];
    }
  } catch {
    /* link không hợp lệ */
  }
  return null;
}

export const isYouTubeHost = (raw: string): boolean => {
  try {
    const host = cleanHost(raw);
    return host === 'youtube.com' || host === 'youtu.be';
  } catch {
    return false;
  }
};

export const youtubeThumb = (id: string): string => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
export const youtubeEmbed = (id: string): string =>
  `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;

import { useEffect, useRef, useState } from "react";
import { useI18n } from "../../i18n/i18nProvider";

type SpotifyInfo = {
  song?: string;
  artist?: string;
  album?: string;
  album_art_url?: string | null;
  timestamps?: {
    start?: number | null;
    end?: number | null;
  };
};

type LyricLine = {
  time: number;
  text: string;
};

type LyricsResponse = {
  found: boolean;
  instrumental?: boolean;
  syncedLyrics?: string | null;
  plainLyrics?: string | null;
};

const API_URL = import.meta.env.VITE_API_URL || "https://api.arcxnjo.com.br";

function parseSyncedLyrics(synced: string): LyricLine[] {
  const lines: LyricLine[] = [];

  for (const rawLine of synced.split("\n")) {
    const match = rawLine.match(/\[(\d{2}):(\d{2})(?:[.:](\d{1,3}))?\](.*)/);
    if (!match) continue;

    const minutes = Number(match[1]);
    const seconds = Number(match[2]);
    const fraction = match[3] ? Number(`0.${match[3]}`) : 0;
    const text = match[4].trim();

    if (!text) continue;

    lines.push({ time: minutes * 60 + seconds + fraction, text });
  }

  return lines.sort((a, b) => a.time - b.time);
}

export const LyricsDisplay = ({
  spotify,
  className = "",
}: {
  spotify: SpotifyInfo | null | undefined;
  className?: string;
}) => {
  const { t } = useI18n();

  const [lines, setLines] = useState<LyricLine[] | null>(null);
  const [plainLyrics, setPlainLyrics] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [loading, setLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const activeLineRef = useRef<HTMLParagraphElement | null>(null);

  const song = spotify?.song || "";
  const artist = spotify?.artist || "";
  const album = spotify?.album || "";
  const start = spotify?.timestamps?.start || null;
  const end = spotify?.timestamps?.end || null;

  useEffect(() => {
    setLines(null);
    setPlainLyrics(null);
    setActiveIndex(-1);

    if (!song || !artist) return;

    const controller = new AbortController();

    const fetchLyrics = async () => {
      setLoading(true);

      try {
        const params = new URLSearchParams({ track: song, artist });
        if (album) params.set("album", album);
        if (start && end && end > start) {
          params.set("duration", String(Math.round((end - start) / 1000)));
        }

        const response = await fetch(`${API_URL}/api/lyrics?${params.toString()}`, {
          signal: controller.signal,
        });

        const data: LyricsResponse = await response.json();
        if (!data.found || data.instrumental) return;

        if (data.syncedLyrics) {
          setLines(parseSyncedLyrics(data.syncedLyrics));
        } else if (data.plainLyrics) {
          setPlainLyrics(data.plainLyrics);
        }
      } catch (error) {
        if ((error as Error)?.name !== "AbortError") {
          console.error("Lyrics fetch error:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLyrics();
    return () => controller.abort();
  }, [song, artist, album, start, end]);

  useEffect(() => {
    if (!lines || !start) return;

    const updateActiveLine = () => {
      const elapsed = (Date.now() - start) / 1000;
      let index = -1;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].time <= elapsed) index = i;
        else break;
      }
      setActiveIndex(index);
    };

    updateActiveLine();
    const interval = window.setInterval(updateActiveLine, 500);
    return () => window.clearInterval(interval);
  }, [lines, start]);

  // Auto-scroll só dentro do container
  useEffect(() => {
    if (activeLineRef.current && containerRef.current) {
      const container = containerRef.current;
      const line = activeLineRef.current;
      const containerTop = container.scrollTop;
      const containerBottom = containerTop + container.clientHeight;
      const lineTop = line.offsetTop;
      const lineBottom = lineTop + line.clientHeight;

      if (lineTop < containerTop || lineBottom > containerBottom) {
        container.scrollTop =
          lineTop - container.clientHeight / 2 + line.clientHeight / 2;
      }
    }
  }, [activeIndex]);

  if (!song || !artist) return null;
  if (loading && !lines && !plainLyrics) return null;
  if (!lines && !plainLyrics) return null;

  return (
    <div className={`overflow-hidden rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md ${className}`}>

      {/* Badge Lyrics */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/35">
          {t("profile.lyrics")}
        </span>
      </div>

      {/* Letras */}
      {lines ? (
        <div
          ref={containerRef}
          className="max-h-64 overflow-y-auto px-4 py-4 text-center"
          style={{ scrollbarWidth: "none" }}
        >
          <style>{`div::-webkit-scrollbar { display: none; }`}</style>
          {lines.map((line, index) => {
            const isActive = index === activeIndex;
            const isPast = index < activeIndex;

            return (
              <p
                key={index}
                ref={isActive ? activeLineRef : null}
                className="mb-3 leading-snug transition-all duration-500"
                style={{
                  fontSize: isActive ? "1.15rem" : "0.95rem",
                  fontWeight: isActive ? 800 : 500,
                  color: isActive
                    ? "rgba(255,255,255,1)"
                    : isPast
                    ? "rgba(255,255,255,0.25)"
                    : "rgba(255,255,255,0.18)",
                  textShadow: isActive
                    ? "0 0 24px rgba(255,255,255,0.5), 0 0 48px rgba(255,255,255,0.2)"
                    : "none",
                  transform: isActive ? "scale(1.04)" : "scale(1)",
                  letterSpacing: isActive ? "0.01em" : "normal",
                }}
              >
                {line.text}
              </p>
            );
          })}
        </div>
      ) : (
        <div
          className="max-h-64 overflow-y-auto px-4 py-4 text-center"
          style={{ scrollbarWidth: "none" }}
        >
          {plainLyrics?.split("\n").map((line, index) => (
            <p
              key={index}
              className="mb-2 text-[15px] leading-relaxed text-white/55"
            >
              {line || "\u00A0"}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

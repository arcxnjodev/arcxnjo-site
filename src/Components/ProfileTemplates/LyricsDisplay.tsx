import { useEffect, useRef, useState } from "react";
import { useI18n } from "../../i18n/i18nProvider";

type SpotifyInfo = {
  song?: string;
  artist?: string;
  album?: string;
  timestamps?: {
    start?: number | null;
    end?: number | null;
  };
};

type LyricLine = {
  time: number; // segundos
  text: string;
};

type LyricsResponse = {
  found: boolean;
  instrumental?: boolean;
  syncedLyrics?: string | null;
  plainLyrics?: string | null;
};

const API_URL = import.meta.env.VITE_API_URL || "https://api.arcxnjo.com.br";

// Parseia o formato LRC: [mm:ss.xx]texto da linha
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

    lines.push({
      time: minutes * 60 + seconds + fraction,
      text,
    });
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

  // Busca a letra quando a música muda
  useEffect(() => {
    setLines(null);
    setPlainLyrics(null);
    setActiveIndex(-1);

    if (!song || !artist) return;

    const controller = new AbortController();

    const fetchLyrics = async () => {
      setLoading(true);

      try {
        const params = new URLSearchParams({
          track: song,
          artist,
        });

        if (album) params.set("album", album);

        if (start && end && end > start) {
          params.set("duration", String(Math.round((end - start) / 1000)));
        }

        const response = await fetch(`${API_URL}/api/lyrics?${params.toString()}`, {
          signal: controller.signal,
        });

        const data: LyricsResponse = await response.json();

        if (!data.found || data.instrumental) {
          return;
        }

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

  // Atualiza a linha ativa com base no progresso da música
  useEffect(() => {
    if (!lines || !start) return;

    const updateActiveLine = () => {
      const elapsed = (Date.now() - start) / 1000;

      let index = -1;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].time <= elapsed) {
          index = i;
        } else {
          break;
        }
      }

      setActiveIndex(index);
    };

    updateActiveLine();

    const interval = window.setInterval(updateActiveLine, 500);

    return () => window.clearInterval(interval);
  }, [lines, start]);

  // Auto-scroll para manter a linha ativa visível
  useEffect(() => {
    if (activeLineRef.current && containerRef.current) {
      activeLineRef.current.scrollIntoView({
        block: "center",
        behavior: "smooth",
      });
    }
  }, [activeIndex]);

  if (!song || !artist) return null;
  if (loading && !lines && !plainLyrics) return null;
  if (!lines && !plainLyrics) return null;

  return (
    <div className={`mt-3 rounded-xl bg-black/20 p-3 ${className}`}>
      <p className="mb-2 text-xs text-white/50">{t("profile.lyrics")}</p>

      {lines ? (
        <div
          ref={containerRef}
          
        >
          {lines.map((line, index) => (
            <p
              key={index}
              ref={index === activeIndex ? activeLineRef : null}
              className={`truncate text-[15px] transition-all duration-300 ${
                index === activeIndex
                  ? "font-semibold text-white"
                  : "text-white/35"
              }`}
            >
              {line.text}
            </p>
          ))}
        </div>
      ) : (
        <div className="text-[15px] text-white/60">
          {plainLyrics?.split("\n").map((line, index) => (
            <p key={index} className="leading-relaxed">
              {line || "\u00A0"}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

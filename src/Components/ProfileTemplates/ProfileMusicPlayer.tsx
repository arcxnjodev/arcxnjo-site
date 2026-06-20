import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "https://api.arcxnjo.com.br";

type LyricLine = { time: number; text: string };

type Props = {
  musicTitle?: string;
  musicArtist?: string;
  albumArt?: string | null;
  audioRef: React.RefObject<HTMLAudioElement>;
};

function parseLrc(lrc: string): LyricLine[] {
  const lines: LyricLine[] = [];
  for (const raw of lrc.split("\n")) {
    const m = raw.match(/\[(\d{2}):(\d{2})(?:[.:](\d{1,3}))?\](.*)/);
    if (!m) continue;
    const text = m[4].trim();
    if (!text) continue;
    lines.push({
      time: Number(m[1]) * 60 + Number(m[2]) + (m[3] ? Number(`0.${m[3]}`) : 0),
      text,
    });
  }
  return lines.sort((a, b) => a.time - b.time);
}

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export const ProfileMusicPlayer = ({
  musicTitle = "Profile music",
  musicArtist = "",
  albumArt,
  audioRef,
}: Props) => {
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [lines, setLines] = useState<LyricLine[] | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);

  // Busca letra
  useEffect(() => {
    setLines(null);
    if (!musicTitle) return;

    const params = new URLSearchParams({ track: musicTitle });
    if (musicArtist) params.set("artist", musicArtist);

    fetch(`${API_URL}/api/lyrics?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.found && data.syncedLyrics) {
          setLines(parseLrc(data.syncedLyrics));
        }
      })
      .catch(() => {});
  }, [musicTitle, musicArtist]);

  // Sincroniza letra
  useEffect(() => {
    if (!lines || !audioRef.current) return;
    const audio = audioRef.current;

    const update = () => {
      const t = audio.currentTime;
      setCurrentTime(t);
      let idx = -1;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].time <= t) idx = i;
        else break;
      }
      setActiveIndex(idx);
    };

    audio.addEventListener("timeupdate", update);
    audio.addEventListener("durationchange", () => setDuration(audio.duration || 0));
    audio.addEventListener("play", () => setPlaying(true));
    audio.addEventListener("pause", () => setPlaying(false));
    audio.addEventListener("ended", () => setPlaying(false));

    return () => {
      audio.removeEventListener("timeupdate", update);
    };
  }, [lines, audioRef]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      await audio.play();
    }
  };

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Number(e.target.value);
  };

  const skipPrev = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, audio.currentTime - 10);
  };

  const skipNext = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.min(duration, audio.currentTime + 10);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className="relative overflow-hidden rounded-3xl border border-white/10 backdrop-blur-xl"
      style={{ background: "rgba(0,0,0,0.35)" }}
    >
      <div className="flex flex-col gap-0 sm:flex-row">
        {/* Lado esquerdo: controles */}
        <div className="flex flex-col justify-center gap-3 p-4 sm:min-w-0 sm:flex-1">
          <div className="flex items-center gap-3">
            {/* Capa */}
            <div className="relative h-[74px] w-[74px] shrink-0 overflow-hidden rounded-[10px] bg-white/10">
              {albumArt ? (
                <img src={albumArt} alt={musicTitle} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-white/20 text-2xl">♪</div>
              )}
            </div>

            {/* Info + controles */}
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex min-w-0 flex-col">
                <div className="flex items-center gap-2">
                  {/* Equalizador animado */}
                  {playing && (
                    <div className="flex h-3 shrink-0 items-end gap-0.5">
                      {[1, 2, 3].map((i) => (
                        <span
                          key={i}
                          className="w-[3px] rounded-full bg-white"
                          style={{
                            animation: `eq${i} ${0.5 + i * 0.1}s ease-in-out infinite alternate`,
                            height: `${6 + i * 3}px`,
                          }}
                        />
                      ))}
                    </div>
                  )}
                  <span className="min-w-0 truncate text-base font-semibold leading-tight text-white">
                    {musicTitle}
                  </span>
                </div>
                {musicArtist && (
                  <span className="truncate text-sm leading-tight text-white/60">{musicArtist}</span>
                )}
              </div>

              {/* Botões */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={skipPrev}
                  className="flex h-7 w-7 shrink-0 items-center justify-center text-white/80 transition hover:text-white"
                  title="−10s"
                >
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
                    <path d="M8.09 14.647c-1.787-1.154-1.787-4.14 0-5.294l10.79-6.968c1.736-1.121 3.87.339 3.87 2.648v13.934c0 2.31-2.134 3.769-3.87 2.648zM2 5a.75.75 0 0 1 1.5 0v14A.75.75 0 0 1 2 19z" />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={togglePlay}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-black transition hover:scale-105"
                >
                  {playing ? (
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
                      <path d="M2 6c0-1.886 0-2.828.586-3.414S4.114 2 6 2s2.828 0 3.414.586S10 4.114 10 6v12c0 1.886 0 2.828-.586 3.414S7.886 22 6 22s-2.828 0-3.414-.586S2 19.886 2 18zm12 0c0-1.886 0-2.828.586-3.414S16.114 2 18 2s2.828 0 3.414.586S22 4.114 22 6v12c0 1.886 0 2.828-.586 3.414S19.886 22 18 22s-2.828 0-3.414-.586S14 19.886 14 18z" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 translate-x-[1px]" fill="currentColor">
                      <path d="M6.906 4.537A.75.75 0 0 0 5.75 5.25v13.5a.75.75 0 0 0 1.156.637l10.5-6.75a.75.75 0 0 0 0-1.274z" />
                    </svg>
                  )}
                </button>

                <button
                  type="button"
                  onClick={skipNext}
                  className="flex h-7 w-7 shrink-0 items-center justify-center text-white/80 transition hover:text-white"
                  title="+10s"
                >
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
                    <path d="M16.66 14.647c1.787-1.154 1.787-4.14 0-5.294L5.87 2.385C4.135 1.264 2 2.724 2 5.033v13.934c0 2.31 2.134 3.769 3.87 2.648zM22.75 5a.75.75 0 0 0-1.5 0v14a.75.75 0 0 0 1.5 0z" />
                  </svg>
                </button>

                {/* Barra de progresso */}
                <div className="flex flex-1 items-center gap-2">
                  <span className="shrink-0 text-xs tabular-nums text-white/50">{fmt(currentTime)}</span>
                  <input
                    type="range"
                    min={0}
                    max={duration || 0}
                    step={0.1}
                    value={currentTime}
                    onChange={seek}
                    className="h-1.5 w-full cursor-pointer appearance-none rounded-full outline-none"
                    style={{
                      background: `linear-gradient(to right, white ${progress}%, rgba(255,255,255,0.15) ${progress}%)`,
                    }}
                  />
                  <span className="shrink-0 text-xs tabular-nums text-white/50">{fmt(duration)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Letras desktop - igual haunt.gg com translateY */}
        {lines && lines.length > 0 && (
          <div
            className="relative hidden w-72 shrink-0 self-stretch overflow-hidden sm:block"
            style={{ maskImage: "linear-gradient(transparent 0%, black 30%, black 70%, transparent 100%)" }}
          >
            <div
              className="absolute inset-x-0 flex flex-col items-start transition-transform duration-500 ease-out"
              style={{
                top: "50%",
                transform: `translateY(${-(activeIndex * 28 + 14)}px)`,
              }}
            >
              {lines.map((line, i) => {
                const isActive = i === activeIndex;
                const diff = Math.abs(i - activeIndex);
                const opacity = isActive ? 1 : diff === 1 ? 0.6 : diff === 2 ? 0.3 : 0.15;
                const blur = isActive ? 0 : diff === 1 ? 1 : diff === 2 ? 2 : 3;

                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => { if (audioRef.current) audioRef.current.currentTime = line.time; }}
                    className={`block w-full cursor-pointer truncate px-2 text-left text-sm transition-all duration-300 ${isActive ? "scale-[1.04] font-semibold" : ""}`}
                    style={{
                      height: 28,
                      lineHeight: "28px",
                      color: isActive ? "rgb(255,255,255)" : "rgb(221,221,221)",
                      opacity,
                      filter: blur > 0 ? `blur(${blur}px)` : undefined,
                    }}
                  >
                    {line.text}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Letras mobile - igual haunt.gg */}
      {lines && lines.length > 0 && (
        <div
          className="relative mt-2 overflow-hidden sm:hidden"
          style={{ height: 112, maskImage: "linear-gradient(transparent 0%, black 30%, black 70%, transparent 100%)" }}
        >
          <div
            className="absolute inset-x-0 flex flex-col items-center transition-transform duration-500 ease-out"
            style={{
              top: "50%",
              transform: `translateY(${-(activeIndex * 28 + 14)}px)`,
            }}
          >
            {lines.map((line, i) => {
              const isActive = i === activeIndex;
              const diff = Math.abs(i - activeIndex);
              const opacity = isActive ? 1 : diff === 1 ? 0.6 : diff === 2 ? 0.3 : 0.15;
              const blur = isActive ? 0 : diff === 1 ? 1 : diff === 2 ? 2 : 3;

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => { if (audioRef.current) audioRef.current.currentTime = line.time; }}
                  className={`block w-full cursor-pointer truncate px-2 text-center text-sm transition-all duration-300 ${isActive ? "scale-[1.04] font-semibold" : ""}`}
                  style={{
                    height: 28,
                    lineHeight: "28px",
                    color: isActive ? "rgb(255,255,255)" : "rgb(221,221,221)",
                    opacity,
                    filter: blur > 0 ? `blur(${blur}px)` : undefined,
                  }}
                >
                  {line.text}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <style>{`
        @keyframes eq1 { from { height: 4px } to { height: 10px } }
        @keyframes eq2 { from { height: 8px } to { height: 4px } }
        @keyframes eq3 { from { height: 6px } to { height: 12px } }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

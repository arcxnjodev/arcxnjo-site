import { useEffect, useRef, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "https://api.arcxnjo.com.br";

type LyricLine = { time: number; text: string };

type Props = {
  musicUrl: string;
  musicTitle?: string;
  musicArtist?: string;
  albumArt?: string | null;
  externalAudioRef?: React.RefObject<HTMLAudioElement>;
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
  if (!s || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export const ProfileMusicPlayer = ({
  musicUrl,
  musicTitle = "Profile music",
  musicArtist = "",
  albumArt,
  externalAudioRef,
}: Props) => {
  const internalAudioRef = useRef<HTMLAudioElement>(null);
  const audioRef = externalAudioRef || internalAudioRef;
  
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [lines, setLines] = useState<LyricLine[] | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [coverArt, setCoverArt] = useState<string | null>(albumArt || null);

  // Busca a capa da música no iTunes (Apple) automaticamente
  useEffect(() => {
    if (albumArt) {
      setCoverArt(albumArt);
      return;
    }
    if (!musicTitle || !musicArtist) return;

    const query = encodeURIComponent(`${musicTitle} ${musicArtist}`);
    fetch(`https://itunes.apple.com/search?term=${query}&limit=1&entity=song`)
      .then((res) => res.json())
      .then((data) => {
        if (data.results && data.results[0] && data.results[0].artworkUrl100) {
          // Troca a imagem pequena de 100x100 por uma de alta resolução 500x500
          setCoverArt(data.results[0].artworkUrl100.replace("100x100bb", "500x500bb"));
        }
      })
      .catch(() => {});
  }, [musicTitle, musicArtist, albumArt]);

  // Busca letra
  useEffect(() => {
    setLines(null);
    setActiveIndex(-1);
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

  // Eventos do áudio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    setPlaying(!audio.paused);
    setCurrentTime(audio.currentTime);
    setDuration(audio.duration || 0);

    const onTimeUpdate = () => {
      const t = audio.currentTime;
      setCurrentTime(t);

      if (lines) {
        let idx = -1;
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].time <= t) idx = i;
          else break;
        }
        setActiveIndex(idx);
      }
    };

    const onDuration = () => setDuration(audio.duration || 0);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => { setPlaying(false); setCurrentTime(0); };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("durationchange", onDuration);
    audio.addEventListener("loadedmetadata", onDuration);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("durationchange", onDuration);
      audio.removeEventListener("loadedmetadata", onDuration);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
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

  const skipBack = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, audio.currentTime - 10);
  };

  const skipForward = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.min(duration, audio.currentTime + 10);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-black/40 p-6 shadow-2xl backdrop-blur-2xl">
      
      {/* Luz de fundo dinâmica baseada na capa do álbum */}
      {coverArt && (
        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-20 mix-blend-screen transition-all duration-1000"
          style={{
            backgroundImage: `url(${coverArt})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(70px)",
          }}
        />
      )}

      {/* Áudio Interno (Se não houver externo) */}
      {!externalAudioRef && (
        <audio ref={audioRef} src={musicUrl} preload="auto" loop playsInline />
      )}

      <div className="relative z-10 flex flex-col gap-8 sm:flex-row lg:gap-10">
        
        {/* Lado Esquerdo: Player Info e Controles */}
        <div className="flex w-full shrink-0 flex-col justify-center sm:w-[320px]">
          
          <div className="flex items-center gap-5">
            {/* Capa */}
            <div className={`relative h-24 w-24 shrink-0 shadow-[0_10px_40px_rgba(0,0,0,0.5)] transition-transform duration-700 ${playing ? "scale-105" : "scale-100"}`}>
              {coverArt ? (
                <img src={coverArt} alt={musicTitle} className="h-full w-full rounded-2xl object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                  <span className="text-4xl text-white/20">♪</span>
                </div>
              )}
              <div className="absolute inset-0 rounded-2xl border border-white/10" />
            </div>

            {/* Info */}
            <div className="flex min-w-0 flex-1 flex-col justify-center">
              <div className="flex items-center gap-2">
                {playing && (
                  <div className="flex h-4 shrink-0 items-end gap-[3px]" aria-hidden>
                    <span className="w-1 rounded-full bg-purple-400" style={{ animation: "eq1 0.6s ease-in-out infinite alternate" }} />
                    <span className="w-1 rounded-full bg-purple-400" style={{ animation: "eq2 0.5s ease-in-out infinite alternate" }} />
                    <span className="w-1 rounded-full bg-purple-400" style={{ animation: "eq3 0.7s ease-in-out infinite alternate" }} />
                  </div>
                )}
                <h3 className="truncate text-xl font-black tracking-tight text-white">
                  {musicTitle}
                </h3>
              </div>
              {musicArtist && (
                <p className="mt-0.5 truncate text-sm font-semibold text-white/50">
                  {musicArtist}
                </p>
              )}
            </div>
          </div>

          {/* Barra de Progresso */}
          <div className="mt-7 flex flex-col gap-2">
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={currentTime}
              onChange={seek}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/10 outline-none transition-all hover:h-2"
              style={{
                background: `linear-gradient(to right, #a855f7 ${progress}%, rgba(255,255,255,0.1) ${progress}%)`,
              }}
            />
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-bold tracking-wider text-white/40 tabular-nums">
                {fmt(currentTime)}
              </span>
              <span className="text-[11px] font-bold tracking-wider text-white/40 tabular-nums">
                {fmt(duration)}
              </span>
            </div>
          </div>

          {/* Botões de Controle */}
          <div className="mt-5 flex items-center justify-center gap-6">
            <button
              type="button"
              onClick={skipBack}
              className="group flex h-10 w-10 items-center justify-center text-white/50 transition-all hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6 transition-transform group-hover:-translate-x-1" fill="currentColor">
                <path d="M8.09 14.647c-1.787-1.154-1.787-4.14 0-5.294l10.79-6.968c1.736-1.121 3.87.339 3.87 2.648v13.934c0 2.31-2.134 3.769-3.87 2.648zM2 5a.75.75 0 0 1 1.5 0v14A.75.75 0 0 1 2 19z" />
              </svg>
            </button>

            <button
              type="button"
              onClick={togglePlay}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all hover:scale-105 hover:bg-purple-100 hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] active:scale-95"
            >
              {playing ? (
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
                  <path d="M2 6c0-1.886 0-2.828.586-3.414S4.114 2 6 2s2.828 0 3.414.586S10 4.114 10 6v12c0 1.886 0 2.828-.586 3.414S7.886 22 6 22s-2.828 0-3.414-.586S2 19.886 2 18zm12 0c0-1.886 0-2.828.586-3.414S16.114 2 18 2s2.828 0 3.414.586S22 4.114 22 6v12c0 1.886 0 2.828-.586 3.414S19.886 22 18 22s-2.828 0-3.414-.586S14 19.886 14 18z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-7 w-7 translate-x-[2px]" fill="currentColor">
                  <path d="M6.906 4.537A.75.75 0 0 0 5.75 5.25v13.5a.75.75 0 0 0 1.156.637l10.5-6.75a.75.75 0 0 0 0-1.274z" />
                </svg>
              )}
            </button>

            <button
              type="button"
              onClick={skipForward}
              className="group flex h-10 w-10 items-center justify-center text-white/50 transition-all hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6 transition-transform group-hover:translate-x-1" fill="currentColor">
                <path d="M16.66 14.647c1.787-1.154 1.787-4.14 0-5.294L5.87 2.385C4.135 1.264 2 2.724 2 5.033v13.934c0 2.31 2.134 3.769 3.87 2.648zM22.75 5a.75.75 0 0 0-1.5 0v14a.75.75 0 0 0 1.5 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Lado Direito: Letras da Música */}
        {lines && lines.length > 0 && (
          <div
            className="relative mt-4 flex-1 overflow-hidden sm:mt-0"
            style={{
              height: "200px",
              maskImage: "linear-gradient(transparent 0%, black 20%, black 80%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(transparent 0%, black 20%, black 80%, transparent 100%)"
            }}
          >
            <div
              className="absolute inset-x-0 flex flex-col items-center transition-transform duration-700 ease-out sm:items-start"
              style={{
                top: "50%",
                transform: `translateY(${-(activeIndex * 36 + 18)}px)`,
              }}
            >
              {lines.map((line, i) => {
                const isActive = i === activeIndex;
                const diff = Math.abs(i - activeIndex);
                const opacity = isActive ? 1 : diff === 1 ? 0.4 : diff === 2 ? 0.15 : 0;
                const blur = isActive ? 0 : diff === 1 ? 1 : 2;

                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => { if (audioRef.current) audioRef.current.currentTime = line.time; }}
                    className={`block w-full cursor-pointer truncate px-2 text-center text-base transition-all duration-500 sm:text-left sm:text-lg ${
                      isActive ? "scale-[1.02] font-black text-white" : "font-medium text-white/70"
                    }`}
                    style={{
                      height: 36,
                      lineHeight: "36px",
                      opacity,
                      filter: blur > 0 ? `blur(${blur}px)` : "none",
                      pointerEvents: opacity === 0 ? "none" : "auto",
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

      <style>{`
        @keyframes eq1 { from { height: 6px } to { height: 16px } }
        @keyframes eq2 { from { height: 10px } to { height: 6px } }
        @keyframes eq3 { from { height: 8px } to { height: 18px } }
        
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px; 
          height: 14px;
          border-radius: 50%;
          background: white;
          box-shadow: 0 0 10px rgba(255,255,255,0.8);
          cursor: pointer;
          transition: transform 0.1s;
        }
        
        input[type=range]:active::-webkit-slider-thumb {
          transform: scale(1.3);
        }
      `}</style>
    </div>
  );
};
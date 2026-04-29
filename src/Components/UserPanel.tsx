import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import type { IconType } from "react-icons";
import {
  FaDiscord,
  FaGlobe,
  FaInstagram,
  FaLinkedin,
  FaTwitch,
  FaTwitter,
  FaYoutube,
  FaGithub,
  FaTiktok,
  FaKickstarterK,
  FaVolumeUp,
  FaVolumeMute,
  FaDownload,
  FaMusic,
  FaMapMarkerAlt,
  FaCircle,
  FaBookOpen,
  FaPaperPlane,
} from "react-icons/fa";

type ProfileEffect = "none" | "stars" | "snow" | "sparkles" | "hearts";

type GuestbookEntry = {
  id: number;
  visitor_name: string;
  message: string;
  created_at: string;
};

type ProfileData = {
  username: string;
  profile: {
    profile_image?: string;
    banner_image?: string;
    banner_video?: string;
    banner_type?: string;
    theme_color?: string;
    bio?: string;
    display_name?: string;
    profile_template?: string;
    profile_effect?: ProfileEffect;
    music_url?: string;
    music_title?: string;
    location?: string;
    status_text?: string;
  };
  socialMedia: Record<string, string>;
  stats: {
    profile_views: number;
  };
};

const socialIcons: Record<string, IconType> = {
  instagram: FaInstagram,
  x: FaTwitter,
  twitter: FaTwitter,
  youtube: FaYoutube,
  twitch: FaTwitch,
  kick: FaKickstarterK,
  discord: FaDiscord,
  linkedin: FaLinkedin,
  github: FaGithub,
  tiktok: FaTiktok,
  website: FaGlobe,
};

const getSocialUrl = (platform: string, url: string) => {
  const cleanUrl = url.trim();

  if (cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://")) {
    return cleanUrl;
  }

  const cleanUsername = cleanUrl.replace("@", "");

  switch (platform.toLowerCase()) {
    case "instagram":
      return `https://instagram.com/${cleanUsername}`;
    case "x":
    case "twitter":
      return `https://x.com/${cleanUsername}`;
    case "youtube":
      return `https://youtube.com/@${cleanUsername}`;
    case "tiktok":
      return `https://tiktok.com/@${cleanUsername}`;
    case "twitch":
      return `https://twitch.tv/${cleanUsername}`;
    case "kick":
      return `https://kick.com/${cleanUsername}`;
    case "linkedin":
      return `https://linkedin.com/in/${cleanUsername}`;
    case "github":
      return `https://github.com/${cleanUsername}`;
    case "discord":
      return cleanUrl;
    default:
      return `https://${cleanUrl}`;
  }
};

const profileTemplates = {
  "neon-purple": {
    overlay: "bg-black/18",
    card: "bg-black/16 shadow-xl",
    avatar: "border-white/15 shadow-lg",
    username: "text-white",
    handle: "text-gray-300",
    bio: "text-gray-100",
    views: "text-gray-300",
    icon: "hover:text-white hover:bg-white/10",
    audioButton:
      "bg-black/15 hover:bg-black/20 text-white backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.28)]",
    audioPanel:
      "bg-black/22 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.35)]",
    sliderAccent: "accent-white",
    infoCard: "bg-white/8",
    infoIcon: "text-white",
    guestbookForm:
      "bg-black/28 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.35)]",
  },
  "cyber-glass": {
    overlay: "bg-black/15",
    card: "bg-white/10 shadow-[0_0_45px_rgba(34,211,238,0.18)]",
    avatar: "border-cyan-300/40 shadow-[0_0_25px_rgba(34,211,238,0.35)]",
    username: "text-white",
    handle: "text-cyan-200/80",
    bio: "text-cyan-50",
    views: "text-cyan-200/80",
    icon: "hover:text-cyan-300 hover:bg-cyan-400/10",
    audioButton:
      "bg-black/15 hover:bg-black/20 text-white backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.28)]",
    audioPanel:
      "bg-black/22 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.35)]",
    sliderAccent: "accent-cyan-300",
    infoCard: "bg-white/10",
    infoIcon: "text-cyan-300",
    guestbookForm:
      "bg-black/28 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.35)]",
  },
  "minimal-dark": {
    overlay: "bg-black/28",
    card: "bg-black/28 shadow-2xl",
    avatar: "border-white/15 shadow-lg",
    username: "text-white",
    handle: "text-gray-300",
    bio: "text-gray-200",
    views: "text-gray-300",
    icon: "hover:text-white hover:bg-white/10",
    audioButton:
      "bg-black/15 hover:bg-black/20 text-white backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.28)]",
    audioPanel:
      "bg-black/22 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.35)]",
    sliderAccent: "accent-white",
    infoCard: "bg-white/6",
    infoIcon: "text-white",
    guestbookForm:
      "bg-black/32 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.35)]",
  },
  "red-glow": {
    overlay: "bg-black/20",
    card: "bg-black/18 shadow-xl",
    avatar: "border-red-500/40 shadow-[0_0_25px_rgba(239,68,68,0.45)]",
    username: "text-white",
    handle: "text-red-200/80",
    bio: "text-red-50",
    views: "text-red-200/80",
    icon: "hover:text-red-400 hover:bg-red-500/10",
    audioButton:
      "bg-black/15 hover:bg-black/20 text-white backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.28)]",
    audioPanel:
      "bg-black/22 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.35)]",
    sliderAccent: "accent-red-400",
    infoCard: "bg-white/8",
    infoIcon: "text-red-300",
    guestbookForm:
      "bg-black/28 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.35)]",
  },
  "blue-ice": {
    overlay: "bg-black/18",
    card: "bg-black/16 shadow-xl",
    avatar: "border-blue-300/40 shadow-[0_0_25px_rgba(96,165,250,0.45)]",
    username: "text-white",
    handle: "text-blue-200/80",
    bio: "text-blue-50",
    views: "text-blue-200/80",
    icon: "hover:text-blue-300 hover:bg-blue-500/10",
    audioButton:
      "bg-black/15 hover:bg-black/20 text-white backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.28)]",
    audioPanel:
      "bg-black/22 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.35)]",
    sliderAccent: "accent-blue-300",
    infoCard: "bg-white/8",
    infoIcon: "text-blue-300",
    guestbookForm:
      "bg-black/28 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.35)]",
  },
};

const ParticleLayer = ({ effect }: { effect: ProfileEffect }) => {
  const particles = useMemo(() => {
    const count =
      effect === "stars"
        ? 28
        : effect === "snow"
        ? 30
        : effect === "sparkles"
        ? 20
        : effect === "hearts"
        ? 16
        : 0;

    return Array.from({ length: count }, (_, index) => ({
      id: `${effect}-${index}`,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 8 + Math.random() * 18,
      duration: 4 + Math.random() * 8,
      delay: Math.random() * 6,
      opacity: 0.2 + Math.random() * 0.7,
    }));
  }, [effect]);

  if (effect === "none") return null;

  return (
    <>
      <style>{`
        @keyframes arcxnjoTwinkle {
          0%,100% { opacity: 0.15; transform: scale(0.8); }
          50% { opacity: 0.95; transform: scale(1.15); }
        }
        @keyframes arcxnjoSnowFall {
          0% { transform: translateY(-12vh); opacity: 0; }
          10% { opacity: 0.85; }
          100% { transform: translateY(110vh); opacity: 0; }
        }
        @keyframes arcxnjoFloatUp {
          0% { transform: translateY(16px) scale(0.9); opacity: 0; }
          10% { opacity: 0.85; }
          100% { transform: translateY(-110vh) scale(1.08); opacity: 0; }
        }
      `}</style>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {effect === "stars" &&
          particles.map((particle) => (
            <span
              key={particle.id}
              className="absolute rounded-full bg-white"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                width: `${particle.size / 4}px`,
                height: `${particle.size / 4}px`,
                opacity: particle.opacity,
                animation: `arcxnjoTwinkle ${particle.duration}s ease-in-out ${particle.delay}s infinite`,
                boxShadow: "0 0 10px rgba(255,255,255,0.55)",
              }}
            />
          ))}

        {effect === "snow" &&
          particles.map((particle) => (
            <span
              key={particle.id}
              className="absolute rounded-full bg-white"
              style={{
                left: `${particle.left}%`,
                top: `-${particle.size}px`,
                width: `${particle.size / 3}px`,
                height: `${particle.size / 3}px`,
                opacity: particle.opacity,
                animation: `arcxnjoSnowFall ${particle.duration + 4}s linear ${particle.delay}s infinite`,
              }}
            />
          ))}

        {effect === "sparkles" &&
          particles.map((particle) => (
            <span
              key={particle.id}
              className="absolute text-white"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                fontSize: `${particle.size}px`,
                opacity: particle.opacity,
                animation: `arcxnjoTwinkle ${particle.duration}s ease-in-out ${particle.delay}s infinite`,
                textShadow: "0 0 12px rgba(255,255,255,0.5)",
              }}
            >
              ✦
            </span>
          ))}

        {effect === "hearts" &&
          particles.map((particle) => (
            <span
              key={particle.id}
              className="absolute text-pink-300"
              style={{
                left: `${particle.left}%`,
                bottom: `-24px`,
                fontSize: `${particle.size}px`,
                opacity: particle.opacity,
                animation: `arcxnjoFloatUp ${particle.duration + 5}s linear ${particle.delay}s infinite`,
                textShadow: "0 0 14px rgba(255,105,180,0.4)",
              }}
            >
              ♥
            </span>
          ))}
      </div>
    </>
  );
};

export const UserPanel = () => {
  const locationPath = useLocation();
  const username = locationPath.pathname.replace("/", "");
  const API_URL = import.meta.env.VITE_API_URL || "https://api.arcxnjo.com.br";

  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [entered, setEntered] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.6);

  const [guestbookEntries, setGuestbookEntries] = useState<GuestbookEntry[]>([]);
  const [guestbookIndex, setGuestbookIndex] = useState(0);
  const [guestbookVisible, setGuestbookVisible] = useState(true);
  const [guestbookOpen, setGuestbookOpen] = useState(false);
  const [visitorName, setVisitorName] = useState("");
  const [guestbookMessage, setGuestbookMessage] = useState("");
  const [guestbookSubmitting, setGuestbookSubmitting] = useState(false);
  const [guestbookFeedback, setGuestbookFeedback] = useState("");

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const backgroundVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${API_URL}/api/profile/${username}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Profile not found.");
        }

        setData(result);
      } catch (error) {
        console.error(error);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchProfile();
    }
  }, [username, API_URL]);

  useEffect(() => {
    const fetchGuestbook = async () => {
      try {
        const response = await fetch(`${API_URL}/api/profile/${username}/guestbook`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to load guestbook.");
        }

        setGuestbookEntries(Array.isArray(result) ? result : []);
        setGuestbookIndex(0);
        setGuestbookVisible(true);
      } catch (error) {
        console.error("Guestbook fetch error:", error);
      }
    };

    if (username) {
      fetchGuestbook();
    }
  }, [username, API_URL]);

  useEffect(() => {
    if (guestbookEntries.length <= 1) return;

    let switchTimeout: number | null = null;

    const interval = window.setInterval(() => {
      setGuestbookVisible(false);

      switchTimeout = window.setTimeout(() => {
        setGuestbookIndex((prev) => (prev + 1) % guestbookEntries.length);
        setGuestbookVisible(true);
      }, 280);
    }, 3200);

    return () => {
      window.clearInterval(interval);
      if (switchTimeout) {
        window.clearTimeout(switchTimeout);
      }
    };
  }, [guestbookEntries.length]);

  const hasMusic = Boolean(data?.profile.music_url);
  const isVideoBackground =
    data?.profile.banner_type === "video" && data?.profile.banner_video;
  const controlsTarget = hasMusic ? "music" : isVideoBackground ? "video" : null;

  useEffect(() => {
    if (controlsTarget === "music" && audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = muted;
    }

    if (controlsTarget === "video" && backgroundVideoRef.current) {
      backgroundVideoRef.current.volume = volume;
      backgroundVideoRef.current.muted = muted;
    }
  }, [volume, muted, controlsTarget]);

  const handleEnter = async () => {
    setEntered(true);

    try {
      if (hasMusic && audioRef.current) {
        audioRef.current.volume = volume;
        audioRef.current.muted = muted;
        await audioRef.current.play();
        return;
      }

      if (isVideoBackground && backgroundVideoRef.current) {
        backgroundVideoRef.current.volume = volume;
        backgroundVideoRef.current.muted = muted;
        await backgroundVideoRef.current.play();
      }
    } catch (error) {
      console.error("Media play error:", error);
    }
  };

  const toggleMute = () => {
    setMuted((prev) => !prev);
  };

  const handleVolumeChange = (value: number) => {
    setVolume(value);

    if (value > 0 && muted) {
      setMuted(false);
    }

    if (value === 0) {
      setMuted(true);
    }
  };

  const formatMusicFileName = useMemo(() => {
    if (!data?.profile.music_title?.trim()) return "profile-audio";
    return data.profile.music_title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-");
  }, [data?.profile.music_title]);

  const currentGuestbookEntry =
    guestbookEntries.length > 0
      ? guestbookEntries[guestbookIndex % guestbookEntries.length]
      : null;

  const handleGuestbookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!visitorName.trim() || !guestbookMessage.trim()) {
      setGuestbookFeedback("Please fill in your name and message.");
      return;
    }

    setGuestbookSubmitting(true);
    setGuestbookFeedback("");

    try {
      const response = await fetch(`${API_URL}/api/profile/${username}/guestbook`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          visitorName,
          message: guestbookMessage,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to send message.");
      }

      if (result.entry) {
        setGuestbookEntries((prev) => [result.entry, ...prev].slice(0, 30));
        setGuestbookIndex(0);
        setGuestbookVisible(true);
      }

      setVisitorName("");
      setGuestbookMessage("");
      setGuestbookFeedback("Message sent!");
    } catch (error: any) {
      setGuestbookFeedback(error.message || "Failed to send message.");
    } finally {
      setGuestbookSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        Loading profile...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        Profile not found.
      </div>
    );
  }

  const socialEntries = Object.entries(data.socialMedia).filter(
    ([, url]) => url && url.trim() !== ""
  );

  const template =
    profileTemplates[
      (data.profile.profile_template || "neon-purple") as keyof typeof profileTemplates
    ] || profileTemplates["neon-purple"];

  const displayName = data.profile.display_name?.trim();
  const hasLocation = Boolean(data.profile.location?.trim());
  const hasStatus = Boolean(data.profile.status_text?.trim());
  const profileEffect = (data.profile.profile_effect || "none") as ProfileEffect;

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white flex items-center justify-center px-4 py-10">
      {isVideoBackground ? (
        <video
          ref={backgroundVideoRef}
          src={data.profile.banner_video}
          className="absolute inset-0 w-full h-full object-cover"
          muted={controlsTarget !== "video" ? true : muted}
          loop
          autoPlay={false}
          playsInline
        />
      ) : data.profile.banner_image ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${data.profile.banner_image})`,
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-purple-950" />
      )}

      <div className={`absolute inset-0 ${template.overlay}`} />

      {entered && <ParticleLayer effect={profileEffect} />}

      {hasMusic && (
        <audio
          ref={audioRef}
          src={data.profile.music_url}
          loop
          preload="auto"
        />
      )}

      {!entered && (
        <button
          type="button"
          onClick={handleEnter}
          className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/70 text-white text-center px-4"
        >
          <span className="text-4xl md:text-5xl font-extrabold tracking-widest drop-shadow-[0_0_18px_rgba(168,85,247,0.9)]">
            CLICK TO ENTER
          </span>

          <span className="mt-4 text-sm md:text-base text-white/60">
            Tap to load profile
          </span>
        </button>
      )}

      {entered && controlsTarget && (
        <div className="fixed top-5 left-5 z-40 group">
          <div className="relative">
            <button
              type="button"
              onClick={toggleMute}
              title={muted ? "Unmute" : "Mute"}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 ${template.audioButton}`}
            >
              {muted || volume === 0 ? (
                <FaVolumeMute className="text-xl" />
              ) : (
                <FaVolumeUp className="text-xl" />
              )}
            </button>

            <div className="absolute left-0 top-full pt-2 opacity-0 pointer-events-none translate-y-1 transition-all duration-200 group-hover:opacity-100 group-hover:pointer-events-auto group-hover:translate-y-0">
              <div className={`w-72 rounded-2xl p-4 ${template.audioPanel}`}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <FaMusic className="text-sm text-white/90" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white truncate">
                      {hasMusic
                        ? data.profile.music_title || "Profile Music"
                        : "Background Video Audio"}
                    </p>

                    <p className="text-xs text-white/50 mt-0.5">
                      {muted || volume === 0
                        ? "Muted"
                        : `Volume ${Math.round(volume * 100)}%`}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-white/60">Volume</span>
                    <span className="text-xs text-white/60">
                      {Math.round(volume * 100)}%
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) => handleVolumeChange(Number(e.target.value))}
                    className={`w-full h-2 cursor-pointer ${template.sliderAccent}`}
                  />
                </div>

                {hasMusic && (
                  <a
                    href={data.profile.music_url}
                    download={`${formatMusicFileName}.mp3`}
                    className="mt-4 flex items-center justify-center gap-2 w-full rounded-xl bg-white/10 hover:bg-white/20 py-2.5 text-sm font-medium text-white transition"
                  >
                    <FaDownload />
                    Download Music
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {entered && (
        <div className="fixed bottom-5 right-5 z-40 flex items-end gap-3 max-w-[90vw]">
          <div className="pointer-events-none max-w-[260px] text-right">
            <div
              className={`transition-all duration-300 ${
                guestbookVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
            >
              {currentGuestbookEntry ? (
                <>
                  <p className="text-sm font-bold text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)]">
                    {currentGuestbookEntry.visitor_name}
                  </p>

                  <p className="mt-1 text-xs leading-relaxed text-white/85 drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)]">
                    {currentGuestbookEntry.message}
                  </p>
                </>
              ) : (
                <p className="text-xs text-white/70 drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)]">
                  No comments yet
                </p>
              )}
            </div>
          </div>

          <div className="relative">
            {guestbookOpen && (
              <div className="absolute bottom-16 right-0 w-[280px]">
                <div className={`rounded-2xl p-4 ${template.guestbookForm}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <FaBookOpen className="text-sm text-white/80" />
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-white">
                      Guestbook
                    </h3>
                  </div>

                  <form onSubmit={handleGuestbookSubmit} className="space-y-3">
                    <input
                      type="text"
                      value={visitorName}
                      onChange={(e) => setVisitorName(e.target.value)}
                      placeholder="Your name"
                      maxLength={32}
                      className="w-full rounded-xl bg-white/10 px-4 py-3 text-sm text-white placeholder-white/45 outline-none"
                    />

                    <textarea
                      value={guestbookMessage}
                      onChange={(e) => setGuestbookMessage(e.target.value)}
                      placeholder="Leave a message..."
                      maxLength={180}
                      rows={3}
                      className="w-full rounded-xl bg-white/10 px-4 py-3 text-sm text-white placeholder-white/45 outline-none resize-none"
                    />

                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs text-white/55">
                        {guestbookMessage.length}/180
                      </span>

                      <button
                        type="submit"
                        disabled={guestbookSubmitting}
                        className="inline-flex items-center gap-2 rounded-xl bg-white/12 hover:bg-white/20 px-4 py-2.5 text-sm font-medium text-white transition disabled:opacity-50"
                      >
                        <FaPaperPlane className="text-xs" />
                        {guestbookSubmitting ? "Sending..." : "Send"}
                      </button>
                    </div>

                    {guestbookFeedback && (
                      <p className="text-xs text-white/70">{guestbookFeedback}</p>
                    )}
                  </form>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setGuestbookOpen((prev) => !prev)}
              className="w-12 h-12 rounded-2xl bg-black/20 hover:bg-black/30 backdrop-blur-2xl flex items-center justify-center text-white shadow-[0_10px_30px_rgba(0,0,0,0.28)] transition"
              title="Open guestbook"
            >
              <FaBookOpen className="text-lg" />
            </button>
          </div>
        </div>
      )}

      {entered && (
        <div className="relative z-10 w-full max-w-md">
          <div className={`rounded-3xl px-6 py-8 text-center ${template.card}`}>
            <img
              src={data.profile.profile_image || "/favicon.png"}
              alt={data.username}
              className={`w-28 h-28 rounded-full mx-auto border-4 object-cover bg-black ${template.avatar}`}
            />

            {displayName ? (
              <>
                <h1 className={`mt-4 text-3xl font-bold ${template.username}`}>
                  {displayName}
                </h1>

                <p className={`mt-1 text-sm ${template.handle}`}>
                  @{data.username}
                </p>
              </>
            ) : (
              <h1 className={`mt-4 text-3xl font-bold ${template.username}`}>
                @{data.username}
              </h1>
            )}

            {data.profile.bio && (
              <p className={`mt-3 text-sm whitespace-pre-line ${template.bio}`}>
                {data.profile.bio}
              </p>
            )}

            {(hasLocation || hasStatus) && (
              <div className={`mt-5 rounded-2xl p-4 text-left ${template.infoCard}`}>
                <div className="space-y-3">
                  {hasLocation && (
                    <div className="flex items-center gap-3">
                      <FaMapMarkerAlt className={`text-sm ${template.infoIcon}`} />
                      <span className="text-sm text-white/90">
                        {data.profile.location}
                      </span>
                    </div>
                  )}

                  {hasStatus && (
                    <div className="flex items-start gap-3">
                      <FaCircle className={`text-[10px] mt-1.5 ${template.infoIcon}`} />
                      <span className="text-sm text-white/90">
                        {data.profile.status_text}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <p className={`mt-3 text-sm ${template.views}`}>
              {data.stats?.profile_views || 0} views
            </p>

            {socialEntries.length > 0 && (
              <div className="mt-6 flex flex-wrap justify-center gap-4">
                {socialEntries.map(([platform, url]) => {
                  const Icon = socialIcons[platform.toLowerCase()] || FaGlobe;

                  return (
                    <a
                      key={platform}
                      href={getSocialUrl(platform, url)}
                      target="_blank"
                      rel="noreferrer"
                      title={platform}
                      aria-label={platform}
                      className={`w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-xl text-white transition ${template.icon}`}
                    >
                      <Icon />
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
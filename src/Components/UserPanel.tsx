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
} from "react-icons/fa";

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
    overlay: "bg-black/20",
    card: "bg-black/18 shadow-[0_0_45px_rgba(168,85,247,0.28)]",
    avatar: "border-purple-400/40 shadow-[0_0_25px_rgba(168,85,247,0.45)]",
    username: "text-white drop-shadow-[0_0_12px_rgba(168,85,247,0.9)]",
    handle: "text-purple-200/80",
    bio: "text-gray-100",
    views: "text-purple-200/80",
    icon: "hover:text-purple-400 hover:bg-purple-500/10 hover:shadow-[0_0_18px_rgba(168,85,247,0.6)]",
    audioButton:
      "bg-white/10 hover:bg-white/15 text-white shadow-[0_8px_30px_rgba(0,0,0,0.35)]",
    audioPanel:
      "bg-[#111111cc] shadow-[0_12px_40px_rgba(0,0,0,0.45)]",
    sliderAccent: "accent-purple-400",
    infoCard: "bg-white/8",
    infoIcon: "text-purple-300",
  },
  "cyber-glass": {
    overlay: "bg-black/15",
    card: "bg-white/10 shadow-[0_0_45px_rgba(34,211,238,0.18)]",
    avatar: "border-cyan-300/40 shadow-[0_0_25px_rgba(34,211,238,0.35)]",
    username: "text-white drop-shadow-[0_0_12px_rgba(34,211,238,0.8)]",
    handle: "text-cyan-200/80",
    bio: "text-cyan-50",
    views: "text-cyan-200/80",
    icon: "hover:text-cyan-300 hover:bg-cyan-400/10 hover:shadow-[0_0_18px_rgba(34,211,238,0.6)]",
    audioButton:
      "bg-white/10 hover:bg-white/15 text-white shadow-[0_8px_30px_rgba(0,0,0,0.35)]",
    audioPanel:
      "bg-[#111111cc] shadow-[0_12px_40px_rgba(0,0,0,0.45)]",
    sliderAccent: "accent-cyan-300",
    infoCard: "bg-white/10",
    infoIcon: "text-cyan-300",
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
      "bg-white/10 hover:bg-white/15 text-white shadow-[0_8px_30px_rgba(0,0,0,0.35)]",
    audioPanel:
      "bg-[#111111dd] shadow-[0_12px_40px_rgba(0,0,0,0.55)]",
    sliderAccent: "accent-white",
    infoCard: "bg-white/6",
    infoIcon: "text-white",
  },
  "red-glow": {
    overlay: "bg-black/20",
    card: "bg-black/18 shadow-[0_0_45px_rgba(239,68,68,0.28)]",
    avatar: "border-red-500/40 shadow-[0_0_25px_rgba(239,68,68,0.45)]",
    username: "text-white drop-shadow-[0_0_12px_rgba(239,68,68,0.9)]",
    handle: "text-red-200/80",
    bio: "text-red-50",
    views: "text-red-200/80",
    icon: "hover:text-red-400 hover:bg-red-500/10 hover:shadow-[0_0_18px_rgba(239,68,68,0.6)]",
    audioButton:
      "bg-white/10 hover:bg-white/15 text-white shadow-[0_8px_30px_rgba(0,0,0,0.35)]",
    audioPanel:
      "bg-[#111111cc] shadow-[0_12px_40px_rgba(0,0,0,0.45)]",
    sliderAccent: "accent-red-400",
    infoCard: "bg-white/8",
    infoIcon: "text-red-300",
  },
  "blue-ice": {
    overlay: "bg-black/18",
    card: "bg-black/16 shadow-[0_0_45px_rgba(96,165,250,0.28)]",
    avatar: "border-blue-300/40 shadow-[0_0_25px_rgba(96,165,250,0.45)]",
    username: "text-white drop-shadow-[0_0_12px_rgba(96,165,250,0.9)]",
    handle: "text-blue-200/80",
    bio: "text-blue-50",
    views: "text-blue-200/80",
    icon: "hover:text-blue-300 hover:bg-blue-500/10 hover:shadow-[0_0_18px_rgba(96,165,250,0.6)]",
    audioButton:
      "bg-white/10 hover:bg-white/15 text-white shadow-[0_8px_30px_rgba(0,0,0,0.35)]",
    audioPanel:
      "bg-[#111111cc] shadow-[0_12px_40px_rgba(0,0,0,0.45)]",
    sliderAccent: "accent-blue-300",
    infoCard: "bg-white/8",
    infoIcon: "text-blue-300",
  },
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
  const [audioMenuHovered, setAudioMenuHovered] = useState(false);

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
  const audioMenuVisible = entered && controlsTarget && audioMenuHovered;
  const hasLocation = Boolean(data.profile.location?.trim());
  const hasStatus = Boolean(data.profile.status_text?.trim());

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
        <div
          className="fixed top-5 left-5 z-40"
          onMouseEnter={() => setAudioMenuHovered(true)}
          onMouseLeave={() => setAudioMenuHovered(false)}
        >
          <div className="relative">
            <button
              type="button"
              onClick={toggleMute}
              title={muted ? "Unmute" : "Mute"}
              className={`w-12 h-12 rounded-2xl backdrop-blur-xl border flex items-center justify-center transition-all duration-200 ${template.audioButton}`}
            >
              {muted || volume === 0 ? (
                <FaVolumeMute className="text-xl" />
              ) : (
                <FaVolumeUp className="text-xl" />
              )}
            </button>

            <div
              className={`absolute left-0 top-14 w-72 rounded-2xl backdrop-blur-xl p-4 transition-all duration-200 ${
                audioMenuVisible
                  ? "opacity-100 translate-y-0 pointer-events-auto"
                  : "opacity-0 -translate-y-2 pointer-events-none"
              } ${template.audioPanel}`}
            >
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
      )}

      {entered && (
        <div
          className={`relative z-10 w-full max-w-md rounded-3xl px-6 py-8 text-center ${template.card}`}
        >
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
                    className={`w-11 h-11 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-xl text-white transition ${template.icon}`}
                  >
                    <Icon />
                  </a>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
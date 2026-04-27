import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
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
  };
  socialMedia: Record<string, string>;
  stats: {
    profile_views: number;
  };
};

const socialIcons: Record<string, React.ElementType> = {
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
    overlay: "bg-black/25",
    card: "bg-black/35 border-purple-400/40 shadow-[0_0_45px_rgba(168,85,247,0.45)]",
    avatar: "border-purple-400/50 shadow-[0_0_25px_rgba(168,85,247,0.6)]",
    username: "text-white drop-shadow-[0_0_12px_rgba(168,85,247,0.9)]",
    handle: "text-purple-200/80",
    bio: "text-gray-200",
    views: "text-purple-200/80",
    icon: "hover:text-purple-400 hover:border-purple-400 hover:bg-purple-500/10 hover:shadow-[0_0_18px_rgba(168,85,247,0.6)]",
  },
  "cyber-glass": {
    overlay: "bg-black/20",
    card: "bg-white/10 border-cyan-300/30 shadow-[0_0_45px_rgba(34,211,238,0.25)]",
    avatar: "border-cyan-300/50 shadow-[0_0_25px_rgba(34,211,238,0.45)]",
    username: "text-white drop-shadow-[0_0_12px_rgba(34,211,238,0.8)]",
    handle: "text-cyan-200/80",
    bio: "text-cyan-50",
    views: "text-cyan-200/80",
    icon: "hover:text-cyan-300 hover:border-cyan-300 hover:bg-cyan-400/10 hover:shadow-[0_0_18px_rgba(34,211,238,0.6)]",
  },
  "minimal-dark": {
    overlay: "bg-black/40",
    card: "bg-black/65 border-white/10 shadow-2xl",
    avatar: "border-white/20 shadow-lg",
    username: "text-white",
    handle: "text-gray-400",
    bio: "text-gray-300",
    views: "text-gray-400",
    icon: "hover:text-white hover:border-white hover:bg-white/10",
  },
  "red-glow": {
    overlay: "bg-black/30",
    card: "bg-black/40 border-red-500/40 shadow-[0_0_45px_rgba(239,68,68,0.45)]",
    avatar: "border-red-500/50 shadow-[0_0_25px_rgba(239,68,68,0.6)]",
    username: "text-white drop-shadow-[0_0_12px_rgba(239,68,68,0.9)]",
    handle: "text-red-200/80",
    bio: "text-red-50",
    views: "text-red-200/80",
    icon: "hover:text-red-400 hover:border-red-400 hover:bg-red-500/10 hover:shadow-[0_0_18px_rgba(239,68,68,0.6)]",
  },
  "blue-ice": {
    overlay: "bg-black/25",
    card: "bg-slate-950/45 border-blue-300/40 shadow-[0_0_45px_rgba(96,165,250,0.45)]",
    avatar: "border-blue-300/50 shadow-[0_0_25px_rgba(96,165,250,0.6)]",
    username: "text-white drop-shadow-[0_0_12px_rgba(96,165,250,0.9)]",
    handle: "text-blue-200/80",
    bio: "text-blue-50",
    views: "text-blue-200/80",
    icon: "hover:text-blue-300 hover:border-blue-300 hover:bg-blue-500/10 hover:shadow-[0_0_18px_rgba(96,165,250,0.6)]",
  },
};

export const UserPanel = () => {
  const location = useLocation();
  const username = location.pathname.replace("/", "");

  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/profile/${username}`
        );

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
  }, [username]);

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

  const isVideoBackground =
    data.profile.banner_type === "video" && data.profile.banner_video;

  const template =
    profileTemplates[
      (data.profile.profile_template || "neon-purple") as keyof typeof profileTemplates
    ] || profileTemplates["neon-purple"];

  const displayName = data.profile.display_name?.trim();

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white flex items-center justify-center px-4 py-10">
      {isVideoBackground ? (
        <video
          src={data.profile.banner_video}
          className="absolute inset-0 w-full h-full object-cover"
          muted
          loop
          autoPlay
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

      <div
        className={`relative z-10 w-full max-w-md rounded-3xl border px-6 py-8 text-center ${template.card}`}
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
    </div>
  );
};
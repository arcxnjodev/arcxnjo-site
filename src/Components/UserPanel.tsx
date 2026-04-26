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

      <div className="absolute inset-0 bg-black/25 backdrop-blur-md border border-white/15" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.25),transparent_45%)]" />

      <div className="relative z-10 w-full max-w-md rounded-3xl bg-black/35 border border-white/10 shadow-2xl px-6 py-8 text-center">
        <img
          src={data.profile.profile_image || "/favicon.png"}
          alt={data.username}
          className="w-28 h-28 rounded-full mx-auto border-4 border-white/20 object-cover bg-black shadow-lg"
        />

        <h1 className="mt-4 text-3xl font-bold text-white drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]">@{data.username}</h1>

        {data.profile.bio && (
          <p className="text-gray-300 mt-2 text-sm whitespace-pre-line">
            {data.profile.bio}
          </p>
        )}

        <p className="text-gray-400 mt-2 text-sm">
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
                  className="w-11 h-11 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-xl text-white hover:text-purple-400 hover:border-purple-400 hover:bg-purple-500/10 transition"
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
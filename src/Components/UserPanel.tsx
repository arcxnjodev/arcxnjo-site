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

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl overflow-hidden bg-gray-900 border border-white/10 shadow-2xl">
        <div
          className="h-40 bg-cover bg-center"
          style={{
            backgroundImage: data.profile.banner_image
              ? `url(${data.profile.banner_image})`
              : "linear-gradient(135deg, #111827, #7c3aed)",
          }}
        />

        <div className="px-6 pb-8 text-center -mt-14">
          <img
            src={data.profile.profile_image || "/favicon.png"}
            alt={data.username}
            className="w-28 h-28 rounded-full mx-auto border-4 border-gray-900 object-cover bg-black"
          />

          <h1 className="mt-4 text-2xl font-bold">@{data.username}</h1>

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
                    href={url}
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
    </div>
  );
};
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

type ProfileData = {
  username: string;
  profile: {
    profile_image?: string;
    banner_image?: string;
    banner_video?: string;
    banner_type?: string;
    theme_color?: string;
  };
  socialMedia: Record<string, string>;
  stats: {
    profile_views: number;
  };
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

          <p className="text-gray-400 mt-1">
            {data.stats?.profile_views || 0} views
          </p>

          <div className="mt-6 space-y-3">
            {Object.entries(data.socialMedia).map(([platform, url]) => (
              <a
                key={platform}
                href={url}
                target="_blank"
                rel="noreferrer"
                className="block w-full rounded-xl bg-purple-600 hover:bg-purple-700 transition py-3 font-semibold text-black"
              >
                {platform.toUpperCase()}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
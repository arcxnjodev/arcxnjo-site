import axios from "axios";
import { useEffect, useMemo, useState } from "react";

type UserPlan = "free" | "pro";

type BadgeDef = {
  id: string;
  label: string;
  group: "free" | "pro" | "manual";
  image: string;
};

const allBadges: BadgeDef[] = [
  {
    id: "open-dm",
    label: "Open DM",
    group: "free",
    image: "https://cdn.discordapp.com/emojis/827964533792440421.webp",
  },
  {
    id: "music",
    label: "Music",
    group: "free",
    image: "https://cdn.discordapp.com/emojis/847487695227584562.webp",
  },
  {
    id: "anime",
    label: "Anime",
    group: "free",
    image: "https://cdn.discordapp.com/emojis/705315110004195430.webp",
  },

  {
    id: "verified",
    label: "Verified",
    group: "pro",
    image: "https://cdn.discordapp.com/emojis/894156569858703380.webp?size=32&animated=true",
  },
  {
    id: "premium",
    label: "Premium",
    group: "pro",
    image: "https://cdn.discordapp.com/emojis/1083803537785499669.webp",
  },
  {
    id: "vip",
    label: "VIP",
    group: "pro",
    image: "https://cdn.discordapp.com/emojis/1041872676710514748.webp",
  },
  {
    id: "og",
    label: "OG",
    group: "pro",
    image: "https://cdn.discordapp.com/emojis/972692703072649336.webp",
  },

  {
    id: "developer",
    label: "Developer",
    group: "manual",
    image: "https://cdn.discordapp.com/emojis/827964533792440421.webp",
  },
  {
    id: "staff",
    label: "Staff",
    group: "manual",
    image: "https://cdn.discordapp.com/emojis/928907588282748948.webp",
  },
  {
    id: "founder",
    label: "Founder",
    group: "manual",
    image: "https://cdn.discordapp.com/emojis/1257354981384650873.webp",
  },
];

export const BadgeSettings = () => {
  const API_URL = import.meta.env.VITE_API_URL || "https://api.arcxnjo.com.br";

  const [plan, setPlan] = useState<UserPlan>("free");
  const [selectedBadges, setSelectedBadges] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [ownerBypass, setOwnerBypass] = useState(false);

  const allowedBadges = useMemo(() => {
    let allowed = allBadges
      .filter((badge) => badge.group === "free")
      .map((b) => b.id);

    if (plan === "pro") {
      allowed = [
        ...allowed,
        ...allBadges.filter((badge) => badge.group === "pro").map((b) => b.id),
      ];
    }

    if (ownerBypass) {
      allowed = allBadges.map((b) => b.id);
    }

    return [...new Set(allowed)];
  }, [plan, ownerBypass]);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await axios.get(`${API_URL}/api/profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const currentPlan = (response.data.plan || "free") as UserPlan;
        const currentBadges = Array.isArray(response.data.profile_badges)
          ? response.data.profile_badges
          : [];
        const currentOwnerBypass = Boolean(response.data.owner_bypass);

        setPlan(currentPlan);
        setOwnerBypass(currentOwnerBypass);
        setSelectedBadges(currentBadges);
      } catch (error) {
        console.error("Error fetching badges:", error);
      }
    };

    fetchBadges();
  }, [API_URL]);

  const toggleBadge = (badgeId: string) => {
    if (!allowedBadges.includes(badgeId)) return;

    setSelectedBadges((prev) => {
      if (prev.includes(badgeId)) {
        return prev.filter((badge) => badge !== badgeId);
      }

      if (prev.length >= 3) {
        return prev;
      }

      return [...prev, badgeId];
    });
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("token");

      const response = await axios.put(
        `${API_URL}/api/profile/badges`,
        { badges: selectedBadges },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSelectedBadges(
        Array.isArray(response.data.badges) ? response.data.badges : selectedBadges
      );

      setMessage("✅ Badges updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error: any) {
      setMessage(
        "❌ Error saving: " +
          (error.response?.data?.error || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const grouped = {
    free: allBadges.filter((badge) => badge.group === "free"),
    pro: allBadges.filter((badge) => badge.group === "pro"),
    manual: allBadges.filter((badge) => badge.group === "manual"),
  };

  const renderGroup = (
    title: string,
    badges: BadgeDef[],
    locked = false
  ) => (
    <div className="mt-6">
      <p className="text-white font-semibold mb-3">{title}</p>

      <div className="flex flex-wrap gap-3">
        {badges.map((badge) => {
          const selected = selectedBadges.includes(badge.id);
          const clickable = !locked && allowedBadges.includes(badge.id);

          return (
            <button
              key={badge.id}
              type="button"
              onClick={() => clickable && toggleBadge(badge.id)}
              className={`relative overflow-hidden inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition ${
                selected
                  ? "bg-gradient-to-r from-white/25 to-white/10 text-white shadow-[0_0_18px_rgba(255,255,255,0.18)] scale-[1.03]"
                  : clickable
                  ? "bg-white/10 text-white hover:bg-white/20"
                  : "bg-white/5 text-white/35 cursor-not-allowed"
              }`}
            >
              {selected && (
                <span
                  className="absolute inset-y-0 -left-10 w-10 bg-white/30 blur-md"
                  style={{
                    transform: "skewX(-20deg)",
                    animation: "arcxnjoBadgeShine 2.8s linear infinite",
                  }}
                />
              )}

              <img
                src={badge.image}
                alt={badge.label}
                className="relative z-10 w-5 h-5 object-contain"
              />
              <span className="relative z-10">{badge.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="bg-purple-700 p-10 rounded-lg m-5">
      <style>{`
        @keyframes arcxnjoBadgeShine {
          0% { transform: translateX(-140px) skewX(-20deg); opacity: 0; }
          20% { opacity: 0.9; }
          100% { transform: translateX(340px) skewX(-20deg); opacity: 0; }
        }
      `}</style>

      <p className="text-2xl font-bold mb-2 text-white">Badges</p>
      <p className="text-white/70 text-sm">
        Select up to 3 badges for your profile.
      </p>

      <div className="mt-4 flex flex-wrap gap-3 text-sm">
        <span className="bg-black/25 text-white px-3 py-1 rounded-full">
          Plan: {plan}
        </span>
        <span className="bg-black/25 text-white px-3 py-1 rounded-full">
          Bypass: {ownerBypass ? "enabled" : "disabled"}
        </span>
        <span className="bg-black/25 text-white px-3 py-1 rounded-full">
          Selected: {selectedBadges.length}/3
        </span>
      </div>

      {message && (
        <div
          className={`mt-4 p-2 rounded text-center ${
            message.includes("✅") ? "bg-green-500" : "bg-red-500"
          } text-white`}
        >
          {message}
        </div>
      )}

      {renderGroup("Free Badges", grouped.free)}
      {renderGroup("Pro Badges", grouped.pro)}
      {renderGroup("Owner-only / Manual Badges", grouped.manual, !ownerBypass)}

      <button
        type="button"
        onClick={handleSave}
        disabled={loading}
        className="bg-purple-900 w-full p-3 rounded-md my-6 text-white hover:bg-purple-800 transition disabled:opacity-50"
      >
        {loading ? "Saving..." : "Save Badges"}
      </button>
    </div>
  );
};
import axios from "axios";
import { useEffect, useMemo, useState } from "react";

type UserPlan = "free" | "pro";
type UserRole = "user" | "dev" | "staff" | "founder" | "admin";

type BadgeDef = {
  id: string;
  label: string;
  group: "free" | "pro" | "staff";
};

const allBadges: BadgeDef[] = [
  { id: "gamer", label: "Gamer", group: "free" },
  { id: "music", label: "Music", group: "free" },
  { id: "anime", label: "Anime", group: "free" },
  { id: "open-dm", label: "Open DM", group: "free" },
  { id: "artist", label: "Artist", group: "free" },
  { id: "developer", label: "Developer", group: "free" },

  { id: "premium", label: "Premium", group: "pro" },
  { id: "supporter", label: "Supporter", group: "pro" },
  { id: "vip", label: "VIP", group: "pro" },

  { id: "dev", label: "Dev", group: "staff" },
  { id: "staff", label: "Staff", group: "staff" },
  { id: "verified", label: "Verified", group: "staff" },
  { id: "founder", label: "Founder", group: "staff" },
  { id: "official", label: "Official", group: "staff" },
];

export const BadgeSettings = () => {
  const API_URL = import.meta.env.VITE_API_URL || "https://api.arcxnjo.com.br";

  const [plan, setPlan] = useState<UserPlan>("free");
  const [role, setRole] = useState<UserRole>("user");
  const [selectedBadges, setSelectedBadges] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

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

    if (["dev", "staff", "founder", "admin"].includes(role)) {
      allowed = [
        ...allowed,
        ...allBadges.filter((badge) => badge.group === "pro").map((b) => b.id),
        ...allBadges.filter((badge) => badge.group === "staff").map((b) => b.id),
      ];
    }

    return [...new Set(allowed)];
  }, [plan, role]);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await axios.get(`${API_URL}/api/profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setPlan((response.data.plan || "free") as UserPlan);
        setRole((response.data.role || "user") as UserRole);
        setSelectedBadges(
          Array.isArray(response.data.profile_badges)
            ? response.data.profile_badges
            : []
        );
      } catch (error) {
        console.error("Error fetching badges:", error);
      }
    };

    fetchBadges();
  }, [API_URL]);

  const toggleBadge = (badgeId: string) => {
    const isAllowed = allowedBadges.includes(badgeId);
    if (!isAllowed) return;

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

      setSelectedBadges(Array.isArray(response.data.badges) ? response.data.badges : selectedBadges);
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
    staff: allBadges.filter((badge) => badge.group === "staff"),
  };

  const renderGroup = (
    title: string,
    badges: BadgeDef[],
    groupColor: string
  ) => (
    <div className="mt-6">
      <p className="text-white font-semibold mb-3">{title}</p>

      <div className="flex flex-wrap gap-3">
        {badges.map((badge) => {
          const selected = selectedBadges.includes(badge.id);
          const allowed = allowedBadges.includes(badge.id);

          return (
            <button
              key={badge.id}
              type="button"
              onClick={() => toggleBadge(badge.id)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                selected
                  ? `${groupColor} text-white shadow-lg`
                  : allowed
                  ? "bg-white/10 text-white hover:bg-white/20"
                  : "bg-white/5 text-white/35 cursor-not-allowed"
              }`}
            >
              {badge.label}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="bg-purple-700 p-10 rounded-lg m-5">
      <p className="text-2xl font-bold mb-2 text-white">Badges</p>
      <p className="text-white/70 text-sm">
        Select up to 3 badges for your profile.
      </p>

      <div className="mt-4 flex flex-wrap gap-3 text-sm">
        <span className="bg-black/25 text-white px-3 py-1 rounded-full">
          Plan: {plan}
        </span>
        <span className="bg-black/25 text-white px-3 py-1 rounded-full">
          Role: {role}
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

      {renderGroup("Free Badges", grouped.free, "bg-white/20")}
      {renderGroup("Pro Badges", grouped.pro, "bg-yellow-500/70")}
      {renderGroup("Dev / Staff Badges", grouped.staff, "bg-cyan-500/70")}

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
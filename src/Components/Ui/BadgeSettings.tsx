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
  { id: "open-dm", label: "Open DM", group: "free", image: "https://cdn.discordapp.com/emojis/827964533792440421.webp" },
  { id: "music", label: "Music", group: "free", image: "https://cdn.discordapp.com/emojis/847487695227584562.webp" },
  { id: "anime", label: "Anime", group: "free", image: "https://cdn.discordapp.com/emojis/705315110004195430.webp" },

  { id: "verified", label: "Verified", group: "pro", image: "https://cdn.discordapp.com/emojis/894156569858703380.webp?size=32&animated=true" },
  { id: "premium", label: "Premium", group: "pro", image: "https://cdn.discordapp.com/emojis/1083803537785499669.webp" },
  { id: "vip", label: "VIP", group: "pro", image: "https://cdn.discordapp.com/emojis/1041872676710514748.webp" },
  { id: "og", label: "OG", group: "pro", image: "https://cdn.discordapp.com/emojis/972692703072649336.webp" },

  { id: "developer", label: "Developer", group: "manual", image: "https://cdn.discordapp.com/emojis/827964533792440421.webp" },
  { id: "staff", label: "Staff", group: "manual", image: "https://cdn.discordapp.com/emojis/928907588282748948.webp" },
  { id: "founder", label: "Founder", group: "manual", image: "https://cdn.discordapp.com/emojis/1257354981384650873.webp" },
];

export const BadgeSettings = () => {
  const API_URL = import.meta.env.VITE_API_URL || "https://api.arcxnjo.com.br";

  const [plan, setPlan] = useState<UserPlan>("free");
  const [selectedBadges, setSelectedBadges] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [ownerBypass, setOwnerBypass] = useState(false);

  const allowedBadges = useMemo(() => {
    let allowed = allBadges.filter(b => b.group === "free").map(b => b.id);

    if (plan === "pro") {
      allowed = [...allowed, ...allBadges.filter(b => b.group === "pro").map(b => b.id)];
    }

    if (ownerBypass) {
      allowed = allBadges.map(b => b.id);
    }

    return [...new Set(allowed)];
  }, [plan, ownerBypass]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get(`${API_URL}/api/profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setPlan(res.data.plan || "free");
        setOwnerBypass(Boolean(res.data.owner_bypass));
        setSelectedBadges(res.data.profile_badges || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetch();
  }, [API_URL]);

  const toggleBadge = (id: string) => {
    if (!allowedBadges.includes(id)) return;

    setSelectedBadges(prev => {
      if (prev.includes(id)) {
        return prev.filter(b => b !== id);
      }

      if (prev.length >= 3) return prev;

      return [...prev, id];
    });
  };

  const save = async () => {
    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `${API_URL}/api/profile/badges`,
        { badges: selectedBadges },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage("✅ Saved!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err: any) {
      setMessage("❌ " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const renderGroup = (title: string, badges: BadgeDef[], locked = false) => (
    <div className="mt-6">
      <p className="text-white font-semibold mb-3">{title}</p>

      <div className="flex flex-wrap gap-3">
        {badges.map(b => {
          const selected = selectedBadges.includes(b.id);
          const clickable = !locked && allowedBadges.includes(b.id);

          return (
            <button
              key={b.id}
              onClick={() => clickable && toggleBadge(b.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-full transition ${
                selected
                  ? "bg-white/20 scale-105"
                  : clickable
                  ? "bg-white/10 hover:bg-white/20"
                  : "bg-white/5 opacity-40 cursor-not-allowed"
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <img src={b.image} className="w-6 h-6" />
              </div>

              <span className="text-white text-sm">{b.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="bg-purple-700 p-10 rounded-lg m-5 text-center">

      <p className="text-2xl font-bold text-white">Badges</p>

      {/* DISCORD BUTTON */}
      <div className="mt-4 flex flex-col items-center gap-2">
        <button
          onClick={() => {
            window.location.href = "https://api.arcxnjo.com.br/api/auth/discord";
          }}
          className="bg-[#5865F2] hover:bg-[#4752C4] px-5 py-2.5 rounded-xl text-white font-semibold"
        >
          Connect Discord
        </button>

        <p className="text-xs text-white/60">
          Show your Discord status on profile
        </p>
      </div>

      <div className="mt-4 flex justify-center gap-2 text-sm">
        <span className="bg-black/30 px-2 py-1 rounded">Plan: {plan}</span>
        <span className="bg-black/30 px-2 py-1 rounded">
          Selected: {selectedBadges.length}/3
        </span>
      </div>

      {message && (
        <div className="mt-4 text-white">{message}</div>
      )}

      {renderGroup("Free", allBadges.filter(b => b.group === "free"))}
      {renderGroup("Pro", allBadges.filter(b => b.group === "pro"))}
      {renderGroup("Admin", allBadges.filter(b => b.group === "manual"), !ownerBypass)}

      <button
        onClick={save}
        disabled={loading}
        className="mt-6 bg-purple-900 w-full p-3 rounded text-white"
      >
        {loading ? "Saving..." : "Save"}
      </button>
    </div>
  );
};
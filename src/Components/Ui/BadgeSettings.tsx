import axios from "axios";
import { useEffect, useMemo, useState } from "react";

type UserPlan = "free" | "pro";

type BadgeDef = {
  id: string;
  label: string;
  group: "free" | "pro" | "manual";
  image: string;
};

const manualBadges = ["developer", "staff", "founder"];

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
    image:
      "https://cdn.discordapp.com/emojis/894156569858703380.webp?size=32&animated=true",
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
    image: "https://emoji.gg/emoji/95693-developer.png",
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
  const [lockedBadges, setLockedBadges] = useState<string[]>([]);
  const [ownerBypass, setOwnerBypass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const allowedBadges = useMemo(() => {
    let allowed = allBadges
      .filter((badge) => badge.group === "free")
      .map((badge) => badge.id);

    if (plan === "pro") {
      allowed = [
        ...allowed,
        ...allBadges
          .filter((badge) => badge.group === "pro")
          .map((badge) => badge.id),
      ];
    }

    if (ownerBypass) {
      allowed = allBadges.map((badge) => badge.id);
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
        const currentOwnerBypass = Boolean(response.data.owner_bypass);
        const currentBadges = Array.isArray(response.data.profile_badges)
          ? response.data.profile_badges
          : [];

        setPlan(currentPlan);
        setOwnerBypass(currentOwnerBypass);

        if (currentOwnerBypass) {
          setSelectedBadges(currentBadges);
          setLockedBadges([]);
          return;
        }

        const locked = currentBadges.filter((badge: string) =>
          manualBadges.includes(badge)
        );

        const editableAllowed =
          currentPlan === "pro"
            ? ["open-dm", "music", "anime", "verified", "premium", "vip", "og"]
            : ["open-dm", "music", "anime"];

        const editable = currentBadges.filter((badge: string) =>
          editableAllowed.includes(badge)
        );

        setSelectedBadges(editable);
        setLockedBadges(locked);
      } catch (error) {
        console.error("Error fetching badges:", error);
      }
    };

    fetchBadges();
  }, [API_URL]);

  const totalSelected = selectedBadges.length + lockedBadges.length;

  const toggleBadge = (badgeId: string) => {
    if (!allowedBadges.includes(badgeId)) return;

    setSelectedBadges((prev) => {
      if (prev.includes(badgeId)) {
        return prev.filter((badge) => badge !== badgeId);
      }

      if (prev.length + lockedBadges.length >= 3) {
        setMessage("❌ You can select a maximum of 3 badges.");
        setTimeout(() => setMessage(""), 2500);
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

      if (!token) {
        setMessage("❌ Você precisa estar logado.");
        return;
      }

      const response = await axios.put(
        `${API_URL}/api/profile/badges`,
        { badges: selectedBadges },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const returnedBadges = Array.isArray(response.data.badges)
        ? response.data.badges
        : selectedBadges;

      if (ownerBypass) {
        setSelectedBadges(returnedBadges);
        setLockedBadges([]);
      } else {
        setLockedBadges(
          returnedBadges.filter((badge: string) =>
            manualBadges.includes(badge)
          )
        );

        setSelectedBadges(
          returnedBadges.filter(
            (badge: string) => !manualBadges.includes(badge)
          )
        );
      }

      setMessage("✅ Badges saved successfully!");
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

  const handleConnectDiscord = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Você precisa estar logado para conectar o Discord.");
      window.location.href = "/login";
      return;
    }

    window.location.href = `${API_URL}/api/auth/discord?token=${encodeURIComponent(
      token
    )}`;
  };

  const grouped = {
    free: allBadges.filter((badge) => badge.group === "free"),
    pro: allBadges.filter((badge) => badge.group === "pro"),
    manual: allBadges.filter((badge) => badge.group === "manual"),
  };

  const renderGroup = (
    title: string,
    badges: BadgeDef[],
    lockedGroup = false
  ) => (
    <div className="mt-6">
      <p className="text-white font-semibold mb-3">{title}</p>

      <div className="flex flex-wrap gap-3">
        {badges.map((badge) => {
          const selected =
            selectedBadges.includes(badge.id) ||
            lockedBadges.includes(badge.id);

          const clickable =
            !lockedGroup && allowedBadges.includes(badge.id);

          return (
            <button
              key={badge.id}
              type="button"
              onClick={() => clickable && toggleBadge(badge.id)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-full transition ${
                selected
                  ? "bg-white/20 scale-[1.03] shadow-[0_0_18px_rgba(255,255,255,0.14)]"
                  : clickable
                  ? "bg-white/10 hover:bg-white/20"
                  : "bg-white/5 opacity-45 cursor-not-allowed"
              }`}
            >
              <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <img
                  src={badge.image}
                  alt={badge.label}
                  className="w-7 h-7 object-contain"
                  draggable={false}
                />
              </div>

              <div className="text-left">
                <span className="block text-white text-sm font-semibold">
                  {badge.label}
                </span>

                <span className="block text-white/45 text-xs">
                  {badge.group === "manual"
                    ? ownerBypass
                      ? "Owner"
                      : "Neon only"
                    : badge.group === "pro"
                    ? "Pro"
                    : "Free"}
                </span>
              </div>
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

      <div className="mt-5 rounded-2xl bg-black/20 p-5 flex flex-col items-center text-center">
        <button
          type="button"
          onClick={handleConnectDiscord}
          className="flex items-center gap-2 bg-[#5865F2] hover:bg-[#4752C4] transition px-5 py-2.5 rounded-xl text-white font-semibold shadow-md"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M20.317 4.369A19.791 19.791 0 0 0 16.885 3c-.161.287-.343.671-.471.973a18.27 18.27 0 0 0-5.828 0 10.8 10.8 0 0 0-.48-.973 19.736 19.736 0 0 0-3.432 1.37C2.533 9.045 1.555 13.58 2.013 18.057a19.9 19.9 0 0 0 5.993 3.02c.486-.66.92-1.356 1.296-2.082-.713-.27-1.39-.605-2.033-.998.17-.123.338-.25.5-.381a13.913 13.913 0 0 0 11.464 0c.163.131.33.258.5.381-.644.393-1.32.728-2.034.998.377.726.81 1.422 1.297 2.082a19.89 19.89 0 0 0 5.993-3.02c.54-5.177-.9-9.674-3.683-13.688zM9.545 15.735c-1.18 0-2.145-1.085-2.145-2.419 0-1.333.945-2.419 2.145-2.419 1.2 0 2.164 1.096 2.145 2.419 0 1.334-.945 2.419-2.145 2.419zm4.91 0c-1.18 0-2.145-1.085-2.145-2.419 0-1.333.945-2.419 2.145-2.419 1.2 0 2.164 1.096 2.145 2.419 0 1.334-.945 2.419-2.145 2.419z" />
          </svg>

          Connect Discord
        </button>

        <p className="text-xs text-white/60 mt-3 max-w-[280px]">
          Connect your Discord to show your live status on your public profile.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3 text-sm">
        <span className="bg-black/25 text-white px-3 py-1 rounded-full">
          Plan: {plan}
        </span>

        <span className="bg-black/25 text-white px-3 py-1 rounded-full">
          Bypass: {ownerBypass ? "enabled" : "disabled"}
        </span>

        <span className="bg-black/25 text-white px-3 py-1 rounded-full">
          Selected: {totalSelected}/3
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
      {renderGroup(
        "Owner-only / Manual Badges",
        grouped.manual,
        !ownerBypass
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={loading}
        className="bg-purple-900 w-full p-3 rounded-md mt-8 text-white hover:bg-purple-800 transition disabled:opacity-50"
      >
        {loading ? "Saving..." : "Save Badges"}
      </button>
    </div>
  );
};
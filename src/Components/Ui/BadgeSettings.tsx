import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import {
  FaCheckCircle,
  FaCrown,
  FaDiscord,
  FaLock,
  FaSave,
  FaShieldAlt,
} from "react-icons/fa";

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
    image: "https://cdn.discordapp.com/attachments/1255692212717752513/1512912971662102732/DCE8D196-1743-4CAA-9D72-0D638D7C0E15.gif?ex=6a330081&is=6a31af01&hm=c25763e7cb496b940dee1b5d318711d83a9f2de008ccce8f3d644bdb4343295e&p",
  },
  {
    id: "music",
    label: "Music",
    group: "free",
    image: "https://cdn.discordapp.com/attachments/1255692212717752513/1478659125482225673/7CE6BDAA-CBAE-48F9-8438-8153B75BFB26.gif?ex=6a32f8df&is=6a31a75f&hm=fb882fafbcf0462caa82f0b37d72b2568e68f5b0bf19c75c606ae6c44283263a&",
  },
  {
    id: "anime",
    label: "Anime",
    group: "free",
    image: "https://cdn.discordapp.com/attachments/1255692212717752513/1480655304508047623/8297995ca09f89a263cc05bd3d78b620.gif?ex=6a32fbb5&is=6a31aa35&hm=01876dc05d7f0a9960d13c34a103ac1fe87119028eb73370a9f8f420b2a58d57&",
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
    image: "https://cdn.discordapp.com/attachments/1255692212717752513/1514587049791852604/9C8E2C74-BEE8-4517-B7BD-C94B6DB15A15.gif?ex=6a3328dc&is=6a31d75c&hm=91c35ca08acebb128ee7c72399265a293c7cb550c26ded9e7382590cc99121f5&",
  },
  {
    id: "og",
    label: "OG",
    group: "pro",
    image: "https://media.discordapp.net/attachments/1255692212717752513/1452546315434332241/ogu.png?ex=6a32e56c&is=6a3193ec&hm=a56b67350041db028d27871d0b4ba2a207bfb405edeb9244e1e5ca043bdf6cf6&=&format=webp&quality=lossless",
  },
  {
    id: "developer",
    label: "Developer",
    group: "manual",
    image: "https://cdn.discordapp.com/attachments/1255692212717752513/1398993841415262219/black-butterfly-ezgif.com-effects.gif?ex=6a3330cb&is=6a31df4b&hm=7ed11996a125b2117c0aecfe83dddb4e9716943d47249213630b751c2e72abfd&",
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
    image: "https://cdn.discordapp.com/attachments/1255692212717752513/1461132709295427667/6636d37ba22a391c6353b1436a81f656.gif?ex=6a3326e0&is=6a31d560&hm=4089b5929cd674bd36b63648930c46b786f0ab873b3e7164d0c4d41d528b9bfc&",
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

      if (prev.length + lockedBadges.length >= 3 && plan !== "pro") {
        setMessage("❌ Free users can select a maximum of 3 badges. Upgrade to Pro for unlimited badges.");
        setTimeout(() => setMessage(""), 3000);
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

  const renderBadgeGroup = (
    title: string,
    description: string,
    badges: BadgeDef[],
    lockedGroup = false
  ) => (
    <section className="rounded-3xl border border-white/10 bg-black/25 p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h4 className="text-lg font-black text-white">{title}</h4>
          <p className="mt-1 text-sm text-white/40">{description}</p>
        </div>

        {lockedGroup && !ownerBypass && (
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/5 text-white/35">
            <FaLock />
          </div>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {badges.map((badge) => {
          const selected =
            selectedBadges.includes(badge.id) ||
            lockedBadges.includes(badge.id);

          const clickable = !lockedGroup && allowedBadges.includes(badge.id);
          const isLockedManual = lockedGroup && !ownerBypass;

          return (
            <button
              key={badge.id}
              type="button"
              onClick={() => clickable && toggleBadge(badge.id)}
              disabled={!clickable}
              className={`group relative overflow-hidden rounded-3xl border p-4 text-left transition ${
                selected
                  ? "border-purple-400/40 bg-purple-500/15 shadow-[0_0_28px_rgba(168,85,247,0.18)]"
                  : clickable
                  ? "border-white/10 bg-white/[0.035] hover:border-purple-400/25 hover:bg-white/[0.06]"
                  : "cursor-not-allowed border-white/5 bg-white/[0.02] opacity-45"
              }`}
            >
              {selected && (
                <div className="absolute right-3 top-3 text-green-300">
                  <FaCheckCircle />
                </div>
              )}

              <div className="flex items-center gap-4">
                <div className="relative grid h-14 w-14 place-items-center rounded-2xl bg-white/10">
                  <div className="absolute inset-0 rounded-2xl bg-purple-500/10 opacity-0 transition group-hover:opacity-100" />

                  <img
                    src={badge.image}
                    alt={badge.label}
                    className="relative h-9 w-9 object-contain"
                    draggable={false}
                  />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-white">
                    {badge.label}
                  </p>

                  <p className="mt-1 text-xs text-white/40">
                    {badge.group === "manual"
                      ? ownerBypass
                        ? "Owner bypass"
                        : "Neon only"
                      : badge.group === "pro"
                      ? "Pro badge"
                      : "Free badge"}
                  </p>

                  {isLockedManual && (
                    <p className="mt-1 text-[11px] text-white/25">
                      Given manually
                    </p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-purple-600/20 via-black/30 to-pink-600/10 p-5 md:p-6">
        <div className="absolute right-[-80px] top-[-80px] h-52 w-52 rounded-full bg-purple-500/20 blur-3xl" />

        <div className="relative">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-purple-200">
            <FaShieldAlt />
            Badge System
          </div>

          <h3 className="text-2xl font-black text-white">Badges do perfil</h3>

          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/50">
            {plan === "pro"
              ? "Badges ilimitadas no Pro. Badges manuais só podem ser dadas pelo owner."
              : "Escolha até 3 badges para aparecerem no seu perfil público. Faça upgrade para Pro e use badges ilimitadas."}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-white/35">
            Plan
          </p>
          <p className="mt-2 text-2xl font-black text-white">{plan}</p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-white/35">
            Bypass
          </p>
          <p className="mt-2 text-2xl font-black text-white">
            {ownerBypass ? "enabled" : "disabled"}
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-white/35">
            Selected
          </p>
          <p className="mt-2 text-2xl font-black text-white">
            {totalSelected}/3
          </p>
        </div>
      </div>

      <section className="rounded-3xl border border-white/10 bg-black/25 p-5">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2">
              <FaDiscord className="text-[#5865F2]" />
              <h4 className="text-lg font-black text-white">
                Discord Connection
              </h4>
            </div>

            <p className="mt-1 max-w-2xl text-sm text-white/45">
              Conecte seu Discord para mostrar status, boost, Spotify e presença
              no perfil público.
            </p>
          </div>

          <button
            type="button"
            onClick={handleConnectDiscord}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#5865F2] px-5 py-3 text-sm font-bold text-white shadow-[0_0_28px_rgba(88,101,242,0.22)] transition hover:-translate-y-0.5 hover:bg-[#4752C4] hover:shadow-[0_0_38px_rgba(88,101,242,0.35)] active:translate-y-0"
          >
            <FaDiscord />
            Connect Discord
          </button>
        </div>
      </section>

      {message && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
            message.includes("✅")
              ? "border-green-400/20 bg-green-500/10 text-green-200"
              : "border-red-400/20 bg-red-500/10 text-red-200"
          }`}
        >
          {message}
        </div>
      )}

      {renderBadgeGroup(
        "Free Badges",
        "Badges disponíveis para qualquer conta.",
        grouped.free
      )}

      {renderBadgeGroup(
        "Pro Badges",
        "Badges liberadas para usuários Pro.",
        grouped.pro
      )}

      {renderBadgeGroup(
        "Owner-only / Manual Badges",
        ownerBypass
          ? "Seu bypass está ativo. Você pode selecionar badges manuais."
          : "Essas badges são dadas manualmente pelo owner através do Neon.",
        grouped.manual,
        !ownerBypass
      )}

      <section className="rounded-3xl border border-white/10 bg-black/25 p-5">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="flex items-center gap-2 text-sm font-bold text-white">
              <FaCrown className="text-yellow-300" />
              Ready to publish
            </p>

            <p className="mt-1 text-xs text-white/40">
              Salve para atualizar as badges do perfil público.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-purple-600 px-5 py-3 text-sm font-bold text-white shadow-[0_0_28px_rgba(147,51,234,0.22)] transition hover:-translate-y-0.5 hover:bg-purple-500 hover:shadow-[0_0_38px_rgba(147,51,234,0.34)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FaSave className="text-xs" />
            {loading ? "Saving..." : "Save Badges"}
          </button>
        </div>
      </section>
    </div>
  );
};
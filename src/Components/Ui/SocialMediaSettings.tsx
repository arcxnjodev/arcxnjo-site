import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import type { IconType } from "react-icons";
import {
  FaBitcoin,
  FaDiscord,
  FaEnvelope,
  FaEthereum,
  FaFacebook,
  FaGithub,
  FaGitlab,
  FaGlobe,
  FaInstagram,
  FaKickstarter,
  FaLinkedin,
  FaMusic,
  FaPatreon,
  FaPaypal,
  FaPinterest,
  FaPlaystation,
  FaReddit,
  FaSignalMessenger,
  FaSnapchat,
  FaSoundcloud,
  FaSpotify,
  FaSteam,
  FaTelegram,
  FaThreads,
  FaTiktok,
  FaTwitch,
  FaVk,
  FaWhatsapp,
  FaXbox,
  FaXTwitter,
  FaYoutube,
  FaDollarSign,
  FaCircleCheck,
  FaTrash,
  FaFloppyDisk,
  FaArrowUpRightFromSquare,
  FaLink,
  
} from "react-icons/fa6";
import { SiRoblox } from "react-icons/si";

type LinkValues = Record<string, string>;

type LinkPlatform = {
  id: string;
  label: string;
  placeholder: string;
  icon: IconType;
  color: string;
  hint: string;
};

const linkPlatforms: LinkPlatform[] = [
  {
    id: "snapchat",
    label: "Snapchat",
    placeholder: "seuusuario",
    icon: FaSnapchat,
    color: "text-yellow-300",
    hint: "Usuário do Snapchat.",
  },
  {
    id: "youtube",
    label: "YouTube",
    placeholder: "@canal ou link",
    icon: FaYoutube,
    color: "text-red-500",
    hint: "Canal, @handle ou link completo.",
  },
  {
    id: "discord",
    label: "Discord",
    placeholder: "discord.gg/seulink ou usuário",
    icon: FaDiscord,
    color: "text-indigo-400",
    hint: "Convite, servidor ou username.",
  },
  {
    id: "spotify",
    label: "Spotify",
    placeholder: "link do perfil ou usuário",
    icon: FaSpotify,
    color: "text-green-400",
    hint: "Perfil, playlist ou link completo.",
  },
  {
    id: "instagram",
    label: "Instagram",
    placeholder: "seuusuario",
    icon: FaInstagram,
    color: "text-pink-500",
    hint: "Use apenas o usuário ou cole o link completo.",
  },
  {
    id: "x",
    label: "X",
    placeholder: "seuusuario",
    icon: FaXTwitter,
    color: "text-zinc-300",
    hint: "Seu @ do X/Twitter.",
  },
  {
    id: "tiktok",
    label: "TikTok",
    placeholder: "seuusuario",
    icon: FaTiktok,
    color: "text-white",
    hint: "Seu usuário do TikTok.",
  },
  {
    id: "telegram",
    label: "Telegram",
    placeholder: "seuusuario",
    icon: FaTelegram,
    color: "text-sky-400",
    hint: "Usuário, canal ou grupo.",
  },
  {
    id: "soundcloud",
    label: "SoundCloud",
    placeholder: "seuusuario",
    icon: FaSoundcloud,
    color: "text-orange-500",
    hint: "Perfil ou link do SoundCloud.",
  },
  {
    id: "paypal",
    label: "PayPal",
    placeholder: "seuusuario",
    icon: FaPaypal,
    color: "text-blue-500",
    hint: "PayPal.me ou link completo.",
  },
  {
    id: "github",
    label: "GitHub",
    placeholder: "seuusuario",
    icon: FaGithub,
    color: "text-white",
    hint: "Seu usuário do GitHub.",
  },
  {
    id: "roblox",
    label: "Roblox",
    placeholder: "seuusuario",
    icon: SiRoblox,
    color: "text-slate-300",
    hint: "Usuário ou link completo.",
  },
  {
    id: "cashapp",
    label: "Cash App",
    placeholder: "$seucash",
    icon: FaDollarSign,
    color: "text-green-500",
    hint: "Cashtag ou link completo.",
  },
  {
    id: "venmo",
    label: "Venmo",
    placeholder: "seuusuario",
    icon: FaDollarSign,
    color: "text-blue-500",
    hint: "Usuário ou link completo.",
  },
  {
    id: "playstation",
    label: "PlayStation",
    placeholder: "seuusuario",
    icon: FaPlaystation,
    color: "text-sky-500",
    hint: "PSN ID ou link completo.",
  },
  {
    id: "xbox",
    label: "Xbox",
    placeholder: "seugamertag",
    icon: FaXbox,
    color: "text-green-600",
    hint: "Gamertag ou link completo.",
  },
  {
    id: "applemusic",
    label: "Apple Music",
    placeholder: "link do perfil/playlist",
    icon: FaMusic,
    color: "text-rose-400",
    hint: "Cole o link completo.",
  },
  {
    id: "gitlab",
    label: "GitLab",
    placeholder: "seuusuario",
    icon: FaGitlab,
    color: "text-orange-500",
    hint: "Usuário ou link completo.",
  },
  {
    id: "twitch",
    label: "Twitch",
    placeholder: "seuusuario",
    icon: FaTwitch,
    color: "text-purple-500",
    hint: "Seu usuário da Twitch.",
  },
  {
    id: "reddit",
    label: "Reddit",
    placeholder: "u/seuusuario",
    icon: FaReddit,
    color: "text-orange-600",
    hint: "Usuário, subreddit ou link.",
  },
  {
    id: "vk",
    label: "VK",
    placeholder: "seuusuario",
    icon: FaVk,
    color: "text-blue-500",
    hint: "Usuário ou link completo.",
  },
  {
    id: "steam",
    label: "Steam",
    placeholder: "seuusuario",
    icon: FaSteam,
    color: "text-white",
    hint: "Perfil ou link completo.",
  },
  {
    id: "kick",
    label: "Kick",
    placeholder: "seuusuario",
    icon: FaKickstarter,
    color: "text-lime-400",
    hint: "Seu usuário da Kick.",
  },
  {
    id: "pinterest",
    label: "Pinterest",
    placeholder: "seuusuario",
    icon: FaPinterest,
    color: "text-red-600",
    hint: "Usuário ou link completo.",
  },
  {
    id: "facebook",
    label: "Facebook",
    placeholder: "seuusuario",
    icon: FaFacebook,
    color: "text-blue-600",
    hint: "Perfil, página ou link completo.",
  },
  {
    id: "threads",
    label: "Threads",
    placeholder: "seuusuario",
    icon: FaThreads,
    color: "text-white",
    hint: "Usuário ou link completo.",
  },
  {
    id: "patreon",
    label: "Patreon",
    placeholder: "seuusuario",
    icon: FaPatreon,
    color: "text-rose-500",
    hint: "Usuário ou link completo.",
  },
  {
    id: "signal",
    label: "Signal",
    placeholder: "seuusuario",
    icon: FaSignalMessenger,
    color: "text-blue-500",
    hint: "Usuário ou link completo.",
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    placeholder: "+5511999999999",
    icon: FaWhatsapp,
    color: "text-green-500",
    hint: "Número com DDD ou link completo.",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    placeholder: "seuusuario",
    icon: FaLinkedin,
    color: "text-blue-400",
    hint: "Usuário ou link completo.",
  },
  {
    id: "bitcoin",
    label: "Bitcoin",
    placeholder: "endereço ou link",
    icon: FaBitcoin,
    color: "text-orange-400",
    hint: "Carteira, endereço ou link.",
  },
  {
    id: "ethereum",
    label: "Ethereum",
    placeholder: "endereço ou link",
    icon: FaEthereum,
    color: "text-zinc-400",
    hint: "Carteira, endereço ou link.",
  },
  {
    id: "litecoin",
    label: "Litecoin",
    placeholder: "endereço ou link",
    icon: FaBitcoin,
    color: "text-blue-400",
    hint: "Carteira, endereço ou link.",
  },
  {
    id: "solana",
    label: "Solana",
    placeholder: "endereço ou link",
    icon: FaBitcoin,
    color: "text-purple-400",
    hint: "Carteira, endereço ou link.",
  },
  {
    id: "email",
    label: "Email",
    placeholder: "voce@email.com",
    icon: FaEnvelope,
    color: "text-zinc-200",
    hint: "Email público de contato.",
  },
  {
    id: "website",
    label: "URL personalizada",
    placeholder: "https://seusite.com",
    icon: FaGlobe,
    color: "text-zinc-200",
    hint: "Use sua própria URL.",
  },
];

const getPlatform = (platformId: string) => {
  return (
    linkPlatforms.find((platform) => platform.id === platformId) ||
    linkPlatforms[0]
  );
};

const buildPreviewUrl = (platform: string, value: string) => {
  const cleanValue = value.trim();

  if (!cleanValue) return "";

  if (platform === "email") {
    return cleanValue.includes("@") ? `mailto:${cleanValue}` : cleanValue;
  }

  if (cleanValue.startsWith("http://") || cleanValue.startsWith("https://")) {
    return cleanValue;
  }

  const cleanUsername = cleanValue.replace("@", "");

  switch (platform) {
    case "snapchat":
      return `https://www.snapchat.com/add/${cleanUsername}`;
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
    case "telegram":
      return `https://t.me/${cleanUsername}`;
    case "soundcloud":
      return `https://soundcloud.com/${cleanUsername}`;
    case "paypal":
      return `https://paypal.me/${cleanUsername}`;
    case "github":
      return `https://github.com/${cleanUsername}`;
    case "gitlab":
      return `https://gitlab.com/${cleanUsername}`;
    case "linkedin":
      return `https://linkedin.com/in/${cleanUsername}`;
    case "spotify":
      return `https://open.spotify.com/user/${cleanUsername}`;
    case "steam":
      return `https://steamcommunity.com/id/${cleanUsername}`;
    case "reddit":
      return cleanUsername.startsWith("u/")
        ? `https://reddit.com/${cleanUsername}`
        : `https://reddit.com/u/${cleanUsername}`;
    case "pinterest":
      return `https://pinterest.com/${cleanUsername}`;
    case "facebook":
      return `https://facebook.com/${cleanUsername}`;
    case "threads":
      return `https://threads.net/@${cleanUsername}`;
    case "patreon":
      return `https://patreon.com/${cleanUsername}`;
    case "roblox":
      return `https://www.roblox.com/search/users?keyword=${encodeURIComponent(cleanUsername)}`;
    case "discord":
      if (cleanValue.includes("discord.gg")) {
        return `https://${cleanValue.replace(/^https?:\/\//, "")}`;
      }

      return cleanValue;
    default:
      return `https://${cleanValue}`;
  }
};

export const SocialMediaSettings = () => {
  const API_URL = import.meta.env.VITE_API_URL || "https://api.arcxnjo.com.br";

  const [values, setValues] = useState<LinkValues>({});
  const [selectedPlatform, setSelectedPlatform] = useState("instagram");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const selected = getPlatform(selectedPlatform);
  const selectedValue = values[selectedPlatform] || "";
  const previewUrl = buildPreviewUrl(selectedPlatform, selectedValue);

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await axios.get(`${API_URL}/api/profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const socialMedia = response.data.socialMedia || {};
        const nextValues: LinkValues = {};

        linkPlatforms.forEach((platform) => {
          nextValues[platform.id] =
            socialMedia[platform.id] ||
            (platform.id === "x" ? socialMedia.twitter : "") ||
            (platform.id === "linkedin" ? socialMedia.linkedIn : "") ||
            "";
        });

        setValues(nextValues);

        const firstFilled = linkPlatforms.find((platform) =>
          nextValues[platform.id]?.trim()
        );

        if (firstFilled) {
          setSelectedPlatform(firstFilled.id);
        }
      } catch (error) {
        console.error("Error fetching links:", error);
      }
    };

    fetchLinks();
  }, [API_URL]);

  const filledLinks = useMemo(() => {
    return linkPlatforms.filter((platform) => values[platform.id]?.trim());
  }, [values]);

  const updateSelectedValue = (value: string) => {
    setValues((prev) => ({
      ...prev,
      [selectedPlatform]: value,
    }));
  };

  const clearSelectedValue = () => {
    setValues((prev) => ({
      ...prev,
      [selectedPlatform]: "",
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("token");

      const links = linkPlatforms
        .map((platform, index) => ({
          platform: platform.id,
          url: values[platform.id]?.trim() || "",
          displayOrder: index + 1,
        }))
        .filter((link) => link.url);

      await axios.put(
        `${API_URL}/api/profile/social-media`,
        { links },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage("✅ Links salvos com sucesso!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error: any) {
      setMessage(
        "❌ Erro ao salvar: " +
          (error.response?.data?.error || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const SelectedIcon = selected.icon;

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/30 p-5 md:p-6">
        <div className="absolute right-[-90px] top-[-90px] h-56 w-56 rounded-full bg-purple-500/20 blur-3xl" />

        <div className="relative">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-white/55">
            <FaLink />
            Links
          </div>

          <h3 className="flex items-center gap-3 text-2xl font-black text-white">
            <FaLink className="text-white/80" />
            Conecte seus perfis sociais.
          </h3>

          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/45">
            Escolha uma plataforma, adicione sua URL ou username e salve seus
            links públicos.
          </p>
        </div>
      </div>

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

      <section className="rounded-3xl border border-white/10 bg-black/25 p-5">
        <div className="grid grid-cols-4 gap-4 sm:grid-cols-5 md:grid-cols-6 xl:grid-cols-8">
          {linkPlatforms
            .filter((platform) => platform.id !== "website")
            .map((platform) => {
              const Icon = platform.icon;
              const isSelected = selectedPlatform === platform.id;
              const hasValue = Boolean(values[platform.id]?.trim());

              return (
                <button
                  key={platform.id}
                  type="button"
                  onClick={() => setSelectedPlatform(platform.id)}
                  title={platform.label}
                  className={`group relative grid h-16 w-16 place-items-center rounded-2xl border bg-black/35 transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-black/55 hover:shadow-[0_0_25px_rgba(255,255,255,0.08)] ${
                    isSelected
                      ? "border-white/30 shadow-[0_0_28px_rgba(255,255,255,0.10)]"
                      : "border-white/5"
                  }`}
                >
                  <Icon
                    className={`text-3xl drop-shadow-[0_0_12px_rgba(255,255,255,0.20)] transition group-hover:scale-110 ${platform.color}`}
                  />

                  {hasValue && (
                    <span
                      className="absolute right-1 top-1 grid h-4 w-4 place-items-center rounded-full bg-red-500 text-[8px] text-white opacity-0 transition group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        setValues((prev: Record<string, string>) => ({ ...prev, [platform.id]: "" }));
                      }}
                      title={`Remover ${platform.label}`}
                    >
                      ✕
                    </span>
                  )}

                  {hasValue && (
                    <span className="absolute bottom-1 right-1 grid h-3 w-3 place-items-center rounded-full bg-green-400 text-[6px] text-black group-hover:opacity-0 transition">
                      <FaCircleCheck />
                    </span>
                  )}
                </button>
              );
            })}
        </div>

        <button
          type="button"
          onClick={() => setSelectedPlatform("website")}
          className={`mt-6 flex w-full items-center gap-4 rounded-3xl border bg-black/25 p-4 text-left transition hover:border-white/15 hover:bg-black/40 ${
            selectedPlatform === "website" ? "border-white/25" : "border-white/10"
          }`}
        >
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/8 text-white/75">
            <FaGlobe className="text-2xl" />
          </div>

          <div>
            <p className="text-sm font-bold text-white">
              Adicionar URL personalizada
            </p>
            <p className="mt-1 text-xs text-white/40">
              Use sua própria URL e escolha um ícone que combine.
            </p>
          </div>
        </button>
      </section>

      <section className="rounded-3xl border border-white/10 bg-black/25 p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-black/40 text-white">
            <SelectedIcon className={`text-2xl ${selected.color}`} />
          </div>

          <div>
            <p className="text-lg font-black text-white">{selected.label}</p>
            <p className="text-xs text-white/40">{selected.hint}</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 md:flex-row">
          <input
            type="text"
            value={selectedValue}
            onChange={(event) => updateSelectedValue(event.target.value)}
            placeholder={selected.placeholder}
            className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition focus:border-white/25 focus:bg-black/45 focus:shadow-[0_0_0_4px_rgba(255,255,255,0.08)]"
          />

          {selectedValue.trim() && (
            <button
              type="button"
              onClick={clearSelectedValue}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200 transition hover:bg-red-500/20 hover:text-white"
            >
              <FaTrash className="text-xs" />
              Limpar
            </button>
          )}
        </div>

        {selectedValue.trim() && (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/25 px-3 py-2">
            <span className="min-w-0 truncate text-xs text-white/45">
              {previewUrl}
            </span>

            {previewUrl.startsWith("http") || previewUrl.startsWith("mailto:") ? (
              <a
                href={previewUrl}
                target="_blank"
                rel="noreferrer"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white/10 text-white/60 transition hover:bg-white/15 hover:text-white"
                title="Open preview"
              >
                <FaArrowUpRightFromSquare className="text-xs" />
              </a>
            ) : null}
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-white/10 bg-black/25 p-5">
        <div className="mb-4 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-bold text-white">Links ativos</p>
            <p className="text-xs text-white/40">
              {filledLinks.length} link(s) preenchido(s)
            </p>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-purple-600 px-5 py-3 text-sm font-bold text-white shadow-[0_0_28px_rgba(147,51,234,0.22)] transition hover:-translate-y-0.5 hover:bg-purple-500 hover:shadow-[0_0_38px_rgba(147,51,234,0.34)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FaFloppyDisk className="text-xs" />
            {loading ? "Saving..." : "Save Links"}
          </button>
        </div>

        {filledLinks.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {filledLinks.map((platform) => {
              const Icon = platform.icon;
              const url = buildPreviewUrl(platform.id, values[platform.id]);

              return (
                <a
                  key={platform.id}
                  href={url.startsWith("http") || url.startsWith("mailto:") ? url : undefined}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/70 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
                >
                  <Icon className={platform.color} />
                  {platform.label}
                </a>
              );
            })}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-4 text-sm text-white/35">
            Nenhum link preenchido ainda. Escolha um ícone acima para começar.
          </p>
        )}
      </section>
    </div>
  );
};

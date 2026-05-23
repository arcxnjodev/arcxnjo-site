import { useFormik } from "formik";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import type { IconType } from "react-icons";
import {
  FaDiscord,
  FaExternalLinkAlt,
  FaInstagram,
  FaKickstarterK,
  FaLinkedin,
  FaLink,
  FaSave,
  FaTwitch,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa";

type SocialValues = {
  instagram: string;
  x: string;
  youtube: string;
  twitch: string;
  kick: string;
  discord: string;
  linkedin: string;
};

type SocialField = {
  name: keyof SocialValues;
  label: string;
  placeholder: string;
  icon: IconType;
  hint: string;
};

const socialFields: SocialField[] = [
  {
    name: "instagram",
    label: "Instagram",
    placeholder: "4rcanjo__",
    icon: FaInstagram,
    hint: "Use apenas o usuário ou cole o link completo.",
  },
  {
    name: "x",
    label: "X / Twitter",
    placeholder: "arcxnjo",
    icon: FaTwitter,
    hint: "Seu @ do X/Twitter.",
  },
  {
    name: "youtube",
    label: "YouTube",
    placeholder: "Arcanjo092",
    icon: FaYoutube,
    hint: "Canal, @handle ou link completo.",
  },
  {
    name: "twitch",
    label: "Twitch",
    placeholder: "arcxnjo",
    icon: FaTwitch,
    hint: "Seu usuário da Twitch.",
  },
  {
    name: "kick",
    label: "Kick",
    placeholder: "arcxnjo",
    icon: FaKickstarterK,
    hint: "Seu usuário da Kick.",
  },
  {
    name: "discord",
    label: "Discord",
    placeholder: "discord.gg/seulink ou usuário",
    icon: FaDiscord,
    hint: "Convite, servidor ou username.",
  },
  {
    name: "linkedin",
    label: "LinkedIn",
    placeholder: "railson-moreira",
    icon: FaLinkedin,
    hint: "Username, perfil ou link completo.",
  },
];

const buildPreviewUrl = (platform: keyof SocialValues, value: string) => {
  const cleanValue = value.trim();

  if (!cleanValue) return "";

  if (cleanValue.startsWith("http://") || cleanValue.startsWith("https://")) {
    return cleanValue;
  }

  const cleanUsername = cleanValue.replace("@", "");

  switch (platform) {
    case "instagram":
      return `https://instagram.com/${cleanUsername}`;
    case "x":
      return `https://x.com/${cleanUsername}`;
    case "youtube":
      return `https://youtube.com/@${cleanUsername}`;
    case "twitch":
      return `https://twitch.tv/${cleanUsername}`;
    case "kick":
      return `https://kick.com/${cleanUsername}`;
    case "linkedin":
      return `https://linkedin.com/in/${cleanUsername}`;
    case "discord":
      if (cleanValue.includes("discord.gg")) {
        return `https://${cleanValue.replace(/^https?:\/\//, "")}`;
      }

      return cleanValue;
    default:
      return cleanValue;
  }
};

export const SocialMediaSettings = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "https://api.arcxnjo.com.br";

  const formik = useFormik<SocialValues>({
    initialValues: {
      instagram: "",
      x: "",
      youtube: "",
      twitch: "",
      kick: "",
      discord: "",
      linkedin: "",
    },
    onSubmit: async (values) => {
      setLoading(true);
      setMessage("");

      try {
        const token = localStorage.getItem("token");

        await axios.put(
          `${API_URL}/api/profile/social-media`,
          {
            instagram: values.instagram.trim(),
            x: values.x.trim(),
            youtube: values.youtube.trim(),
            twitch: values.twitch.trim(),
            kick: values.kick.trim(),
            discord: values.discord.trim(),
            linkedIn: values.linkedin.trim(),
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setMessage("✅ Social media saved successfully!");
        setTimeout(() => setMessage(""), 3000);
      } catch (error: any) {
        setMessage(
          "❌ Error saving: " +
            (error.response?.data?.error || error.message)
        );
      } finally {
        setLoading(false);
      }
    },
  });

  const { values, handleSubmit, handleChange, setValues } = formik;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await axios.get(`${API_URL}/api/profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const socialMedia = response.data.socialMedia || {};

        setValues({
          instagram: socialMedia.instagram || "",
          x: socialMedia.x || "",
          youtube: socialMedia.youtube || "",
          twitch: socialMedia.twitch || "",
          kick: socialMedia.kick || "",
          discord: socialMedia.discord || "",
          linkedin: socialMedia.linkedin || socialMedia.linkedIn || "",
        });
      } catch (error) {
        console.error("Error fetching social media:", error);
      }
    };

    fetchUserData();
  }, [API_URL, setValues]);

  const filledLinks = useMemo(() => {
    return socialFields.filter((field) => values[field.name]?.trim());
  }, [values]);

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-purple-600/20 via-black/30 to-pink-600/10 p-5 md:p-6">
        <div className="absolute right-[-80px] top-[-80px] h-52 w-52 rounded-full bg-purple-500/20 blur-3xl" />

        <div className="relative">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-purple-200">
            <FaLink />
            Social Hub
          </div>

          <h3 className="text-2xl font-black text-white">
            Seus links públicos
          </h3>

          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/50">
            Coloque seus perfis sociais aqui. Você pode usar só o username ou o
            link completo. O perfil público transforma isso em botões bonitos.
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

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-4 xl:grid-cols-2">
          {socialFields.map((field) => {
            const Icon = field.icon;
            const value = values[field.name];
            const previewUrl = buildPreviewUrl(field.name, value);

            return (
              <div
                key={field.name}
                className="group rounded-3xl border border-white/10 bg-black/25 p-4 transition hover:border-purple-400/25 hover:bg-white/[0.045]"
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-white/70 transition group-hover:bg-purple-500/20 group-hover:text-white">
                    <Icon className="text-lg" />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-white">
                      {field.label}
                    </p>
                    <p className="text-xs text-white/35">{field.hint}</p>
                  </div>
                </div>

                <input
                  type="text"
                  name={field.name}
                  placeholder={field.placeholder}
                  className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition focus:border-purple-400/60 focus:bg-black/45 focus:shadow-[0_0_0_4px_rgba(168,85,247,0.12)]"
                  value={value}
                  onChange={handleChange}
                />

                {value.trim() && (
                  <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/25 px-3 py-2">
                    <span className="min-w-0 truncate text-xs text-white/45">
                      {previewUrl}
                    </span>

                    {previewUrl.startsWith("http") && (
                      <a
                        href={previewUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white/10 text-white/60 transition hover:bg-purple-500/20 hover:text-white"
                        title="Open preview"
                      >
                        <FaExternalLinkAlt className="text-xs" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
          <div className="mb-4 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-bold text-white">
                Preview dos links ativos
              </p>
              <p className="text-xs text-white/40">
                {filledLinks.length} link(s) preenchido(s)
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-purple-600 px-5 py-3 text-sm font-bold text-white shadow-[0_0_28px_rgba(147,51,234,0.22)] transition hover:-translate-y-0.5 hover:bg-purple-500 hover:shadow-[0_0_38px_rgba(147,51,234,0.34)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FaSave className="text-xs" />
              {loading ? "Saving..." : "Save Social Links"}
            </button>
          </div>

          {filledLinks.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {filledLinks.map((field) => {
                const Icon = field.icon;
                const previewUrl = buildPreviewUrl(
                  field.name,
                  values[field.name]
                );

                return (
                  <a
                    key={field.name}
                    href={previewUrl.startsWith("http") ? previewUrl : undefined}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/70 transition hover:border-purple-400/25 hover:bg-purple-500/10 hover:text-white"
                  >
                    <Icon />
                    {field.label}
                  </a>
                );
              })}
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-4 text-sm text-white/35">
              Nenhum link preenchido ainda. Seus botões sociais vão aparecer
              aqui quando você adicionar algum perfil.
            </p>
          )}
        </div>
      </form>
    </div>
  );
};
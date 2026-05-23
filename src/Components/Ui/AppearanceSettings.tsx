import axios from "axios";
import { useEffect, useState } from "react";
import type { IconType } from "react-icons";
import {
  FaBan,
  FaCheckCircle,
  FaHeart,
  FaMagic,
  FaPalette,
  FaSave,
  FaSnowflake,
  FaStar,
} from "react-icons/fa";

const templates = [
  {
    id: "neon-purple",
    name: "Neon Purple",
    description: "Dark glass card with purple glow.",
    preview: "from-purple-700 to-black",
  },
  {
    id: "cyber-glass",
    name: "Cyber Glass",
    description: "Transparent futuristic style.",
    preview: "from-cyan-500 to-purple-700",
  },
  {
    id: "minimal-dark",
    name: "Minimal Dark",
    description: "Simple and clean dark layout.",
    preview: "from-gray-900 to-black",
  },
  {
    id: "red-glow",
    name: "Red Glow",
    description: "Dark profile with red highlight.",
    preview: "from-red-700 to-black",
  },
  {
    id: "blue-ice",
    name: "Blue Ice",
    description: "Cold blue futuristic style.",
    preview: "from-blue-600 to-slate-950",
  },
];

const effects: {
  id: string;
  name: string;
  description: string;
  icon: IconType;
}[] = [
  {
    id: "none",
    name: "None",
    description: "No animated particles.",
    icon: FaBan,
  },
  {
    id: "stars",
    name: "Stars",
    description: "Twinkling stars in the background.",
    icon: FaStar,
  },
  {
    id: "snow",
    name: "Snow",
    description: "Soft falling snow effect.",
    icon: FaSnowflake,
  },
  {
    id: "sparkles",
    name: "Sparkles",
    description: "Small shining sparkles.",
    icon: FaMagic,
  },
  {
    id: "hearts",
    name: "Hearts",
    description: "Floating hearts effect.",
    icon: FaHeart,
  },
];

export const AppearanceSettings = () => {
  const [selectedTemplate, setSelectedTemplate] = useState("neon-purple");
  const [selectedEffect, setSelectedEffect] = useState("none");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "https://api.arcxnjo.com.br";

  useEffect(() => {
    const fetchAppearance = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await axios.get(`${API_URL}/api/profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setSelectedTemplate(response.data.profile_template || "neon-purple");
        setSelectedEffect(response.data.profile_effect || "none");
      } catch (error) {
        console.error("Error fetching appearance:", error);
      }
    };

    fetchAppearance();
  }, [API_URL]);

  const handleSave = async () => {
    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `${API_URL}/api/profile/appearance`,
        {
          profileTemplate: selectedTemplate,
          profileEffect: selectedEffect,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage("✅ Appearance updated successfully!");
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

  const selectedTemplateData =
    templates.find((template) => template.id === selectedTemplate) ||
    templates[0];

  const selectedEffectData =
    effects.find((effect) => effect.id === selectedEffect) || effects[0];

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-purple-600/20 via-black/30 to-cyan-600/10 p-5 md:p-6">
        <div className="absolute right-[-80px] top-[-80px] h-52 w-52 rounded-full bg-purple-500/20 blur-3xl" />

        <div className="relative">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-purple-200">
            <FaPalette />
            Appearance Lab
          </div>

          <h3 className="text-2xl font-black text-white">Visual do perfil</h3>

          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/50">
            Escolha o template e o efeito animado do perfil público. Aqui é onde
            o perfil ganha clima, brilho e personalidade.
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
        <div className="mb-5">
          <h4 className="text-lg font-black text-white">Templates</h4>
          <p className="mt-1 text-sm text-white/40">
            Escolha a estrutura visual do seu perfil.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {templates.map((template) => {
            const isSelected = selectedTemplate === template.id;

            return (
              <button
                key={template.id}
                type="button"
                onClick={() => setSelectedTemplate(template.id)}
                className={`group overflow-hidden rounded-3xl border text-left transition ${
                  isSelected
                    ? "border-purple-400/50 bg-purple-500/15 shadow-[0_0_28px_rgba(168,85,247,0.18)]"
                    : "border-white/10 bg-white/[0.035] hover:border-purple-400/25 hover:bg-white/[0.06]"
                }`}
              >
                <div
                  className={`relative h-32 bg-gradient-to-br ${template.preview} flex items-center justify-center`}
                >
                  <div className="absolute inset-0 bg-black/10" />

                  <div className="relative w-24 rounded-3xl border border-white/20 bg-black/35 p-3 backdrop-blur-md">
                    <div className="mx-auto h-10 w-10 rounded-full bg-white/25" />
                    <div className="mx-auto mt-3 h-2 w-14 rounded-full bg-white/25" />
                    <div className="mx-auto mt-2 h-2 w-10 rounded-full bg-white/15" />
                  </div>

                  {isSelected && (
                    <div className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-2xl bg-green-500/20 text-green-200">
                      <FaCheckCircle />
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <p className="text-sm font-black text-white">
                    {template.name}
                  </p>

                  <p className="mt-1 text-xs leading-relaxed text-white/45">
                    {template.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-black/25 p-5">
        <div className="mb-5">
          <h4 className="text-lg font-black text-white">Effects</h4>
          <p className="mt-1 text-sm text-white/40">
            Escolha partículas animadas para o fundo do perfil.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {effects.map((effect) => {
            const Icon = effect.icon;
            const isSelected = selectedEffect === effect.id;

            return (
              <button
                key={effect.id}
                type="button"
                onClick={() => setSelectedEffect(effect.id)}
                className={`group rounded-3xl border p-4 text-left transition ${
                  isSelected
                    ? "border-purple-400/50 bg-purple-500/15 shadow-[0_0_28px_rgba(168,85,247,0.18)]"
                    : "border-white/10 bg-white/[0.035] hover:border-purple-400/25 hover:bg-white/[0.06]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`grid h-12 w-12 place-items-center rounded-2xl transition ${
                      isSelected
                        ? "bg-purple-500 text-white"
                        : "bg-white/10 text-white/55 group-hover:text-white"
                    }`}
                  >
                    <Icon />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-black text-white">
                      {effect.name}
                    </p>

                    <p className="mt-1 text-xs text-white/40">
                      {effect.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-black/25 p-5">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-bold text-white">Current style</p>

            <p className="mt-1 text-xs text-white/40">
              Template: {selectedTemplateData.name} · Effect:{" "}
              {selectedEffectData.name}
            </p>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-purple-600 px-5 py-3 text-sm font-bold text-white shadow-[0_0_28px_rgba(147,51,234,0.22)] transition hover:-translate-y-0.5 hover:bg-purple-500 hover:shadow-[0_0_38px_rgba(147,51,234,0.34)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FaSave className="text-xs" />
            {loading ? "Saving..." : "Save Appearance"}
          </button>
        </div>
      </section>
    </div>
  );
};
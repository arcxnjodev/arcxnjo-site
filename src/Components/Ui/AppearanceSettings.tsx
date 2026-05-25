import axios from "axios";
import { useEffect, useState } from "react";
import type { IconType } from "react-icons";
import {
  FaBan,
  FaCheckCircle,
  FaHeart,
  FaLock,
  FaMagic,
  FaPalette,
  FaSave,
  FaSnowflake,
  FaStar,
} from "react-icons/fa";
import { useI18n } from "../../i18n/i18nProvider";

type TemplateDef = {
  id: string;
  name: string;
  description: {
    pt: string;
    en: string;
    es: string;
  };
  preview: string;
  proOnly?: boolean;
};

const templates: TemplateDef[] = [
  {
    id: "neon-purple",
    name: "Neon Purple",
    description: {
      pt: "Card escuro com brilho roxo.",
      en: "Dark glass card with purple glow.",
      es: "Tarjeta oscura con brillo morado.",
    },
    preview: "from-purple-700 to-black",
  },
  {
    id: "cyber-glass",
    name: "Cyber Glass",
    description: {
      pt: "Estilo transparente e futurista.",
      en: "Transparent futuristic style.",
      es: "Estilo transparente y futurista.",
    },
    preview: "from-cyan-500 to-purple-700",
  },
  {
    id: "minimal-dark",
    name: "Minimal Dark",
    description: {
      pt: "Layout escuro simples e limpo.",
      en: "Simple and clean dark layout.",
      es: "Diseño oscuro simple y limpio.",
    },
    preview: "from-gray-900 to-black",
  },
  {
    id: "red-glow",
    name: "Red Glow",
    description: {
      pt: "Perfil escuro com destaque vermelho.",
      en: "Dark profile with red highlight.",
      es: "Perfil oscuro con destaque rojo.",
    },
    preview: "from-red-700 to-black",
  },
  {
    id: "blue-ice",
    name: "Blue Ice",
    description: {
      pt: "Estilo azul frio e futurista.",
      en: "Cold blue futuristic style.",
      es: "Estilo azul frío y futurista.",
    },
    preview: "from-blue-600 to-slate-950",
  },
  {
    id: "pro-scroll",
    name: "Pro Scroll",
    description: {
      pt: "Template Pro com scroll, horário, atividade Discord e seção de música.",
      en: "Pro template with scroll, local time, Discord activity and music section.",
      es: "Template Pro con scroll, horario, actividad de Discord y sección de música.",
    },
    preview: "from-black via-zinc-950 to-white/20",
    proOnly: true,
  },
];

const effects: {
  id: string;
  name: {
    pt: string;
    en: string;
    es: string;
  };
  description: {
    pt: string;
    en: string;
    es: string;
  };
  icon: IconType;
}[] = [
  {
    id: "none",
    name: { pt: "Nenhum", en: "None", es: "Ninguno" },
    description: {
      pt: "Sem partículas animadas.",
      en: "No animated particles.",
      es: "Sin partículas animadas.",
    },
    icon: FaBan,
  },
  {
    id: "stars",
    name: { pt: "Estrelas", en: "Stars", es: "Estrellas" },
    description: {
      pt: "Estrelas brilhando no fundo.",
      en: "Twinkling stars in the background.",
      es: "Estrellas brillando en el fondo.",
    },
    icon: FaStar,
  },
  {
    id: "snow",
    name: { pt: "Neve", en: "Snow", es: "Nieve" },
    description: {
      pt: "Efeito suave de neve caindo.",
      en: "Soft falling snow effect.",
      es: "Efecto suave de nieve cayendo.",
    },
    icon: FaSnowflake,
  },
  {
    id: "sparkles",
    name: { pt: "Brilhos", en: "Sparkles", es: "Destellos" },
    description: {
      pt: "Pequenos brilhos animados.",
      en: "Small shining sparkles.",
      es: "Pequeños destellos brillantes.",
    },
    icon: FaMagic,
  },
  {
    id: "hearts",
    name: { pt: "Corações", en: "Hearts", es: "Corazones" },
    description: {
      pt: "Corações flutuando no fundo.",
      en: "Floating hearts effect.",
      es: "Corazones flotando en el fondo.",
    },
    icon: FaHeart,
  },
];

const copy = {
  pt: {
    badge: "Appearance Lab",
    title: "Visual do perfil",
    subtitle:
      "Escolha o template e o efeito animado do perfil público. Templates Pro aparecem bloqueados para usuários Free.",
    templates: "Templates",
    templatesDesc: "Escolha a estrutura visual do seu perfil.",
    effects: "Efeitos",
    effectsDesc: "Escolha partículas animadas para o fundo do perfil.",
    currentStyle: "Estilo atual",
    template: "Template",
    effect: "Efeito",
    proOnly: "PRO",
    locked: "Disponível no plano Pro",
    save: "Salvar aparência",
    saving: "Salvando...",
    success: "✅ Aparência atualizada com sucesso!",
    error: "❌ Erro ao salvar: ",
  },
  en: {
    badge: "Appearance Lab",
    title: "Profile appearance",
    subtitle:
      "Choose the template and animated effect for your public profile. Pro templates appear locked for Free users.",
    templates: "Templates",
    templatesDesc: "Choose your profile visual structure.",
    effects: "Effects",
    effectsDesc: "Choose animated particles for the profile background.",
    currentStyle: "Current style",
    template: "Template",
    effect: "Effect",
    proOnly: "PRO",
    locked: "Available on the Pro plan",
    save: "Save Appearance",
    saving: "Saving...",
    success: "✅ Appearance updated successfully!",
    error: "❌ Error saving: ",
  },
  es: {
    badge: "Appearance Lab",
    title: "Apariencia del perfil",
    subtitle:
      "Elige el template y el efecto animado del perfil público. Los templates Pro aparecen bloqueados para usuarios Free.",
    templates: "Templates",
    templatesDesc: "Elige la estructura visual de tu perfil.",
    effects: "Efectos",
    effectsDesc: "Elige partículas animadas para el fondo del perfil.",
    currentStyle: "Estilo actual",
    template: "Template",
    effect: "Efecto",
    proOnly: "PRO",
    locked: "Disponible en el plan Pro",
    save: "Guardar apariencia",
    saving: "Guardando...",
    success: "✅ Apariencia actualizada con éxito!",
    error: "❌ Error al guardar: ",
  },
};

export const AppearanceSettings = () => {
  const { language } = useI18n();

  const [selectedTemplate, setSelectedTemplate] = useState("neon-purple");
  const [selectedEffect, setSelectedEffect] = useState("none");
  const [plan, setPlan] = useState<"free" | "pro">("free");
  const [ownerBypass, setOwnerBypass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "https://api.arcxnjo.com.br";
  const text = copy[language];

  const canUseProTemplates = plan === "pro" || ownerBypass;

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
        setPlan(response.data.plan === "pro" ? "pro" : "free");
        setOwnerBypass(Boolean(response.data.owner_bypass));
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

      setMessage(text.success);
      setTimeout(() => setMessage(""), 3000);
    } catch (error: any) {
      setMessage(text.error + (error.response?.data?.error || error.message));
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
            {text.badge}
          </div>

          <h3 className="text-2xl font-black text-white">{text.title}</h3>

          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/50">
            {text.subtitle}
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
          <h4 className="text-lg font-black text-white">{text.templates}</h4>
          <p className="mt-1 text-sm text-white/40">{text.templatesDesc}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {templates.map((template) => {
            const isSelected = selectedTemplate === template.id;
            const isLocked = Boolean(template.proOnly && !canUseProTemplates);

            return (
              <button
                key={template.id}
                type="button"
                onClick={() => {
                  if (isLocked) return;
                  setSelectedTemplate(template.id);
                }}
                disabled={isLocked}
                className={`group overflow-hidden rounded-3xl border text-left transition ${
                  isSelected
                    ? "border-purple-400/50 bg-purple-500/15 shadow-[0_0_28px_rgba(168,85,247,0.18)]"
                    : isLocked
                    ? "cursor-not-allowed border-white/5 bg-white/[0.025] opacity-55"
                    : "border-white/10 bg-white/[0.035] hover:border-purple-400/25 hover:bg-white/[0.06]"
                }`}
              >
                <div
                  className={`relative flex h-32 items-center justify-center bg-gradient-to-br ${template.preview}`}
                >
                  <div className="absolute inset-0 bg-black/10" />

                  <div className="relative w-24 rounded-3xl border border-white/20 bg-black/35 p-3 backdrop-blur-md">
                    <div className="mx-auto h-10 w-10 rounded-full bg-white/25" />
                    <div className="mx-auto mt-3 h-2 w-14 rounded-full bg-white/25" />
                    <div className="mx-auto mt-2 h-2 w-10 rounded-full bg-white/15" />
                  </div>

                  {template.proOnly && (
                    <div className="absolute left-3 top-3 rounded-full bg-black/45 px-2 py-1 text-[10px] font-black tracking-widest text-white backdrop-blur-md">
                      {text.proOnly}
                    </div>
                  )}

                  {isLocked && (
                    <div className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-2xl bg-black/40 text-white">
                      <FaLock />
                    </div>
                  )}

                  {isSelected && !isLocked && (
                    <div className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-2xl bg-green-500/20 text-green-200">
                      <FaCheckCircle />
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <p className="text-sm font-black text-white">{template.name}</p>

                  <p className="mt-1 text-xs leading-relaxed text-white/45">
                    {isLocked ? text.locked : template.description[language]}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-black/25 p-5">
        <div className="mb-5">
          <h4 className="text-lg font-black text-white">{text.effects}</h4>
          <p className="mt-1 text-sm text-white/40">{text.effectsDesc}</p>
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
                      {effect.name[language]}
                    </p>

                    <p className="mt-1 text-xs text-white/40">
                      {effect.description[language]}
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
            <p className="text-sm font-bold text-white">{text.currentStyle}</p>

            <p className="mt-1 text-xs text-white/40">
              {text.template}: {selectedTemplateData.name} · {text.effect}:{" "}
              {selectedEffectData.name[language]}
            </p>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-purple-600 px-5 py-3 text-sm font-bold text-white shadow-[0_0_28px_rgba(147,51,234,0.22)] transition hover:-translate-y-0.5 hover:bg-purple-500 hover:shadow-[0_0_38px_rgba(147,51,234,0.34)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FaSave className="text-xs" />
            {loading ? text.saving : text.save}
          </button>
        </div>
      </section>
    </div>
  );
};

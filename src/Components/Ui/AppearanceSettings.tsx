import axios from "axios";
import { useEffect, useState } from "react";
import type { IconType } from "react-icons";
import {
  FaBan,
  FaCheckCircle,
  FaCode,
  FaEye,
  FaHeart,
  FaLayerGroup,
  FaLock,
  FaMagic,
  FaMousePointer,
  FaPalette,
  FaSave,
  FaSnowflake,
  FaSpinner,
  FaStar,
  FaTerminal,
  FaTrash,
  FaUndo,
} from "react-icons/fa";
import { useI18n } from "../../i18n/i18nProvider";
import { CommunityTemplatePreview } from "./CommunityTemplatePreview";

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

type CommunityEditorData = {
  hasActiveTemplate: boolean;
  template: {
    id: number;
    name: string;
    description: string;
    preview_image: string;
    creator_username?: string | null;
    original_html_code: string;
    original_css_code: string;
    original_js_code: string;
  } | null;
  override: {
    exists: boolean;
    html_code: string;
    css_code: string;
    js_code: string;
    updated_at?: string | null;
  } | null;
};

type CommunityEditorTab = "html" | "css" | "js" | "preview";

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
    customCursor: "Cursor personalizado",
    customCursorDesc:
      "Coloque o link de uma imagem para usar como cursor personalizado no perfil.",
    cursorImageUrl: "URL da imagem do cursor",
    cursorHint: "Recomendado: PNG, WEBP, GIF ou CUR pequeno. Ideal: 32x32 ou 64x64.",
    clearCursor: "Limpar cursor",
    preview: "Preview",
    communityTemplateName: "Template da comunidade",
    communityStudioBadge: "Community Studio",
    communityStudioTitle: "Editar template da comunidade",
    communityStudioSubtitle:
      "Edite uma cópia pessoal do template que você está usando. O template público aprovado continua intacto.",
    loadingStudio: "Carregando editor do template...",
    noCommunityTemplate:
      "Você só consegue editar aqui quando estiver usando um template da comunidade.",
    originalBy: "Original por",
    personalEdit: "edição pessoal",
    originalVersion: "versão original",
    saveEdit: "Salvar edição",
    savingEdit: "Salvando edição...",
    resetEdit: "Resetar para original",
    loadOriginal: "Carregar original",
    savedEdit: "✅ Edição pessoal salva!",
    resetEditSuccess: "✅ Edição resetada para o template original.",
    loadEditorError: "❌ Erro ao carregar editor: ",
    saveEditorError: "❌ Erro ao salvar edição: ",
    resetEditorError: "❌ Erro ao resetar edição: ",
    htmlTab: "HTML",
    cssTab: "CSS",
    jsTab: "JS",
    previewTab: "Preview",
    codeHint:
      "Dica: use window.ARCXNJO_PROFILE para acessar avatar, nome, bio, links, Discord e stats.",
    jsWarning:
      "JS roda isolado no iframe sandbox. Use apenas para efeitos visuais do seu próprio perfil.",
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
    customCursor: "Custom cursor",
    customCursorDesc:
      "Add an image link to use as a custom cursor on your profile.",
    cursorImageUrl: "Cursor image URL",
    cursorHint: "Recommended: small PNG, WEBP, GIF, or CUR. Ideal: 32x32 or 64x64.",
    clearCursor: "Clear cursor",
    preview: "Preview",
    communityTemplateName: "Community template",
    communityStudioBadge: "Community Studio",
    communityStudioTitle: "Edit community template",
    communityStudioSubtitle:
      "Edit your personal copy of the template you are using. The approved public template stays untouched.",
    loadingStudio: "Loading template editor...",
    noCommunityTemplate:
      "You can edit here only when you are using a community template.",
    originalBy: "Original by",
    personalEdit: "personal edit",
    originalVersion: "original version",
    saveEdit: "Save edit",
    savingEdit: "Saving edit...",
    resetEdit: "Reset to original",
    loadOriginal: "Load original",
    savedEdit: "✅ Personal edit saved!",
    resetEditSuccess: "✅ Edit reset to the original template.",
    loadEditorError: "❌ Editor load error: ",
    saveEditorError: "❌ Edit save error: ",
    resetEditorError: "❌ Edit reset error: ",
    htmlTab: "HTML",
    cssTab: "CSS",
    jsTab: "JS",
    previewTab: "Preview",
    codeHint:
      "Tip: use window.ARCXNJO_PROFILE to access avatar, name, bio, links, Discord, and stats.",
    jsWarning:
      "JS runs isolated inside the sandboxed iframe. Use it only for visual effects on your own profile.",
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
    customCursor: "Cursor personalizado",
    customCursorDesc:
      "Agrega el link de una imagen para usarla como cursor personalizado en tu perfil.",
    cursorImageUrl: "URL de imagen del cursor",
    cursorHint: "Recomendado: PNG, WEBP, GIF o CUR pequeño. Ideal: 32x32 o 64x64.",
    clearCursor: "Limpiar cursor",
    preview: "Preview",
    communityTemplateName: "Template de la comunidad",
    communityStudioBadge: "Community Studio",
    communityStudioTitle: "Editar template de la comunidad",
    communityStudioSubtitle:
      "Edita tu copia personal del template que estás usando. El template público aprobado sigue intacto.",
    loadingStudio: "Cargando editor del template...",
    noCommunityTemplate:
      "Solo puedes editar aquí cuando estés usando un template de la comunidad.",
    originalBy: "Original por",
    personalEdit: "edición personal",
    originalVersion: "versión original",
    saveEdit: "Guardar edición",
    savingEdit: "Guardando edición...",
    resetEdit: "Resetear al original",
    loadOriginal: "Cargar original",
    savedEdit: "✅ Edición personal guardada!",
    resetEditSuccess: "✅ Edición reseteada al template original.",
    loadEditorError: "❌ Error al cargar editor: ",
    saveEditorError: "❌ Error al guardar edición: ",
    resetEditorError: "❌ Error al resetear edición: ",
    htmlTab: "HTML",
    cssTab: "CSS",
    jsTab: "JS",
    previewTab: "Preview",
    codeHint:
      "Tip: usa window.ARCXNJO_PROFILE para acceder a avatar, nombre, bio, links, Discord y stats.",
    jsWarning:
      "JS se ejecuta aislado dentro del iframe sandbox. Úsalo solo para efectos visuales de tu propio perfil.",
  },
};

const codeTextareaClass =
  "min-h-[360px] w-full resize-y rounded-b-3xl border-0 bg-[#050505] px-4 py-4 font-mono text-xs leading-relaxed text-white outline-none placeholder-white/20";

export const AppearanceSettings = () => {
  const { language } = useI18n();

  const [selectedTemplate, setSelectedTemplate] = useState("neon-purple");
  const [selectedEffect, setSelectedEffect] = useState("none");
  const [plan, setPlan] = useState<"free" | "pro">("free");
  const [ownerBypass, setOwnerBypass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [customCursorUrl, setCustomCursorUrl] = useState("");
  const [communityEditor, setCommunityEditor] = useState<CommunityEditorData | null>(null);
  const [communityEditorLoading, setCommunityEditorLoading] = useState(false);
  const [communitySaving, setCommunitySaving] = useState(false);
  const [communityTab, setCommunityTab] = useState<CommunityEditorTab>("html");
  const [communityHtml, setCommunityHtml] = useState("");
  const [communityCss, setCommunityCss] = useState("");
  const [communityJs, setCommunityJs] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "https://api.arcxnjo.com.br";
  const text = copy[language];

  const canUseProTemplates = plan === "pro" || ownerBypass;
  const isCommunityTemplateSelected = selectedTemplate === "community";

  const fetchCommunityEditor = async (authToken = localStorage.getItem("token")) => {
    try {
      if (!authToken) return;

      setCommunityEditorLoading(true);

      const response = await axios.get(`${API_URL}/api/profile/community-template/editor`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const data: CommunityEditorData = response.data;
      setCommunityEditor(data);

      if (data?.hasActiveTemplate && data.override) {
        setCommunityHtml(data.override.html_code || "");
        setCommunityCss(data.override.css_code || "");
        setCommunityJs(data.override.js_code || "");
      }
    } catch (error: any) {
      setMessage(text.loadEditorError + (error.response?.data?.error || error.message));
    } finally {
      setCommunityEditorLoading(false);
    }
  };

  useEffect(() => {
    const fetchAppearance = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await axios.get(`${API_URL}/api/profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const profileTemplate = response.data.profile_template || "neon-purple";

        setSelectedTemplate(profileTemplate);
        setSelectedEffect(response.data.profile_effect || "none");
        setPlan(response.data.plan === "pro" ? "pro" : "free");
        setOwnerBypass(Boolean(response.data.owner_bypass));
        setCustomCursorUrl(response.data.custom_cursor_url || "");

        if (profileTemplate === "community") {
          await fetchCommunityEditor(token);
        }
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
          customCursorUrl: customCursorUrl.trim(),
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

  const handleSaveCommunityEdit = async () => {
    setCommunitySaving(true);
    setMessage("");

    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `${API_URL}/api/profile/community-template/editor`,
        {
          htmlCode: communityHtml,
          cssCode: communityCss,
          jsCode: communityJs,
          settings: {},
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage(text.savedEdit);
      await fetchCommunityEditor(token);
      setTimeout(() => setMessage(""), 3000);
    } catch (error: any) {
      setMessage(text.saveEditorError + (error.response?.data?.error || error.message));
    } finally {
      setCommunitySaving(false);
    }
  };

  const handleResetCommunityEdit = async () => {
    setCommunitySaving(true);
    setMessage("");

    try {
      const token = localStorage.getItem("token");

      await axios.delete(`${API_URL}/api/profile/community-template/editor`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage(text.resetEditSuccess);
      await fetchCommunityEditor(token);
      setTimeout(() => setMessage(""), 3000);
    } catch (error: any) {
      setMessage(text.resetEditorError + (error.response?.data?.error || error.message));
    } finally {
      setCommunitySaving(false);
    }
  };

  const handleLoadOriginalCommunityCode = () => {
    if (!communityEditor?.template) return;

    setCommunityHtml(communityEditor.template.original_html_code || "");
    setCommunityCss(communityEditor.template.original_css_code || "");
    setCommunityJs(communityEditor.template.original_js_code || "");
  };

  const selectedTemplateData =
    templates.find((template) => template.id === selectedTemplate) ||
    templates[0];

  const selectedEffectData =
    effects.find((effect) => effect.id === selectedEffect) || effects[0];

  const selectedTemplateLabel = isCommunityTemplateSelected
    ? communityEditor?.template?.name || text.communityTemplateName
    : selectedTemplateData.name;

  const communityCodeLength = communityHtml.length + communityCss.length + communityJs.length;
  const communityLineCount = [communityHtml, communityCss, communityJs]
    .join("\n")
    .split("\n")
    .filter(Boolean).length;

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

      {isCommunityTemplateSelected && (
        <section className="overflow-hidden rounded-3xl border border-white/10 bg-black/25">
          <div className="relative overflow-hidden border-b border-white/10 bg-[#050505] p-5 md:p-6">
            <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.45)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.45)_1px,transparent_1px)] [background-size:36px_36px]" />
            <div className="absolute right-[-120px] top-[-120px] h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />

            <div className="relative flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-cyan-200">
                  <FaTerminal />
                  {text.communityStudioBadge}
                </div>

                <h4 className="text-2xl font-black text-white">
                  {text.communityStudioTitle}
                </h4>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/45">
                  {text.communityStudioSubtitle}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-black/55 px-4 py-3">
                  <p className="text-lg font-black text-white">{communityLineCount}</p>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/30">
                    lines
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/55 px-4 py-3">
                  <p className="text-lg font-black text-white">{communityCodeLength}</p>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/30">
                    chars
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/55 px-4 py-3">
                  <p className="text-lg font-black text-white">
                    {communityEditor?.override?.exists ? "custom" : "base"}
                  </p>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/30">
                    mode
                  </p>
                </div>
              </div>
            </div>
          </div>

          {communityEditorLoading ? (
            <div className="flex items-center gap-3 p-5 text-sm text-white/45">
              <FaSpinner className="animate-spin" />
              {text.loadingStudio}
            </div>
          ) : communityEditor?.hasActiveTemplate && communityEditor.template ? (
            <div className="grid gap-5 p-5 xl:grid-cols-[1fr_440px]">
              <div className="space-y-4">
                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                    <div className="min-w-0">
                      <p className="truncate text-lg font-black text-white">
                        {communityEditor.template.name}
                      </p>
                      <p className="mt-1 text-xs text-white/40">
                        {text.originalBy} @{communityEditor.template.creator_username || "unknown"} ·{" "}
                        {communityEditor.override?.exists
                          ? text.personalEdit
                          : text.originalVersion}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={handleLoadOriginalCommunityCode}
                        className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-2.5 text-xs font-bold text-white/55 transition hover:border-cyan-400/25 hover:bg-cyan-500/10 hover:text-cyan-100"
                      >
                        <FaUndo />
                        {text.loadOriginal}
                      </button>

                      <button
                        type="button"
                        onClick={handleResetCommunityEdit}
                        disabled={communitySaving}
                        className="inline-flex items-center gap-2 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-2.5 text-xs font-bold text-red-200 transition hover:border-red-300/35 hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <FaTrash />
                        {text.resetEdit}
                      </button>

                      <button
                        type="button"
                        onClick={handleSaveCommunityEdit}
                        disabled={communitySaving}
                        className="inline-flex items-center gap-2 rounded-2xl bg-cyan-500 px-4 py-2.5 text-xs font-black text-black transition hover:-translate-y-0.5 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {communitySaving ? <FaSpinner className="animate-spin" /> : <FaSave />}
                        {communitySaving ? text.savingEdit : text.saveEdit}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#050505]">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-black/50 p-2">
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: "html" as const, label: text.htmlTab, icon: FaCode },
                        { id: "css" as const, label: text.cssTab, icon: FaPalette },
                        { id: "js" as const, label: text.jsTab, icon: FaTerminal },
                        { id: "preview" as const, label: text.previewTab, icon: FaEye },
                      ].map((tab) => {
                        const Icon = tab.icon;
                        const active = communityTab === tab.id;

                        return (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setCommunityTab(tab.id)}
                            className={`inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-black transition ${
                              active
                                ? "bg-white text-black"
                                : "text-white/45 hover:bg-white/5 hover:text-white"
                            }`}
                          >
                            <Icon />
                            {tab.label}
                          </button>
                        );
                      })}
                    </div>

                    <span className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
                      sandbox editor
                    </span>
                  </div>

                  {communityTab === "html" && (
                    <textarea
                      value={communityHtml}
                      onChange={(event) => setCommunityHtml(event.target.value)}
                      spellCheck={false}
                      className={codeTextareaClass}
                    />
                  )}

                  {communityTab === "css" && (
                    <textarea
                      value={communityCss}
                      onChange={(event) => setCommunityCss(event.target.value)}
                      spellCheck={false}
                      className={codeTextareaClass}
                    />
                  )}

                  {communityTab === "js" && (
                    <textarea
                      value={communityJs}
                      onChange={(event) => setCommunityJs(event.target.value)}
                      spellCheck={false}
                      className={codeTextareaClass}
                    />
                  )}

                  {communityTab === "preview" && (
                    <div className="p-4">
                      <CommunityTemplatePreview
                        htmlCode={communityHtml}
                        cssCode={communityCss}
                        jsCode={communityJs}
                        height="520px"
                      />
                    </div>
                  )}
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <p className="rounded-2xl border border-cyan-400/15 bg-cyan-500/10 p-3 text-xs leading-relaxed text-cyan-100/80">
                    {text.codeHint}
                  </p>

                  <p className="rounded-2xl border border-yellow-400/15 bg-yellow-500/10 p-3 text-xs leading-relaxed text-yellow-100/80">
                    {text.jsWarning}
                  </p>
                </div>
              </div>

              <aside className="space-y-4">
                <div className="rounded-3xl border border-white/10 bg-black/35 p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-black text-white">
                    <FaEye className="text-cyan-300" />
                    {text.preview}
                  </div>

                  <CommunityTemplatePreview
                    htmlCode={communityHtml}
                    cssCode={communityCss}
                    jsCode={communityJs}
                    height="620px"
                  />
                </div>
              </aside>
            </div>
          ) : (
            <div className="p-5">
              <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.03] p-6 text-sm text-white/40">
                {text.noCommunityTemplate}
              </div>
            </div>
          )}
        </section>
      )}

      <section className="rounded-3xl border border-white/10 bg-black/25 p-5">
        <div className="mb-5 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-white/70">
            <FaMousePointer />
          </div>

          <div>
            <h4 className="text-lg font-black text-white">{text.customCursor}</h4>
            <p className="mt-1 text-sm text-white/40">
              {text.customCursorDesc}
            </p>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <label className="mb-2 block text-sm font-semibold text-white/85">
              {text.cursorImageUrl}
            </label>

            <input
              type="text"
              value={customCursorUrl}
              onChange={(e) => setCustomCursorUrl(e.target.value)}
              placeholder="https://site.com/cursor.png"
              className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition focus:border-purple-400/60 focus:bg-black/45 focus:shadow-[0_0_0_4px_rgba(168,85,247,0.12)]"
            />

            <p className="mt-2 text-xs text-white/35">
              {text.cursorHint}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setCustomCursorUrl("")}
            className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm font-bold text-white/55 transition hover:border-red-400/25 hover:bg-red-500/10 hover:text-red-200"
          >
            {text.clearCursor}
          </button>
        </div>

        {customCursorUrl.trim() && (
          <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 p-4">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-white/35">
              {text.preview}
            </p>

            <div className="flex items-center gap-3">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/10">
                <img
                  src={customCursorUrl}
                  alt="Custom cursor preview"
                  className="max-h-9 max-w-9 object-contain"
                  draggable={false}
                />
              </div>

              <p className="min-w-0 truncate text-sm text-white/50">
                {customCursorUrl}
              </p>
            </div>
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-white/10 bg-black/25 p-5">
        <div className="mb-5">
          <h4 className="text-lg font-black text-white">{text.templates}</h4>
          <p className="mt-1 text-sm text-white/40">{text.templatesDesc}</p>
        </div>

        {isCommunityTemplateSelected && (
          <div className="mb-4 rounded-3xl border border-cyan-400/20 bg-cyan-500/10 p-4">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-400/15 text-cyan-100">
                <FaLayerGroup />
              </div>

              <div>
                <p className="text-sm font-black text-white">
                  {text.communityTemplateName}
                </p>
                <p className="mt-1 text-xs text-cyan-100/60">
                  {communityEditor?.template?.name || selectedTemplateLabel}
                </p>
              </div>
            </div>
          </div>
        )}

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
              {text.template}: {selectedTemplateLabel} · {text.effect}:{" "}
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

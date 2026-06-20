import axios from "axios";
import { useEffect, useState } from "react";
import type { IconType } from "react-icons";
import {
  FaBan,
  FaCheckCircle,
  FaCode,
  FaHeart,
  FaImage,
  FaLock,
  FaMagic,
  FaMousePointer,
  FaMusic,
  FaPalette,
  FaPaintBrush,
  FaSave,
  FaSlidersH,
  FaSnowflake,
  FaSpinner,
  FaStar,
  FaSyncAlt,
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

type StudioTab = "visual" | "media" | "buttons" | "music" | "advanced";

type CommunityEditorResponse = {
  hasActiveTemplate: boolean;
  template: {
    id: number;
    name: string;
    description: string;
    preview_image: string;
    creator_username: string | null;
    original_html_code: string;
    original_css_code: string;
    original_js_code: string;
  } | null;
  override: {
    exists: boolean;
    html_code: string;
    css_code: string;
    js_code: string;
    settings: Partial<TemplateStudioSettings>;
    updated_at: string | null;
  } | null;
};

type TemplateStudioSettings = {
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  backgroundColor: string;
  cardRadius: number;
  cardBlur: number;
  glowIntensity: number;
  avatarSize: number;
  backgroundImage: string;
  backgroundVideo: string;
  backgroundOpacity: number;
  buttonStyle: "glass" | "solid" | "outline" | "minimal";
  buttonRadius: number;
  buttonGlow: boolean;
  showIcons: boolean;
  buttonSize: "sm" | "md" | "lg";
  showMusic: boolean;
  musicUrl: string;
  musicTitle: string;
  musicPosition: "top" | "bottom" | "left" | "right";
  showCover: boolean;
  coverImage: string;
  showLyrics: boolean;
};

const defaultStudioSettings: TemplateStudioSettings = {
  primaryColor: "#a855f7",
  secondaryColor: "#22d3ee",
  textColor: "#ffffff",
  backgroundColor: "#050505",
  cardRadius: 28,
  cardBlur: 18,
  glowIntensity: 38,
  avatarSize: 128,
  backgroundImage: "",
  backgroundVideo: "",
  backgroundOpacity: 42,
  buttonStyle: "glass",
  buttonRadius: 22,
  buttonGlow: true,
  showIcons: true,
  buttonSize: "md",
  showMusic: false,
  musicUrl: "",
  musicTitle: "",
  musicPosition: "bottom",
  showCover: true,
  coverImage: "",
  showLyrics: false,
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
  {
    id: "sleek",
    name: "Sleek",
    description: {
      pt: "Layout horizontal com foto grande e info ao lado.",
      en: "Horizontal layout with large photo and info beside it.",
      es: "Layout horizontal con foto grande e info al lado.",
    },
    preview: "from-zinc-900 to-black",
  },
  {
    id: "grid",
    name: "Grid",
    description: {
      pt: "Cards em grade com banner interno e seções separadas.",
      en: "Grid cards with inner banner and separated sections.",
      es: "Grid cards with inner banner and separated sections.",
    },
    preview: "from-neutral-900 to-zinc-950",
  },
  {
    id: "modern",
    name: "Modern",
    description: {
      pt: "Duas colunas com stats, bio e socials separados.",
      en: "Two columns with stats, bio and separated socials.",
      es: "Dos columnas con stats, bio y sociales separados.",
    },
    preview: "from-zinc-800 to-black",
  },
  {
    id: "simplistic",
    name: "Simplistic",
    description: {
      pt: "Botões grandes de link com foto e bio no topo.",
      en: "Big link buttons with photo and bio on top.",
      es: "Botones grandes de enlace con foto y bio arriba.",
    },
    preview: "from-stone-900 to-black",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: {
      pt: "Sem card. Tudo flutua diretamente sobre o fundo.",
      en: "No card. Everything floats directly over the background.",
      es: "Sin tarjeta. Todo flota directamente sobre el fondo.",
    },
    preview: "from-black to-zinc-900",
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
      "Escolha o template, efeito, cursor e personalize templates da comunidade por botões ou código avançado.",
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
    cursorTitle: "Cursor personalizado",
    cursorDescription:
      "Faça o upload de um arquivo ou coloque o link de uma imagem para usar como cursor no perfil.",
    cursorUrl: "URL da imagem do cursor",
    cursorHelp:
      "Recomendado: PNG, WEBP, GIF ou CUR pequeno. Tamanho físico máximo obrigatório: 32x32 pixels.",
    clearCursor: "Limpar cursor",
    uploadCursor: "Upload de arquivo",
    uploadingCursor: "Enviando...",
    cursorSizeError: "Erro: O cursor deve ter no máximo 32x32 pixels. Sua imagem tem {width}x{height}px.",
    cursorUploadSuccess: "✅ Cursor enviado! Não se esqueça de salvar as alterações.",
    preview: "Preview",
    studioBadge: "Community Studio",
    studioTitle: "Editar template da comunidade",
    studioDescription:
      "Personalize o template que você está usando sem alterar o original aprovado pela comunidade.",
    noCommunityTemplate:
      "Você ainda não está usando um template da comunidade.",
    noCommunityTemplateDesc:
      "Escolha um template aprovado na aba Comunidade para liberar esse editor.",
    loadEditorError: "❌ Erro ao carregar editor: ",
    saveStudio: "Salvar edição",
    savingStudio: "Salvando edição...",
    studioSaved: "✅ Edição pessoal salva no seu perfil!",
    studioSaveError: "❌ Erro ao salvar edição: ",
    resetStudio: "Resetar para original",
    resetConfirm:
      "Resetar sua edição pessoal e voltar para o template original?",
    resetDone: "✅ Edição resetada para o original.",
    resetError: "❌ Erro ao resetar edição: ",
    loadOriginal: "Carregar original",
    editedCopy: "cópia pessoal",
    originalTemplate: "template original",
    by: "por",
    tabs: {
      visual: "Visual",
      media: "Mídia",
      buttons: "Botões",
      music: "Música",
      advanced: "Código",
    },
    fields: {
      primaryColor: "Cor principal",
      secondaryColor: "Cor secundária",
      textColor: "Cor do texto",
      backgroundColor: "Cor do fundo",
      cardRadius: "Arredondamento do card",
      cardBlur: "Blur do card",
      glowIntensity: "Intensidade do glow",
      avatarSize: "Tamanho do avatar",
      backgroundImage: "Imagem de fundo",
      backgroundVideo: "Vídeo de fundo",
      backgroundOpacity: "Opacidade do fundo",
      buttonStyle: "Estilo dos botões",
      buttonRadius: "Arredondamento dos botões",
      buttonGlow: "Glow nos botões",
      showIcons: "Mostrar ícones",
      buttonSize: "Tamanho dos botões",
      showMusic: "Mostrar player de música",
      musicUrl: "Link da música",
      musicTitle: "Nome da música",
      musicPosition: "Posição do player",
      showCover: "Mostrar capa",
      coverImage: "Imagem da capa",
      showLyrics: "Preparar área de letra",
    },
    options: {
      glass: "Glass",
      solid: "Sólido",
      outline: "Contorno",
      minimal: "Minimal",
      sm: "Pequeno",
      md: "Médio",
      lg: "Grande",
      top: "Topo",
      bottom: "Embaixo",
      left: "Esquerda",
      right: "Direita",
    },
    advancedWarning:
      "Modo avançado: HTML/CSS/JS mexem diretamente na sua cópia pessoal. Use com cuidado.",
  },
  en: {
    badge: "Appearance Lab",
    title: "Profile appearance",
    subtitle:
      "Choose your template, effect, cursor, and customize community templates with buttons or advanced code.",
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
    cursorTitle: "Custom cursor",
    cursorDescription:
      "Upload a file or add an image link to use as a custom cursor on your profile.",
    cursorUrl: "Cursor image URL",
    cursorHelp:
      "Recommended: small PNG, WEBP, GIF or CUR. Mandatory maximum size: 32x32 pixels.",
    clearCursor: "Clear cursor",
    uploadCursor: "Upload file",
    uploadingCursor: "Uploading...",
    cursorSizeError: "Error: Cursor must be at most 32x32 pixels. Your image is {width}x{height}px.",
    cursorUploadSuccess: "✅ Cursor uploaded! Don't forget to save changes.",
    preview: "Preview",
    studioBadge: "Community Studio",
    studioTitle: "Edit community template",
    studioDescription:
      "Customize the community template you are using without changing the approved original.",
    noCommunityTemplate: "You are not using a community template yet.",
    noCommunityTemplateDesc:
      "Choose an approved template in the Community tab to unlock this editor.",
    loadEditorError: "❌ Error loading editor: ",
    saveStudio: "Save edit",
    savingStudio: "Saving edit...",
    studioSaved: "✅ Personal edit saved to your profile!",
    studioSaveError: "❌ Error saving edit: ",
    resetStudio: "Reset to original",
    resetConfirm:
      "Reset your personal edit and go back to the original template?",
    resetDone: "✅ Edit reset to original.",
    resetError: "❌ Error resetting edit: ",
    loadOriginal: "Load original",
    editedCopy: "personal copy",
    originalTemplate: "original template",
    by: "by",
    tabs: {
      visual: "Visual",
      media: "Media",
      buttons: "Buttons",
      music: "Music",
      advanced: "Code",
    },
    fields: {
      primaryColor: "Primary color",
      secondaryColor: "Secondary color",
      textColor: "Text color",
      backgroundColor: "Background color",
      cardRadius: "Card radius",
      cardBlur: "Card blur",
      glowIntensity: "Glow intensity",
      avatarSize: "Avatar size",
      backgroundImage: "Background image",
      backgroundVideo: "Background video",
      backgroundOpacity: "Background opacity",
      buttonStyle: "Button style",
      buttonRadius: "Button radius",
      buttonGlow: "Button glow",
      showIcons: "Show icons",
      buttonSize: "Button size",
      showMusic: "Show music player",
      musicUrl: "Music link",
      musicTitle: "Song title",
      musicPosition: "Player position",
      showCover: "Show cover",
      coverImage: "Cover image",
      showLyrics: "Prepare lyrics area",
    },
    options: {
      glass: "Glass",
      solid: "Solid",
      outline: "Outline",
      minimal: "Minimal",
      sm: "Small",
      md: "Medium",
      lg: "Large",
      top: "Top",
      bottom: "Bottom",
      left: "Left",
      right: "Right",
    },
    advancedWarning:
      "Advanced mode: HTML/CSS/JS directly change your personal copy. Use carefully.",
  },
  es: {
    badge: "Appearance Lab",
    title: "Apariencia del perfil",
    subtitle:
      "Elige el template, efecto, cursor y personaliza templates de la comunidad con botones o código avanzado.",
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
    cursorTitle: "Cursor personalizado",
    cursorDescription:
      "Sube un archivo o coloca el link de una imagen para usar como cursor personalizado en tu perfil.",
    cursorUrl: "URL de imagen del cursor",
    cursorHelp:
      "Recomendado: PNG, WEBP, GIF o CUR pequeño. Tamaño máximo obligatorio: 32x32 píxeles.",
    clearCursor: "Limpiar cursor",
    uploadCursor: "Subir archivo",
    uploadingCursor: "Subiendo...",
    cursorSizeError: "Error: El cursor debe tener un máximo de 32x32 píxeles. Tu imagen es de {width}x{height}px.",
    cursorUploadSuccess: "✅ ¡Cursor subido! No olvides guardar los cambios.",
    preview: "Preview",
    studioBadge: "Community Studio",
    studioTitle: "Editar template de la comunidad",
    studioDescription:
      "Personaliza el template de la comunidad que estás usando sin cambiar el original aprobado.",
    noCommunityTemplate: "Aún no estás usando un template de la comunidad.",
    noCommunityTemplateDesc:
      "Elige un template aprobado en la pestaña Comunidad para desbloquear este editor.",
    loadEditorError: "❌ Error al cargar editor: ",
    saveStudio: "Guardar edición",
    savingStudio: "Guardando edición...",
    studioSaved: "✅ Edición personal guardada en tu perfil!",
    studioSaveError: "❌ Error al guardar edición: ",
    resetStudio: "Resetear al original",
    resetConfirm:
      "¿Resetear tu edición personal y volver al template original?",
    resetDone: "✅ Edición reseteada al original.",
    resetError: "❌ Error al resetear edición: ",
    loadOriginal: "Cargar original",
    editedCopy: "copia personal",
    originalTemplate: "template original",
    by: "por",
    tabs: {
      visual: "Visual",
      media: "Medios",
      buttons: "Botones",
      music: "Música",
      advanced: "Código",
    },
    fields: {
      primaryColor: "Color principal",
      secondaryColor: "Color secundario",
      textColor: "Color del texto",
      backgroundColor: "Color del fondo",
      cardRadius: "Borde del card",
      cardBlur: "Blur del card",
      glowIntensity: "Intensidad del glow",
      avatarSize: "Tamaño del avatar",
      backgroundImage: "Imagen de fondo",
      backgroundVideo: "Video de fondo",
      backgroundOpacity: "Opacidad del fondo",
      buttonStyle: "Estilo de botones",
      buttonRadius: "Borde de botones",
      buttonGlow: "Glow en botones",
      showIcons: "Mostrar íconos",
      buttonSize: "Tamaño de botones",
      showMusic: "Mostrar player de música",
      musicUrl: "Link de música",
      musicTitle: "Nombre de la canción",
      musicPosition: "Posición del player",
      showCover: "Mostrar portada",
      coverImage: "Imagen de portada",
      showLyrics: "Preparar área de letra",
    },
    options: {
      glass: "Glass",
      solid: "Sólido",
      outline: "Contorno",
      minimal: "Minimal",
      sm: "Pequeño",
      md: "Medio",
      lg: "Grande",
      top: "Arriba",
      bottom: "Abajo",
      left: "Izquierda",
      right: "Derecha",
    },
    advancedWarning:
      "Modo avanzado: HTML/CSS/JS cambian directamente tu copia personal. Úsalo con cuidado.",
  },
};

const inputClass =
  "w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition focus:border-purple-400/60 focus:bg-black/45 focus:shadow-[0_0_0_4px_rgba(168,85,247,0.12)]";

const codeAreaClass =
  "min-h-[320px] w-full resize-y rounded-b-3xl border-0 bg-[#050505] px-4 py-4 font-mono text-xs leading-relaxed text-white outline-none placeholder-white/20";

const mergeStudioSettings = (
  incoming?: Partial<TemplateStudioSettings> | null,
): TemplateStudioSettings => ({
  ...defaultStudioSettings,
  ...(incoming || {}),
});

export const AppearanceSettings = () => {
  const { language } = useI18n();

  const [selectedTemplate, setSelectedTemplate] = useState("neon-purple");
  const [selectedEffect, setSelectedEffect] = useState("none");
  const [plan, setPlan] = useState<"free" | "pro">("free");
  const [ownerBypass, setOwnerBypass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [customCursorUrl, setCustomCursorUrl] = useState("");
  const [uploadingCursor, setUploadingCursor] = useState(false);

  const [studioLoading, setStudioLoading] = useState(false);
  const [studioSaving, setStudioSaving] = useState(false);
  const [studioMessage, setStudioMessage] = useState("");
  const [studioTab, setStudioTab] = useState<StudioTab>("visual");
  const [communityEditor, setCommunityEditor] =
    useState<CommunityEditorResponse | null>(null);
  const [studioSettings, setStudioSettings] = useState<TemplateStudioSettings>(
    defaultStudioSettings,
  );
  const [htmlCode, setHtmlCode] = useState("");
  const [cssCode, setCssCode] = useState("");
  const [jsCode, setJsCode] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "https://api.arcxnjo.com.br";
  const text = copy[language];

  const canUseProTemplates = plan === "pro" || ownerBypass;
  const hasActiveCommunityTemplate = Boolean(
    communityEditor?.hasActiveTemplate && communityEditor.template,
  );

  const updateStudioSetting = <K extends keyof TemplateStudioSettings>(
    key: K,
    value: TemplateStudioSettings[K],
  ) => {
    setStudioSettings((prev) => ({ ...prev, [key]: value }));
  };

  const fetchCommunityEditor = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      setStudioLoading(true);
      setStudioMessage("");

      const response = await axios.get<CommunityEditorResponse>(
        `${API_URL}/api/profile/community-template/editor`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const editor = response.data;
      setCommunityEditor(editor);

      if (editor.hasActiveTemplate && editor.template && editor.override) {
        setHtmlCode(
          editor.override.html_code || editor.template.original_html_code || "",
        );
        setCssCode(
          editor.override.css_code || editor.template.original_css_code || "",
        );
        setJsCode(
          editor.override.js_code || editor.template.original_js_code || "",
        );
        setStudioSettings(mergeStudioSettings(editor.override.settings));
      } else {
        setHtmlCode("");
        setCssCode("");
        setJsCode("");
        setStudioSettings(defaultStudioSettings);
      }
    } catch (error: any) {
      setStudioMessage(
        text.loadEditorError + (error.response?.data?.error || error.message),
      );
    } finally {
      setStudioLoading(false);
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

        const template = response.data.profile_template || "neon-purple";
        setSelectedTemplate(template);
        setSelectedEffect(response.data.profile_effect || "none");
        setPlan(response.data.plan === "pro" ? "pro" : "free");
        setOwnerBypass(Boolean(response.data.owner_bypass));
        setCustomCursorUrl(response.data.custom_cursor_url || "");

        if (template === "community") {
          await fetchCommunityEditor();
        }
      } catch (error) {
        console.error("Error fetching appearance:", error);
      }
    };

    fetchAppearance();
  }, [API_URL]);

  useEffect(() => {
    if (selectedTemplate === "community") {
      fetchCommunityEditor();
    }
  }, [selectedTemplate]);

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
        },
      );

      setMessage(text.success);
      setTimeout(() => setMessage(""), 3000);

      if (selectedTemplate === "community") {
        await fetchCommunityEditor();
      }
    } catch (error: any) {
      setMessage(text.error + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCursorUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Carrega e valida as dimensões da imagem antes de fazer o upload
    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = async () => {
      if (img.width > 32 || img.height > 32) {
        const formattedError = text.cursorSizeError
          .replace("{width}", String(img.width))
          .replace("{height}", String(img.height));
        alert(formattedError);
        e.target.value = ""; // Limpa a seleção do arquivo
        return;
      }

      const formData = new FormData();
      formData.append("file", file); // O backend de upload genérico espera a chave 'file'

      try {
        setUploadingCursor(true);
        const token = localStorage.getItem("token");

        const response = await axios.post(`${API_URL}/api/upload`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });

        setCustomCursorUrl(response.data.url);
        alert(text.cursorUploadSuccess);
      } catch (err: any) {
        console.error("Error uploading cursor:", err);
        alert(err.response?.data?.error || "Failed to upload cursor file.");
      } finally {
        setUploadingCursor(false);
        e.target.value = ""; // Limpa a seleção do arquivo
      }
    };
  };

  const handleSaveStudio = async () => {
    if (!hasActiveCommunityTemplate) return;

    try {
      const token = localStorage.getItem("token");
      setStudioSaving(true);
      setStudioMessage("");

      await axios.put(
        `${API_URL}/api/profile/community-template/editor`,
        {
          htmlCode,
          cssCode,
          jsCode,
          settings: studioSettings,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setStudioMessage(text.studioSaved);
      await fetchCommunityEditor();
    } catch (error: any) {
      setStudioMessage(
        text.studioSaveError + (error.response?.data?.error || error.message),
      );
    } finally {
      setStudioSaving(false);
    }
  };

  const handleResetStudio = async () => {
    if (!hasActiveCommunityTemplate) return;
    if (!window.confirm(text.resetConfirm)) return;

    try {
      const token = localStorage.getItem("token");
      setStudioSaving(true);
      setStudioMessage("");

      await axios.delete(`${API_URL}/api/profile/community-template/editor`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setStudioMessage(text.resetDone);
      await fetchCommunityEditor();
    } catch (error: any) {
      setStudioMessage(
        text.resetError + (error.response?.data?.error || error.message),
      );
    } finally {
      setStudioSaving(false);
    }
  };

  const handleLoadOriginal = () => {
    if (!communityEditor?.template) return;

    setHtmlCode(communityEditor.template.original_html_code || "");
    setCssCode(communityEditor.template.original_css_code || "");
    setJsCode(communityEditor.template.original_js_code || "");
    setStudioSettings(defaultStudioSettings);
  };

  const selectedTemplateData =
    templates.find((template) => template.id === selectedTemplate) ||
    templates[0];

  const selectedEffectData =
    effects.find((effect) => effect.id === selectedEffect) || effects[0];

  const studioTabs: { id: StudioTab; label: string; icon: IconType }[] = [
    { id: "visual", label: text.tabs.visual, icon: FaPaintBrush },
    { id: "media", label: text.tabs.media, icon: FaImage },
    { id: "buttons", label: text.tabs.buttons, icon: FaSlidersH },
    { id: "music", label: text.tabs.music, icon: FaMusic },
    { id: "advanced", label: text.tabs.advanced, icon: FaCode },
  ];

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
        <div className="mb-5 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-white/70">
            <FaMousePointer />
          </div>

          <div>
            <h4 className="text-lg font-black text-white">
              {text.cursorTitle}
            </h4>
            <p className="mt-1 text-sm text-white/40">
              {text.cursorDescription}
            </p>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="w-full">
            <label className="mb-2 block text-sm font-semibold text-white/85">
              {text.cursorUrl}
            </label>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={customCursorUrl}
                onChange={(e) => setCustomCursorUrl(e.target.value)}
                placeholder="https://site.com/cursor.png"
                className={inputClass}
              />

              <input
                type="file"
                id="cursor-file-upload-input"
                accept="image/png, image/webp, image/gif, image/x-icon"
                className="hidden"
                onChange={handleCursorUpload}
              />

              <button
                type="button"
                onClick={() => document.getElementById("cursor-file-upload-input")?.click()}
                disabled={uploadingCursor}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-purple-600/20 border border-purple-500/30 px-5 py-3 text-sm font-bold text-purple-200 transition hover:bg-purple-500/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {uploadingCursor ? <FaSpinner className="animate-spin" /> : <FaImage />}
                {uploadingCursor ? text.uploadingCursor : text.uploadCursor}
              </button>
            </div>

            <p className="mt-2 text-xs text-white/35">{text.cursorHelp}</p>
          </div>

          <button
            type="button"
            onClick={() => setCustomCursorUrl("")}
            className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm font-bold text-white/55 transition hover:border-red-400/25 hover:bg-red-500/10 hover:text-red-200 w-full lg:w-auto"
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
                  <p className="text-sm font-black text-white">
                    {template.name}
                  </p>

                  <p className="mt-1 text-xs leading-relaxed text-white/45">
                    {isLocked ? text.locked : template.description[language]}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-white/10 bg-black/25">
        <div className="relative overflow-hidden border-b border-white/10 bg-gradient-to-br from-cyan-500/10 via-black/30 to-purple-500/10 p-5">
          <div className="absolute right-[-90px] top-[-90px] h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-cyan-200">
                <FaCode />
                {text.studioBadge}
              </div>

              <h4 className="text-2xl font-black text-white">
                {text.studioTitle}
              </h4>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/45">
                {text.studioDescription}
              </p>
            </div>

            {hasActiveCommunityTemplate && communityEditor?.template && (
              <div className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white/55">
                <span className="font-bold text-white">
                  {communityEditor.template.name}
                </span>{" "}
                <span className="text-white/30">·</span> {text.by} @
                {communityEditor.template.creator_username || "unknown"}
                <div className="mt-1 text-xs text-cyan-200/70">
                  {communityEditor.override?.exists
                    ? text.editedCopy
                    : text.originalTemplate}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-5">
          {studioMessage && (
            <div
              className={`mb-5 rounded-2xl border px-4 py-3 text-sm font-semibold ${
                studioMessage.includes("✅")
                  ? "border-green-400/20 bg-green-500/10 text-green-200"
                  : "border-red-400/20 bg-red-500/10 text-red-200"
              }`}
            >
              {studioMessage}
            </div>
          )}

          {studioLoading ? (
            <div className="grid min-h-[280px] place-items-center rounded-3xl border border-white/10 bg-black/30 text-white/45">
              <FaSpinner className="mb-3 animate-spin text-2xl" />
              {text.saving}
            </div>
          ) : !hasActiveCommunityTemplate ? (
            <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.03] p-8 text-center">
              <p className="text-lg font-black text-white">
                {text.noCommunityTemplate}
              </p>
              <p className="mx-auto mt-2 max-w-xl text-sm text-white/45">
                {text.noCommunityTemplateDesc}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 2xl:grid-cols-[1fr_520px]">
              <div className="space-y-5">
                <div className="grid gap-2 rounded-3xl border border-white/10 bg-black/30 p-2 sm:grid-cols-5">
                  {studioTabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = studioTab === tab.id;

                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setStudioTab(tab.id)}
                        className={`inline-flex items-center justify-center gap-2 rounded-2xl px-3 py-3 text-sm font-black transition ${
                          isActive
                            ? "bg-white text-black shadow-[0_0_24px_rgba(255,255,255,0.16)]"
                            : "text-white/45 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <Icon />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {studioTab === "visual" && (
                  <div className="grid gap-5 rounded-3xl border border-white/10 bg-black/25 p-5 md:grid-cols-2">
                    <ColorField
                      label={text.fields.primaryColor}
                      value={studioSettings.primaryColor}
                      onChange={(value) =>
                        updateStudioSetting("primaryColor", value)
                      }
                    />
                    <ColorField
                      label={text.fields.secondaryColor}
                      value={studioSettings.secondaryColor}
                      onChange={(value) =>
                        updateStudioSetting("secondaryColor", value)
                      }
                    />
                    <ColorField
                      label={text.fields.textColor}
                      value={studioSettings.textColor}
                      onChange={(value) =>
                        updateStudioSetting("textColor", value)
                      }
                    />
                    <ColorField
                      label={text.fields.backgroundColor}
                      value={studioSettings.backgroundColor}
                      onChange={(value) =>
                        updateStudioSetting("backgroundColor", value)
                      }
                    />
                    <RangeField
                      label={text.fields.cardRadius}
                      value={studioSettings.cardRadius}
                      min={0}
                      max={56}
                      suffix="px"
                      onChange={(value) =>
                        updateStudioSetting("cardRadius", value)
                      }
                    />
                    <RangeField
                      label={text.fields.cardBlur}
                      value={studioSettings.cardBlur}
                      min={0}
                      max={40}
                      suffix="px"
                      onChange={(value) =>
                        updateStudioSetting("cardBlur", value)
                      }
                    />
                    <RangeField
                      label={text.fields.glowIntensity}
                      value={studioSettings.glowIntensity}
                      min={0}
                      max={80}
                      suffix="%"
                      onChange={(value) =>
                        updateStudioSetting("glowIntensity", value)
                      }
                    />
                    <RangeField
                      label={text.fields.avatarSize}
                      value={studioSettings.avatarSize}
                      min={72}
                      max={220}
                      suffix="px"
                      onChange={(value) =>
                        updateStudioSetting("avatarSize", value)
                      }
                    />
                  </div>
                )}

                {studioTab === "media" && (
                  <div className="grid gap-5 rounded-3xl border border-white/10 bg-black/25 p-5">
                    <TextField
                      label={text.fields.backgroundImage}
                      value={studioSettings.backgroundImage}
                      placeholder="https://..."
                      onChange={(value) =>
                        updateStudioSetting("backgroundImage", value)
                      }
                    />
                    <TextField
                      label={text.fields.backgroundVideo}
                      value={studioSettings.backgroundVideo}
                      placeholder="https://...mp4"
                      onChange={(value) =>
                        updateStudioSetting("backgroundVideo", value)
                      }
                    />
                    <RangeField
                      label={text.fields.backgroundOpacity}
                      value={studioSettings.backgroundOpacity}
                      min={0}
                      max={100}
                      suffix="%"
                      onChange={(value) =>
                        updateStudioSetting("backgroundOpacity", value)
                      }
                    />
                  </div>
                )}

                {studioTab === "buttons" && (
                  <div className="grid gap-5 rounded-3xl border border-white/10 bg-black/25 p-5 md:grid-cols-2">
                    <SelectField
                      label={text.fields.buttonStyle}
                      value={studioSettings.buttonStyle}
                      options={[
                        ["glass", text.options.glass],
                        ["solid", text.options.solid],
                        ["outline", text.options.outline],
                        ["minimal", text.options.minimal],
                      ]}
                      onChange={(value) =>
                        updateStudioSetting(
                          "buttonStyle",
                          value as TemplateStudioSettings["buttonStyle"],
                        )
                      }
                    />
                    <SelectField
                      label={text.fields.buttonSize}
                      value={studioSettings.buttonSize}
                      options={[
                        ["sm", text.options.sm],
                        ["md", text.options.md],
                        ["lg", text.options.lg],
                      ]}
                      onChange={(value) =>
                        updateStudioSetting(
                          "buttonSize",
                          value as TemplateStudioSettings["buttonSize"],
                        )
                      }
                    />
                    <RangeField
                      label={text.fields.buttonRadius}
                      value={studioSettings.buttonRadius}
                      min={0}
                      max={42}
                      suffix="px"
                      onChange={(value) =>
                        updateStudioSetting("buttonRadius", value)
                      }
                    />
                    <ToggleField
                      label={text.fields.buttonGlow}
                      checked={studioSettings.buttonGlow}
                      onChange={(value) =>
                        updateStudioSetting("buttonGlow", value)
                      }
                    />
                    <ToggleField
                      label={text.fields.showIcons}
                      checked={studioSettings.showIcons}
                      onChange={(value) =>
                        updateStudioSetting("showIcons", value)
                      }
                    />
                  </div>
                )}

                {studioTab === "music" && (
                  <div className="grid gap-5 rounded-3xl border border-white/10 bg-black/25 p-5 md:grid-cols-2">
                    <ToggleField
                      label={text.fields.showMusic}
                      checked={studioSettings.showMusic}
                      onChange={(value) =>
                        updateStudioSetting("showMusic", value)
                      }
                    />
                    <SelectField
                      label={text.fields.musicPosition}
                      value={studioSettings.musicPosition}
                      options={[
                        ["top", text.options.top],
                        ["bottom", text.options.bottom],
                        ["left", text.options.left],
                        ["right", text.options.right],
                      ]}
                      onChange={(value) =>
                        updateStudioSetting(
                          "musicPosition",
                          value as TemplateStudioSettings["musicPosition"],
                        )
                      }
                    />
                    <TextField
                      label={text.fields.musicTitle}
                      value={studioSettings.musicTitle}
                      placeholder="staying alive"
                      onChange={(value) =>
                        updateStudioSetting("musicTitle", value)
                      }
                    />
                    <TextField
                      label={text.fields.musicUrl}
                      value={studioSettings.musicUrl}
                      placeholder="https://...mp3"
                      onChange={(value) =>
                        updateStudioSetting("musicUrl", value)
                      }
                    />
                    <ToggleField
                      label={text.fields.showCover}
                      checked={studioSettings.showCover}
                      onChange={(value) =>
                        updateStudioSetting("showCover", value)
                      }
                    />
                    <TextField
                      label={text.fields.coverImage}
                      value={studioSettings.coverImage}
                      placeholder="https://...jpg"
                      onChange={(value) =>
                        updateStudioSetting("coverImage", value)
                      }
                    />
                    <ToggleField
                      label={text.fields.showLyrics}
                      checked={studioSettings.showLyrics}
                      onChange={(value) =>
                        updateStudioSetting("showLyrics", value)
                      }
                    />
                  </div>
                )}

                {studioTab === "advanced" && (
                  <div className="space-y-5">
                    <div className="rounded-2xl border border-yellow-400/20 bg-yellow-500/10 px-4 py-3 text-sm font-semibold text-yellow-100">
                      {text.advancedWarning}
                    </div>
                    <CodeEditor
                      label="index.html"
                      value={htmlCode}
                      onChange={setHtmlCode}
                    />
                    <CodeEditor
                      label="style.css"
                      value={cssCode}
                      onChange={setCssCode}
                    />
                    <CodeEditor
                      label="script.js"
                      value={jsCode}
                      onChange={setJsCode}
                    />
                  </div>
                )}

                <div className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-black/25 p-4 sm:flex-row sm:justify-between">
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={handleLoadOriginal}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm font-bold text-white/60 transition hover:border-cyan-400/25 hover:bg-cyan-500/10 hover:text-cyan-100"
                    >
                      <FaSyncAlt />
                      {text.loadOriginal}
                    </button>

                    <button
                      type="button"
                      onClick={handleResetStudio}
                      disabled={studioSaving}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200 transition hover:border-red-300/35 hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <FaUndo />
                      {text.resetStudio}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveStudio}
                    disabled={studioSaving}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-purple-600 px-5 py-3 text-sm font-bold text-white shadow-[0_0_28px_rgba(147,51,234,0.22)] transition hover:-translate-y-0.5 hover:bg-purple-500 hover:shadow-[0_0_38px_rgba(147,51,234,0.34)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {studioSaving ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      <FaSave />
                    )}
                    {studioSaving ? text.savingStudio : text.saveStudio}
                  </button>
                </div>
              </div>

              <aside className="space-y-4">
                <div className="sticky top-24 rounded-3xl border border-white/10 bg-black/25 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-sm font-black text-white">
                      {text.preview}
                    </p>
                    <span className="rounded-full border border-green-400/20 bg-green-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-green-200">
                      sandbox
                    </span>
                  </div>

                  <CommunityTemplatePreview
                    htmlCode={htmlCode}
                    cssCode={cssCode}
                    jsCode={jsCode}
                    height="560px"
                    templateSettings={studioSettings}
                  />
                </div>
              </aside>
            </div>
          )}
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

type FieldProps = {
  label: string;
};

const ColorField = ({
  label,
  value,
  onChange,
}: FieldProps & { value: string; onChange: (value: string) => void }) => (
  <label className="block">
    <span className="mb-2 block text-sm font-semibold text-white/85">
      {label}
    </span>
    <div className="flex gap-3">
      <input
        type="color"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-14 shrink-0 cursor-pointer rounded-2xl border border-white/10 bg-black/35 p-1"
      />
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={inputClass}
      />
    </div>
  </label>
);

const RangeField = ({
  label,
  value,
  min,
  max,
  suffix,
  onChange,
}: FieldProps & {
  value: number;
  min: number;
  max: number;
  suffix: string;
  onChange: (value: number) => void;
}) => (
  <label className="block">
    <span className="mb-2 flex items-center justify-between gap-3 text-sm font-semibold text-white/85">
      {label}
      <span className="text-xs text-white/35">
        {value}
        {suffix}
      </span>
    </span>
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      className="w-full accent-purple-500"
    />
  </label>
);

const TextField = ({
  label,
  value,
  placeholder,
  onChange,
}: FieldProps & {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) => (
  <label className="block">
    <span className="mb-2 block text-sm font-semibold text-white/85">
      {label}
    </span>
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className={inputClass}
    />
  </label>
);

const SelectField = ({
  label,
  value,
  options,
  onChange,
}: FieldProps & {
  value: string;
  options: [string, string][];
  onChange: (value: string) => void;
}) => (
  <label className="block">
    <span className="mb-2 block text-sm font-semibold text-white/85">
      {label}
    </span>
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={inputClass}
    >
      {options.map(([optionValue, optionLabel]) => (
        <option key={optionValue} value={optionValue}>
          {optionLabel}
        </option>
      ))}
    </select>
  </label>
);

const ToggleField = ({
  label,
  checked,
  onChange,
}: FieldProps & { checked: boolean; onChange: (value: boolean) => void }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`flex items-center justify-between gap-4 rounded-2xl border px-4 py-3 text-left transition ${
      checked
        ? "border-purple-400/40 bg-purple-500/15 text-white"
        : "border-white/10 bg-black/30 text-white/55 hover:border-white/20"
    }`}
  >
    <span className="text-sm font-semibold">{label}</span>
    <span
      className={`relative h-6 w-11 rounded-full transition ${
        checked ? "bg-purple-500" : "bg-white/15"
      }`}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
          checked ? "left-6" : "left-1"
        }`}
      />
    </span>
  </button>
);

const CodeEditor = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) => (
  <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#050505]">
    <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-white/50">
        <FaCode />
        {label}
      </div>
      <div className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-yellow-300/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-green-400/80" />
      </div>
    </div>
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      spellCheck={false}
      className={codeAreaClass}
    />
  </div>
);
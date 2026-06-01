import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import {
  FaCheck,
  FaCode,
  FaEye,
  FaImage,
  FaPaperPlane,
  FaPlus,
  FaSpinner,
  FaUsers,
} from "react-icons/fa";
import { CommunityTemplatePreview } from "./CommunityTemplatePreview";

type CommunityTemplate = {
  id: number;
  name: string;
  description: string;
  preview_image: string;
  html_code: string;
  css_code: string;
  js_code: string;
  status: "pending" | "approved" | "rejected";
  rejection_reason?: string;
  is_public: boolean;
  created_at: string;
  approved_at?: string | null;
  creator_username?: string;
};

const statusClass: Record<string, string> = {
  pending: "border-yellow-400/20 bg-yellow-500/10 text-yellow-200",
  approved: "border-green-400/20 bg-green-500/10 text-green-200",
  rejected: "border-red-400/20 bg-red-500/10 text-red-200",
};

export const CommunityTemplatesSettings = () => {
  const API_URL = import.meta.env.VITE_API_URL || "https://api.arcxnjo.com.br";

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [htmlCode, setHtmlCode] = useState(
    `<main class="profile">
  <img class="avatar" src="https://cdn-icons-png.flaticon.com/512/219/219986.png" />
  <h1>Community Template</h1>
  <p>Edit this HTML and CSS to create your profile style.</p>
</main>`
  );
  const [cssCode, setCssCode] = useState(
    `.profile {
  min-height: 100vh;
  display: grid;
  place-items: center;
  text-align: center;
  padding: 32px;
  background:
    radial-gradient(circle at top, rgba(168, 85, 247, .35), transparent 35%),
    linear-gradient(135deg, #050505, #160027);
}

.avatar {
  width: 128px;
  height: 128px;
  border-radius: 999px;
  object-fit: cover;
  border: 3px solid rgba(255,255,255,.25);
  box-shadow: 0 0 40px rgba(255,255,255,.18);
}

h1 {
  margin: 20px 0 8px;
  font-size: clamp(32px, 6vw, 64px);
}

p {
  color: rgba(255,255,255,.65);
}`
  );
  const [jsCode, setJsCode] = useState("");
  const [myTemplates, setMyTemplates] = useState<CommunityTemplate[]>([]);
  const [publicTemplates, setPublicTemplates] = useState<CommunityTemplate[]>([]);
  const [currentCommunityTemplateId, setCurrentCommunityTemplateId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [usingTemplateId, setUsingTemplateId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [showPreview, setShowPreview] = useState(true);

  const token = localStorage.getItem("token");

  const fetchMyTemplates = async () => {
    try {
      setFetching(true);

      const response = await axios.get(`${API_URL}/api/community/templates/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMyTemplates(response.data || []);
    } catch (error) {
      console.error("Community templates fetch error:", error);
    } finally {
      setFetching(false);
    }
  };

  const fetchPublicTemplates = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/community/templates/public`);
      setPublicTemplates(response.data || []);
    } catch (error) {
      console.error("Public community templates fetch error:", error);
    }
  };

  const fetchCurrentProfile = async () => {
    try {
      if (!token) return;

      const response = await axios.get(`${API_URL}/api/profile/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const templateId = Number(response.data.community_template_id || 0);
      setCurrentCommunityTemplateId(templateId > 0 ? templateId : null);
    } catch (error) {
      console.error("Current community template fetch error:", error);
    }
  };

  useEffect(() => {
    fetchPublicTemplates();

    if (token) {
      fetchMyTemplates();
      fetchCurrentProfile();
    }
  }, [API_URL]);

  const canSubmit = useMemo(() => {
    return name.trim().length >= 3 && htmlCode.trim().length > 0;
  }, [name, htmlCode]);

  const handleSubmit = async () => {
    if (!canSubmit) {
      setMessage("❌ Dê um nome e coloque pelo menos o HTML do template.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      await axios.post(
        `${API_URL}/api/community/templates`,
        {
          name: name.trim(),
          description: description.trim(),
          previewImage: previewImage.trim(),
          htmlCode,
          cssCode,
          jsCode,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage("✅ Template enviado para aprovação!");
      setName("");
      setDescription("");
      setPreviewImage("");
      setJsCode("");
      await fetchMyTemplates();
    } catch (error: any) {
      setMessage(
        "❌ Erro ao enviar: " + (error.response?.data?.error || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUseTemplate = async (template: CommunityTemplate) => {
    try {
      setUsingTemplateId(template.id);
      setMessage("");

      await axios.put(
        `${API_URL}/api/profile/community-template`,
        { templateId: template.id },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setCurrentCommunityTemplateId(template.id);
      setMessage(`✅ Template "${template.name}" aplicado no seu perfil!`);
    } catch (error: any) {
      setMessage(
        "❌ Erro ao usar template: " +
          (error.response?.data?.error || error.message)
      );
    } finally {
      setUsingTemplateId(null);
    }
  };

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-purple-600/20 via-black/30 to-pink-600/10 p-5 md:p-6">
        <div className="absolute right-[-80px] top-[-80px] h-52 w-52 rounded-full bg-purple-500/20 blur-3xl" />

        <div className="relative">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-purple-200">
            <FaUsers />
            Comunidade
          </div>

          <h3 className="text-2xl font-black text-white">
            Templates da comunidade
          </h3>

          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/50">
            Use templates aprovados no seu perfil ou envie seu próprio HTML, CSS
            e JavaScript para aprovação.
          </p>
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

      <section className="rounded-3xl border border-white/10 bg-black/25 p-5">
        <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <h4 className="text-xl font-black text-white">
              Galeria aprovada
            </h4>
            <p className="mt-1 text-sm text-white/40">
              Templates liberados aparecem aqui depois da aprovação.
            </p>
          </div>

          <span className="w-fit rounded-full border border-white/10 bg-white/[0.035] px-3 py-1 text-xs font-bold text-white/45">
            {publicTemplates.length} público(s)
          </span>
        </div>

        {publicTemplates.length > 0 ? (
          <div className="grid gap-5 xl:grid-cols-2">
            {publicTemplates.map((template) => {
              const isCurrent = currentCommunityTemplateId === template.id;
              const isLoading = usingTemplateId === template.id;

              return (
                <article
                  key={template.id}
                  className="overflow-hidden rounded-3xl border border-white/10 bg-black/30"
                >
                  {template.preview_image ? (
                    <img
                      src={template.preview_image}
                      alt={template.name}
                      className="h-48 w-full object-cover"
                    />
                  ) : (
                    <CommunityTemplatePreview
                      htmlCode={template.html_code}
                      cssCode={template.css_code}
                      jsCode={template.js_code}
                      height="220px"
                    />
                  )}

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h5 className="truncate text-lg font-black text-white">
                          {template.name}
                        </h5>
                        <p className="mt-1 text-xs text-white/35">
                          por @{template.creator_username || "unknown"}
                        </p>
                      </div>

                      {isCurrent && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-green-400/20 bg-green-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-green-200">
                          <FaCheck />
                          usando
                        </span>
                      )}
                    </div>

                    {template.description && (
                      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-white/55">
                        {template.description}
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={() => handleUseTemplate(template)}
                      disabled={isLoading || isCurrent}
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-purple-600 px-4 py-3 text-sm font-bold text-white shadow-[0_0_24px_rgba(147,51,234,0.2)] transition hover:-translate-y-0.5 hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isLoading ? (
                        <FaSpinner className="animate-spin" />
                      ) : isCurrent ? (
                        <FaCheck />
                      ) : (
                        <FaEye />
                      )}
                      {isCurrent ? "Template em uso" : "Usar no meu perfil"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-5 text-sm text-white/35">
            Ainda não tem template aprovado. Quando você aprovar um template, ele
            aparece aqui para todo mundo usar.
          </p>
        )}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="space-y-5 rounded-3xl border border-white/10 bg-black/25 p-5">
          <div>
            <h4 className="text-xl font-black text-white">
              Enviar novo template
            </h4>
            <p className="mt-1 text-sm text-white/40">
              Seu envio fica pendente até ser aprovado.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-white/85">
                Nome do template
              </label>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={80}
                placeholder="Dark Angel"
                className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition focus:border-purple-400/60 focus:bg-black/45 focus:shadow-[0_0_0_4px_rgba(168,85,247,0.12)]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-white/85">
                Preview image URL
              </label>
              <input
                value={previewImage}
                onChange={(event) => setPreviewImage(event.target.value)}
                maxLength={500}
                placeholder="https://..."
                className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition focus:border-purple-400/60 focus:bg-black/45 focus:shadow-[0_0_0_4px_rgba(168,85,247,0.12)]"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-white/85">
              Descrição
            </label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={500}
              placeholder="Explique o estilo do template..."
              rows={3}
              className="w-full resize-none rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition focus:border-purple-400/60 focus:bg-black/45 focus:shadow-[0_0_0_4px_rgba(168,85,247,0.12)]"
            />
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-white/85">
              <FaCode className="text-white/45" />
              HTML
            </label>
            <textarea
              value={htmlCode}
              onChange={(event) => setHtmlCode(event.target.value)}
              rows={9}
              spellCheck={false}
              className="w-full resize-y rounded-2xl border border-white/10 bg-black/45 px-4 py-3 font-mono text-xs text-white outline-none transition focus:border-purple-400/60 focus:shadow-[0_0_0_4px_rgba(168,85,247,0.12)]"
            />
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-white/85">
              <FaImage className="text-white/45" />
              CSS
            </label>
            <textarea
              value={cssCode}
              onChange={(event) => setCssCode(event.target.value)}
              rows={10}
              spellCheck={false}
              className="w-full resize-y rounded-2xl border border-white/10 bg-black/45 px-4 py-3 font-mono text-xs text-white outline-none transition focus:border-purple-400/60 focus:shadow-[0_0_0_4px_rgba(168,85,247,0.12)]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-white/85">
              JavaScript opcional
            </label>
            <textarea
              value={jsCode}
              onChange={(event) => setJsCode(event.target.value)}
              rows={6}
              spellCheck={false}
              placeholder="// Opcional. Vai rodar isolado dentro de iframe sandbox."
              className="w-full resize-y rounded-2xl border border-white/10 bg-black/45 px-4 py-3 font-mono text-xs text-white placeholder-white/25 outline-none transition focus:border-purple-400/60 focus:shadow-[0_0_0_4px_rgba(168,85,247,0.12)]"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={() => setShowPreview((prev) => !prev)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.035] px-5 py-3 text-sm font-bold text-white/60 transition hover:border-purple-400/25 hover:bg-purple-500/10 hover:text-white"
            >
              <FaEye />
              {showPreview ? "Esconder preview" : "Mostrar preview"}
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !canSubmit}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-purple-600 px-5 py-3 text-sm font-bold text-white shadow-[0_0_28px_rgba(147,51,234,0.22)] transition hover:-translate-y-0.5 hover:bg-purple-500 hover:shadow-[0_0_38px_rgba(147,51,234,0.34)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
              Enviar para aprovação
            </button>
          </div>
        </div>

        <aside className="space-y-4">
          {showPreview && (
            <div className="rounded-3xl border border-white/10 bg-black/25 p-4">
              <p className="mb-3 text-sm font-black text-white">
                Preview isolado
              </p>
              <CommunityTemplatePreview
                htmlCode={htmlCode}
                cssCode={cssCode}
                jsCode={jsCode}
                height="520px"
              />
            </div>
          )}

          <div className="rounded-3xl border border-white/10 bg-black/25 p-4">
            <p className="mb-3 flex items-center gap-2 text-sm font-black text-white">
              <FaPlus className="text-purple-300" />
              Meus envios
            </p>

            {fetching ? (
              <p className="text-sm text-white/45">Carregando...</p>
            ) : myTemplates.length > 0 ? (
              <div className="space-y-3">
                {myTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="rounded-2xl border border-white/10 bg-black/30 p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-white">
                          {template.name}
                        </p>
                        <p className="mt-1 text-xs text-white/35">
                          {new Date(template.created_at).toLocaleString()}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${
                          statusClass[template.status] || statusClass.pending
                        }`}
                      >
                        {template.status}
                      </span>
                    </div>

                    {template.status === "rejected" &&
                      template.rejection_reason && (
                        <p className="mt-3 rounded-xl border border-red-400/20 bg-red-500/10 p-2 text-xs text-red-200">
                          {template.rejection_reason}
                        </p>
                      )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-4 text-sm text-white/35">
                Nenhum template enviado ainda.
              </p>
            )}
          </div>
        </aside>
      </section>
    </div>
  );
};

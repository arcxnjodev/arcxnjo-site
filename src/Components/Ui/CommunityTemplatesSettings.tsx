import axios from "axios";
import { useEffect, useMemo, useState, type ReactNode } from "react";
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
import { useI18n } from "../../i18n/i18nProvider";
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

type CommunityView = "gallery" | "submit";

type CodeEditorProps = {
  label: string;
  icon?: ReactNode;
  value: string;
  onChange: (value: string) => void;
  rows: number;
  placeholder?: string;
};

const statusClass: Record<string, string> = {
  pending: "border-yellow-400/20 bg-yellow-500/10 text-yellow-200",
  approved: "border-green-400/20 bg-green-500/10 text-green-200",
  rejected: "border-red-400/20 bg-red-500/10 text-red-200",
};

const codePanelClass =
  "rounded-[1.35rem] border border-white/10 bg-[#050505]/90 shadow-[0_20px_70px_rgba(0,0,0,0.36)]";

const fieldClass =
  "w-full rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition focus:border-purple-400/60 focus:bg-black/55 focus:shadow-[0_0_0_4px_rgba(168,85,247,0.12)]";

const CodeEditor = ({
  label,
  icon,
  value,
  onChange,
  rows,
  placeholder,
}: CodeEditorProps) => {
  return (
    <div className={codePanelClass}>
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-white/50">
          {icon}
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
        rows={rows}
        spellCheck={false}
        placeholder={placeholder}
        className="block w-full resize-y border-0 bg-transparent px-4 py-4 font-mono text-xs leading-relaxed text-white outline-none placeholder-white/20"
      />
    </div>
  );
};

export const CommunityTemplatesSettings = () => {
  const API_URL = import.meta.env.VITE_API_URL || "https://api.arcxnjo.com.br";
  const { t } = useI18n();

  const [activeView, setActiveView] = useState<CommunityView>("gallery");
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
  const [currentCommunityTemplateId, setCurrentCommunityTemplateId] = useState<
    number | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [usingTemplateId, setUsingTemplateId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [showPreview, setShowPreview] = useState(true);

  const token = localStorage.getItem("token");

  const getStatusLabel = (status: CommunityTemplate["status"]) => {
    if (status === "approved") return t("settings.community.statusApproved");
    if (status === "rejected") return t("settings.community.statusRejected");
    return t("settings.community.statusPending");
  };

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

  const codeStats = useMemo(() => {
    const lines = [htmlCode, cssCode, jsCode]
      .join("\n")
      .split("\n")
      .filter(Boolean).length;

    const chars = htmlCode.length + cssCode.length + jsCode.length;

    return { lines, chars };
  }, [htmlCode, cssCode, jsCode]);

  const handleSubmit = async () => {
    if (!canSubmit) {
      setMessage(`❌ ${t("settings.community.needNameAndHtml")}`);
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

      setMessage(`✅ ${t("settings.community.sentForApproval")}`);
      setName("");
      setDescription("");
      setPreviewImage("");
      setJsCode("");
      setActiveView("submit");
      await fetchMyTemplates();
    } catch (error: any) {
      setMessage(
        `❌ ${t("settings.community.submitError")}${
          error.response?.data?.error || error.message
        }`
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
      setMessage(
        `✅ ${t("settings.community.appliedBefore")}"${template.name}"${t(
          "settings.community.appliedAfter"
        )}`
      );
    } catch (error: any) {
      setMessage(
        `❌ ${t("settings.community.useError")}${
          error.response?.data?.error || error.message
        }`
      );
    } finally {
      setUsingTemplateId(null);
    }
  };

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-purple-600/20 via-black/40 to-pink-600/10 p-5 md:p-6">
        <div className="absolute right-[-80px] top-[-80px] h-52 w-52 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute bottom-[-90px] left-[-80px] h-52 w-52 rounded-full bg-fuchsia-500/10 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-purple-200">
              <FaUsers />
              {t("admin.community")}
            </div>

            <h3 className="text-2xl font-black text-white md:text-3xl">
              {t("settings.community.title")}
            </h3>

            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/50">
              {t("settings.community.description")}
            </p>
          </div>

          <div className="grid gap-2 rounded-3xl border border-white/10 bg-black/30 p-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setActiveView("gallery")}
              className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black transition ${
                activeView === "gallery"
                  ? "bg-white text-black shadow-[0_0_24px_rgba(255,255,255,0.16)]"
                  : "text-white/45 hover:bg-white/5 hover:text-white"
              }`}
            >
              <FaEye />
              {t("settings.community.galleryTab")}
            </button>

            <button
              type="button"
              onClick={() => setActiveView("submit")}
              className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black transition ${
                activeView === "submit"
                  ? "bg-purple-600 text-white shadow-[0_0_28px_rgba(147,51,234,0.28)]"
                  : "text-white/45 hover:bg-white/5 hover:text-white"
              }`}
            >
              <FaCode />
              {t("settings.community.submitTab")}
            </button>
          </div>
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

      {activeView === "gallery" && (
        <section className="space-y-5">
          <div className="flex flex-col justify-between gap-3 rounded-3xl border border-white/10 bg-black/25 p-5 md:flex-row md:items-center">
            <div>
              <h4 className="text-xl font-black text-white">
                {t("settings.community.approvedGallery")}
              </h4>
              <p className="mt-1 text-sm text-white/40">
                {t("settings.community.approvedGalleryDescription")}
              </p>
            </div>

            <span className="w-fit rounded-full border border-white/10 bg-white/[0.035] px-3 py-1 text-xs font-bold text-white/45">
              {publicTemplates.length} {t("settings.community.approvedCount")}
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
                    className="group overflow-hidden rounded-3xl border border-white/10 bg-black/30 transition hover:border-purple-400/30 hover:bg-black/45"
                  >
                    <div className="relative overflow-hidden bg-black/45">
                      {template.preview_image ? (
                        <img
                          src={template.preview_image}
                          alt={template.name}
                          className="h-52 w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <CommunityTemplatePreview
                          htmlCode={template.html_code}
                          cssCode={template.css_code}
                          jsCode={template.js_code}
                          height="240px"
                        />
                      )}

                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/80 to-transparent" />
                    </div>

                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h5 className="truncate text-lg font-black text-white">
                            {template.name}
                          </h5>
                          <p className="mt-1 text-xs text-white/35">
                            {t("settings.community.by")} @{template.creator_username || "unknown"}
                          </p>
                        </div>

                        {isCurrent && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-green-400/20 bg-green-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-green-200">
                            <FaCheck />
                            {t("settings.community.using")}
                          </span>
                        )}
                      </div>

                      {template.description && (
                        <p className="mt-3 text-sm leading-relaxed text-white/55">
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
                        {isCurrent
                          ? t("settings.community.templateInUse")
                          : t("settings.community.useOnProfile")}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="rounded-3xl border border-dashed border-white/10 bg-white/[0.03] p-8 text-center text-sm text-white/35">
              {t("settings.community.emptyGallery")}
            </p>
          )}
        </section>
      )}

      {activeView === "submit" && (
        <section className="space-y-5">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#050505] p-5">
            <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.4)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.4)_1px,transparent_1px)] [background-size:38px_38px]" />
            <div className="relative flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-green-400/20 bg-green-500/10 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-green-200">
                  <FaCode />
                  {t("settings.community.coderMode")}
                </div>

                <h4 className="text-2xl font-black text-white">
                  {t("settings.community.submitTitle")}
                </h4>
                <p className="mt-1 max-w-2xl text-sm text-white/45">
                  {t("settings.community.submitDescription")}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-black/55 px-4 py-3">
                  <p className="text-lg font-black text-white">{codeStats.lines}</p>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/30">
                    {t("settings.community.lines")}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/55 px-4 py-3">
                  <p className="text-lg font-black text-white">{codeStats.chars}</p>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/30">
                    {t("settings.community.chars")}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/55 px-4 py-3 sm:block">
                  <p className="text-lg font-black text-white">
                    {myTemplates.length}
                  </p>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/30">
                    {t("settings.community.submissions")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <section className="grid gap-6 xl:grid-cols-[1fr_440px]">
            <div className="space-y-5">
              <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-white/85">
                      {t("settings.community.templateName")}
                    </label>
                    <input
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      maxLength={80}
                      placeholder="Dark Angel"
                      className={fieldClass}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-white/85">
                      {t("settings.community.previewImageUrl")}
                    </label>
                    <input
                      value={previewImage}
                      onChange={(event) => setPreviewImage(event.target.value)}
                      maxLength={500}
                      placeholder="https://..."
                      className={fieldClass}
                    />
                  </div>
                </div>

                <div className="mt-5">
                  <label className="mb-2 block text-sm font-semibold text-white/85">
                    {t("settings.community.descriptionLabel")}
                  </label>
                  <textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    maxLength={500}
                    placeholder={t("settings.community.descriptionPlaceholder")}
                    rows={3}
                    className={`${fieldClass} resize-none`}
                  />
                </div>
              </div>

              <CodeEditor
                label="index.html"
                icon={<FaCode className="text-orange-300" />}
                value={htmlCode}
                onChange={setHtmlCode}
                rows={10}
              />

              <CodeEditor
                label="style.css"
                icon={<FaImage className="text-blue-300" />}
                value={cssCode}
                onChange={setCssCode}
                rows={12}
              />

              <CodeEditor
                label="script.js"
                icon={<FaPlus className="text-yellow-300" />}
                value={jsCode}
                onChange={setJsCode}
                rows={7}
                placeholder={t("settings.community.optionalJsPlaceholder")}
              />

              <div className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-black/25 p-4 sm:flex-row sm:justify-between">
                <button
                  type="button"
                  onClick={() => setShowPreview((prev) => !prev)}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.035] px-5 py-3 text-sm font-bold text-white/60 transition hover:border-purple-400/25 hover:bg-purple-500/10 hover:text-white"
                >
                  <FaEye />
                  {showPreview
                    ? t("settings.community.hidePreview")
                    : t("settings.community.showPreview")}
                </button>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || !canSubmit}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-purple-600 px-5 py-3 text-sm font-bold text-white shadow-[0_0_28px_rgba(147,51,234,0.22)] transition hover:-translate-y-0.5 hover:bg-purple-500 hover:shadow-[0_0_38px_rgba(147,51,234,0.34)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
                  {t("settings.community.submitForApproval")}
                </button>
              </div>
            </div>

            <aside className="space-y-4">
              {showPreview && (
                <div className="sticky top-24 rounded-3xl border border-white/10 bg-black/25 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-sm font-black text-white">
                      {t("settings.community.isolatedPreview")}
                    </p>
                    <span className="rounded-full border border-green-400/20 bg-green-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-green-200">
                      {t("settings.community.sandbox")}
                    </span>
                  </div>

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
                  {t("settings.community.mySubmissions")}
                </p>

                {fetching ? (
                  <p className="text-sm text-white/45">{t("common.loading")}</p>
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
                            {getStatusLabel(template.status)}
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
                    {t("settings.community.noSubmissions")}
                  </p>
                )}
              </div>
            </aside>
          </section>
        </section>
      )}
    </div>
  );
};

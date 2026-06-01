import axios from "axios";
import { useEffect, useState } from "react";
import {
  FaCheck,
  FaEye,
  FaSpinner,
  FaTimes,
  FaTrash,
  FaUsersCog,
} from "react-icons/fa";
import { useI18n } from "../../i18n/i18nProvider";
import { CommunityTemplatePreview } from "./CommunityTemplatePreview";

type AdminCommunityTemplate = {
  id: number;
  creator_user_id: number;
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
  creator_email?: string;
};

const filterOptions = ["pending", "approved", "rejected", "all"] as const;

const statusClass: Record<string, string> = {
  pending: "border-yellow-400/20 bg-yellow-500/10 text-yellow-200",
  approved: "border-green-400/20 bg-green-500/10 text-green-200",
  rejected: "border-red-400/20 bg-red-500/10 text-red-200",
};

export const AdminCommunityTemplates = () => {
  const API_URL = import.meta.env.VITE_API_URL || "https://api.arcxnjo.com.br";
  const token = localStorage.getItem("token");
  const { t } = useI18n();

  const [templates, setTemplates] = useState<AdminCommunityTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] =
    useState<AdminCommunityTemplate | null>(null);
  const [statusFilter, setStatusFilter] =
    useState<(typeof filterOptions)[number]>("pending");
  const [rejectionReason, setRejectionReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  const getFilterLabel = (filter: (typeof filterOptions)[number]) => {
    if (filter === "approved") return t("settings.communityAdmin.filterApproved");
    if (filter === "rejected") return t("settings.communityAdmin.filterRejected");
    if (filter === "all") return t("settings.communityAdmin.filterAll");
    return t("settings.communityAdmin.filterPending");
  };

  const getStatusLabel = (status: AdminCommunityTemplate["status"]) => {
    if (status === "approved") return t("settings.communityAdmin.statusApproved");
    if (status === "rejected") return t("settings.communityAdmin.statusRejected");
    return t("settings.communityAdmin.statusPending");
  };

  const fetchTemplates = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${API_URL}/api/admin/community/templates?status=${statusFilter}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const list = response.data || [];
      setTemplates(list);

      if (list.length > 0) {
        setSelectedTemplate((current) => {
          if (current && list.some((item: AdminCommunityTemplate) => item.id === current.id)) {
            return current;
          }

          return list[0];
        });
      } else {
        setSelectedTemplate(null);
      }
    } catch (error: any) {
      setMessage(
        `❌ ${t("settings.communityAdmin.loadError")}${
          error.response?.data?.error || error.message
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [API_URL, statusFilter]);

  const updateStatus = async (
    template: AdminCommunityTemplate,
    status: "pending" | "approved" | "rejected"
  ) => {
    if (status === "rejected" && !rejectionReason.trim()) {
      setMessage(`❌ ${t("settings.communityAdmin.rejectionRequired")}`);
      return;
    }

    try {
      setActionLoading(template.id);
      setMessage("");

      await axios.put(
        `${API_URL}/api/admin/community/templates/${template.id}/status`,
        {
          status,
          rejectionReason: rejectionReason.trim(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage(
        status === "approved"
          ? `✅ ${t("settings.communityAdmin.approvedMessage")}`
          : status === "rejected"
          ? `✅ ${t("settings.communityAdmin.rejectedMessage")}`
          : `✅ ${t("settings.communityAdmin.pendingMessage")}`
      );
      setRejectionReason("");
      await fetchTemplates();
    } catch (error: any) {
      setMessage(
        `❌ ${t("settings.communityAdmin.updateError")}${
          error.response?.data?.error || error.message
        }`
      );
    } finally {
      setActionLoading(null);
    }
  };

  const deleteTemplate = async (template: AdminCommunityTemplate) => {
    const confirmed = window.confirm(
      `${t("settings.communityAdmin.deleteConfirmBefore")}"${template.name}"${t(
        "settings.communityAdmin.deleteConfirmAfter"
      )}`
    );

    if (!confirmed) return;

    try {
      setActionLoading(template.id);
      setMessage("");

      await axios.delete(
        `${API_URL}/api/admin/community/templates/${template.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage(`✅ ${t("settings.communityAdmin.deletedMessage")}`);
      await fetchTemplates();
    } catch (error: any) {
      setMessage(
        `❌ ${t("settings.communityAdmin.deleteError")}${
          error.response?.data?.error || error.message
        }`
      );
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-purple-600/20 via-black/30 to-pink-600/10 p-5 md:p-6">
        <div className="absolute right-[-80px] top-[-80px] h-52 w-52 rounded-full bg-purple-500/20 blur-3xl" />

        <div className="relative">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-purple-200">
            <FaUsersCog />
            {t("settings.communityAdmin.badge")}
          </div>

          <h3 className="text-2xl font-black text-white">
            {t("settings.communityAdmin.title")}
          </h3>

          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/50">
            {t("settings.communityAdmin.description")}
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

      <div className="flex flex-wrap gap-2">
        {filterOptions.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setStatusFilter(option)}
            className={`rounded-2xl border px-4 py-2.5 text-sm font-bold capitalize transition ${
              statusFilter === option
                ? "border-purple-400/45 bg-purple-500/20 text-white"
                : "border-white/10 bg-white/[0.035] text-white/50 hover:border-purple-400/25 hover:text-white"
            }`}
          >
            {getFilterLabel(option)}
          </button>
        ))}
      </div>

      <section className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <aside className="rounded-3xl border border-white/10 bg-black/25 p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-sm font-black text-white">
              {t("settings.communityAdmin.templates")}
            </p>

            {loading && <FaSpinner className="animate-spin text-white/45" />}
          </div>

          {templates.length > 0 ? (
            <div className="space-y-3">
              {templates.map((template) => {
                const isSelected = selectedTemplate?.id === template.id;

                return (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => {
                      setSelectedTemplate(template);
                      setRejectionReason(template.rejection_reason || "");
                    }}
                    className={`w-full rounded-2xl border p-3 text-left transition ${
                      isSelected
                        ? "border-purple-400/45 bg-purple-500/15"
                        : "border-white/10 bg-black/30 hover:border-purple-400/25"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-white">
                          {template.name}
                        </p>
                        <p className="mt-1 truncate text-xs text-white/35">
                          @{template.creator_username || t("settings.communityAdmin.unknown")}
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
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-4 text-sm text-white/35">
              {t("settings.communityAdmin.noTemplates")}
            </p>
          )}
        </aside>

        <main className="min-w-0 rounded-3xl border border-white/10 bg-black/25 p-4">
          {selectedTemplate ? (
            <div className="space-y-5">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                <div className="min-w-0">
                  <h4 className="truncate text-2xl font-black text-white">
                    {selectedTemplate.name}
                  </h4>

                  <p className="mt-1 text-sm text-white/45">
                    {t("settings.communityAdmin.sentBy")} @
                    {selectedTemplate.creator_username || t("settings.communityAdmin.unknown")}
                    {selectedTemplate.creator_email
                      ? ` · ${selectedTemplate.creator_email}`
                      : ""}
                  </p>

                  {selectedTemplate.description && (
                    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/60">
                      {selectedTemplate.description}
                    </p>
                  )}
                </div>

                <span
                  className={`w-fit rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-wider ${
                    statusClass[selectedTemplate.status] || statusClass.pending
                  }`}
                >
                  {getStatusLabel(selectedTemplate.status)}
                </span>
              </div>

              {selectedTemplate.preview_image && (
                <img
                  src={selectedTemplate.preview_image}
                  alt={selectedTemplate.name}
                  className="max-h-52 w-full rounded-3xl object-cover"
                />
              )}

              <div>
                <div className="mb-3 flex items-center gap-2 text-sm font-black text-white">
                  <FaEye className="text-purple-300" />
                  {t("settings.communityAdmin.isolatedPreview")}
                </div>

                <CommunityTemplatePreview
                  htmlCode={selectedTemplate.html_code}
                  cssCode={selectedTemplate.css_code}
                  jsCode={selectedTemplate.js_code}
                  height="560px"
                />
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-white/35">
                    HTML
                  </p>
                  <pre className="max-h-56 overflow-auto rounded-2xl border border-white/10 bg-black/45 p-3 text-xs text-white/60">
                    {selectedTemplate.html_code}
                  </pre>
                </div>

                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-white/35">
                    CSS
                  </p>
                  <pre className="max-h-56 overflow-auto rounded-2xl border border-white/10 bg-black/45 p-3 text-xs text-white/60">
                    {selectedTemplate.css_code || t("settings.communityAdmin.emptyCss")}
                  </pre>
                </div>

                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-white/35">
                    JS
                  </p>
                  <pre className="max-h-56 overflow-auto rounded-2xl border border-white/10 bg-black/45 p-3 text-xs text-white/60">
                    {selectedTemplate.js_code || t("settings.communityAdmin.emptyJs")}
                  </pre>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/35 p-4">
                <label className="mb-2 block text-sm font-bold text-white">
                  {t("settings.communityAdmin.rejectionReason")}
                </label>

                <textarea
                  value={rejectionReason}
                  onChange={(event) => setRejectionReason(event.target.value)}
                  rows={3}
                  placeholder={t("settings.communityAdmin.rejectionPlaceholder")}
                  className="w-full resize-none rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition focus:border-purple-400/60 focus:shadow-[0_0_0_4px_rgba(168,85,247,0.12)]"
                />

                <div className="mt-4 flex flex-wrap justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => deleteTemplate(selectedTemplate)}
                    disabled={actionLoading === selectedTemplate.id}
                    className="inline-flex items-center gap-2 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-2.5 text-sm font-bold text-red-200 transition hover:bg-red-500/20 disabled:opacity-50"
                  >
                    <FaTrash />
                    {t("settings.communityAdmin.delete")}
                  </button>

                  <button
                    type="button"
                    onClick={() => updateStatus(selectedTemplate, "rejected")}
                    disabled={actionLoading === selectedTemplate.id}
                    className="inline-flex items-center gap-2 rounded-2xl border border-yellow-400/20 bg-yellow-500/10 px-4 py-2.5 text-sm font-bold text-yellow-100 transition hover:bg-yellow-500/20 disabled:opacity-50"
                  >
                    <FaTimes />
                    {t("settings.communityAdmin.reject")}
                  </button>

                  <button
                    type="button"
                    onClick={() => updateStatus(selectedTemplate, "approved")}
                    disabled={actionLoading === selectedTemplate.id}
                    className="inline-flex items-center gap-2 rounded-2xl bg-green-600 px-4 py-2.5 text-sm font-bold text-white shadow-[0_0_24px_rgba(34,197,94,0.2)] transition hover:bg-green-500 disabled:opacity-50"
                  >
                    <FaCheck />
                    {t("settings.communityAdmin.approve")}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-6 text-center text-sm text-white/35">
              {t("settings.communityAdmin.noTemplates")}
            </p>
          )}
        </main>
      </section>
    </div>
  );
};

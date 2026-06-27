import { useState, useEffect, useCallback, useRef, type ReactNode } from "react";
import { useSelector } from "react-redux";
import { userSliceType } from "../Store/userSlice";
import { SocialMediaSettings } from "./Ui/SocialMediaSettings";
import { ProfileImagesSettings } from "./Ui/ProfileImagesSettings";
import { AppearanceSettings } from "./ProfileTemplates/AppearanceSettings";
import { BadgeSettings } from "./Ui/BadgeSettings";
import { MusicSettings } from "./Ui/MusicSettings";
import { CommunityTemplatesSettings } from "./Ui/CommunityTemplatesSettings";
import { AdminCommunityTemplates } from "./Ui/AdminCommunityTemplates";
import {
  FaUser, FaLink, FaImage, FaRightFromBracket,
  FaPalette, FaMusic, FaCertificate, FaArrowUpRightFromSquare,
 FaUsers, FaShield, FaCopy, FaCheck,
  FaChevronLeft, FaChevronRight, FaCircle,
} from "react-icons/fa6";
import axios from "axios";
import { useI18n } from "../i18n/i18nProvider";

// Tab accent colors
const TAB_ACCENTS: Record<string, { bg: string; border: string; text: string; glow: string; dot: string }> = {
  profile:          { bg: "bg-violet-500/15",  border: "border-violet-400/30",  text: "text-violet-200",  glow: "shadow-[0_0_24px_rgba(139,92,246,0.2)]",  dot: "bg-violet-400" },
  social:           { bg: "bg-sky-500/15",     border: "border-sky-400/30",     text: "text-sky-200",     glow: "shadow-[0_0_24px_rgba(56,189,248,0.2)]",  dot: "bg-sky-400" },
  images:           { bg: "bg-emerald-500/15", border: "border-emerald-400/30", text: "text-emerald-200", glow: "shadow-[0_0_24px_rgba(52,211,153,0.2)]",  dot: "bg-emerald-400" },
  appearance:       { bg: "bg-pink-500/15",    border: "border-pink-400/30",    text: "text-pink-200",    glow: "shadow-[0_0_24px_rgba(244,114,182,0.2)]", dot: "bg-pink-400" },
  music:            { bg: "bg-amber-500/15",   border: "border-amber-400/30",   text: "text-amber-200",   glow: "shadow-[0_0_24px_rgba(251,191,36,0.2)]",  dot: "bg-amber-400" },
  badges:           { bg: "bg-orange-500/15",  border: "border-orange-400/30",  text: "text-orange-200",  glow: "shadow-[0_0_24px_rgba(251,146,60,0.2)]",  dot: "bg-orange-400" },
  community:        { bg: "bg-teal-500/15",    border: "border-teal-400/30",    text: "text-teal-200",    glow: "shadow-[0_0_24px_rgba(45,212,191,0.2)]",  dot: "bg-teal-400" },
  "community-admin":{ bg: "bg-red-500/15",     border: "border-red-400/30",     text: "text-red-200",     glow: "shadow-[0_0_24px_rgba(248,113,113,0.2)]", dot: "bg-red-400" },
};

// Auto-save hook
function useAutoSave<T>(
  value: T,
  onSave: (val: T) => Promise<void>,
  delay = 1200
): "idle" | "saving" | "saved" | "error" {
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!mountedRef.current) { mountedRef.current = true; return; }
    if (timerRef.current) clearTimeout(timerRef.current);
    setStatus("idle");
    timerRef.current = setTimeout(async () => {
      setStatus("saving");
      try {
        await onSave(value);
        setStatus("saved");
        setTimeout(() => setStatus("idle"), 2000);
      } catch {
        setStatus("error");
        setTimeout(() => setStatus("idle"), 3000);
      }
    }, delay);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return status;
}

// Inline status indicator
const SaveStatus = ({ status }: { status: "idle" | "saving" | "saved" | "error" }) => {
  if (status === "idle") return null;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold transition-all ${
      status === "saving" ? "text-white/40" :
      status === "saved"  ? "text-emerald-400" : "text-red-400"
    }`}>
      {status === "saving" && <span className="h-1.5 w-1.5 animate-ping rounded-full bg-white/40" />}
      {status === "saved"  && <FaCheck className="text-[10px]" />}
      {status === "saving" ? "salvando..." : status === "saved" ? "salvo" : "erro ao salvar"}
    </span>
  );
};

// Copy button
const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition ${
        copied ? "bg-emerald-500/20 text-emerald-300" : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
      }`}
    >
      {copied ? <FaCheck /> : <FaCopy />}
      {copied ? "Copiado!" : "Copiar"}
    </button>
  );
};

export const AdminPanel = () => {
  const { email } = useSelector((store: { user: userSliceType }) => store.user);
  const { t } = useI18n();

  const [activeTab, setActiveTab] = useState("profile");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [username, setUsername] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [statusText, setStatusText] = useState("");
  const [plan, setPlan] = useState("free");
  const [role, setRole] = useState("user");
  const [ownerBypass, setOwnerBypass] = useState(false);
  const [discordAvatar, setDiscordAvatar] = useState<string | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "https://api.arcxnjo.com.br";

  // Auto-save hooks
  const saveDisplayName = useCallback(async (val: string) => {
    const token = localStorage.getItem("token");
    await axios.put(`${API_URL}/api/profile/display-name`, { displayName: val }, { headers: { Authorization: `Bearer ${token}` } });
  }, [API_URL]);

  const saveBio = useCallback(async (val: string) => {
    const token = localStorage.getItem("token");
    await axios.put(`${API_URL}/api/profile/bio`, { bio: val }, { headers: { Authorization: `Bearer ${token}` } });
  }, [API_URL]);

  const saveLocation = useCallback(async (val: string) => {
    const token = localStorage.getItem("token");
    await axios.put(`${API_URL}/api/profile/details`, { location: val, statusText }, { headers: { Authorization: `Bearer ${token}` } });
  }, [API_URL, statusText]);

  const saveStatus = useCallback(async (val: string) => {
    const token = localStorage.getItem("token");
    await axios.put(`${API_URL}/api/profile/details`, { location, statusText: val }, { headers: { Authorization: `Bearer ${token}` } });
  }, [API_URL, location]);

  const displayNameStatus = useAutoSave(displayName, saveDisplayName);
  const bioStatus = useAutoSave(bio, saveBio);
  const locationStatus = useAutoSave(location, saveLocation);
  const statusTextStatus = useAutoSave(statusText, saveStatus);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) { window.location.href = "/login"; return; }

        const tokenPayload = JSON.parse(atob(token.split(".")[1]));
        const response = await axios.get(`${API_URL}/api/profile/me`, { headers: { Authorization: `Bearer ${token}` } });

        const currentUsername = response.data.username || tokenPayload.username || "";
        setUsername(currentUsername);
        setNewUsername(currentUsername);
        setDisplayName(response.data.display_name || "");
        setBio(response.data.bio || "");
        setLocation(response.data.location || "");
        setStatusText(response.data.status_text || "");
        setPlan(response.data.plan || "free");
        setRole(response.data.role || "user");
        setOwnerBypass(Boolean(response.data.owner_bypass));

        const discordId = response.data.discord_id;
        if (discordId) {
          axios.get(`${API_URL}/api/discord-presence/${discordId}`).then((res) => {
            const dUser = res.data?.discord_user;
            if (dUser?.avatar) {
              const ext = dUser.avatar.startsWith("a_") ? "gif" : "png";
              setDiscordAvatar(`https://cdn.discordapp.com/avatars/${dUser.id}/${dUser.avatar}.${ext}?size=128`);
            }
          }).catch(() => {});
        }
      } catch (error: any) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
      }
    };
    fetchUserData();
  }, [API_URL]);

  const handleSaveUsername = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(`${API_URL}/api/profile/username`, { username: newUsername }, { headers: { Authorization: `Bearer ${token}` } });
      setUsername(response.data.username);
      setNewUsername(response.data.username);
      if (response.data.token) localStorage.setItem("token", response.data.token);
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to update username.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const isAdminUser = ["admin", "owner", "staff"].includes(role.toLowerCase()) || ownerBypass;
  const safeEmail = email || localStorage.getItem("email") || "discord user";
  const profileUrl = `https://arcxnjo.com.br/${username || ""}`;
  const accent = TAB_ACCENTS[activeTab] || TAB_ACCENTS.profile;

  const tabs = [
    { id: "profile",   label: t("admin.publicProfile"),   icon: <FaUser />,        short: "Perfil" },
    { id: "social",    label: t("admin.socialMedia"),      icon: <FaLink />,        short: "Links" },
    { id: "images",    label: t("admin.images"),           icon: <FaImage />,       short: "Mídia" },
    { id: "appearance",label: t("admin.appearance"),       icon: <FaPalette />,     short: "Visual" },
    { id: "music",     label: t("admin.music"),            icon: <FaMusic />,       short: "Música" },
    { id: "badges",    label: t("admin.badges"),           icon: <FaCertificate />, short: "Badges" },
    { id: "community", label: t("admin.community"),        icon: <FaUsers />,       short: "Comunidade" },
    ...(isAdminUser ? [{ id: "community-admin", label: t("admin.communityApproval"), icon: <FaShield />, short: "Admin" }] : []),
  ];

  const activeTabData = tabs.find((tab) => tab.id === activeTab);

  const inputClass = "w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition focus:border-white/25 focus:bg-black/40";

  const componentMap: Record<string, ReactNode> = {
    social: <SocialMediaSettings />,
    images: <ProfileImagesSettings />,
    appearance: <AppearanceSettings />,
    music: <MusicSettings />,
    badges: <BadgeSettings />,
    community: <CommunityTemplatesSettings />,
    "community-admin": <AdminCommunityTemplates />,
  };

  return (
    <div className="relative min-h-screen bg-[#06060a] text-white">
      <style>{`
        @keyframes scanline { 0%,100%{transform:translateY(-100%)} 50%{transform:translateY(100vh)} }
        @keyframes gridMove { from{background-position:0 0} to{background-position:40px 40px} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* Background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.015) 1px,transparent 1px)",
          backgroundSize: "40px 40px",
          animation: "gridMove 20s linear infinite",
        }} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(139,92,246,0.08),transparent_50%),radial-gradient(ellipse_at_80%_100%,rgba(56,189,248,0.06),transparent_50%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      {/* Mobile nav overlay */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setMobileNavOpen(false)} />
      )}

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#06060a]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-white/50 hover:text-white lg:hidden"
            >
              <span className="flex flex-col gap-1">
                <span className="h-px w-4 bg-current" />
                <span className="h-px w-3 bg-current" />
                <span className="h-px w-4 bg-current" />
              </span>
            </button>

            <div className="flex items-center gap-2">
              <div className="h-6 w-6 overflow-hidden rounded-full">
                {discordAvatar
                  ? <img src={discordAvatar} alt="" className="h-full w-full object-cover" />
                  : <div className="flex h-full w-full items-center justify-center bg-violet-600 text-[10px] font-black">{username?.[0]?.toUpperCase()}</div>
                }
              </div>
              <span className="hidden text-sm font-semibold text-white/70 sm:block">{displayName || username}</span>
            </div>

            <span className={`hidden rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider sm:inline-flex ${
              plan === "pro" ? "border-violet-400/30 bg-violet-500/15 text-violet-300" : "border-white/10 bg-white/5 text-white/40"
            }`}>
              {plan}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={profileUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/60 transition hover:bg-white/10 hover:text-white"
            >
              <FaArrowUpRightFromSquare className="text-[10px]" />
              <span className="hidden sm:inline">Ver perfil</span>
            </a>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-xl border border-red-500/15 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-300/70 transition hover:bg-red-500/20 hover:text-red-200"
            >
              <FaRightFromBracket className="text-[10px]" />
              <span className="hidden sm:inline">{t("admin.logout")}</span>
            </button>
          </div>
        </div>
      </header>

      <div className="relative mx-auto flex max-w-7xl gap-0 lg:gap-6 lg:px-6 lg:py-8">
        {/* Sidebar desktop */}
        <aside className={`relative hidden flex-col lg:flex transition-all duration-300 ${sidebarCollapsed ? "w-16" : "w-64"}`}>
          <div className="sticky top-20 flex flex-col gap-2">
            {/* User card */}
            {!sidebarCollapsed && (
              <div className="mb-2 overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4">
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl">
                    {discordAvatar
                      ? <img src={discordAvatar} alt="" className="h-full w-full object-cover" />
                      : <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-600 to-pink-500 text-sm font-black">{username?.[0]?.toUpperCase()}</div>
                    }
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-white">{displayName || username || "User"}</p>
                    <p className="truncate text-xs text-white/35">{safeEmail}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Nav */}
            <nav className="flex flex-col gap-1">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const a = TAB_ACCENTS[tab.id] || TAB_ACCENTS.profile;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    title={sidebarCollapsed ? tab.label : undefined}
                    className={`group relative flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all ${
                      isActive
                        ? `${a.bg} ${a.border} ${a.text} ${a.glow}`
                        : "border-transparent text-white/40 hover:bg-white/[0.04] hover:text-white/70"
                    } ${sidebarCollapsed ? "justify-center" : ""}`}
                  >
                    {isActive && <span className={`absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full ${a.dot}`} />}
                    <span className={`shrink-0 text-sm ${isActive ? "" : "opacity-60 group-hover:opacity-100"}`}>{tab.icon}</span>
                    {!sidebarCollapsed && <span className="truncate text-sm font-semibold">{tab.label}</span>}
                  </button>
                );
              })}
            </nav>

            {/* Collapse toggle */}
            <button
              type="button"
              onClick={() => setSidebarCollapsed((p) => !p)}
              className="mt-2 flex items-center justify-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] py-2 text-xs text-white/25 transition hover:bg-white/[0.05] hover:text-white/50"
            >
              {sidebarCollapsed ? <FaChevronRight /> : <><FaChevronLeft /><span>Recolher</span></>}
            </button>
          </div>
        </aside>

        {/* Mobile sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-72 flex-col gap-2 overflow-y-auto border-r border-white/[0.06] bg-[#06060a] p-4 transition-transform duration-300 lg:hidden ${mobileNavOpen ? "flex translate-x-0" : "-translate-x-full"}`}>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 overflow-hidden rounded-xl">
                {discordAvatar
                  ? <img src={discordAvatar} alt="" className="h-full w-full object-cover" />
                  : <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-600 to-pink-500 text-sm font-black">{username?.[0]?.toUpperCase()}</div>
                }
              </div>
              <div>
                <p className="text-sm font-bold text-white">{displayName || username}</p>
                <p className="text-xs text-white/35">{plan}</p>
              </div>
            </div>
            <button type="button" onClick={() => setMobileNavOpen(false)} className="text-white/30 hover:text-white">✕</button>
          </div>

          <nav className="flex flex-col gap-1">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const a = TAB_ACCENTS[tab.id] || TAB_ACCENTS.profile;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => { setActiveTab(tab.id); setMobileNavOpen(false); }}
                  className={`flex items-center gap-3 rounded-xl border px-3 py-3 text-left transition ${
                    isActive ? `${a.bg} ${a.border} ${a.text}` : "border-transparent text-white/40 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span className="text-sm">{tab.icon}</span>
                  <span className="text-sm font-semibold">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1 px-4 py-6 md:px-6 lg:px-0 lg:py-0">
          {/* Tab header */}
          <div className="mb-6 flex items-center gap-3" style={{ animation: "fadeUp 0.25s ease-out" }}>
            <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border text-sm ${accent.bg} ${accent.border} ${accent.text}`}>
              {activeTabData?.icon}
            </div>
            <div>
              <h1 className="text-lg font-black text-white">{activeTabData?.label}</h1>
            </div>

            {activeTab === "profile" && (
              <div className="ml-auto flex items-center gap-2">
                <FaCircle className={`text-[6px] ${accent.dot}`} />
                <span className="text-xs text-white/30">arcxnjo.com.br/{username}</span>
                <CopyButton text={profileUrl} />
              </div>
            )}
          </div>

          {/* Profile tab */}
          {activeTab === "profile" && (
            <div className="space-y-4" style={{ animation: "fadeUp 0.3s ease-out" }}>
              {/* Username */}
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
                <div className="mb-4 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-white">{t("admin.username")}</p>
                    <p className="text-xs text-white/35">Visível na URL do seu perfil.</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex flex-1 items-center rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm">
                    <span className="mr-1 text-white/25">@</span>
                    <input
                      type="text"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      placeholder="seu-username"
                      className="flex-1 bg-transparent text-white outline-none placeholder-white/20"
                      maxLength={20}
                    />
                    <span className="text-xs text-white/20">{newUsername.length}/20</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveUsername}
                    className={`shrink-0 rounded-2xl border px-4 py-3 text-sm font-bold transition ${accent.bg} ${accent.border} ${accent.text} hover:brightness-110`}
                  >
                    Salvar
                  </button>
                </div>
              </div>

              {/* Display name */}
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-white">{t("admin.displayName")}</p>
                    <p className="text-xs text-white/35">Nome exibido no seu perfil público.</p>
                  </div>
                  <SaveStatus status={displayNameStatus} />
                </div>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Seu nome"
                  className={inputClass}
                  maxLength={32}
                />
                <p className="mt-2 text-right text-xs text-white/20">{displayName.length}/32</p>
              </div>

              {/* Bio */}
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-white">Bio</p>
                    <p className="text-xs text-white/35">Conte um pouco sobre você.</p>
                  </div>
                  <SaveStatus status={bioStatus} />
                </div>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Uma bio curta..."
                  className={`${inputClass} min-h-[100px] resize-none`}
                  rows={3}
                  maxLength={160}
                />
                <p className="mt-2 text-right text-xs text-white/20">{bio.length}/160</p>
              </div>

              {/* Location + status */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm font-bold text-white">{t("admin.location")}</p>
                    <SaveStatus status={locationStatus} />
                  </div>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Sua cidade"
                    className={inputClass}
                    maxLength={40}
                  />
                </div>

                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm font-bold text-white">{t("admin.status")}</p>
                    <SaveStatus status={statusTextStatus} />
                  </div>
                  <input
                    type="text"
                    value={statusText}
                    onChange={(e) => setStatusText(e.target.value)}
                    placeholder="O que você está fazendo?"
                    className={inputClass}
                    maxLength={80}
                  />
                  <p className="mt-2 text-right text-xs text-white/20">{statusText.length}/80</p>
                </div>
              </div>

              {/* Profile URL */}
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.02] px-5 py-4">
                <div className="flex items-center gap-2 min-w-0">
                  <FaCircle className={`shrink-0 text-[6px] ${accent.dot}`} />
                  <code className="truncate text-sm text-white/50">{profileUrl}</code>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <CopyButton text={profileUrl} />
                  <a
                    href={profileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/50 transition hover:bg-white/10 hover:text-white"
                  >
                    <FaArrowUpRightFromSquare className="text-[10px]" />
                    Abrir
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Other tabs */}
          {activeTab !== "profile" && (
            <div style={{ animation: "fadeUp 0.3s ease-out" }}>
              {componentMap[activeTab]}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

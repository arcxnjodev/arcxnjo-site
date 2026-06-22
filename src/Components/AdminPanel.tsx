import { useState, useEffect, type ReactNode } from "react";
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
  FaUser,
  FaLink,
  FaImage,
  FaSignOutAlt,
  FaPalette,
  FaMusic,
  FaCertificate,
  FaExternalLinkAlt,
  FaMagic,
  FaSave,
  FaUsers,
  FaShieldAlt,
} from "react-icons/fa";
import axios from "axios";
import { useI18n } from "../i18n/i18nProvider";

export const AdminPanel = () => {
  const { email } = useSelector((store: { user: userSliceType }) => store.user);
  const { t } = useI18n();

  const [activeTab, setActiveTab] = useState("profile");
  const [username, setUsername] = useState<string>("");
  const [newUsername, setNewUsername] = useState<string>("");
  const [displayName, setDisplayName] = useState<string>("");
  const [bio, setBio] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [statusText, setStatusText] = useState<string>("");
  const [plan, setPlan] = useState<string>("free");
  const [role, setRole] = useState<string>("user");
  const [ownerBypass, setOwnerBypass] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "https://api.arcxnjo.com.br";

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          window.location.href = "/login";
          return;
        }

        const tokenPayload = JSON.parse(atob(token.split(".")[1]));
        const usernameFromToken = tokenPayload.username || "";

        const response = await axios.get(`${API_URL}/api/profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const currentUsername = response.data.username || usernameFromToken;

        setUsername(currentUsername);
        setNewUsername(currentUsername);
        setDisplayName(response.data.display_name || "");
        setBio(response.data.bio || "");
        setLocation(response.data.location || "");
        setStatusText(response.data.status_text || "");
        setPlan(response.data.plan || "free");
        setRole(response.data.role || "user");
        setOwnerBypass(Boolean(response.data.owner_bypass));
      } catch (error) {
        console.error("Error fetching user data:", error);

        const token = localStorage.getItem("token");

        if (token) {
          try {
            const tokenPayload = JSON.parse(atob(token.split(".")[1]));
            const usernameFromToken = tokenPayload.username || "";

            setUsername(usernameFromToken);
            setNewUsername(usernameFromToken);
          } catch {
            setUsername("");
            setNewUsername("");
          }
        }
      }
    };

    fetchUserData();
  }, [API_URL]);

  const handleSaveUsername = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.put(
        `${API_URL}/api/profile/username`,
        { username: newUsername },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUsername(response.data.username);
      setNewUsername(response.data.username);

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }

      alert("Username updated successfully!");
    } catch (error: any) {
      console.error("Error updating username:", error);
      alert(error.response?.data?.error || "Failed to update username.");
    }
  };

  const handleSaveDisplayName = async () => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `${API_URL}/api/profile/display-name`,
        { displayName },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Display name updated successfully!");
    } catch (error) {
      console.error("Error updating display name:", error);
      alert("Failed to update display name. Please try again.");
    }
  };

  const handleSaveBio = async () => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `${API_URL}/api/profile/bio`,
        { bio },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Bio updated successfully!");
    } catch (error) {
      console.error("Error updating bio:", error);
      alert("Failed to update bio. Please try again.");
    }
  };

  const handleSaveDetails = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.put(
        `${API_URL}/api/profile/details`,
        { location, statusText },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.location) {
        setLocation(response.data.location);
      }

      alert("Profile details updated successfully!");
    } catch (error) {
      console.error("Error updating profile details:", error);
      alert("Failed to update profile details. Please try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const isAdminUser = ["admin", "owner", "staff"].includes(role.toLowerCase()) || ownerBypass;

  const tabs = [
    {
      id: "profile",
      label: t("admin.publicProfile"),
      description: t("admin.publicProfileDescription"),
      icon: <FaUser />,
      component: null,
    },
    {
      id: "social",
      label: t("admin.socialMedia"),
      description: t("admin.socialMediaDescription"),
      icon: <FaLink />,
      component: <SocialMediaSettings />,
    },
    {
      id: "images",
      label: t("admin.images"),
      description: t("admin.imagesDescription"),
      icon: <FaImage />,
      component: <ProfileImagesSettings />,
    },
    {
      id: "appearance",
      label: t("admin.appearance"),
      description: t("admin.appearanceDescription"),
      icon: <FaPalette />,
      component: <AppearanceSettings />,
    },
    {
      id: "music",
      label: t("admin.music"),
      description: t("admin.musicDescription"),
      icon: <FaMusic />,
      component: <MusicSettings />,
    },
    {
      id: "badges",
      label: t("admin.badges"),
      description: t("admin.badgesDescription"),
      icon: <FaCertificate />,
      component: <BadgeSettings />,
    },
    {
      id: "community",
      label: t("admin.community"),
      description: t("admin.communityDescription"),
      icon: <FaUsers />,
      component: <CommunityTemplatesSettings />,
    },
    ...(isAdminUser
      ? [
          {
            id: "community-admin",
            label: t("admin.communityApproval"),
            description: t("admin.communityApprovalDescription"),
            icon: <FaShieldAlt />,
            component: <AdminCommunityTemplates />,
          },
        ]
      : []),
  ];

  const activeTabData = tabs.find((tab) => tab.id === activeTab);
  const safeEmail = email || localStorage.getItem("email") || "discord user";
  const profileUrl = `https://arcxnjo.com.br/${username || ""}`;

  const glassCard =
    "rounded-3xl border border-white/[0.06] bg-white/[0.025] backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.4)]";

  const inputClass =
    "w-full rounded-xl border border-white/5 bg-black/40 px-3.5 py-2.5 text-xs text-white placeholder-white/20 outline-none transition focus:border-purple-500/40 focus:bg-black/55 focus:shadow-[0_0_0_3px_rgba(168,85,247,0.08)]";

  const labelClass = "block text-xs font-semibold text-white/70 mb-1.5";

  const SaveButton = ({
  onClick,
  children,
}: {
  onClick: () => void | Promise<void>;
  children: ReactNode;
}) => (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-3 py-2 text-xs font-bold text-white shadow-[0_0_16px_rgba(147,51,234,0.18)] transition hover:-translate-y-0.5 hover:bg-purple-500 hover:shadow-[0_0_24px_rgba(147,51,234,0.26)] active:translate-y-0"
    >
      <FaSave className="text-[10px]" />
      {children}
    </button>
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* Estilos e animações sutis de interface mantidos */}
      <style>{`
        @keyframes adminPulse {
          0%, 100% { opacity: 0.15; transform: scaleX(0.92); }
          50% { opacity: 0.35; transform: scaleX(1); }
        }

        @keyframes adminGlowSweep {
          0% { transform: translateX(-120%); opacity: 0; }
          40% { opacity: 0.12; }
          100% { transform: translateX(120%); opacity: 0; }
        }

        @keyframes liveIndicator {
          0%, 100% { opacity: 0.4; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.15); }
        }
      `}</style>

      {/* Fundo Minimalista e Premium */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[#060608]" />

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.15) 1.5px, transparent 1.5px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="absolute inset-x-0 top-0 h-[300px] bg-gradient-to-b from-white/[0.015] to-transparent" />

        <div className="absolute -right-[15%] -top-[10%] h-[500px] w-[500px] rounded-full bg-purple-500/[0.025] blur-[100px]" />
        <div className="absolute -left-[10%] top-[15%] h-[400px] w-[400px] rounded-full bg-cyan-500/[0.015] blur-[80px]" />
        <div className="absolute -bottom-[20%] left-[30%] h-[700px] w-[700px] rounded-full bg-emerald-500/[0.015] blur-[120px]" />
      </div>

      {/* Header Compacto */}
      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-black/40 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <a href="/" className="group flex items-center gap-3">
            <div className="relative grid h-9 w-9 place-items-center rounded-xl bg-white/5 shadow-[0_0_20px_rgba(168,85,247,0.12)] border border-white/10">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500/30 to-pink-500/10 opacity-70 transition group-hover:opacity-100" />
              <FaMagic className="relative z-10 text-xs text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black tracking-widest text-white" style={{ fontFamily: "Orbitron, sans-serif" }}>ARCXNJO</span>
              <span className="text-[9px] font-bold text-white/35 tracking-widest uppercase">{t("admin.controlCenter")}</span>
            </div>
          </a>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.02] px-2.5 py-1 text-[10px] font-mono text-white/40 sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" style={{ animation: "liveIndicator 1.8s infinite" }} />
              api.arcxnjo.com.br · 200
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.02] px-3 text-xs font-bold text-white/60 transition hover:border-red-400/20 hover:bg-red-500/5 hover:text-white"
            >
              <FaSignOutAlt className="text-xs" />
              <span>{t("admin.logout")}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout de Alta Densidade (Zoom 90%) */}
      {activeTabData && (
        <main className="relative z-10 mx-auto max-w-6xl px-4 py-6">
          <div className="grid gap-6 lg:grid-cols-[230px_1fr]">
            
            {/* Sidebar de navegação */}
            <aside className="flex flex-col gap-4">
              <div className="flex items-center gap-4 p-3 rounded-2xl border border-white/[0.06] bg-white/[0.015]">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 text-lg font-black text-white border border-white/10 shadow-[0_0_20px_rgba(168,85,247,0.15)]">
                  {username?.charAt(0).toUpperCase() || safeEmail?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="truncate text-xs font-black text-white">
                    {displayName || username || "User"}
                  </span>
                  <span className="truncate text-[10px] text-white/40 mt-0.5">
                    {safeEmail} <span className="text-white/20">·</span> <span className="uppercase text-purple-400 font-bold tracking-wider">{plan}</span>
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-1.5">
                <nav className="flex flex-col gap-0.5">
                  {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;

                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2.5 w-full px-3 py-2 text-xs font-bold rounded-xl transition-all ${
                          isActive
                            ? "bg-purple-600 text-white shadow-[0_0_16px_rgba(147,51,234,0.24)]"
                            : "text-white/50 hover:bg-white/[0.03] hover:text-white"
                        }`}
                      >
                        <span className="text-sm shrink-0">{tab.icon}</span>
                        <span className="truncate">{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!username) return;
                  window.open(profileUrl, "_blank");
                }}
                className="flex items-center justify-center gap-1.5 w-full px-3 py-2.5 text-xs font-bold rounded-xl border border-purple-500/15 bg-purple-500/5 text-purple-300 transition hover:bg-purple-500/10"
              >
                <span>{t("admin.viewProfile")}</span>
                <FaExternalLinkAlt className="text-[10px]" />
              </button>
            </aside>

            {/* Conteúdo Principal */}
            <main className="min-w-0">
              <div className={`${glassCard} overflow-hidden`}>
                
                {/* Cabeçalho da Seção Ativa */}
                <div className="border-b border-white/[0.06] bg-black/15 px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-xl bg-purple-500/10 text-purple-300 border border-purple-500/10">
                      {activeTabData?.icon}
                    </div>
                    <div>
                      <h2 className="text-sm font-black text-white">
                        {activeTabData?.label}
                      </h2>
                      <p className="text-[11px] text-white/40">
                        {activeTabData?.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Formulários e Componentes Internos */}
                <div className="p-5 md:p-6">
                  {activeTab === "profile" ? (
                    <div className="space-y-5">
                      
                      {/* Resumo da Identidade */}
                      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-purple-600/15 via-black/25 to-pink-600/10 p-4 md:p-5">
                        <div className="absolute right-[-60px] top-[-60px] h-32 w-32 rounded-full bg-purple-500/10 blur-2xl" />

                        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
                          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-white/5 text-xl font-black text-white border border-white/5 shadow-md">
                            {username.charAt(0).toUpperCase() || "U"}
                          </div>

                          <div className="min-w-0 flex-1">
                            <h3 className="truncate text-lg font-black text-white leading-tight">
                              {displayName || username || "User"}
                            </h3>
                            <p className="truncate text-xs text-white/40 mt-0.5">
                              {safeEmail}
                            </p>
                            <div className="mt-2.5 flex flex-wrap gap-1.5">
                              <span className="rounded-full border border-white/5 bg-black/35 px-2.5 py-0.5 text-[10px] font-bold text-white/50">
                                @{username || "..."}
                              </span>
                              <span className="rounded-full border border-purple-400/10 bg-purple-500/5 px-2.5 py-0.5 text-[10px] font-bold text-purple-200">
                                {plan} plan
                              </span>
                              <span className="rounded-full border border-pink-400/10 bg-pink-500/5 px-2.5 py-0.5 text-[10px] font-bold text-pink-200">
                                {role}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Inputs de Configuração */}
                      <div className="grid gap-5 xl:grid-cols-2">
                        <section className="rounded-2xl border border-white/[0.06] bg-black/15 p-4">
                          <div className="mb-4">
                            <h3 className="text-sm font-black text-white">
                              {t("admin.identity")}
                            </h3>
                            <p className="text-[11px] text-white/40">
                              {t("admin.identityDescription")}
                            </p>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <label className={labelClass}>{t("admin.username")}</label>
                              <input
                                type="text"
                                value={newUsername}
                                onChange={(e) => setNewUsername(e.target.value)}
                                placeholder="your-username"
                                className={inputClass}
                                maxLength={20}
                              />
                              <div className="mt-2 flex items-center justify-between gap-3">
                                <span className="text-[10px] text-white/30">
                                  {newUsername.length}/20
                               </span>
                                <SaveButton onClick={handleSaveUsername}>
                                  {t("admin.saveUsername")}
                                </SaveButton>
                              </div>
                            </div>

                            <div className="border-t border-white/5 pt-4">
                              <label className={labelClass}>{t("admin.displayName")}</label>
                              <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="Your display name"
                                className={inputClass}
                                maxLength={32}
                              />
                              <div className="mt-2 flex items-center justify-between gap-3">
                                <span className="text-[10px] text-white/30">
                                  {displayName.length}/32
                                </span>
                                <SaveButton onClick={handleSaveDisplayName}>
                                  {t("admin.saveDisplayName")}
                                </SaveButton>
                              </div>
                            </div>
                          </div>
                        </section>

                        <section className="rounded-2xl border border-white/[0.06] bg-black/15 p-4">
                          <div className="mb-4">
                            <h3 className="text-sm font-black text-white">
                              {t("admin.profileText")}
                            </h3>
                            <p className="text-[11px] text-white/40">
                              {t("admin.profileTextDescription")}
                            </p>
                          </div>

                          <div>
                            <label className={labelClass}>Bio</label>
                            <textarea
                              value={bio}
                              onChange={(e) => setBio(e.target.value)}
                              placeholder="Write a short bio..."
                              className={`${inputClass} min-h-[110px] resize-none`}
                              rows={3}
                              maxLength={160}
                            />

                            <div className="mt-2 flex items-center justify-between gap-3">
                              <span className="text-[10px] text-white/30">
                                {bio.length}/160
                              </span>
                              <SaveButton onClick={handleSaveBio}>
                                {t("admin.saveBio")}
                              </SaveButton>
                            </div>
                          </div>
                        </section>
                      </div>

                      {/* Detalhes de Localização e Status */}
                      <section className="rounded-2xl border border-white/[0.06] bg-black/15 p-4">
                        <div className="mb-4">
                          <h3 className="text-sm font-black text-white">
                            {t("admin.extraDetails")}
                          </h3>
                          <p className="text-[11px] text-white/40">
                            {t("admin.extraDetailsDescription")}
                          </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <label className={labelClass}>{t("admin.location")}</label>
                            <input
                              type="text"
                              value={location}
                              onChange={(e) => setLocation(e.target.value)}
                              placeholder="Your location (leave empty for auto-IP)"
                              className={inputClass}
                              maxLength={40}
                            />
                          </div>

                          <div>
                            <label className={labelClass}>{t("admin.status")}</label>
                            <input
                              type="text"
                              value={statusText}
                              onChange={(e) => setStatusText(e.target.value)}
                              placeholder="What are you doing now?"
                              className={inputClass}
                              maxLength={80}
                            />
                            <div className="mt-2 flex items-center justify-between gap-3">
                              <span className="text-[10px] text-white/30">
                                {statusText.length}/80
                              </span>
                              <SaveButton onClick={handleSaveDetails}>
                                {t("admin.saveDetails")}
                              </SaveButton>
                            </div>
                          </div>
                        </div>
                      </section>
                    </div>
                  ) : (
                    activeTabData?.component
                  )}
                </div>

              </div>
            </main>
          </div>
        </main>
      )}
    </div>
  );
};
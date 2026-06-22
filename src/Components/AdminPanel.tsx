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
  FaTachometerAlt,
  FaPalette,
  FaMusic,
  FaCertificate,
  FaExternalLinkAlt,
  FaCrown,
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
  const [ownerBypass = false, setOwnerBypass] = useState(false);

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
    "rounded-3xl border border-white/10 bg-white/[0.055] backdrop-blur-2xl shadow-[0_20px_80px_rgba(0,0,0,0.38)]";

  const inputClass =
    "w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white placeholder-white/35 outline-none transition focus:border-purple-400/60 focus:bg-black/45 focus:shadow-[0_0_0_4px_rgba(168,85,247,0.12)]";

  const labelClass = "block text-sm font-semibold text-white/85 mb-2";

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
      className="inline-flex items-center gap-2 rounded-2xl bg-purple-600 px-4 py-2.5 text-sm font-bold text-white shadow-[0_0_28px_rgba(147,51,234,0.22)] transition hover:-translate-y-0.5 hover:bg-purple-500 hover:shadow-[0_0_38px_rgba(147,51,234,0.34)] active:translate-y-0"
    >
      <FaSave className="text-xs" />
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
          40% { opacity: 0.15; }
          100% { transform: translateX(120%); opacity: 0; }
        }
      `}</style>

      {/* Fundo Minimalista e Premium (Sem poluição de hacker de IA) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Cor grafite profunda ultra elegante */}
        <div className="absolute inset-0 bg-[#08080a]" />

        {/* Malha de pontos (Dotted Grid) sutil de 3% de opacidade */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.15) 1.5px, transparent 1.5px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Gradiente sutil vindo do topo */}
        <div className="absolute inset-x-0 top-0 h-[400px] bg-gradient-to-b from-white/[0.015] to-transparent" />

        {/* Luz ambiente estática e ultra-suave nos cantos da tela */}
        {/* Luz roxa superior direita */}
        <div className="absolute -right-[15%] -top-[10%] h-[600px] w-[600px] rounded-full bg-purple-500/[0.03] blur-[120px]" />
        {/* Luz ciano superior esquerda */}
        <div className="absolute -left-[10%] top-[15%] h-[500px] w-[500px] rounded-full bg-cyan-500/[0.02] blur-[100px]" />
        {/* Luz esmeralda inferior central */}
        <div className="absolute -bottom-[20%] left-[30%] h-[700px] w-[700px] rounded-full bg-emerald-500/[0.02] blur-[140px]" />
      </div>

      <header className="sticky top-0 z-30 border-b border-white/10 bg-black/45 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <a href="/" className="group flex items-center gap-4">
            <div className="relative grid h-11 w-11 place-items-center rounded-2xl bg-white/10 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/50 to-pink-500/20 opacity-70 transition group-hover:opacity-100" />
              <FaMagic className="relative z-10 text-base" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-black tracking-wider text-white">ARCXNJO</span>
              <span className="text-[10px] font-semibold text-white/40 tracking-widest">{t("admin.controlCenter")}</span>
            </div>
          </a>

          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-white/60 transition hover:bg-white/10 hover:text-white"
              title={t("admin.logout")}
            >
              <FaSignOutAlt className="text-sm" />
            </button>
          </div>
        </div>
      </header>

      {activeTabData && (
        <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
            
            {/* Sidebar de navegação */}
            <aside className="flex flex-col gap-4">
              <div className="flex items-center gap-4 p-4 rounded-3xl border border-white/10 bg-white/[0.03]">
                <img
                  src={data.profile?.profile_image || "/favicon.png"}
                  alt={username}
                  className="h-12 w-12 rounded-full object-cover border border-white/10"
                />
                <div className="flex flex-col min-w-0">
                  <span className="truncate text-sm font-bold text-white">
                    {displayName || username || "User"}
                  </span>
                  <span className="truncate text-xs text-white/40">
                    {safeEmail}
                  </span>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-2">
                <nav className="flex flex-col gap-1">
                  {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;

                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-3 w-full px-4 py-3 text-sm font-bold rounded-2xl transition-all ${
                          isActive
                            ? "bg-purple-600 text-white shadow-[0_0_24px_rgba(147,51,234,0.3)]"
                            : "text-white/50 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <span className="text-base">{tab.icon}</span>
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              <button
                onClick={() => window.open(profileUrl, "_blank")}
                className="flex items-center justify-center gap-2 w-full px-4 py-3.5 text-sm font-bold rounded-2xl border border-purple-500/20 bg-purple-500/10 text-purple-200 transition hover:bg-purple-500/20"
              >
                <span>{t("admin.viewProfile")}</span>
                <FaExternalLinkAlt className="text-xs" />
              </button>
            </aside>

            {/* Conteúdo Principal */}
            <div className="flex flex-col gap-6">
              <section className={`${glassCard} overflow-hidden p-6 md:p-8 relative`}>
                <div
                  className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-purple-500/10 via-white/5 to-transparent"
                  style={{ animation: "adminGlowSweep 5s ease-in-out infinite" }}
                />

                <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
                  <div>
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-purple-200">
                      <FaCrown className="text-purple-300" />
                      {t("admin.creatorDashboard")}
                    </div>

                    <h1 className="text-3xl font-black tracking-tight text-white md:text-5xl">
                      {activeTabData.label}
                    </h1>

                    <p className="mt-2 text-sm leading-relaxed text-white/55">
                      {activeTabData.description}
                    </p>
                  </div>
                </div>
              </section>

              <div className="min-w-0">
                {activeTab === "profile" ? (
                  <div className="space-y-6">
                    <div className="grid gap-5 xl:grid-cols-2">
                      <section className="rounded-3xl border border-white/10 bg-black/25 p-5">
                        <div className="mb-5">
                          <h3 className="text-lg font-black text-white">
                            {t("admin.identity")}
                          </h3>
                          <p className="text-sm text-white/40">
                            {t("admin.identityDescription")}
                          </p>
                        </div>

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

                          <div className="mt-3 flex items-center justify-between gap-3">
                            <span className="text-xs text-white/45">
                              {newUsername.length}/20
                            </span>

                            <SaveButton onClick={handleSaveUsername}>
                              {t("admin.saveUsername")}
                            </SaveButton>
                          </div>
                        </div>

                        <div className="mt-6">
                          <label className={labelClass}>{t("admin.displayName")}</label>
                          <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="Your display name"
                            className={inputClass}
                            maxLength={32}
                          />

                          <div className="mt-3 flex items-center justify-between gap-3">
                            <span className="text-xs text-white/45">
                              {displayName.length}/32
                            </span>

                            <SaveButton onClick={handleSaveDisplayName}>
                              {t("admin.saveDisplayName")}
                            </SaveButton>
                          </div>
                        </div>
                      </section>

                      <section className="rounded-3xl border border-white/10 bg-black/25 p-5">
                        <div className="mb-5">
                          <h3 className="text-lg font-black text-white">
                            {t("admin.profileText")}
                          </h3>
                          <p className="text-sm text-white/40">
                            {t("admin.profileTextDescription")}
                          </p>
                        </div>

                        <div>
                          <label className={labelClass}>Bio</label>
                          <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Write a short bio..."
                            className={`${inputClass} min-h-[118px] resize-none`}
                            rows={3}
                            maxLength={160}
                          />

                          <div className="mt-3 flex items-center justify-between gap-3">
                            <span className="text-xs text-white/45">
                              {bio.length}/160
                            </span>

                            <SaveButton onClick={handleSaveBio}>
                              {t("admin.saveBio")}
                            </SaveButton>
                          </div>
                        </div>
                      </section>
                    </div>

                    <section className="rounded-3xl border border-white/10 bg-black/25 p-5">
                      <div className="mb-5">
                        <h3 className="text-lg font-black text-white">
                          {t("admin.extraDetails")}
                        </h3>
                        <p className="text-sm text-white/40">
                          {t("admin.extraDetailsDescription")}
                        </p>
                      </div>

                      <div className="grid gap-5 md:grid-cols-2">
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

                          <div className="mt-3 flex items-center justify-between gap-3">
                            <span className="text-xs text-white/45">
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
                  activeTabData.component
                )}
              </div>
            </div>

          </div>
        </main>
      )}
    </div>
  );
};
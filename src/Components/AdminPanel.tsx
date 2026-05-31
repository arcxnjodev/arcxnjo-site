import { useState, useEffect, type ReactNode } from "react";
import { useSelector } from "react-redux";
import { userSliceType } from "../Store/userSlice";
import { SocialMediaSettings } from "./Ui/SocialMediaSettings";
import { ProfileImagesSettings } from "./Ui/ProfileImagesSettings";
import { AppearanceSettings } from "./Ui/AppearanceSettings";
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

      await axios.put(
        `${API_URL}/api/profile/details`,
        { location, statusText },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

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
      label: "Comunidade",
      description: "Crie templates e envie para aprovação",
      icon: <FaUsers />,
      component: <CommunityTemplatesSettings />,
    },
    ...(isAdminUser
      ? [
          {
            id: "community-admin",
            label: "Aprovação",
            description: "Revise templates enviados pela comunidade",
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
      <style>{`
        @keyframes adminFloat {
          0%, 100% { transform: translate3d(0,0,0) scale(1); opacity: 0.58; }
          50% { transform: translate3d(24px,-18px,0) scale(1.08); opacity: 0.92; }
        }

        @keyframes adminPulse {
          0%, 100% { opacity: 0.12; transform: scaleX(0.88); }
          50% { opacity: 0.42; transform: scaleX(1); }
        }

        @keyframes adminGridMove {
          from { background-position: 0 0; }
          to { background-position: 80px 80px; }
        }

        @keyframes adminGlowSweep {
          0% { transform: translateX(-120%); opacity: 0; }
          40% { opacity: 0.38; }
          100% { transform: translateX(120%); opacity: 0; }
        }
      `}</style>

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(147,51,234,0.28),transparent_34%),radial-gradient(circle_at_85%_15%,rgba(236,72,153,0.16),transparent_32%),radial-gradient(circle_at_50%_100%,rgba(59,130,246,0.12),transparent_35%)]" />

        <div
          className="absolute inset-0 opacity-[0.09]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.18) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            animation: "adminGridMove 18s linear infinite",
          }}
        />

        <div
          className="absolute left-[-120px] top-[120px] h-80 w-80 rounded-full bg-purple-700/25 blur-3xl"
          style={{ animation: "adminFloat 8s ease-in-out infinite" }}
        />

        <div
          className="absolute bottom-[-140px] right-[-120px] h-96 w-96 rounded-full bg-fuchsia-600/18 blur-3xl"
          style={{ animation: "adminFloat 10s ease-in-out infinite reverse" }}
        />

        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-400/60 to-transparent" />
      </div>

      <header className="sticky top-0 z-30 border-b border-white/10 bg-black/45 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <a href="/" className="group flex items-center gap-4">
            <div className="relative grid h-11 w-11 place-items-center rounded-2xl bg-white/10 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/50 to-pink-500/20 opacity-70 transition group-hover:opacity-100" />
              <FaMagic className="relative text-white" />
            </div>

            <div>
              <span
                className="block text-xl font-bold tracking-[0.25em] text-white md:text-2xl"
                style={{ fontFamily: "Orbitron, sans-serif" }}
              >
                ARC<span className="text-purple-400">X</span>NJO
              </span>
              <span className="text-xs text-white/45">{t("admin.controlCenter")}</span>
            </div>
          </a>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 md:flex">
              <div className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-xs font-black text-white">
                {username?.charAt(0).toUpperCase() ||
                  safeEmail?.charAt(0).toUpperCase() ||
                  "U"}
              </div>

              <div className="leading-tight">
                <p className="max-w-[160px] truncate text-sm font-semibold text-white">
                  {displayName || username || safeEmail?.split("@")[0] || "User"}
                </p>
                <p className="text-[11px] uppercase tracking-wider text-white/40">
                  {plan} / {role}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/70 transition hover:border-red-400/30 hover:bg-red-500/10 hover:text-white"
            >
              <FaSignOutAlt />
              <span className="hidden sm:inline">{t("admin.logout")}</span>
            </button>
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-7xl px-5 py-8 lg:px-8">
        <section className={`${glassCard} relative mb-8 overflow-hidden p-6 md:p-8`}>
          <div
            className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-purple-500/15 via-white/5 to-transparent"
            style={{ animation: "adminGlowSweep 5s ease-in-out infinite" }}
          />

          <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-purple-200">
                <FaCrown className="text-purple-300" />
                {t("admin.creatorDashboard")}
              </div>

              <h1 className="text-3xl font-black tracking-tight text-white md:text-5xl">
                {t("admin.dashboard")}
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/55 md:text-base">
                {t("admin.dashboardSubtitle")}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[360px]">
              <div className="rounded-3xl border border-white/10 bg-black/30 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/35">
                  Username
                </p>
                <p className="mt-1 truncate text-lg font-bold text-white">
                  @{username || t("admin.loading")}
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/30 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/35">
                  Plan
                </p>
                <p className="mt-1 flex items-center gap-2 text-lg font-bold text-white">
                  <span className="h-2 w-2 rounded-full bg-purple-400 shadow-[0_0_16px_rgba(168,85,247,0.8)]" />
                  {plan || "free"}
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          <aside className={`${glassCard} h-fit p-4 lg:sticky lg:top-24`}>
            <div className="mb-4 rounded-3xl border border-white/10 bg-black/35 p-4">
              <div className="flex items-center gap-3">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500 text-xl font-black text-white shadow-[0_0_30px_rgba(168,85,247,0.28)]">
                  {username?.charAt(0).toUpperCase() ||
                    safeEmail?.charAt(0).toUpperCase() ||
                    "U"}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-white">
                    {displayName || username || "User"}
                  </p>
                  <p className="truncate text-xs text-white/45">{safeEmail}</p>
                </div>
              </div>

              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full w-2/3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                  style={{ animation: "adminPulse 2.4s ease-in-out infinite" }}
                />
              </div>
            </div>

            <nav className="space-y-2">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`group relative w-full overflow-hidden rounded-2xl border px-4 py-4 text-left transition ${
                      isActive
                        ? "border-purple-400/30 bg-purple-500/15 text-white shadow-[0_0_28px_rgba(168,85,247,0.18)]"
                        : "border-white/5 bg-white/[0.03] text-white/55 hover:border-white/10 hover:bg-white/[0.07] hover:text-white"
                    }`}
                  >
                    {isActive && (
                      <span className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-purple-400 to-pink-400" />
                    )}

                    <span className="flex items-center gap-3">
                      <span
                        className={`grid h-10 w-10 place-items-center rounded-2xl transition ${
                          isActive
                            ? "bg-purple-500 text-white"
                            : "bg-black/30 text-white/45 group-hover:text-white"
                        }`}
                      >
                        {tab.icon}
                      </span>

                      <span className="min-w-0">
                        <span className="block text-sm font-bold">
                          {tab.label}
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-white/35">
                          {tab.description}
                        </span>
                      </span>
                    </span>
                  </button>
                );
              })}
            </nav>

            <div className="mt-4 border-t border-white/10 pt-4">
              <button
                type="button"
                onClick={() => {
                  if (!username) {
                    alert("Username is still loading. Please wait a moment.");
                    return;
                  }

                  window.open(profileUrl, "_blank");
                }}
                className="group flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-left text-white/60 transition hover:border-purple-400/25 hover:bg-purple-500/10 hover:text-white"
              >
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/5 group-hover:bg-purple-500/20">
                  <FaTachometerAlt />
                </span>

                <span className="min-w-0">
                  <span className="flex items-center gap-2 text-sm font-bold">
                    {t("admin.viewProfile")}
                    <FaExternalLinkAlt className="text-[10px] opacity-60" />
                  </span>
                  <span className="block truncate text-xs text-white/35">
                    arcxnjo.com.br/{username || t("admin.loading")}
                  </span>
                </span>
              </button>
            </div>
          </aside>

          <main className="min-w-0 space-y-6">
            <div className={`${glassCard} overflow-hidden`}>
              <div className="border-b border-white/10 bg-black/25 px-5 py-4 md:px-6">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-purple-500/20 text-purple-200">
                    {activeTabData?.icon}
                  </div>

                  <div>
                    <h2 className="text-lg font-black text-white">
                      {activeTabData?.label}
                    </h2>
                    <p className="text-sm text-white/40">
                      {activeTabData?.description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 md:p-6">
                {activeTab === "profile" && (
                  <div className="space-y-6">
                    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-purple-600/25 via-black/35 to-pink-600/20 p-5 md:p-6">
                      <div className="absolute right-[-70px] top-[-70px] h-44 w-44 rounded-full bg-purple-500/20 blur-3xl" />

                      <div className="relative flex flex-col gap-5 md:flex-row md:items-start">
                        <div className="grid h-20 w-20 shrink-0 place-items-center rounded-3xl bg-white/10 text-3xl font-black text-white shadow-[0_0_30px_rgba(255,255,255,0.08)]">
                          {username.charAt(0).toUpperCase() || "U"}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-2xl font-black text-white">
                            {displayName || username || "User"}
                          </h3>

                          <p className="mt-1 truncate text-sm text-white/50">
                            {safeEmail}
                          </p>

                          <div className="mt-4 flex flex-wrap gap-2">
                            <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs font-semibold text-white/60">
                              @{username || t("admin.loading")}
                            </span>

                            <span className="rounded-full border border-purple-400/20 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-100">
                              {plan} plan
                            </span>

                            <span className="rounded-full border border-pink-400/20 bg-pink-500/10 px-3 py-1 text-xs font-semibold text-pink-100">
                              {role}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

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

                          <p className="mt-2 text-xs text-white/35">
                            3-20 characters. Letters, numbers, dots,
                            underscores and hyphens only.
                          </p>

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
                              Save {t("admin.displayName")}
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
                            placeholder="Your location"
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

                    <section className="rounded-3xl border border-white/10 bg-black/25 p-5">
                      <p className="text-sm font-semibold text-white/70">
                        {t("admin.publicUrl")}
                      </p>

                      <div className="mt-3 flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/35 p-4 md:flex-row md:items-center md:justify-between">
                        <code className="break-all text-sm text-purple-100">
                          https://arcxnjo.com.br/{username || t("admin.loading")}
                        </code>

                        <button
                          type="button"
                          onClick={() => {
                            if (!username) return;
                            window.open(profileUrl, "_blank");
                          }}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/15"
                        >
                          Open
                          <FaExternalLinkAlt className="text-xs" />
                        </button>
                      </div>
                    </section>
                  </div>
                )}

                {activeTab === "social" &&
                  tabs.find((t) => t.id === "social")?.component}

                {activeTab === "images" &&
                  tabs.find((t) => t.id === "images")?.component}

                {activeTab === "appearance" &&
                  tabs.find((t) => t.id === "appearance")?.component}

                {activeTab === "music" &&
                  tabs.find((t) => t.id === "music")?.component}

                {activeTab === "badges" &&
                  tabs.find((t) => t.id === "badges")?.component}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
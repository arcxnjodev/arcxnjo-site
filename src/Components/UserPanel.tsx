import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useI18n } from "../i18n/i18nProvider";
import { CommunityProfileTemplate } from "./ProfileTemplates/CommunityProfileTemplate";
import { DefaultProfileTemplate } from "./ProfileTemplates/DefaultProfileTemplate";
import { ProScrollTemplate } from "./ProfileTemplates/ProScrollTemplate";
import { SleekTemplate } from "./ProfileTemplates/SleekTemplate";
import { GridTemplate } from "./ProfileTemplates/GridTemplate";
import { ModernTemplate } from "./ProfileTemplates/ModernTemplate";
import { SimplisticTemplate } from "./ProfileTemplates/SimplisticTemplate";
import { MinimalTemplate } from "./ProfileTemplates/MinimalTemplate";
import type { ProfileData } from "./ProfileTemplates/types";

export const UserPanel = () => {
  const locationPath = useLocation();
  const username = locationPath.pathname.replace("/", "");
  const API_URL = import.meta.env.VITE_API_URL || "https://api.arcxnjo.com.br";
  const { t } = useI18n();

  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [discordData, setDiscordData] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${API_URL}/api/profile/${username}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || t("profile.notFound"));
        }

        setData(result);
      } catch (error) {
        console.error(error);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchProfile();
    }
  }, [username, API_URL, t]);

  useEffect(() => {
    if (!data?.profile?.discord_id) return;

    const fetchDiscordPresence = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/discord-presence/${data.profile.discord_id}`
        );

        const result = await response.json();

        if (result.success) {
          setDiscordData(result);
        }
      } catch (error) {
        console.error("Discord presence error:", error);
      }
    };

    fetchDiscordPresence();

    const interval = window.setInterval(fetchDiscordPresence, 30000);

    return () => {
      window.clearInterval(interval);
    };
  }, [data?.profile?.discord_id, API_URL]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        {t("profile.loading")}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        {t("profile.notFound")}
      </div>
    );
  }

  const templateId = data.profile.profile_template || "neon-purple";

  if (templateId === "community" && data.communityTemplate) {
    return (
      <CommunityProfileTemplate
        data={data}
        username={username}
        apiUrl={API_URL}
        discordData={discordData}
      />
    );
  }

  if (templateId === "pro-scroll") {
    return (
      <ProScrollTemplate
        data={data}
        username={username}
        apiUrl={API_URL}
        discordData={discordData}
      />
    );
  }

  if (templateId === "sleek") {
    return (
      <SleekTemplate
        data={data}
        username={username}
        apiUrl={API_URL}
        discordData={discordData}
      />
    );
  }

  if (templateId === "grid") {
    return (
      <GridTemplate data={data} username={username} apiUrl={API_URL} discordData={discordData} />
    );
  }

  if (templateId === "modern") {
    return (
      <ModernTemplate data={data} username={username} apiUrl={API_URL} discordData={discordData} />
    );
  }

  if (templateId === "simplistic") {
    return (
      <SimplisticTemplate data={data} username={username} apiUrl={API_URL} discordData={discordData} />
    );
  }

  if (templateId === "minimal") {
    return (
      <MinimalTemplate data={data} username={username} apiUrl={API_URL} discordData={discordData} />
    );
  }

  return (
    <DefaultProfileTemplate
      data={data}
      username={username}
      apiUrl={API_URL}
      discordData={discordData}
    />
  );
};

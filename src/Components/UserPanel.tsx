import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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

// Dicionário de mapeamento para os templates que usam as mesmas propriedades padrão
const TEMPLATE_MAP: Record<
  string,
  React.ComponentType<{
    data: ProfileData;
    username: string;
    apiUrl: string;
    discordData: any;
  }>
> = {
  "pro-scroll": ProScrollTemplate,
  "sleek": SleekTemplate,
  "grid": GridTemplate,
  "modern": ModernTemplate,
  "simplistic": SimplisticTemplate,
  "minimal": MinimalTemplate,
};

export const UserPanel = () => {
  // Lê o parâmetro ':username' diretamente do React Router
  const { username } = useParams<{ username: string }>();
  const API_URL = import.meta.env.VITE_API_URL || "https://api.arcxnjo.com.br";
  const { t } = useI18n();

  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [discordData, setDiscordData] = useState<any>(null);

  // 1. Busca dos dados do perfil com prevenção de Race Condition
  useEffect(() => {
    let ignore = false;

    const fetchProfile = async () => {
      try {
        const response = await fetch(`${API_URL}/api/profile/${username}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || t("profile.notFound"));
        }

        if (!ignore) {
          setData(result);
        }
      } catch (error) {
        console.error(error);
        if (!ignore) {
          setData(null);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    if (username) {
      setLoading(true);
      fetchProfile();
    }

    return () => {
      ignore = true; // Ignora o resultado se o usuário mudar de página antes da requisição terminar
    };
  }, [username, API_URL, t]);

  // 2. Monitoramento de status do Discord via polling
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

  // Tratamento caso não existam dados ou o username não esteja preenchido
  if (!data || !username) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        {t("profile.notFound")}
      </div>
    );
  }

  const templateId = data.profile.profile_template || "neon-purple";

  // Caso especial do template "community" que possui validação adicional de dados
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

  // Renderização dinâmica baseada no dicionário de templates mapeados
  const SelectedTemplate = TEMPLATE_MAP[templateId];

  if (SelectedTemplate) {
    return (
      <SelectedTemplate
        data={data}
        username={username}
        apiUrl={API_URL}
        discordData={discordData}
      />
    );
  }

  // Template Fallback (Caso o templateId não bata com nenhum mapeado)
  return (
    <DefaultProfileTemplate
      data={data}
      username={username}
      apiUrl={API_URL}
      discordData={discordData}
    />
  );
};
import { FaDiscord } from "react-icons/fa";
import { useI18n } from "../../i18n/i18nProvider";

type DiscordAuthButtonProps = {
  text?: string;
};

export const DiscordAuthButton = ({ text }: DiscordAuthButtonProps) => {
  const API_URL = import.meta.env.VITE_API_URL || "https://api.arcxnjo.com.br";
  const { t } = useI18n();

  const handleDiscordLogin = () => {
    window.location.href = `${API_URL}/api/auth/discord/login`;
  };

  return (
    <button
      type="button"
      onClick={handleDiscordLogin}
      className="w-full flex items-center justify-center gap-3 bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold py-3 rounded-xl transition shadow-lg shadow-[#5865F2]/20"
    >
      <FaDiscord className="text-2xl" />
      {text || t("auth.loginWithDiscord")}
    </button>
  );
};

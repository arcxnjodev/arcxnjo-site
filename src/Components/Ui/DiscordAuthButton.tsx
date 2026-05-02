import { FaDiscord } from "react-icons/fa";

type DiscordAuthButtonProps = {
  text?: string;
};

export const DiscordAuthButton = ({
  text = "Continue with Discord",
}: DiscordAuthButtonProps) => {
  const API_URL = import.meta.env.VITE_API_URL || "https://api.arcxnjo.com.br";

  const handleDiscordLogin = () => {
    const popup = window.open(
      `${API_URL}/api/auth/discord/login?popup=1`,
      "arcxnjo-discord-login",
      "width=520,height=720"
    );

    const receiveMessage = (event: MessageEvent) => {
      if (event.origin !== API_URL) return;

      if (event.data?.type !== "ARCXNJO_DISCORD_LOGIN_SUCCESS") return;

      localStorage.setItem("token", event.data.token);
      localStorage.setItem("user", JSON.stringify(event.data.user));

      window.removeEventListener("message", receiveMessage);

      if (popup && !popup.closed) {
        popup.close();
      }

      window.location.href = "/panel";
    };

    window.addEventListener("message", receiveMessage);
  };

  return (
    <button
      type="button"
      onClick={handleDiscordLogin}
      className="w-full flex items-center justify-center gap-3 bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold py-3 rounded-xl transition shadow-lg shadow-[#5865F2]/20"
    >
      <FaDiscord className="text-xl" />
      {text}
    </button>
  );
};
import type { IconType } from "react-icons";
import {
  FaDiscord,
  FaGithub,
  FaInstagram,
  FaLinkedin,
  FaTiktok,
  FaTwitch,
  FaXTwitter,
  FaYoutube,
  FaSpotify,
  FaSoundcloud,
  FaSnapchat,
  FaTelegram,
  FaReddit,
  FaFacebook,
  FaWhatsapp,
  FaSteam,
  FaPatreon,
  FaKickstarter,
  FaGlobe,
} from "react-icons/fa6";

import { SiRoblox } from "react-icons/si";

import type { TemplateStyle } from "./types";

export const socialIcons: Record<string, IconType> = {
  instagram: FaInstagram,
  x: FaXTwitter,
  twitter: FaXTwitter,
  youtube: FaYoutube,
  twitch: FaTwitch,
  kick: FaKickstarter,
  discord: FaDiscord,
  linkedin: FaLinkedin,
  github: FaGithub,
  tiktok: FaTiktok,
  spotify: FaSpotify,
  soundcloud: FaSoundcloud,
  snapchat: FaSnapchat,
  telegram: FaTelegram,
  reddit: FaReddit,
  facebook: FaFacebook,
  whatsapp: FaWhatsapp,
  steam: FaSteam,
  patreon: FaPatreon,
  website: FaGlobe,
  roblox: SiRoblox,
};

export const socialColors: Record<string, string> = {
  instagram: "#E1306C",
  x: "#ffffff",
  twitter: "#1DA1F2",
  youtube: "#FF0000",
  twitch: "#9146FF",
  kick: "#53FC18",
  discord: "#5865F2",
  linkedin: "#0A66C2",
  github: "#ffffff",
  tiktok: "#ffffff",
  spotify: "#1DB954",
  soundcloud: "#FF5500",
  snapchat: "#FFFC00",
  telegram: "#26A5E4",
  reddit: "#FF4500",
  facebook: "#1877F2",
  whatsapp: "#25D366",
  steam: "#ffffff",
  patreon: "#FF424D",
  website: "#ffffff",
  roblox: "#ffffff",
};

export const getSocialUrl = (platform: string, url: string) => {
  const cleanUrl = url.trim();

  if (cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://")) {
    return cleanUrl;
  }

  const cleanUsername = cleanUrl.replace("@", "");

  switch (platform.toLowerCase()) {
    case "instagram":
      return `https://instagram.com/${cleanUsername}`;
    case "x":
    case "twitter":
      return `https://x.com/${cleanUsername}`;
    case "youtube":
      return `https://youtube.com/@${cleanUsername}`;
    case "tiktok":
      return `https://tiktok.com/@${cleanUsername}`;
    case "twitch":
      return `https://twitch.tv/${cleanUsername}`;
    case "kick":
      return `https://kick.com/${cleanUsername}`;
    case "linkedin":
      return `https://linkedin.com/in/${cleanUsername}`;
    case "github":
      return `https://github.com/${cleanUsername}`;
    case "spotify":
      return `https://open.spotify.com/user/${cleanUsername}`;
    case "soundcloud":
      return `https://soundcloud.com/${cleanUsername}`;
    case "snapchat":
      return `https://snapchat.com/add/${cleanUsername}`;
    case "telegram":
      return `https://t.me/${cleanUsername}`;
    case "reddit":
      return `https://reddit.com/u/${cleanUsername}`;
    case "facebook":
      return `https://facebook.com/${cleanUsername}`;
    case "whatsapp":
      return `https://wa.me/${cleanUsername}`;
    case "steam":
      return `https://steamcommunity.com/id/${cleanUsername}`;
    case "patreon":
      return `https://patreon.com/${cleanUsername}`;
    case "discord":
      return cleanUrl;
    default:
      return `https://${cleanUrl}`;
  }
};

export const badgeMap: Record<string, { label: string; image: string }> = {
  "open-dm": {
    label: "Open DM",
    image: "/badges/open-dm.gif",
  },
  "music": {
    label: "Music",
    image: "/badges/music.gif",
  },
  "anime": {
    label: "Anime",
    image: "/badges/anime.gif",
  },
  "verified": {
    label: "Verified",
    image: "/badges/verified.gif",
  },
  "premium": {
    label: "Premium",
    image: "/badges/premium.png",
  },
  "vip": {
    label: "VIP",
    image: "/badges/vip.gif",
  },
  "og": {
    label: "OG",
    image: "/badges/og.png",
  },
  "developer": {
    label: "Developer",
    image: "/badges/developer.png",
  },
  "staff": {
    label: "Staff",
    image: "/badges/staff.gif",
  },
  "founder": {
    label: "Founder",
    image: "/badges/founder.gif",
  },
};

export const discordProfileIcons = {
  nitro: "https://emoji.discadia.com/emojis/d34cc966-5dce-4c77-9a83-bc360696de63.GIF",
  boost: "https://emoji.discadia.com/emojis/ade7b907-bead-460e-8463-a9a9ab7a053e.GIF",
};

export const profileTemplates: Record<string, TemplateStyle> = {
  "neon-purple": {
    overlay: "bg-black/20",
    card: "bg-black/20 shadow-xl",
    avatar: "",
    username: "text-white",
    handle: "text-gray-300",
    bio: "text-gray-100",
    views: "text-gray-300",
    icon: "hover:text-white hover:bg-white/10",
    audioButton:
      "bg-black/15 hover:bg-black/20 text-white backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.28)]",
    audioPanel:
      "bg-black/25 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.35)]",
    sliderAccent: "accent-white",
    infoCard: "bg-white/10",
    infoIcon: "text-white",
    guestbookForm:
      "bg-black/30 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.35)]",
  },
  "cyber-glass": {
    overlay: "bg-black/15",
    card: "bg-white/10 shadow-[0_0_45px_rgba(34,211,238,0.18)]",
    avatar: "",
    username: "text-white",
    handle: "text-cyan-200/80",
    bio: "text-cyan-50",
    views: "text-cyan-200/80",
    icon: "hover:text-cyan-300 hover:bg-cyan-400/10",
    audioButton:
      "bg-black/15 hover:bg-black/20 text-white backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.28)]",
    audioPanel:
      "bg-black/25 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.35)]",
    sliderAccent: "accent-cyan-300",
    infoCard: "bg-white/10",
    infoIcon: "text-cyan-300",
    guestbookForm:
      "bg-black/30 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.35)]",
  },
  "minimal-dark": {
    overlay: "bg-black/30",
    card: "bg-black/30 shadow-2xl",
    avatar: "",
    username: "text-white",
    handle: "text-gray-300",
    bio: "text-gray-200",
    views: "text-gray-300",
    icon: "hover:text-white hover:bg-white/10",
    audioButton:
      "bg-black/15 hover:bg-black/20 text-white backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.28)]",
    audioPanel:
      "bg-black/30 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.35)]",
    sliderAccent: "accent-white",
    infoCard: "bg-white/5",
    infoIcon: "text-white",
    guestbookForm:
      "bg-black/35 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.35)]",
  },
  "red-glow": {
    overlay: "bg-black/20",
    card: "bg-black/20 shadow-xl",
    avatar: "",
    username: "text-white",
    handle: "text-red-200/80",
    bio: "text-red-50",
    views: "text-red-200/80",
    icon: "hover:text-red-400 hover:bg-red-500/10",
    audioButton:
      "bg-black/15 hover:bg-black/20 text-white backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.28)]",
    audioPanel:
      "bg-black/25 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.35)]",
    sliderAccent: "accent-red-400",
    infoCard: "bg-white/10",
    infoIcon: "text-red-300",
    guestbookForm:
      "bg-black/30 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.35)]",
  },
  "blue-ice": {
    overlay: "bg-black/20",
    card: "bg-black/20 shadow-xl",
    avatar: "",
    username: "text-white",
    handle: "text-blue-200/80",
    bio: "text-blue-50",
    views: "text-blue-200/80",
    icon: "hover:text-blue-300 hover:bg-blue-500/10",
    audioButton:
      "bg-black/15 hover:bg-black/20 text-white backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.28)]",
    audioPanel:
      "bg-black/25 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.35)]",
    sliderAccent: "accent-blue-300",
    infoCard: "bg-white/10",
    infoIcon: "text-blue-300",
    guestbookForm:
      "bg-black/30 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.35)]",
  },
  "pro-scroll": {
    overlay: "bg-black/35",
    card: "bg-black/20 shadow-[0_25px_80px_rgba(0,0,0,0.45)]",
    avatar: "",
    username: "text-white",
    handle: "text-white/70",
    bio: "text-white/85",
    views: "text-white/60",
    icon: "text-white",
    audioButton:
      "bg-black/40 hover:bg-black/55 text-white backdrop-blur-2xl shadow-[0_0_22px_rgba(255,255,255,0.20)]",
    audioPanel:
      "bg-black/55 backdrop-blur-2xl shadow-[0_12px_48px_rgba(0,0,0,0.55)]",
    sliderAccent: "accent-white",
    infoCard: "bg-black/35 backdrop-blur-2xl border border-white/10",
    infoIcon: "text-white",
    guestbookForm:
      "bg-black/55 backdrop-blur-2xl shadow-[0_12px_48px_rgba(0,0,0,0.55)]",
  },
  "sleek": {
    overlay: "bg-black/25",
    card: "bg-white/5 shadow-xl backdrop-blur-xl border border-white/10",
    avatar: "",
    username: "text-white",
    handle: "text-white/40",
    bio: "text-white/70",
    views: "text-white/30",
    icon: "hover:text-white hover:bg-white/10",
    audioButton:
      "bg-black/15 hover:bg-black/20 text-white backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.28)]",
    audioPanel:
      "bg-black/25 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.35)]",
    sliderAccent: "accent-white",
    infoCard: "bg-white/8",
    infoIcon: "text-white",
    guestbookForm:
      "bg-black/30 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.35)]",
  },
  "grid": {
    overlay: "bg-black/30",
    card: "bg-white/5 shadow-xl backdrop-blur-xl border border-white/10",
    avatar: "",
    username: "text-white",
    handle: "text-white/35",
    bio: "text-white/65",
    views: "text-white/25",
    icon: "hover:text-white hover:bg-white/10",
    audioButton: "bg-black/15 hover:bg-black/20 text-white backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.28)]",
    audioPanel: "bg-black/25 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.35)]",
    sliderAccent: "accent-white",
    infoCard: "bg-white/8",
    infoIcon: "text-white",
    guestbookForm: "bg-black/30 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.35)]",
  },
  "modern": {
    overlay: "bg-black/30",
    card: "bg-white/5 shadow-xl backdrop-blur-xl border border-white/10",
    avatar: "",
    username: "text-white",
    handle: "text-white/35",
    bio: "text-white/65",
    views: "text-white/25",
    icon: "hover:text-white hover:bg-white/10",
    audioButton: "bg-black/15 hover:bg-black/20 text-white backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.28)]",
    audioPanel: "bg-black/25 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.35)]",
    sliderAccent: "accent-white",
    infoCard: "bg-white/5",
    infoIcon: "text-white",
    guestbookForm: "bg-black/30 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.35)]",
  },
  "simplistic": {
    overlay: "bg-black/25",
    card: "bg-white/5 shadow-xl backdrop-blur-xl border border-white/10",
    avatar: "",
    username: "text-white",
    handle: "text-white/35",
    bio: "text-white/55",
    views: "text-white/20",
    icon: "hover:text-white hover:bg-white/10",
    audioButton: "bg-black/15 hover:bg-black/20 text-white backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.28)]",
    audioPanel: "bg-black/25 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.35)]",
    sliderAccent: "accent-white",
    infoCard: "bg-white/5",
    infoIcon: "text-white",
    guestbookForm: "bg-black/30 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.35)]",
  },
  "minimal": {
    overlay: "bg-black/20",
    card: "bg-transparent shadow-none border-none",
    avatar: "",
    username: "text-white",
    handle: "text-white/35",
    bio: "text-white/55",
    views: "text-white/20",
    icon: "hover:text-white hover:bg-white/10",
    audioButton: "bg-black/15 hover:bg-black/20 text-white backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.28)]",
    audioPanel: "bg-black/25 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.35)]",
    sliderAccent: "accent-white",
    infoCard: "bg-white/5",
    infoIcon: "text-white",
    guestbookForm: "bg-black/30 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.35)]",
  },
};

export const getTemplateStyle = (templateId?: string) => {
  return profileTemplates[templateId || "neon-purple"] || profileTemplates["neon-purple"];
};

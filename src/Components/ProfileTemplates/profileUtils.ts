import type { IconType } from "react-icons";
import {
  FaDiscord,
  FaGlobe,
  FaInstagram,
  FaLinkedin,
  FaTwitch,
  FaTwitter,
  FaYoutube,
  FaGithub,
  FaTiktok,
  FaKickstarterK,
} from "react-icons/fa";
import type { TemplateStyle } from "./types";

export const socialIcons: Record<string, IconType> = {
  instagram: FaInstagram,
  x: FaTwitter,
  twitter: FaTwitter,
  youtube: FaYoutube,
  twitch: FaTwitch,
  kick: FaKickstarterK,
  discord: FaDiscord,
  linkedin: FaLinkedin,
  github: FaGithub,
  tiktok: FaTiktok,
  website: FaGlobe,
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
    case "discord":
      return cleanUrl;
    default:
      return `https://${cleanUrl}`;
  }
};

export const badgeMap: Record<string, { label: string; image: string }> = {
  "open-dm": {
    label: "Open DM",
    image: "https://cdn.discordapp.com/emojis/827964533792440421.webp",
  },
  music: {
    label: "Music",
    image: "https://cdn.discordapp.com/emojis/847487695227584562.webp",
  },
  anime: {
    label: "Anime",
    image: "https://cdn.discordapp.com/emojis/705315110004195430.webp",
  },
  verified: {
    label: "Verified",
    image:
      "https://cdn.discordapp.com/emojis/894156569858703380.webp?size=32&animated=true",
  },
  premium: {
    label: "Premium",
    image: "https://cdn.discordapp.com/emojis/1083803537785499669.webp",
  },
  vip: {
    label: "VIP",
    image: "https://cdn.discordapp.com/emojis/1041872676710514748.webp",
  },
  og: {
    label: "OG",
    image: "https://cdn.discordapp.com/emojis/972692703072649336.webp",
  },
  developer: {
    label: "Developer",
    image: "https://emoji.gg/emoji/95693-developer.png",
  },
  staff: {
    label: "Staff",
    image: "https://cdn.discordapp.com/emojis/928907588282748948.webp",
  },
  founder: {
    label: "Founder",
    image: "https://cdn.discordapp.com/emojis/1257354981384650873.webp",
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
    avatar: "border-white/15 shadow-lg",
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
    avatar: "border-cyan-300/40 shadow-[0_0_25px_rgba(34,211,238,0.35)]",
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
    avatar: "border-white/15 shadow-lg",
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
    avatar: "border-red-500/40 shadow-[0_0_25px_rgba(239,68,68,0.45)]",
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
    avatar: "border-blue-300/40 shadow-[0_0_25px_rgba(96,165,250,0.45)]",
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
    avatar: "border-white/20 shadow-[0_0_35px_rgba(255,255,255,0.22)]",
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
};

export const getTemplateStyle = (templateId?: string) => {
  return profileTemplates[templateId || "neon-purple"] || profileTemplates["neon-purple"];
};

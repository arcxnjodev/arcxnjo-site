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
    image: "https://cdn.discordapp.com/emojis/827964533792440421.webp",
  },
  music: {
    label: "Music",
    image: "https://cdn.discordapp.com/attachments/1255692212717752513/1478659125482225673/7CE6BDAA-CBAE-48F9-8438-8153B75BFB26.gif?ex=6a32f8df&is=6a31a75f&hm=fb882fafbcf0462caa82f0b37d72b2568e68f5b0bf19c75c606ae6c44283263a&",
  },
  anime: {
    label: "Anime",
    image: "https://cdn.discordapp.com/attachments/1255692212717752513/1480655304508047623/8297995ca09f89a263cc05bd3d78b620.gif?ex=6a32fbb5&is=6a31aa35&hm=01876dc05d7f0a9960d13c34a103ac1fe87119028eb73370a9f8f420b2a58d57&",
  },
  verified: {
    label: "Verified",
    image: "https://cdn.discordapp.com/emojis/894156569858703380.webp?size=32&animated=true",
  },
  premium: {
    label: "Premium",
    image: "https://cdn.discordapp.com/emojis/1083803537785499669.webp",
  },
  vip: {
    label: "VIP",
    image: "https://cdn.discordapp.com/attachments/1255692212717752513/1514587049791852604/9C8E2C74-BEE8-4517-B7BD-C94B6DB15A15.gif?ex=6a3328dc&is=6a31d75c&hm=91c35ca08acebb128ee7c72399265a293c7cb550c26ded9e7382590cc99121f5&",
  },
  og: {
    label: "OG",
    image: "https://media.discordapp.net/attachments/1255692212717752513/1452546315434332241/ogu.png?ex=6a32e56c&is=6a3193ec&hm=a56b67350041db028d27871d0b4ba2a207bfb405edeb9244e1e5ca043bdf6cf6&=&format=webp&quality=lossless",
  },
  developer: {
    label: "Developer",
    image: "https://cdn.discordapp.com/attachments/1255692212717752513/1398993841415262219/black-butterfly-ezgif.com-effects.gif?ex=6a3330cb&is=6a31df4b&hm=7ed11996a125b2117c0aecfe83dddb4e9716943d47249213630b751c2e72abfd&",
  },
  staff: {
    label: "Staff",
    image: "https://cdn.discordapp.com/emojis/928907588282748948.webp",
  },
  founder: {
    label: "Founder",
    image: "https://cdn.discordapp.com/attachments/1255692212717752513/1461132709295427667/6636d37ba22a391c6353b1436a81f656.gif?ex=6a3326e0&is=6a31d560&hm=4089b5929cd674bd36b63648930c46b786f0ab873b3e7164d0c4d41d528b9bfc&",
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

export type ProfileEffect = "none" | "stars" | "snow" | "sparkles" | "hearts";

export type GuestbookEntry = {
  id: number;
  visitor_name: string;
  message: string;
  created_at: string;
};

export type ProfileData = {
  username: string;
  profile: {
    profile_image?: string;
    banner_image?: string;
    banner_video?: string;
    banner_type?: string;
    theme_color?: string;
    bio?: string;
    display_name?: string;
    profile_template?: string;
    profile_effect?: ProfileEffect;
    profile_badges?: string[];
    music_url?: string;
    music_title?: string;
    location?: string;
    status_text?: string;
    discord_id?: string;
  };
  socialMedia: Record<string, string>;
  stats: {
    profile_views: number;
  };
};

export type TemplateStyle = {
  overlay: string;
  card: string;
  avatar: string;
  username: string;
  handle: string;
  bio: string;
  views: string;
  icon: string;
  audioButton: string;
  audioPanel: string;
  sliderAccent: string;
  infoCard: string;
  infoIcon: string;
  guestbookForm: string;
};

export type ProfileTemplateProps = {
  data: ProfileData;
  username: string;
  apiUrl: string;
  discordData: any;
};
